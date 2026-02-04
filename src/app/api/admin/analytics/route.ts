import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSession } from '@/lib/auth';
import { getUserById } from '@/lib/db';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET() {
  try {
    const supabase = getSupabase();
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUserById(session.userId);

    if (!user?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get total users
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    // Get calls this week
    const { count: callsThisWeek } = await supabase
      .from('calls')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', weekAgo.toISOString())
      .not('ended_at', 'is', null);

    // Get calls this month
    const { count: callsThisMonth } = await supabase
      .from('calls')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', monthAgo.toISOString())
      .not('ended_at', 'is', null);

    // Get average score
    const { data: scores } = await supabase
      .from('call_scores')
      .select('overall_score');

    const avgScore =
      scores && scores.length > 0
        ? scores.reduce((acc, s) => acc + s.overall_score, 0) / scores.length
        : 0;

    // Get active users this week
    const { data: activeUsers } = await supabase
      .from('calls')
      .select('user_id')
      .gte('created_at', weekAgo.toISOString())
      .not('ended_at', 'is', null);

    const uniqueActiveUsers = new Set(activeUsers?.map((c) => c.user_id)).size;

    // Get top performers (users with highest average score, min 1 call)
    const { data: userScores } = await supabase
      .from('calls')
      .select(`
        user_id,
        user:users(name, email),
        score:call_scores(overall_score)
      `)
      .not('ended_at', 'is', null);

    const userStats: Record<
      string,
      {
        name: string;
        email: string;
        scores: number[];
      }
    > = {};

    userScores?.forEach((call) => {
      if (!call.user || !call.score) return;
      const userId = call.user_id;
      const scoreData = Array.isArray(call.score) ? call.score[0] : call.score;

      if (!scoreData?.overall_score) return;

      const userData = call.user as unknown as { name: string; email: string };

      if (!userStats[userId]) {
        userStats[userId] = {
          name: userData.name || '',
          email: userData.email || '',
          scores: [],
        };
      }
      userStats[userId].scores.push(scoreData.overall_score);
    });

    const topPerformers = Object.values(userStats)
      .filter((u) => u.scores.length >= 1)
      .map((u) => ({
        name: u.name,
        email: u.email,
        average_score: u.scores.reduce((a, b) => a + b, 0) / u.scores.length,
        call_count: u.scores.length,
      }))
      .sort((a, b) => b.average_score - a.average_score)
      .slice(0, 5);

    // Get dynamic persona distributions from completed calls
    const { data: dynamicCalls } = await supabase
      .from('calls')
      .select('dynamic_persona_difficulty, mock_business_industry')
      .not('ended_at', 'is', null);

    // Calculate difficulty distribution
    const difficultyStats: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const industryStats: Record<string, number> = {};
    let totalDynamicCalls = 0;

    dynamicCalls?.forEach((call) => {
      // Count difficulty levels
      if (call.dynamic_persona_difficulty) {
        const diff = call.dynamic_persona_difficulty as number;
        if (diff >= 1 && diff <= 5) {
          difficultyStats[diff]++;
          totalDynamicCalls++;
        }
      }

      // Count industries
      if (call.mock_business_industry) {
        const industry = call.mock_business_industry as string;
        industryStats[industry] = (industryStats[industry] || 0) + 1;
      }
    });

    // Format difficulty distribution with labels
    const difficultyLabels: Record<number, string> = {
      1: 'Beginner',
      2: 'Easy',
      3: 'Moderate',
      4: 'Challenging',
      5: 'Expert',
    };

    const difficultyDistribution = Object.entries(difficultyStats)
      .map(([level, count]) => ({
        level: parseInt(level),
        label: difficultyLabels[parseInt(level)],
        count,
        percentage: totalDynamicCalls > 0 ? Math.round((count / totalDynamicCalls) * 100) : 0,
      }))
      .sort((a, b) => a.level - b.level);

    // Format industry distribution (top 8)
    const industryDistribution = Object.entries(industryStats)
      .map(([industry, count]) => ({
        industry,
        count,
        percentage: totalDynamicCalls > 0 ? Math.round((count / totalDynamicCalls) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    return NextResponse.json({
      total_calls_this_week: callsThisWeek || 0,
      total_calls_this_month: callsThisMonth || 0,
      average_score: avgScore,
      total_users: totalUsers || 0,
      active_users_this_week: uniqueActiveUsers,
      top_performers: topPerformers,
      total_dynamic_calls: totalDynamicCalls,
      difficulty_distribution: difficultyDistribution,
      industry_distribution: industryDistribution,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
