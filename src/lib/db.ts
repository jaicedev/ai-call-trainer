import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import { User, Persona, Call, CallScore, FeedComment, FeedReaction, CallWithDetails, UserAchievement, XPHistoryEntry, Achievement, GamificationResult, LeaderboardEntry, CallReview, CallForReview } from '@/types';
import { calculateCallXP, calculateLevelFromXP, checkNewAchievements, getAchievementById, ACHIEVEMENTS } from './gamification';

// Helper to get Supabase admin client (called at request time, not module load)
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// User operations
export async function getUserByEmail(email: string): Promise<User | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email.toLowerCase())
    .single();

  if (error || !data) return null;
  return data as User;
}

export async function getUserById(id: string): Promise<User | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return data as User;
}

export async function createUser(
  email: string,
  password: string
): Promise<User | null> {
  const supabase = getSupabase();
  const passwordHash = await bcrypt.hash(password, 10);

  const { data, error } = await supabase
    .from('users')
    .insert({
      email: email.toLowerCase(),
      password_hash: passwordHash,
    })
    .select()
    .single();

  if (error) {
    console.error('Create user error:', error);
    return null;
  }

  return data as User;
}

export async function verifyPassword(
  user: User,
  password: string
): Promise<boolean> {
  const supabase = getSupabase();
  const { data } = await supabase
    .from('users')
    .select('password_hash')
    .eq('id', user.id)
    .single();

  if (!data) return false;
  return bcrypt.compare(password, data.password_hash);
}

export async function updateUser(
  id: string,
  updates: Partial<Pick<User, 'name' | 'profile_picture_url'>>
): Promise<User | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) return null;
  return data as User;
}

export async function updateUserPassword(
  id: string,
  newPassword: string
): Promise<boolean> {
  const supabase = getSupabase();
  const passwordHash = await bcrypt.hash(newPassword, 10);

  const { error } = await supabase
    .from('users')
    .update({ password_hash: passwordHash })
    .eq('id', id);

  return !error;
}

// Verification code operations
export async function createVerificationCode(
  email: string,
  code: string
): Promise<boolean> {
  const supabase = getSupabase();
  // Delete any existing codes for this email
  await supabase
    .from('verification_codes')
    .delete()
    .eq('email', email.toLowerCase());

  // Create new code with 10 minute expiry
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  const { error } = await supabase.from('verification_codes').insert({
    email: email.toLowerCase(),
    code,
    expires_at: expiresAt.toISOString(),
  });

  return !error;
}

export async function verifyCode(
  email: string,
  code: string
): Promise<boolean> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('verification_codes')
    .select('*')
    .eq('email', email.toLowerCase())
    .eq('code', code)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (error || !data) return false;

  // Delete the used code
  await supabase
    .from('verification_codes')
    .delete()
    .eq('id', data.id);

  return true;
}

// Persona operations
export async function getActivePersonas(): Promise<Persona[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('personas')
    .select('*')
    .eq('is_active', true)
    .order('difficulty_level', { ascending: true });

  if (error) return [];
  return data as Persona[];
}

export async function getAllPersonas(): Promise<Persona[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('personas')
    .select('*')
    .order('name', { ascending: true });

  if (error) return [];
  return data as Persona[];
}

export async function getPersonaById(id: string): Promise<Persona | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('personas')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data as Persona;
}

export async function createPersona(
  persona: Omit<Persona, 'id' | 'created_at' | 'updated_at'>
): Promise<Persona | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('personas')
    .insert(persona)
    .select()
    .single();

  if (error) return null;
  return data as Persona;
}

export async function updatePersona(
  id: string,
  updates: Partial<Omit<Persona, 'id' | 'created_at' | 'updated_at'>>
): Promise<Persona | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('personas')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) return null;
  return data as Persona;
}

// Call operations
export async function createCall(
  userId: string,
  personaId: string
): Promise<Call | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('calls')
    .insert({
      user_id: userId,
      persona_id: personaId,
      started_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) return null;
  return data as Call;
}

// Mock business details type
interface MockBusinessInput {
  businessName: string;
  state: string;
  industry: string;
  phone: string;
  email: string;
}

// Create call with dynamic persona (no database persona reference)
export async function createCallWithDynamicPersona(
  userId: string,
  personaName: string,
  personaDescription: string,
  difficulty: number,
  mockBusiness?: MockBusinessInput
): Promise<Call | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('calls')
    .insert({
      user_id: userId,
      persona_id: null, // No database persona for dynamic calls
      started_at: new Date().toISOString(),
      dynamic_persona_name: personaName,
      dynamic_persona_description: personaDescription,
      dynamic_persona_difficulty: difficulty,
      // Mock business details for CRM-like display
      mock_business_name: mockBusiness?.businessName || null,
      mock_business_state: mockBusiness?.state || null,
      mock_business_industry: mockBusiness?.industry || null,
      mock_business_phone: mockBusiness?.phone || null,
      mock_business_email: mockBusiness?.email || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Create dynamic call error:', error);
    return null;
  }
  return data as Call;
}

export async function endCall(
  callId: string,
  recordingUrl: string | null,
  transcript: unknown[] | null,
  durationSeconds: number
): Promise<Call | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('calls')
    .update({
      recording_url: recordingUrl,
      transcript,
      duration_seconds: durationSeconds,
      ended_at: new Date().toISOString(),
    })
    .eq('id', callId)
    .select()
    .single();

  if (error) return null;
  return data as Call;
}

// Update call notes
export async function updateCallNotes(
  callId: string,
  notes: string
): Promise<Call | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('calls')
    .update({
      call_notes: notes,
    })
    .eq('id', callId)
    .select()
    .single();

  if (error) {
    console.error('Update call notes error:', error);
    return null;
  }
  return data as Call;
}

export async function saveCallScore(
  score: Omit<CallScore, 'id' | 'created_at'>
): Promise<CallScore | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('call_scores')
    .insert(score)
    .select()
    .single();

  if (error) return null;
  return data as CallScore;
}

export async function getCallsForFeed(
  page: number = 1,
  perPage: number = 20,
  currentUserId?: string
): Promise<{ calls: CallWithDetails[]; total: number }> {
  const supabase = getSupabase();
  const offset = (page - 1) * perPage;

  // Get total count
  const { count } = await supabase
    .from('calls')
    .select('*', { count: 'exact', head: true })
    .not('ended_at', 'is', null);

  // Get calls with related data
  const { data: calls, error } = await supabase
    .from('calls')
    .select(`
      *,
      user:users(id, name, profile_picture_url),
      persona:personas(id, name, difficulty_level),
      score:call_scores(*)
    `)
    .not('ended_at', 'is', null)
    .order('created_at', { ascending: false })
    .range(offset, offset + perPage - 1);

  if (error || !calls) {
    return { calls: [], total: 0 };
  }

  // Get reactions for these calls
  const callIds = calls.map((c) => c.id);

  const { data: reactions } = await supabase
    .from('feed_reactions')
    .select('*')
    .in('call_id', callIds);

  const { data: commentCounts } = await supabase
    .from('feed_comments')
    .select('call_id')
    .in('call_id', callIds);

  // Get reviews for these calls
  const { data: reviews } = await supabase
    .from('call_reviews')
    .select(`
      *,
      reviewer:users(id, name, profile_picture_url)
    `)
    .in('call_id', callIds);

  // Process calls with reactions and reviews
  const processedCalls = calls.map((call) => {
    const callReactions = (reactions || []).filter((r) => r.call_id === call.id);
    const reactionCounts: Record<string, { count: number; user_reacted: boolean }> = {};

    for (const r of callReactions) {
      if (!reactionCounts[r.reaction_type]) {
        reactionCounts[r.reaction_type] = { count: 0, user_reacted: false };
      }
      reactionCounts[r.reaction_type].count++;
      if (currentUserId && r.user_id === currentUserId) {
        reactionCounts[r.reaction_type].user_reacted = true;
      }
    }

    const commentsForCall = (commentCounts || []).filter((c) => c.call_id === call.id);
    const callReview = (reviews || []).find((r) => r.call_id === call.id) || null;

    return {
      ...call,
      user: call.user,
      persona: call.persona,
      score: call.score?.[0] || null,
      reactions: Object.entries(reactionCounts).map(([type, data]) => ({
        type: type as 'fire' | 'clap' | 'lightbulb' | 'star',
        count: data.count,
        user_reacted: data.user_reacted,
      })),
      comments_count: commentsForCall.length,
      review: callReview as CallReview | null,
    } as CallWithDetails;
  });

  return { calls: processedCalls, total: count || 0 };
}

export async function getUserCalls(userId: string): Promise<CallWithDetails[]> {
  const supabase = getSupabase();
  const { data: calls, error } = await supabase
    .from('calls')
    .select(`
      *,
      user:users(id, name, profile_picture_url),
      persona:personas(id, name, difficulty_level),
      score:call_scores(*)
    `)
    .eq('user_id', userId)
    .not('ended_at', 'is', null)
    .order('created_at', { ascending: false });

  if (error || !calls) return [];

  return calls.map((call) => ({
    ...call,
    user: call.user,
    persona: call.persona,
    score: call.score?.[0] || null,
    reactions: [],
    comments_count: 0,
  })) as CallWithDetails[];
}

// Comment operations
export async function addComment(
  callId: string,
  userId: string,
  content: string
): Promise<FeedComment | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('feed_comments')
    .insert({
      call_id: callId,
      user_id: userId,
      content,
    })
    .select(`
      *,
      user:users(id, name, profile_picture_url)
    `)
    .single();

  if (error) return null;
  return data as FeedComment;
}

export async function getCommentsForCall(callId: string): Promise<FeedComment[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('feed_comments')
    .select(`
      *,
      user:users(id, name, profile_picture_url)
    `)
    .eq('call_id', callId)
    .order('created_at', { ascending: true });

  if (error) return [];
  return data as FeedComment[];
}

// Reaction operations
export async function toggleReaction(
  callId: string,
  userId: string,
  reactionType: 'fire' | 'clap' | 'lightbulb' | 'star'
): Promise<{ added: boolean }> {
  const supabase = getSupabase();
  // Check if reaction exists
  const { data: existing } = await supabase
    .from('feed_reactions')
    .select('id')
    .eq('call_id', callId)
    .eq('user_id', userId)
    .eq('reaction_type', reactionType)
    .single();

  if (existing) {
    // Remove reaction
    await supabase
      .from('feed_reactions')
      .delete()
      .eq('id', existing.id);
    return { added: false };
  } else {
    // Add reaction
    await supabase.from('feed_reactions').insert({
      call_id: callId,
      user_id: userId,
      reaction_type: reactionType,
    });
    return { added: true };
  }
}

// Admin operations
export async function getAllUsers(): Promise<User[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return [];
  return data as User[];
}

export async function toggleUserAdmin(
  userId: string,
  isAdmin: boolean
): Promise<boolean> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('users')
    .update({ is_admin: isAdmin })
    .eq('id', userId);

  return !error;
}

export async function deletePersona(id: string): Promise<boolean> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('personas')
    .delete()
    .eq('id', id);

  return !error;
}

// Gamification operations

// Get user's unlocked achievements
export async function getUserAchievements(userId: string): Promise<UserAchievement[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('user_achievements')
    .select('*')
    .eq('user_id', userId)
    .order('unlocked_at', { ascending: false });

  if (error) return [];
  return data as UserAchievement[];
}

// Get user's XP history
export async function getUserXPHistory(userId: string, limit: number = 20): Promise<XPHistoryEntry[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('xp_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) return [];
  return data as XPHistoryEntry[];
}

// Award XP and check for achievements after a call
export async function processCallGamification(
  userId: string,
  callId: string,
  score: number,
  difficulty: number,
  durationSeconds: number
): Promise<GamificationResult> {
  const supabase = getSupabase();

  // Get current user data
  const { data: user } = await supabase
    .from('users')
    .select('xp, level, total_calls_completed, total_call_time_seconds')
    .eq('id', userId)
    .single();

  const currentXP = user?.xp || 0;
  const currentLevel = user?.level || 1;
  const currentCalls = user?.total_calls_completed || 0;
  const currentTime = user?.total_call_time_seconds || 0;

  // Calculate XP for this call
  const { totalXP, breakdown } = calculateCallXP(score, difficulty, durationSeconds);

  // Calculate new totals
  const newXP = currentXP + totalXP;
  const newCalls = currentCalls + 1;
  const newTime = currentTime + durationSeconds;
  const newLevel = calculateLevelFromXP(newXP);

  // Get user's existing achievements
  const { data: existingAchievements } = await supabase
    .from('user_achievements')
    .select('achievement_id')
    .eq('user_id', userId);

  const unlockedIds = (existingAchievements || []).map((a) => a.achievement_id);

  // Check for new achievements
  const newAchievements = checkNewAchievements(
    unlockedIds,
    newCalls,
    score,
    newTime,
    difficulty,
    score,
    durationSeconds
  );

  // Calculate total XP including achievement bonuses
  let achievementBonusXP = 0;
  for (const achievement of newAchievements) {
    achievementBonusXP += achievement.xpReward;
  }

  const finalXP = newXP + achievementBonusXP;
  const finalLevel = calculateLevelFromXP(finalXP);

  // Update user stats
  await supabase
    .from('users')
    .update({
      xp: finalXP,
      level: finalLevel,
      total_calls_completed: newCalls,
      total_call_time_seconds: newTime,
    })
    .eq('id', userId);

  // Record XP history - main call XP
  const xpReasonParts = [];
  if (breakdown.base > 0) xpReasonParts.push(`Call: +${breakdown.base}`);
  if (breakdown.score > 0) xpReasonParts.push(`Score: +${breakdown.score}`);
  if (breakdown.difficulty > 0) xpReasonParts.push(`Difficulty: +${breakdown.difficulty}`);
  if (breakdown.time > 0) xpReasonParts.push(`Time: +${breakdown.time}`);
  if (breakdown.perfect > 0) xpReasonParts.push(`Perfect: +${breakdown.perfect}`);

  await supabase.from('xp_history').insert({
    user_id: userId,
    call_id: callId,
    xp_amount: totalXP,
    reason: `Call completed (Score: ${score}) - ${xpReasonParts.join(', ')}`,
  });

  // Record achievements and their XP
  for (const achievement of newAchievements) {
    await supabase.from('user_achievements').insert({
      user_id: userId,
      achievement_id: achievement.id,
    });

    await supabase.from('xp_history').insert({
      user_id: userId,
      call_id: callId,
      xp_amount: achievement.xpReward,
      reason: `Achievement unlocked: ${achievement.name}`,
    });
  }

  return {
    xpGained: totalXP + achievementBonusXP,
    newTotalXP: finalXP,
    previousLevel: currentLevel,
    newLevel: finalLevel,
    leveledUp: finalLevel > currentLevel,
    newAchievements,
  };
}

// Get leaderboard data
export async function getLeaderboard(limit: number = 10): Promise<{
  topByXP: LeaderboardEntry[];
  topByCallCount: LeaderboardEntry[];
  topByTime: LeaderboardEntry[];
  recentAchievements: { user: Pick<User, 'id' | 'name' | 'profile_picture_url'>; achievement: Achievement; unlocked_at: string }[];
}> {
  const supabase = getSupabase();

  // Get all users with their stats
  const { data: users } = await supabase
    .from('users')
    .select('id, name, profile_picture_url, xp, level, total_calls_completed, total_call_time_seconds')
    .order('xp', { ascending: false });

  if (!users) {
    return { topByXP: [], topByCallCount: [], topByTime: [], recentAchievements: [] };
  }

  // Get call scores for average calculation
  const { data: allCalls } = await supabase
    .from('calls')
    .select(`
      user_id,
      score:call_scores(overall_score)
    `)
    .not('ended_at', 'is', null);

  // Calculate average scores per user
  const userScores: Record<string, number[]> = {};
  for (const call of allCalls || []) {
    const scoreData = call.score as unknown as { overall_score: number }[] | null;
    if (scoreData && scoreData.length > 0) {
      if (!userScores[call.user_id]) {
        userScores[call.user_id] = [];
      }
      userScores[call.user_id].push(scoreData[0].overall_score);
    }
  }

  // Transform to LeaderboardEntry with ranks
  const entries: LeaderboardEntry[] = users.map((u, index) => {
    const scores = userScores[u.id] || [];
    const avgScore = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

    return {
      user: {
        id: u.id,
        name: u.name,
        profile_picture_url: u.profile_picture_url,
      },
      xp: u.xp || 0,
      level: u.level || 1,
      total_calls: u.total_calls_completed || 0,
      total_time_seconds: u.total_call_time_seconds || 0,
      average_score: avgScore,
      rank: index + 1,
    };
  });

  // Sort for different leaderboards
  const topByXP = entries.slice(0, limit);

  const topByCallCount = [...entries]
    .sort((a, b) => b.total_calls - a.total_calls)
    .map((e, i) => ({ ...e, rank: i + 1 }))
    .slice(0, limit);

  const topByTime = [...entries]
    .sort((a, b) => b.total_time_seconds - a.total_time_seconds)
    .map((e, i) => ({ ...e, rank: i + 1 }))
    .slice(0, limit);

  // Get recent achievements
  const { data: recentAchievementData } = await supabase
    .from('user_achievements')
    .select(`
      achievement_id,
      unlocked_at,
      user:users(id, name, profile_picture_url)
    `)
    .order('unlocked_at', { ascending: false })
    .limit(limit);

  const recentAchievements = (recentAchievementData || [])
    .map((a) => {
      const achievement = getAchievementById(a.achievement_id);
      if (!achievement) return null;
      // Handle joined user data - it may come as array or object
      const userData = Array.isArray(a.user) ? a.user[0] : a.user;
      if (!userData) return null;
      return {
        user: userData as Pick<User, 'id' | 'name' | 'profile_picture_url'>,
        achievement,
        unlocked_at: a.unlocked_at,
      };
    })
    .filter((a): a is NonNullable<typeof a> => a !== null);

  return { topByXP, topByCallCount, topByTime, recentAchievements };
}

// Get user's rank
export async function getUserRank(userId: string): Promise<number> {
  const supabase = getSupabase();

  const { data: users } = await supabase
    .from('users')
    .select('id, xp')
    .order('xp', { ascending: false });

  if (!users) return 0;

  const index = users.findIndex((u) => u.id === userId);
  return index >= 0 ? index + 1 : 0;
}

// ============================================
// Admin Review Queue Operations
// ============================================

// Get unreviewed calls for admin review queue
export async function getUnreviewedCalls(
  page: number = 1,
  perPage: number = 20
): Promise<{ calls: CallForReview[]; total: number }> {
  const supabase = getSupabase();
  const offset = (page - 1) * perPage;

  // Get total count of unreviewed completed calls
  const { count } = await supabase
    .from('calls')
    .select('*', { count: 'exact', head: true })
    .not('ended_at', 'is', null)
    .or('reviewed.is.null,reviewed.eq.false');

  // Get unreviewed calls with related data
  const { data: calls, error } = await supabase
    .from('calls')
    .select(`
      *,
      user:users(id, name, profile_picture_url),
      persona:personas(id, name, difficulty_level, description, personality_prompt),
      score:call_scores(*)
    `)
    .not('ended_at', 'is', null)
    .or('reviewed.is.null,reviewed.eq.false')
    .order('created_at', { ascending: true }) // Oldest first for FIFO queue
    .range(offset, offset + perPage - 1);

  if (error || !calls) {
    return { calls: [], total: 0 };
  }

  const processedCalls = calls.map((call) => ({
    ...call,
    user: call.user,
    persona: call.persona,
    score: call.score?.[0] || null,
  })) as CallForReview[];

  return { calls: processedCalls, total: count || 0 };
}

// Get the next call to review (oldest unreviewed)
export async function getNextCallForReview(): Promise<CallForReview | null> {
  const supabase = getSupabase();

  const { data: call, error } = await supabase
    .from('calls')
    .select(`
      *,
      user:users(id, name, profile_picture_url),
      persona:personas(id, name, difficulty_level, description, personality_prompt),
      score:call_scores(*)
    `)
    .not('ended_at', 'is', null)
    .or('reviewed.is.null,reviewed.eq.false')
    .order('created_at', { ascending: true })
    .limit(1)
    .single();

  if (error || !call) {
    return null;
  }

  return {
    ...call,
    user: call.user,
    persona: call.persona,
    score: call.score?.[0] || null,
  } as CallForReview;
}

// Get a specific call for review by ID
export async function getCallForReviewById(callId: string): Promise<CallForReview | null> {
  const supabase = getSupabase();

  const { data: call, error } = await supabase
    .from('calls')
    .select(`
      *,
      user:users(id, name, profile_picture_url),
      persona:personas(id, name, difficulty_level, description, personality_prompt),
      score:call_scores(*)
    `)
    .eq('id', callId)
    .single();

  if (error || !call) {
    return null;
  }

  return {
    ...call,
    user: call.user,
    persona: call.persona,
    score: call.score?.[0] || null,
  } as CallForReview;
}

// Submit a review for a call
export async function submitCallReview(
  callId: string,
  reviewerId: string,
  feedback: string,
  notes?: string,
  rating?: number
): Promise<CallReview | null> {
  const supabase = getSupabase();

  // Create the review
  const { data: review, error: reviewError } = await supabase
    .from('call_reviews')
    .insert({
      call_id: callId,
      reviewer_id: reviewerId,
      feedback,
      notes: notes || null,
      rating: rating || null,
    })
    .select(`
      *,
      reviewer:users(id, name, profile_picture_url)
    `)
    .single();

  if (reviewError) {
    console.error('Error creating review:', reviewError);
    return null;
  }

  // Mark the call as reviewed
  const { error: updateError } = await supabase
    .from('calls')
    .update({
      reviewed: true,
      reviewed_at: new Date().toISOString(),
      reviewed_by: reviewerId,
    })
    .eq('id', callId);

  if (updateError) {
    console.error('Error updating call review status:', updateError);
  }

  return review as CallReview;
}

// Get review for a call
export async function getCallReview(callId: string): Promise<CallReview | null> {
  const supabase = getSupabase();

  const { data: review, error } = await supabase
    .from('call_reviews')
    .select(`
      *,
      reviewer:users(id, name, profile_picture_url)
    `)
    .eq('call_id', callId)
    .single();

  if (error || !review) {
    return null;
  }

  return review as CallReview;
}

// Get review queue stats
export async function getReviewQueueStats(): Promise<{
  pending: number;
  reviewedToday: number;
  reviewedThisWeek: number;
}> {
  const supabase = getSupabase();

  // Get pending count
  const { count: pending } = await supabase
    .from('calls')
    .select('*', { count: 'exact', head: true })
    .not('ended_at', 'is', null)
    .or('reviewed.is.null,reviewed.eq.false');

  // Get reviewed today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { count: reviewedToday } = await supabase
    .from('call_reviews')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', today.toISOString());

  // Get reviewed this week
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const { count: reviewedThisWeek } = await supabase
    .from('call_reviews')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', weekAgo.toISOString());

  return {
    pending: pending || 0,
    reviewedToday: reviewedToday || 0,
    reviewedThisWeek: reviewedThisWeek || 0,
  };
}

// Update user role
export async function updateUserRole(
  userId: string,
  role: 'admin' | 'advisor'
): Promise<boolean> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('users')
    .update({
      role,
      is_admin: role === 'admin'
    })
    .eq('id', userId);

  return !error;
}
