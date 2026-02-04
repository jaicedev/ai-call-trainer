// User roles
export type UserRole = 'admin' | 'advisor';

// User types
export interface User {
  id: string;
  email: string;
  name: string | null;
  profile_picture_url: string | null;
  is_admin: boolean;
  role: UserRole;
  created_at: string;
  updated_at: string;
  // Gamification fields
  xp: number;
  level: number;
  total_calls_completed: number;
  total_call_time_seconds: number;
}

export interface VerificationCode {
  id: string;
  email: string;
  code: string;
  expires_at: string;
  created_at: string;
}

// Persona types
export interface Persona {
  id: string;
  name: string;
  description: string;
  personality_prompt: string;
  difficulty_level: 1 | 2 | 3 | 4 | 5;
  common_objections: string[];
  success_criteria: SuccessCriteria;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SuccessCriteria {
  tone_weight: number;
  product_knowledge_weight: number;
  objection_handling_weight: number;
  rapport_building_weight: number;
  closing_technique_weight: number;
  minimum_passing_score: number;
}

// Call types
export interface Call {
  id: string;
  user_id: string;
  persona_id: string | null;
  recording_url: string | null;
  transcript: TranscriptEntry[] | null;
  duration_seconds: number;
  started_at: string;
  ended_at: string | null;
  created_at: string;
  // Dynamic persona fields (used when persona_id is NULL)
  dynamic_persona_name: string | null;
  dynamic_persona_description: string | null;
  dynamic_persona_difficulty: number | null;
  // Review tracking fields
  reviewed: boolean;
  reviewed_at: string | null;
  reviewed_by: string | null;
}

export interface TranscriptEntry {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface CallScore {
  id: string;
  call_id: string;
  overall_score: number;
  tone_score: number;
  product_knowledge_score: number;
  objection_handling_score: number;
  rapport_building_score: number;
  closing_technique_score: number;
  ai_feedback: string;
  strengths: string[];
  improvements: string[];
  created_at: string;
}

// Call review types (admin feedback)
export interface CallReview {
  id: string;
  call_id: string;
  reviewer_id: string;
  feedback: string;
  notes: string | null;
  rating: number | null;
  created_at: string;
  updated_at: string;
  reviewer?: Pick<User, 'id' | 'name' | 'profile_picture_url'>;
}

// Feed types
export interface FeedComment {
  id: string;
  call_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user?: Pick<User, 'id' | 'name' | 'profile_picture_url'>;
}

export type ReactionType = 'fire' | 'clap' | 'lightbulb' | 'star';

export interface FeedReaction {
  id: string;
  call_id: string;
  user_id: string;
  reaction_type: ReactionType;
  created_at: string;
}

// Extended types for UI
export interface CallWithDetails extends Call {
  user: Pick<User, 'id' | 'name' | 'profile_picture_url'>;
  persona: Pick<Persona, 'id' | 'name' | 'difficulty_level'> | null;
  score: CallScore | null;
  reactions: ReactionCount[];
  comments_count: number;
  review?: CallReview | null;
}

// Extended call type for admin review queue
export interface CallForReview extends Call {
  user: Pick<User, 'id' | 'name' | 'profile_picture_url'>;
  persona: Pick<Persona, 'id' | 'name' | 'difficulty_level' | 'description' | 'personality_prompt'> | null;
  score: CallScore | null;
}

export interface ReactionCount {
  type: ReactionType;
  count: number;
  user_reacted: boolean;
}

// API types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  has_more: boolean;
}

// Auth types
export interface AuthSession {
  user: User;
  expires_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface VerifyCodeRequest {
  email: string;
  code: string;
}

export interface SetPasswordRequest {
  email: string;
  code: string;
  password: string;
}

// Gamification types
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'calls' | 'score' | 'streak' | 'time' | 'special';
  requirement: number;
  xpReward: number;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
}

export interface XPHistoryEntry {
  id: string;
  user_id: string;
  call_id: string | null;
  xp_amount: number;
  reason: string;
  created_at: string;
}

export interface GamificationResult {
  xpGained: number;
  newTotalXP: number;
  previousLevel: number;
  newLevel: number;
  leveledUp: boolean;
  newAchievements: Achievement[];
}

export interface LeaderboardEntry {
  user: Pick<User, 'id' | 'name' | 'profile_picture_url'>;
  xp: number;
  level: number;
  total_calls: number;
  total_time_seconds: number;
  average_score: number;
  rank: number;
}

export interface LeaderboardData {
  topByXP: LeaderboardEntry[];
  topByCallCount: LeaderboardEntry[];
  topByTime: LeaderboardEntry[];
  topByScore: LeaderboardEntry[];
  recentAchievements: {
    user: Pick<User, 'id' | 'name' | 'profile_picture_url'>;
    achievement: Achievement;
    unlocked_at: string;
  }[];
}

// Admin types
export interface UserStats {
  user: User;
  total_calls: number;
  average_score: number;
  best_score: number;
  total_duration_minutes: number;
  calls_this_week: number;
}

export interface AnalyticsSummary {
  total_calls_this_week: number;
  total_calls_this_month: number;
  average_score: number;
  most_practiced_personas: { persona: Persona; count: number }[];
  top_performers: { user: User; average_score: number; call_count: number }[];
}
