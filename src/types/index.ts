// User types
export interface User {
  id: string;
  email: string;
  name: string | null;
  profile_picture_url: string | null;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
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
  persona_id: string;
  recording_url: string | null;
  transcript: TranscriptEntry[] | null;
  duration_seconds: number;
  started_at: string;
  ended_at: string | null;
  created_at: string;
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
  persona: Pick<Persona, 'id' | 'name' | 'difficulty_level'>;
  score: CallScore | null;
  reactions: ReactionCount[];
  comments_count: number;
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
