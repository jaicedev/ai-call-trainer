'use client';

import { cn } from '@/lib/utils';
import { Achievement, User } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Trophy, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface RecentAchievement {
  user: Pick<User, 'id' | 'name' | 'profile_picture_url'>;
  achievement: Achievement;
  unlocked_at: string;
}

interface RecentAchievementsFeedProps {
  achievements: RecentAchievement[];
  className?: string;
}

function formatRelativeTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export function RecentAchievementsFeed({ achievements, className }: RecentAchievementsFeedProps) {
  const recentAchievements = achievements.slice(0, 5);

  if (recentAchievements.length === 0) {
    return null;
  }

  return (
    <div className={cn('rounded-lg border bg-white p-4', className)}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold flex items-center gap-2">
          <Trophy className="h-4 w-4 text-yellow-500" />
          Recent Achievements
        </h3>
        <Link
          href="/achievements"
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
        >
          View all
          <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="space-y-3">
        {recentAchievements.map((item, index) => {
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
              className="flex items-start gap-2"
            >
              <Avatar className="h-7 w-7 shrink-0 mt-0.5">
                <AvatarImage src={item.user.profile_picture_url || undefined} />
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  <span className="font-medium">{item.user.name || 'Anonymous'}</span>
                  <span className="text-muted-foreground"> unlocked </span>
                  <span className="font-medium text-yellow-600">{item.achievement.name}</span>
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant="secondary" className="text-xs py-0 px-1.5">
                    +{item.achievement.xpReward} XP
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatRelativeTime(item.unlocked_at)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
