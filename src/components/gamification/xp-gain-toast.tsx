'use client';

import { cn } from '@/lib/utils';
import { Achievement } from '@/types';
import { Sparkles, TrendingUp, Trophy, Star } from 'lucide-react';

interface XPGainToastProps {
  xpGained: number;
  leveledUp?: boolean;
  newLevel?: number;
  className?: string;
}

export function XPGainToast({ xpGained, leveledUp, newLevel, className }: XPGainToastProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
        {leveledUp ? (
          <TrendingUp className="w-5 h-5 text-white" />
        ) : (
          <Sparkles className="w-5 h-5 text-white" />
        )}
      </div>
      <div>
        <p className="font-semibold text-green-600">+{xpGained} XP</p>
        {leveledUp && newLevel && (
          <p className="text-sm text-muted-foreground">
            Level Up! You are now Level {newLevel}
          </p>
        )}
      </div>
    </div>
  );
}

interface AchievementUnlockToastProps {
  achievement: Achievement;
  className?: string;
}

export function AchievementUnlockToast({ achievement, className }: AchievementUnlockToastProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg">
        <Trophy className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="font-semibold flex items-center gap-1">
          <Star className="w-4 h-4 text-yellow-500" />
          Achievement Unlocked!
        </p>
        <p className="text-sm font-medium">{achievement.name}</p>
        <p className="text-xs text-muted-foreground">+{achievement.xpReward} XP</p>
      </div>
    </div>
  );
}

interface LevelUpToastProps {
  newLevel: number;
  levelTitle: string;
  className?: string;
}

export function LevelUpToast({ newLevel, levelTitle, className }: LevelUpToastProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg animate-pulse">
        <span className="text-2xl font-bold text-white">{newLevel}</span>
      </div>
      <div>
        <p className="font-bold text-lg flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-500" />
          Level Up!
        </p>
        <p className="text-sm text-muted-foreground">
          You are now a <span className="font-medium text-foreground">{levelTitle}</span>
        </p>
      </div>
    </div>
  );
}
