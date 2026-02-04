'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { AchievementCard } from '@/components/gamification/achievement-card';
import { XPProgressBar } from '@/components/gamification/xp-progress-bar';
import { Achievement } from '@/types';
import { Trophy, Phone, Target, Clock, Star, Loader2 } from 'lucide-react';

interface AchievementWithStatus extends Achievement {
  unlocked: boolean;
  unlocked_at: string | null;
}

interface AchievementsData {
  achievements: AchievementWithStatus[];
  total: number;
  unlocked: number;
}

interface UserStats {
  xp: number;
  level: number;
  levelTitle: string;
  levelProgress: {
    current: number;
    required: number;
    percentage: number;
  };
  totalCalls: number;
  totalTimeSeconds: number;
  achievementsUnlocked: number;
  rank: number;
}

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<AchievementsData | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [achievementsRes, statsRes] = await Promise.all([
          fetch('/api/achievements'),
          fetch('/api/user/stats'),
        ]);

        if (achievementsRes.ok) {
          const achievementsData = await achievementsRes.json();
          setAchievements(achievementsData);
        }

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }
      } catch (error) {
        console.error('Failed to fetch achievements:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!achievements) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load achievements</p>
      </div>
    );
  }

  const callAchievements = achievements.achievements.filter((a) => a.category === 'calls');
  const scoreAchievements = achievements.achievements.filter((a) => a.category === 'score');
  const timeAchievements = achievements.achievements.filter((a) => a.category === 'time');
  const specialAchievements = achievements.achievements.filter((a) => a.category === 'special');

  const progressPercentage = Math.round((achievements.unlocked / achievements.total) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Trophy className="h-6 w-6 text-yellow-500" />
          Achievements
        </h1>
        <p className="text-muted-foreground">
          Track your progress and unlock rewards
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2">
        {stats && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <XPProgressBar
                xp={stats.xp}
                level={stats.level}
                showDetails
              />
              <div className="grid grid-cols-3 gap-4 pt-2">
                <div className="text-center">
                  <p className="text-2xl font-bold">{stats.totalCalls}</p>
                  <p className="text-xs text-muted-foreground">Calls</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">#{stats.rank}</p>
                  <p className="text-xs text-muted-foreground">Rank</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{achievements.unlocked}</p>
                  <p className="text-xs text-muted-foreground">Achievements</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Achievement Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {achievements.unlocked} of {achievements.total} unlocked
              </span>
              <span className="text-sm font-medium">{progressPercentage}%</span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
            <div className="grid grid-cols-4 gap-2 pt-2">
              <div className="text-center p-2 rounded-lg bg-blue-50">
                <Phone className="h-4 w-4 mx-auto mb-1 text-blue-500" />
                <p className="text-xs text-muted-foreground">
                  {callAchievements.filter((a) => a.unlocked).length}/{callAchievements.length}
                </p>
              </div>
              <div className="text-center p-2 rounded-lg bg-green-50">
                <Target className="h-4 w-4 mx-auto mb-1 text-green-500" />
                <p className="text-xs text-muted-foreground">
                  {scoreAchievements.filter((a) => a.unlocked).length}/{scoreAchievements.length}
                </p>
              </div>
              <div className="text-center p-2 rounded-lg bg-purple-50">
                <Clock className="h-4 w-4 mx-auto mb-1 text-purple-500" />
                <p className="text-xs text-muted-foreground">
                  {timeAchievements.filter((a) => a.unlocked).length}/{timeAchievements.length}
                </p>
              </div>
              <div className="text-center p-2 rounded-lg bg-yellow-50">
                <Star className="h-4 w-4 mx-auto mb-1 text-yellow-500" />
                <p className="text-xs text-muted-foreground">
                  {specialAchievements.filter((a) => a.unlocked).length}/{specialAchievements.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Achievement Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>All Achievements</CardTitle>
          <CardDescription>
            Complete calls to unlock achievements and earn bonus XP
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="calls" className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                <span className="hidden sm:inline">Calls</span>
              </TabsTrigger>
              <TabsTrigger value="score" className="flex items-center gap-1">
                <Target className="h-3 w-3" />
                <span className="hidden sm:inline">Score</span>
              </TabsTrigger>
              <TabsTrigger value="time" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span className="hidden sm:inline">Time</span>
              </TabsTrigger>
              <TabsTrigger value="special" className="flex items-center gap-1">
                <Star className="h-3 w-3" />
                <span className="hidden sm:inline">Special</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <div className="grid gap-4 md:grid-cols-2">
                {achievements.achievements
                  .sort((a, b) => (a.unlocked === b.unlocked ? 0 : a.unlocked ? -1 : 1))
                  .map((achievement) => (
                    <AchievementCard key={achievement.id} achievement={achievement} />
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="calls">
              <div className="grid gap-4 md:grid-cols-2">
                {callAchievements
                  .sort((a, b) => (a.unlocked === b.unlocked ? 0 : a.unlocked ? -1 : 1))
                  .map((achievement) => (
                    <AchievementCard key={achievement.id} achievement={achievement} />
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="score">
              <div className="grid gap-4 md:grid-cols-2">
                {scoreAchievements
                  .sort((a, b) => (a.unlocked === b.unlocked ? 0 : a.unlocked ? -1 : 1))
                  .map((achievement) => (
                    <AchievementCard key={achievement.id} achievement={achievement} />
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="time">
              <div className="grid gap-4 md:grid-cols-2">
                {timeAchievements
                  .sort((a, b) => (a.unlocked === b.unlocked ? 0 : a.unlocked ? -1 : 1))
                  .map((achievement) => (
                    <AchievementCard key={achievement.id} achievement={achievement} />
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="special">
              <div className="grid gap-4 md:grid-cols-2">
                {specialAchievements
                  .sort((a, b) => (a.unlocked === b.unlocked ? 0 : a.unlocked ? -1 : 1))
                  .map((achievement) => (
                    <AchievementCard key={achievement.id} achievement={achievement} />
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
