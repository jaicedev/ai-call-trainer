'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { LeaderboardTable } from '@/components/gamification/leaderboard-table';
import { AchievementCard } from '@/components/gamification/achievement-card';
import { LeaderboardEntry, Achievement, User } from '@/types';
import { Trophy, Phone, Clock, Target, Sparkles, Loader2 } from 'lucide-react';
import { formatTime } from '@/lib/gamification';

interface LeaderboardData {
  topByXP: LeaderboardEntry[];
  topByCallCount: LeaderboardEntry[];
  topByTime: LeaderboardEntry[];
  recentAchievements: {
    user: Pick<User, 'id' | 'name' | 'profile_picture_url'>;
    achievement: Achievement;
    unlocked_at: string;
  }[];
}

export default function LeaderboardPage() {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [leaderboardRes, userRes] = await Promise.all([
          fetch('/api/leaderboard'),
          fetch('/api/auth/me'),
        ]);

        if (leaderboardRes.ok) {
          const leaderboardData = await leaderboardRes.json();
          setData(leaderboardData);
        }

        if (userRes.ok) {
          const userData = await userRes.json();
          setCurrentUserId(userData.id);
        }
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
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

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load leaderboard</p>
      </div>
    );
  }

  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Trophy className="h-6 w-6 text-yellow-500" />
          Leaderboard
        </h1>
        <p className="text-muted-foreground">
          See how you stack up against your teammates
        </p>
      </div>

      {/* Stats Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Performer</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            {data.topByXP[0] && (
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={data.topByXP[0].user.profile_picture_url || undefined} />
                  <AvatarFallback>
                    {data.topByXP[0].user.name?.[0]?.toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{data.topByXP[0].user.name || 'Anonymous'}</p>
                  <p className="text-sm text-muted-foreground">
                    Level {data.topByXP[0].level} - {data.topByXP[0].xp.toLocaleString()} XP
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Calls</CardTitle>
            <Phone className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            {data.topByCallCount[0] && (
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={data.topByCallCount[0].user.profile_picture_url || undefined} />
                  <AvatarFallback>
                    {data.topByCallCount[0].user.name?.[0]?.toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{data.topByCallCount[0].user.name || 'Anonymous'}</p>
                  <p className="text-sm text-muted-foreground">
                    {data.topByCallCount[0].total_calls} calls completed
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Time</CardTitle>
            <Clock className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            {data.topByTime[0] && (
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={data.topByTime[0].user.profile_picture_url || undefined} />
                  <AvatarFallback>
                    {data.topByTime[0].user.name?.[0]?.toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{data.topByTime[0].user.name || 'Anonymous'}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatTime(data.topByTime[0].total_time_seconds)} on calls
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Rankings</CardTitle>
          <CardDescription>
            Compete with your team to climb the leaderboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="xp" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="xp" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                <span className="hidden sm:inline">XP</span>
              </TabsTrigger>
              <TabsTrigger value="calls" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span className="hidden sm:inline">Calls</span>
              </TabsTrigger>
              <TabsTrigger value="time" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="hidden sm:inline">Time</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="xp">
              <LeaderboardTable
                entries={data.topByXP}
                type="xp"
                currentUserId={currentUserId || undefined}
              />
            </TabsContent>

            <TabsContent value="calls">
              <LeaderboardTable
                entries={data.topByCallCount}
                type="calls"
                currentUserId={currentUserId || undefined}
              />
            </TabsContent>

            <TabsContent value="time">
              <LeaderboardTable
                entries={data.topByTime}
                type="time"
                currentUserId={currentUserId || undefined}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Recent Achievements */}
      {data.recentAchievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Recent Achievements
            </CardTitle>
            <CardDescription>
              Latest achievements unlocked by the team
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recentAchievements.map((item, index) => {
                const initials = item.user.name
                  ? item.user.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                  : '?';

                return (
                  <div
                    key={`${item.user.id}-${item.achievement.id}-${index}`}
                    className="flex items-center gap-4 p-3 bg-zinc-50"
                  >
                    <Avatar>
                      <AvatarImage src={item.user.profile_picture_url || undefined} />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {item.user.name || 'Anonymous'}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        Unlocked <span className="font-medium text-foreground">{item.achievement.name}</span>
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <Badge variant="secondary">+{item.achievement.xpReward} XP</Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatRelativeTime(item.unlocked_at)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
