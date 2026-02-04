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

    // Get all users
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Get call stats for each user
    const { data: calls } = await supabase
      .from('calls')
      .select(`
        user_id,
        score:call_scores(overall_score)
      `)
      .not('ended_at', 'is', null);

    // Calculate stats per user
    const userStats: Record<string, { total_calls: number; scores: number[] }> =
      {};

    calls?.forEach((call) => {
      if (!userStats[call.user_id]) {
        userStats[call.user_id] = { total_calls: 0, scores: [] };
      }
      userStats[call.user_id].total_calls++;

      const scoreData = Array.isArray(call.score) ? call.score[0] : call.score;
      if (scoreData?.overall_score) {
        userStats[call.user_id].scores.push(scoreData.overall_score);
      }
    });

    const usersWithStats = users?.map((u) => {
      const stats = userStats[u.id] || { total_calls: 0, scores: [] };
      return {
        id: u.id,
        email: u.email,
        name: u.name,
        profile_picture_url: u.profile_picture_url,
        is_admin: u.is_admin,
        created_at: u.created_at,
        total_calls: stats.total_calls,
        average_score:
          stats.scores.length > 0
            ? stats.scores.reduce((a, b) => a + b, 0) / stats.scores.length
            : 0,
      };
    });

    return NextResponse.json({ users: usersWithStats });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
