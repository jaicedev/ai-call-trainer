'use client';

import { cn } from '@/lib/utils';
import { formatXP, getLevelProgress, getXPForNextLevel, MAX_LEVEL } from '@/lib/gamification';
import { LevelBadge } from './level-badge';

interface XPProgressBarProps {
  xp: number;
  level: number;
  showDetails?: boolean;
  compact?: boolean;
  className?: string;
}

export function XPProgressBar({
  xp,
  level,
  showDetails = false,
  compact = false,
  className,
}: XPProgressBarProps) {
  const progress = getLevelProgress(xp, level);
  const nextLevelXP = getXPForNextLevel(level);
  const isMaxLevel = level >= MAX_LEVEL;

  if (compact) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <LevelBadge level={level} size="sm" />
        <div className="flex-1">
          <div className="h-2 w-full bg-zinc-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        </div>
        <span className="text-xs font-medium text-muted-foreground">
          {formatXP(xp)} XP
        </span>
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <LevelBadge level={level} size="md" showTitle />
        <span className="text-sm font-medium">
          {formatXP(xp)} XP
        </span>
      </div>

      <div className="h-3 w-full bg-zinc-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
          style={{ width: `${progress.percentage}%` }}
        />
      </div>

      {showDetails && (
        <div className="flex justify-between text-xs text-muted-foreground">
          {isMaxLevel ? (
            <span>Max Level Reached!</span>
          ) : (
            <>
              <span>{formatXP(progress.current)} / {formatXP(progress.required)}</span>
              <span>Next: Level {level + 1} at {formatXP(nextLevelXP)} XP</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
