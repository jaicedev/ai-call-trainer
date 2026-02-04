'use client';

import { cn } from '@/lib/utils';
import { LeaderboardEntry } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LevelBadge } from './level-badge';
import { formatXP } from '@/lib/gamification';
import { Trophy, Medal, Award, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface MiniLeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
  className?: string;
}

const rankIcons: Record<number, React.ReactNode> = {
  1: <Trophy className="w-4 h-4 text-yellow-500" />,
  2: <Medal className="w-4 h-4 text-gray-400" />,
  3: <Award className="w-4 h-4 text-amber-600" />,
};

export function MiniLeaderboard({ entries, currentUserId, className }: MiniLeaderboardProps) {
  const topEntries = entries.slice(0, 5);

  return (
    <div className={cn('rounded-lg border bg-white p-4', className)}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold flex items-center gap-2">
          <Trophy className="h-4 w-4 text-yellow-500" />
          Top Performers
        </h3>
        <Link
          href="/leaderboard"
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
        >
          View all
          <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="space-y-2">
        {topEntries.map((entry) => {
          const isCurrentUser = entry.user.id === currentUserId;
          const initials = entry.user.name
            ? entry.user.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
            : '?';

          return (
            <div
              key={entry.user.id}
              className={cn(
                'flex items-center gap-2 py-1.5 px-2 rounded-md transition-colors',
                isCurrentUser
                  ? 'bg-blue-50 border border-blue-200'
                  : 'hover:bg-zinc-50'
              )}
            >
              {/* Rank */}
              <div className="w-5 flex items-center justify-center shrink-0">
                {rankIcons[entry.rank] || (
                  <span className="text-xs font-semibold text-muted-foreground">
                    {entry.rank}
                  </span>
                )}
              </div>

              {/* Avatar */}
              <Avatar className="h-7 w-7 shrink-0">
                <AvatarImage src={entry.user.profile_picture_url || undefined} />
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>

              {/* Name & Level */}
              <div className="flex-1 min-w-0">
                <p className={cn('text-sm font-medium truncate', isCurrentUser && 'text-blue-700')}>
                  {entry.user.name || 'Anonymous'}
                  {isCurrentUser && <span className="text-xs ml-1">(You)</span>}
                </p>
              </div>

              {/* Level Badge */}
              <LevelBadge level={entry.level} size="sm" />

              {/* XP */}
              <span className="text-xs font-semibold text-muted-foreground shrink-0">
                {formatXP(entry.xp)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
