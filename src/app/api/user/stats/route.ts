import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getUserById, getUserAchievements, getUserXPHistory, getUserRank } from '@/lib/db';
import { getLevelProgress, getLevelTitle } from '@/lib/gamification';

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [user, achievements, xpHistory, rank] = await Promise.all([
      getUserById(session.userId),
      getUserAchievements(session.userId),
      getUserXPHistory(session.userId, 10),
      getUserRank(session.userId),
    ]);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const levelProgress = getLevelProgress(user.xp || 0, user.level || 1);
    const levelTitle = getLevelTitle(user.level || 1);

    return NextResponse.json({
      xp: user.xp || 0,
      level: user.level || 1,
      levelTitle,
      levelProgress,
      totalCalls: user.total_calls_completed || 0,
      totalTimeSeconds: user.total_call_time_seconds || 0,
      achievementsUnlocked: achievements.length,
      rank,
      recentXP: xpHistory,
    });
  } catch (error) {
    console.error('User stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
