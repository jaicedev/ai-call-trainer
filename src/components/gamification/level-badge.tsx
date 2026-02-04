'use client';

import { cn } from '@/lib/utils';
import { getLevelTitle } from '@/lib/gamification';

interface LevelBadgeProps {
  level: number;
  size?: 'sm' | 'md' | 'lg';
  showTitle?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'h-6 w-6 text-xs',
  md: 'h-8 w-8 text-sm',
  lg: 'h-12 w-12 text-lg',
};

const levelColors: Record<number, string> = {
  1: 'from-gray-400 to-gray-500',
  2: 'from-gray-500 to-gray-600',
  3: 'from-green-400 to-green-600',
  4: 'from-green-500 to-green-700',
  5: 'from-blue-400 to-blue-600',
  6: 'from-blue-500 to-blue-700',
  7: 'from-purple-400 to-purple-600',
  8: 'from-purple-500 to-purple-700',
  9: 'from-orange-400 to-orange-600',
  10: 'from-orange-500 to-orange-700',
  11: 'from-red-400 to-red-600',
  12: 'from-red-500 to-red-700',
  13: 'from-pink-400 to-pink-600',
  14: 'from-pink-500 to-pink-700',
  15: 'from-indigo-400 to-indigo-600',
  16: 'from-indigo-500 to-indigo-700',
  17: 'from-cyan-400 to-cyan-600',
  18: 'from-cyan-500 to-cyan-700',
  19: 'from-amber-400 to-amber-600',
  20: 'from-amber-500 to-amber-700',
  21: 'from-yellow-400 to-yellow-600',
  22: 'from-yellow-500 to-yellow-600 ring-2 ring-yellow-300',
  23: 'from-yellow-500 to-amber-600 ring-2 ring-yellow-300',
  24: 'from-yellow-400 to-orange-500 ring-2 ring-yellow-400',
  25: 'from-yellow-300 to-yellow-500 ring-4 ring-yellow-300 animate-pulse',
};

export function LevelBadge({ level, size = 'md', showTitle = false, className }: LevelBadgeProps) {
  const colorClass = levelColors[level] || levelColors[25];
  const title = getLevelTitle(level);

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        className={cn(
          'flex items-center justify-center rounded-full bg-gradient-to-br font-bold text-white shadow-md',
          sizeClasses[size],
          colorClass
        )}
        title={`Level ${level}: ${title}`}
      >
        {level}
      </div>
      {showTitle && (
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
      )}
    </div>
  );
}
