import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import { User, Persona, Call, CallScore, FeedComment, FeedReaction, CallWithDetails } from '@/types';

// Use service role for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// User operations
export async function getUserByEmail(email: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email.toLowerCase())
    .single();

  if (error || !data) return null;
  return data as User;
}

export async function getUserById(id: string): Promise<User | null> {
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
  const { data, error } = await supabase
    .from('personas')
    .select('*')
    .eq('is_active', true)
    .order('difficulty_level', { ascending: true });

  if (error) return [];
  return data as Persona[];
}

export async function getAllPersonas(): Promise<Persona[]> {
  const { data, error } = await supabase
    .from('personas')
    .select('*')
    .order('name', { ascending: true });

  if (error) return [];
  return data as Persona[];
}

export async function getPersonaById(id: string): Promise<Persona | null> {
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

export async function endCall(
  callId: string,
  recordingUrl: string | null,
  transcript: unknown[] | null,
  durationSeconds: number
): Promise<Call | null> {
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

export async function saveCallScore(
  score: Omit<CallScore, 'id' | 'created_at'>
): Promise<CallScore | null> {
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

  // Process calls with reactions
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
    } as CallWithDetails;
  });

  return { calls: processedCalls, total: count || 0 };
}

export async function getUserCalls(userId: string): Promise<CallWithDetails[]> {
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
  const { error } = await supabase
    .from('users')
    .update({ is_admin: isAdmin })
    .eq('id', userId);

  return !error;
}

export async function deletePersona(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('personas')
    .delete()
    .eq('id', id);

  return !error;
}
