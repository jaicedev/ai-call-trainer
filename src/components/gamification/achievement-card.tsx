'use client';

import { cn } from '@/lib/utils';
import { Achievement } from '@/types';
import {
  Phone,
  PhoneCall,
  PhoneForwarded,
  Headphones,
  Headset,
  Award,
  Shield,
  Crown,
  CheckCircle,
  ThumbsUp,
  Star,
  Zap,
  Sparkles,
  Clock,
  Timer,
  Hourglass,
  AlarmClock,
  CalendarClock,
  Flame,
  Trophy,
  Milestone,
  Lock,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AchievementCardProps {
  achievement: Achievement & { unlocked: boolean; unlocked_at?: string | null };
  compact?: boolean;
  className?: string;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  phone: Phone,
  'phone-call': PhoneCall,
  'phone-forwarded': PhoneForwarded,
  headphones: Headphones,
  headset: Headset,
  award: Award,
  shield: Shield,
  crown: Crown,
  'check-circle': CheckCircle,
  'thumbs-up': ThumbsUp,
  star: Star,
  zap: Zap,
  sparkles: Sparkles,
  clock: Clock,
  timer: Timer,
  hourglass: Hourglass,
  'alarm-clock': AlarmClock,
  'calendar-clock': CalendarClock,
  flame: Flame,
  trophy: Trophy,
  milestone: Milestone,
};

const categoryColors = {
  calls: 'bg-blue-100 text-blue-800',
  score: 'bg-green-100 text-green-800',
  time: 'bg-purple-100 text-purple-800',
  streak: 'bg-orange-100 text-orange-800',
  special: 'bg-yellow-100 text-yellow-800',
};

export function AchievementCard({ achievement, compact = false, className }: AchievementCardProps) {
  const Icon = iconMap[achievement.icon] || Award;
  const isLocked = !achievement.unlocked;

  if (compact) {
    return (
      <div
        className={cn(
          'flex items-center gap-3 p-3 border',
          isLocked ? 'opacity-50 bg-zinc-50' : 'bg-white',
          className
        )}
      >
        <div
          className={cn(
            'flex items-center justify-center w-10 h-10',
            isLocked ? 'bg-zinc-200' : 'bg-gradient-to-br from-yellow-400 to-orange-500'
          )}
        >
          {isLocked ? (
            <Lock className="w-5 h-5 text-zinc-400" />
          ) : (
            <Icon className="w-5 h-5 text-white" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn('font-medium truncate', isLocked && 'text-muted-foreground')}>
            {achievement.name}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {achievement.description}
          </p>
        </div>
        <Badge variant="secondary" className="shrink-0">
          +{achievement.xpReward} XP
        </Badge>
      </div>
    );
  }

  return (
    <Card
      className={cn(
        'overflow-hidden transition-all hover:shadow-md',
        isLocked && 'opacity-60',
        className
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div
            className={cn(
              'flex items-center justify-center w-14 h-14 shrink-0',
              isLocked
                ? 'bg-zinc-100'
                : 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg'
            )}
          >
            {isLocked ? (
              <Lock className="w-7 h-7 text-zinc-400" />
            ) : (
              <Icon className="w-7 h-7 text-white" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className={cn('font-semibold', isLocked && 'text-muted-foreground')}>
                {achievement.name}
              </h3>
              <Badge className={cn('text-xs', categoryColors[achievement.category])}>
                {achievement.category}
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground mb-2">
              {achievement.description}
            </p>

            <div className="flex items-center justify-between">
              <Badge variant="outline" className="font-semibold">
                +{achievement.xpReward} XP
              </Badge>

              {achievement.unlocked && achievement.unlocked_at && (
                <span className="text-xs text-muted-foreground">
                  Unlocked {new Date(achievement.unlocked_at).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
