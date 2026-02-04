'use client';

import { cn } from '@/lib/utils';
import { LeaderboardEntry } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LevelBadge } from './level-badge';
import { formatXP, formatTime } from '@/lib/gamification';
import { Trophy, Medal, Award } from 'lucide-react';

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  type: 'xp' | 'calls' | 'time' | 'score';
  currentUserId?: string;
  className?: string;
}

const rankIcons: Record<number, React.ReactNode> = {
  1: <Trophy className="w-5 h-5 text-yellow-500" />,
  2: <Medal className="w-5 h-5 text-gray-400" />,
  3: <Award className="w-5 h-5 text-amber-600" />,
};

export function LeaderboardTable({ entries, type, currentUserId, className }: LeaderboardTableProps) {
  const getValue = (entry: LeaderboardEntry) => {
    switch (type) {
      case 'xp':
        return formatXP(entry.xp);
      case 'calls':
        return `${entry.total_calls} calls`;
      case 'time':
        return formatTime(entry.total_time_seconds);
      case 'score':
        return `${entry.average_score}%`;
    }
  };

  const getLabel = () => {
    switch (type) {
      case 'xp':
        return 'XP';
      case 'calls':
        return 'Calls';
      case 'time':
        return 'Time';
      case 'score':
        return 'Avg Score';
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
        <span>Rank</span>
        <span>{getLabel()}</span>
      </div>

      <div className="space-y-1">
        {entries.map((entry) => {
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
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                isCurrentUser
                  ? 'bg-blue-50 border border-blue-200'
                  : 'hover:bg-zinc-50'
              )}
            >
              {/* Rank */}
              <div className="w-8 flex items-center justify-center">
                {rankIcons[entry.rank] || (
                  <span className="text-sm font-semibold text-muted-foreground">
                    {entry.rank}
                  </span>
                )}
              </div>

              {/* User Info */}
              <Avatar className="h-10 w-10">
                <AvatarImage src={entry.user.profile_picture_url || undefined} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <p className={cn('font-medium truncate', isCurrentUser && 'text-blue-700')}>
                  {entry.user.name || 'Anonymous'}
                  {isCurrentUser && <span className="text-xs ml-1">(You)</span>}
                </p>
                <div className="flex items-center gap-2">
                  <LevelBadge level={entry.level} size="sm" />
                  <span className="text-xs text-muted-foreground">
                    Level {entry.level}
                  </span>
                </div>
              </div>

              {/* Value */}
              <div className="text-right">
                <p className="font-semibold">{getValue(entry)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
