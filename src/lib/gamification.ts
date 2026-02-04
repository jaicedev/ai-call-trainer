import { Achievement } from '@/types';

// XP calculation constants
const BASE_XP_PER_CALL = 25;
const XP_PER_SCORE_POINT = 2;
const DIFFICULTY_MULTIPLIERS = {
  1: 1.0,
  2: 1.2,
  3: 1.5,
  4: 1.8,
  5: 2.0,
};
const TIME_BONUS_THRESHOLD = 120; // 2 minutes minimum for time bonus
const TIME_BONUS_XP_PER_MINUTE = 5;
const PERFECT_SCORE_THRESHOLD = 90;
const PERFECT_SCORE_BONUS = 50;

// Level thresholds (XP required to reach each level)
export const LEVEL_THRESHOLDS = [
  0,      // Level 1: 0 XP
  100,    // Level 2: 100 XP
  250,    // Level 3: 250 XP
  500,    // Level 4: 500 XP
  850,    // Level 5: 850 XP
  1300,   // Level 6: 1300 XP
  1850,   // Level 7: 1850 XP
  2500,   // Level 8: 2500 XP
  3300,   // Level 9: 3300 XP
  4200,   // Level 10: 4200 XP
  5250,   // Level 11: 5250 XP
  6450,   // Level 12: 6450 XP
  7800,   // Level 13: 7800 XP
  9300,   // Level 14: 9300 XP
  11000,  // Level 15: 11000 XP
  13000,  // Level 16: 13000 XP
  15500,  // Level 17: 15500 XP
  18500,  // Level 18: 18500 XP
  22000,  // Level 19: 22000 XP
  26000,  // Level 20: 26000 XP
  31000,  // Level 21: 31000 XP
  37000,  // Level 22: 37000 XP
  44000,  // Level 23: 44000 XP
  52000,  // Level 24: 52000 XP
  61000,  // Level 25: 61000 XP (max)
];

export const MAX_LEVEL = LEVEL_THRESHOLDS.length;

// Level titles
export const LEVEL_TITLES: Record<number, string> = {
  1: 'Rookie',
  2: 'Beginner',
  3: 'Trainee',
  4: 'Apprentice',
  5: 'Junior Rep',
  6: 'Sales Rep',
  7: 'Senior Rep',
  8: 'Specialist',
  9: 'Expert',
  10: 'Advisor',
  11: 'Consultant',
  12: 'Senior Consultant',
  13: 'Account Manager',
  14: 'Senior Manager',
  15: 'Director',
  16: 'Senior Director',
  17: 'VP of Sales',
  18: 'Senior VP',
  19: 'Executive',
  20: 'Chief Sales Officer',
  21: 'Sales Legend',
  22: 'Sales Master',
  23: 'Sales Guru',
  24: 'Sales Champion',
  25: 'Sales Immortal',
};

// All achievements definition
export const ACHIEVEMENTS: Achievement[] = [
  // Call count achievements
  {
    id: 'first_call',
    name: 'First Steps',
    description: 'Complete your first practice call',
    icon: 'phone',
    category: 'calls',
    requirement: 1,
    xpReward: 25,
  },
  {
    id: 'calls_5',
    name: 'Getting Started',
    description: 'Complete 5 practice calls',
    icon: 'phone-call',
    category: 'calls',
    requirement: 5,
    xpReward: 50,
  },
  {
    id: 'calls_10',
    name: 'Regular Caller',
    description: 'Complete 10 practice calls',
    icon: 'phone-forwarded',
    category: 'calls',
    requirement: 10,
    xpReward: 100,
  },
  {
    id: 'calls_25',
    name: 'Dedicated Trainer',
    description: 'Complete 25 practice calls',
    icon: 'headphones',
    category: 'calls',
    requirement: 25,
    xpReward: 200,
  },
  {
    id: 'calls_50',
    name: 'Call Center Pro',
    description: 'Complete 50 practice calls',
    icon: 'headset',
    category: 'calls',
    requirement: 50,
    xpReward: 400,
  },
  {
    id: 'calls_100',
    name: 'Century Club',
    description: 'Complete 100 practice calls',
    icon: 'award',
    category: 'calls',
    requirement: 100,
    xpReward: 1000,
  },
  {
    id: 'calls_250',
    name: 'Phone Warrior',
    description: 'Complete 250 practice calls',
    icon: 'shield',
    category: 'calls',
    requirement: 250,
    xpReward: 2500,
  },
  {
    id: 'calls_500',
    name: 'Call Legend',
    description: 'Complete 500 practice calls',
    icon: 'crown',
    category: 'calls',
    requirement: 500,
    xpReward: 5000,
  },

  // Score achievements
  {
    id: 'score_70',
    name: 'Passing Grade',
    description: 'Achieve a score of 70 or higher on a call',
    icon: 'check-circle',
    category: 'score',
    requirement: 70,
    xpReward: 50,
  },
  {
    id: 'score_80',
    name: 'Great Performance',
    description: 'Achieve a score of 80 or higher on a call',
    icon: 'thumbs-up',
    category: 'score',
    requirement: 80,
    xpReward: 100,
  },
  {
    id: 'score_90',
    name: 'Excellent Call',
    description: 'Achieve a score of 90 or higher on a call',
    icon: 'star',
    category: 'score',
    requirement: 90,
    xpReward: 200,
  },
  {
    id: 'score_95',
    name: 'Near Perfection',
    description: 'Achieve a score of 95 or higher on a call',
    icon: 'zap',
    category: 'score',
    requirement: 95,
    xpReward: 300,
  },
  {
    id: 'score_100',
    name: 'Perfect Call',
    description: 'Achieve a perfect score of 100 on a call',
    icon: 'sparkles',
    category: 'score',
    requirement: 100,
    xpReward: 500,
  },

  // Time achievements (in seconds)
  {
    id: 'time_30min',
    name: 'Half Hour Hero',
    description: 'Spend 30 minutes on practice calls',
    icon: 'clock',
    category: 'time',
    requirement: 1800,
    xpReward: 75,
  },
  {
    id: 'time_1hr',
    name: 'Hour of Power',
    description: 'Spend 1 hour on practice calls',
    icon: 'timer',
    category: 'time',
    requirement: 3600,
    xpReward: 150,
  },
  {
    id: 'time_5hr',
    name: 'Dedicated Practitioner',
    description: 'Spend 5 hours on practice calls',
    icon: 'hourglass',
    category: 'time',
    requirement: 18000,
    xpReward: 500,
  },
  {
    id: 'time_10hr',
    name: 'Training Enthusiast',
    description: 'Spend 10 hours on practice calls',
    icon: 'alarm-clock',
    category: 'time',
    requirement: 36000,
    xpReward: 1000,
  },
  {
    id: 'time_24hr',
    name: '24-Hour Champion',
    description: 'Spend 24 hours on practice calls',
    icon: 'calendar-clock',
    category: 'time',
    requirement: 86400,
    xpReward: 2500,
  },

  // Special achievements
  {
    id: 'difficulty_5',
    name: 'Brave Soul',
    description: 'Complete a call on the hardest difficulty (Level 5)',
    icon: 'flame',
    category: 'special',
    requirement: 5,
    xpReward: 150,
  },
  {
    id: 'difficulty_5_score_80',
    name: 'Master Closer',
    description: 'Score 80+ on a Level 5 difficulty call',
    icon: 'trophy',
    category: 'special',
    requirement: 1,
    xpReward: 300,
  },
  {
    id: 'long_call',
    name: 'Marathon Caller',
    description: 'Complete a single call lasting over 10 minutes',
    icon: 'milestone',
    category: 'special',
    requirement: 600,
    xpReward: 100,
  },
];

// Calculate XP for a completed call
export function calculateCallXP(
  score: number,
  difficulty: number,
  durationSeconds: number
): { totalXP: number; breakdown: { base: number; score: number; difficulty: number; time: number; perfect: number } } {
  const difficultyMultiplier = DIFFICULTY_MULTIPLIERS[difficulty as keyof typeof DIFFICULTY_MULTIPLIERS] || 1.0;

  // Base XP for completing a call
  const baseXP = BASE_XP_PER_CALL;

  // XP based on score
  const scoreXP = Math.round(score * XP_PER_SCORE_POINT);

  // Difficulty bonus (percentage increase)
  const difficultyBonus = Math.round((baseXP + scoreXP) * (difficultyMultiplier - 1));

  // Time bonus for longer calls
  let timeBonus = 0;
  if (durationSeconds >= TIME_BONUS_THRESHOLD) {
    const minutes = Math.floor(durationSeconds / 60);
    timeBonus = Math.min(minutes * TIME_BONUS_XP_PER_MINUTE, 50); // Cap at 50 XP
  }

  // Perfect score bonus
  const perfectBonus = score >= PERFECT_SCORE_THRESHOLD ? PERFECT_SCORE_BONUS : 0;

  const totalXP = baseXP + scoreXP + difficultyBonus + timeBonus + perfectBonus;

  return {
    totalXP,
    breakdown: {
      base: baseXP,
      score: scoreXP,
      difficulty: difficultyBonus,
      time: timeBonus,
      perfect: perfectBonus,
    },
  };
}

// Calculate level from total XP
export function calculateLevelFromXP(xp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) {
      return i + 1;
    }
  }
  return 1;
}

// Get XP needed for next level
export function getXPForNextLevel(currentLevel: number): number {
  if (currentLevel >= MAX_LEVEL) {
    return LEVEL_THRESHOLDS[MAX_LEVEL - 1];
  }
  return LEVEL_THRESHOLDS[currentLevel];
}

// Get XP progress within current level
export function getLevelProgress(xp: number, level: number): { current: number; required: number; percentage: number } {
  const currentLevelXP = LEVEL_THRESHOLDS[level - 1];
  const nextLevelXP = level >= MAX_LEVEL ? LEVEL_THRESHOLDS[MAX_LEVEL - 1] : LEVEL_THRESHOLDS[level];

  const xpInCurrentLevel = xp - currentLevelXP;
  const xpRequiredForLevel = nextLevelXP - currentLevelXP;

  const percentage = level >= MAX_LEVEL
    ? 100
    : Math.min(100, Math.round((xpInCurrentLevel / xpRequiredForLevel) * 100));

  return {
    current: xpInCurrentLevel,
    required: xpRequiredForLevel,
    percentage,
  };
}

// Get level title
export function getLevelTitle(level: number): string {
  return LEVEL_TITLES[level] || LEVEL_TITLES[MAX_LEVEL];
}

// Check which achievements are newly unlocked
export function checkNewAchievements(
  unlockedAchievementIds: string[],
  totalCalls: number,
  highestScore: number,
  totalTimeSeconds: number,
  currentCallDifficulty?: number,
  currentCallScore?: number,
  currentCallDuration?: number
): Achievement[] {
  const newAchievements: Achievement[] = [];

  for (const achievement of ACHIEVEMENTS) {
    // Skip already unlocked
    if (unlockedAchievementIds.includes(achievement.id)) {
      continue;
    }

    let unlocked = false;

    switch (achievement.category) {
      case 'calls':
        unlocked = totalCalls >= achievement.requirement;
        break;

      case 'score':
        unlocked = highestScore >= achievement.requirement;
        break;

      case 'time':
        unlocked = totalTimeSeconds >= achievement.requirement;
        break;

      case 'special':
        if (achievement.id === 'difficulty_5') {
          unlocked = currentCallDifficulty === 5;
        } else if (achievement.id === 'difficulty_5_score_80') {
          unlocked = currentCallDifficulty === 5 && (currentCallScore ?? 0) >= 80;
        } else if (achievement.id === 'long_call') {
          unlocked = (currentCallDuration ?? 0) >= achievement.requirement;
        }
        break;
    }

    if (unlocked) {
      newAchievements.push(achievement);
    }
  }

  return newAchievements;
}

// Get all achievements with unlock status
export function getAchievementsWithStatus(
  unlockedAchievementIds: string[]
): (Achievement & { unlocked: boolean })[] {
  return ACHIEVEMENTS.map((achievement) => ({
    ...achievement,
    unlocked: unlockedAchievementIds.includes(achievement.id),
  }));
}

// Get achievement by ID
export function getAchievementById(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}

// Format XP number for display
export function formatXP(xp: number): string {
  if (xp >= 1000000) {
    return `${(xp / 1000000).toFixed(1)}M`;
  }
  if (xp >= 1000) {
    return `${(xp / 1000).toFixed(1)}K`;
  }
  return xp.toString();
}

// Format time for display
export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}
