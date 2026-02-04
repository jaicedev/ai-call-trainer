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

    // Get top performers (users with highest average score, min 3 calls)
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

    // Get most practiced personas
    const { data: personaCalls } = await supabase
      .from('calls')
      .select(`
        persona_id,
        persona:personas(name)
      `)
      .not('ended_at', 'is', null);

    const personaStats: Record<string, { name: string; count: number }> = {};

    personaCalls?.forEach((call) => {
      if (!call.persona) return;
      const personaId = call.persona_id;
      const personaData = call.persona as unknown as { name: string };
      const personaName = personaData.name;

      if (!personaStats[personaId]) {
        personaStats[personaId] = { name: personaName, count: 0 };
      }
      personaStats[personaId].count++;
    });

    const mostPracticedPersonas = Object.values(personaStats)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return NextResponse.json({
      total_calls_this_week: callsThisWeek || 0,
      total_calls_this_month: callsThisMonth || 0,
      average_score: avgScore,
      total_users: totalUsers || 0,
      active_users_this_week: uniqueActiveUsers,
      top_performers: topPerformers,
      most_practiced_personas: mostPracticedPersonas,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
