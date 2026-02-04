import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getUserAchievements } from '@/lib/db';
import { ACHIEVEMENTS, getAchievementsWithStatus } from '@/lib/gamification';

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userAchievements = await getUserAchievements(session.userId);
    const unlockedIds = userAchievements.map((a) => a.achievement_id);
    const allAchievements = getAchievementsWithStatus(unlockedIds);

    // Add unlock dates for unlocked achievements
    const achievementsWithDates = allAchievements.map((achievement) => {
      const userAchievement = userAchievements.find(
        (ua) => ua.achievement_id === achievement.id
      );
      return {
        ...achievement,
        unlocked_at: userAchievement?.unlocked_at || null,
      };
    });

    return NextResponse.json({
      achievements: achievementsWithDates,
      total: ACHIEVEMENTS.length,
      unlocked: unlockedIds.length,
    });
  } catch (error) {
    console.error('Achievements error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
