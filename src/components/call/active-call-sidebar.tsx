'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  PhoneOff,
  Mic,
  MicOff,
  Loader2,
  Volume2,
  User,
  X,
  Phone,
  CheckCircle2,
  Lightbulb,
  Target,
  Sparkles,
  Building2,
  MapPin,
  Mail,
  Briefcase,
  StickyNote,
  Save,
  TrendingUp,
  Trophy,
  Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useCallStore, Persona } from '@/stores/call-store';
import { useGeminiLive, GeminiVoice, GEMINI_VOICES } from '@/hooks/use-gemini-live';
import { useDialTone } from '@/hooks/use-dial-tone';
import { getLevelTitle } from '@/lib/gamification';
import { GamificationResult, Achievement } from '@/types';

const MAX_DURATION = 10 * 60; // 10 minutes

// Get voice for persona - uses assigned voice for dynamic personas, or falls back to name-based selection
const getVoiceForPersona = (persona: Persona): GeminiVoice => {
  // If persona has an explicitly assigned voice (dynamic personas), use it
  if (persona.voice && GEMINI_VOICES.includes(persona.voice)) {
    return persona.voice;
  }

  // Fallback for legacy personas based on name
  const name = persona.name.toLowerCase();
  if (name.includes('friendly') || name.includes('fiona')) return 'Puck';
  if (name.includes('hostile') || name.includes('harry')) return 'Fenrir';
  if (name.includes('skeptical') || name.includes('analytical')) return 'Charon';
  if (name.includes('indecisive') || name.includes('irene')) return 'Aoede';
  return 'Kore';
};

// Show gamification toasts
function showGamificationToasts(gamification: GamificationResult) {
  // Show XP gained toast
  toast.custom(
    () => (
      <div className="flex items-center gap-3 bg-white rounded-lg shadow-lg p-4 border">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-semibold text-green-600">+{gamification.xpGained} XP</p>
          <p className="text-sm text-muted-foreground">Call completed!</p>
        </div>
      </div>
    ),
    { duration: 4000 }
  );

  // Show level up toast
  if (gamification.leveledUp) {
    const levelTitle = getLevelTitle(gamification.newLevel);
    setTimeout(() => {
      toast.custom(
        () => (
          <div className="flex items-center gap-3 bg-white rounded-lg shadow-lg p-4 border">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg animate-pulse">
              <span className="text-2xl font-bold text-white">{gamification.newLevel}</span>
            </div>
            <div>
              <p className="font-bold text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-500" />
                Level Up!
              </p>
              <p className="text-sm text-muted-foreground">
                You are now a <span className="font-medium text-foreground">{levelTitle}</span>
              </p>
            </div>
          </div>
        ),
        { duration: 6000 }
      );
    }, 1500);
  }

  // Show achievement toasts
  gamification.newAchievements.forEach((achievement, index) => {
    setTimeout(() => {
      toast.custom(
        () => (
          <div className="flex items-center gap-3 bg-white rounded-lg shadow-lg p-4 border">
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
        ),
        { duration: 5000 }
      );
    }, 2500 + index * 1500);
  });

  // Dispatch event for sidebar to update
  window.dispatchEvent(new Event('gamification-update'));
}

export function ActiveCallSidebar() {
  const {
    status,
    callId,
    persona,
    personaReveal,
    mockBusiness,
    callNotes,
    duration,
    transcript,
    score,
    gamification,
    muted,
    currentSpeaker,
    sidebarOpen,
    setConnecting,
    setConnected,
    setEnding,
    setEnded,
    setError,
    updateDuration,
    updateTranscript,
    setCurrentSpeaker,
    setMuted,
    setCallNotes,
    closeSidebar,
    reset,
  } = useCallStore();

  const [savingNotes, setSavingNotes] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const setupCompleteRef = useRef<boolean>(false);
  const hasInitiatedConnectionRef = useRef<boolean>(false);

  const { playRingTone, stopAllTones, cleanup: cleanupDialTone } = useDialTone();

  const {
    connect,
    disconnect,
    toggleMute: geminiToggleMute,
    sendText,
    getRecordingBase64,
    getTranscript,
    isConnected,
  } = useGeminiLive({
    onTranscriptUpdate: (newTranscript) => {
      updateTranscript(newTranscript);
    },
    onSpeakingChange: (speaker) => {
      setCurrentSpeaker(speaker);
    },
    onError: (error) => {
      console.error('Gemini error:', error);
      toast.error(error);
      setError(error);
    },
    onSetupComplete: () => {
      setupCompleteRef.current = true;
      // Trigger the AI to answer the call
      sendText('The phone is ringing. Answer it naturally and say hello.', false);
    },
  });

  // Handle dialing state - play ring tone
  useEffect(() => {
    if (status === 'dialing') {
      playRingTone();

      // After a brief ring, start connecting
      const dialingTimeout = setTimeout(() => {
        stopAllTones();
        setConnecting();
      }, 3000); // Ring for 3 seconds

      return () => {
        clearTimeout(dialingTimeout);
        stopAllTones();
      };
    }
  }, [status, playRingTone, stopAllTones, setConnecting]);

  // Handle connecting state - initialize Gemini
  useEffect(() => {
    if (status === 'connecting' && persona && !hasInitiatedConnectionRef.current) {
      hasInitiatedConnectionRef.current = true;
      setupCompleteRef.current = false;

      console.log('[CallSidebar] Initiating Gemini connection for persona:', persona.name);

      const personaInstruction = `${persona.personality_prompt}

=== CORE ROLEPLAY INSTRUCTIONS ===
- You are roleplaying as a business prospect named ${persona.name}
- You have just answered your phone - start by saying "Hello?" or "This is ${persona.name.split(' ')[0]}, who's calling?" or a similar natural phone greeting
- The caller is a sales representative trying to sell you business lending products (MCAs, term loans, lines of credit, equipment financing)
- Stay in character throughout the entire conversation
- React authentically based on your persona's personality traits
- If the caller handles your objections well, you may show increased interest
- If they fail to address your concerns, remain skeptical or disengaged

=== CRITICAL: NATURAL REAL-TIME CONVERSATION ===
This is a LIVE phone call, not a chat. You MUST behave like a real person on the phone:

1. TURN-TAKING - Never talk over the caller:
   - WAIT for them to finish speaking completely before you respond
   - If they pause mid-sentence to think (1-2 seconds), stay quiet and let them continue
   - If you're unsure if they're done, wait an extra beat

2. BACKCHANNELING - Show you're listening:
   - Use brief acknowledgments while they speak: "Mmhmm", "Uh huh", "Right", "Okay"
   - These are NOT interruptions - they signal active listening
   - Use them sparingly - maybe once every few sentences

3. NATURAL SPEECH PATTERNS:
   - Use filler words naturally: "um", "well", "you know", "I mean", "so..."
   - Take brief pauses to "think" before responding
   - Vary your pace - sometimes quick, sometimes thoughtful
   - Trail off occasionally: "I don't know if..."

4. RESPONSE LENGTH:
   - Keep responses SHORT (1-2 sentences usually)
   - Match the energy of the caller
   - A simple "No" or "Okay" is often the right answer
   - Don't over-explain or monologue

5. IF INTERRUPTED:
   - Stop speaking IMMEDIATELY
   - Don't repeat yourself unless asked
   - React naturally: "Oh, sorry - go ahead" or just let them talk

6. AUTHENTIC HUMAN REACTIONS:
   - Show confusion: "Wait, what?", "I don't follow"
   - Show thinking: "Hmm...", "Let me see...", "Well..."
   - Show skepticism: "I don't know about that...", "Eh..."
   - Show interest: "Oh really?", "Huh, okay"

- The call should feel like a REAL sales conversation with a REAL person
- Do not break character or mention that you are an AI
- If you decide to end the call, say goodbye naturally`;

      const voice = getVoiceForPersona(persona);
      connect(personaInstruction, voice);
    }

    // Reset the flag when status changes away from connecting
    if (status !== 'connecting') {
      hasInitiatedConnectionRef.current = false;
    }
  }, [status, persona, connect]);

  // Handle connection established
  useEffect(() => {
    if (isConnected && status === 'connecting') {
      setConnected();
      startTimeRef.current = Date.now();

      // Start timer
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current!) / 1000);
        updateDuration(elapsed);

        // Auto-end at max duration
        if (elapsed >= MAX_DURATION) {
          endCall();
        }
      }, 1000);
    }
  }, [isConnected, status, setConnected, updateDuration]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      cleanupDialTone();
    };
  }, [cleanupDialTone]);

  const handleToggleMute = () => {
    const nowMuted = geminiToggleMute();
    setMuted(nowMuted);
  };

  const endCall = useCallback(async () => {
    setEnding();

    // Get recording and transcript before disconnecting
    const audioBlob = await getRecordingBase64();
    const finalTranscript = getTranscript();

    // Stop timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    disconnect();
    stopAllTones();

    try {
      const res = await fetch('/api/calls/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callId,
          personaId: persona?.id,
          transcript: finalTranscript,
          durationSeconds: duration,
          audioBlob,
        }),
      });

      const data = await res.json();
      setEnded(data.score || null, data.gamification || null);

      // Show gamification toasts
      if (data.gamification) {
        showGamificationToasts(data.gamification);
      }
    } catch (err) {
      console.error('End call error:', err);
      toast.error('Failed to save call results');
      setEnded(null, null);
    }
  }, [callId, persona?.id, duration, getRecordingBase64, getTranscript, disconnect, stopAllTones, setEnding, setEnded]);

  const handleClose = () => {
    if (status === 'connected' || status === 'connecting' || status === 'dialing') {
      // Confirm before closing active call
      if (confirm('End the current call?')) {
        endCall();
      }
    } else {
      reset();
      closeSidebar();
    }
  };

  const handleBackToFeed = () => {
    reset();
    closeSidebar();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (s: number) => {
    if (s >= 80) return 'text-green-600';
    if (s >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const saveNotes = async () => {
    if (!callId || !callNotes.trim()) return;

    setSavingNotes(true);
    try {
      const res = await fetch(`/api/calls/${callId}/notes`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: callNotes }),
      });

      if (res.ok) {
        toast.success('Notes saved!');
      } else {
        toast.error('Failed to save notes');
      }
    } catch (err) {
      console.error('Save notes error:', err);
      toast.error('Failed to save notes');
    } finally {
      setSavingNotes(false);
    }
  };

  if (!sidebarOpen) return null;

  return (
    <aside className="fixed right-0 top-0 h-screen w-96 border-l bg-zinc-900 flex flex-col z-50 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-800">
        <div className="text-white">
          <span className="text-xs text-zinc-400 uppercase tracking-wide">
            {status === 'dialing' && 'Calling...'}
            {status === 'connecting' && 'Connecting...'}
            {status === 'connected' && 'In Call'}
            {status === 'ending' && 'Ending Call...'}
            {status === 'ended' && 'Call Complete'}
            {status === 'error' && 'Call Failed'}
          </span>
          <h2 className="text-lg font-medium">{persona?.name}</h2>
        </div>
        <div className="flex items-center gap-2">
          {status === 'connected' && (
            <Badge
              variant="outline"
              className={cn(
                'text-white border-white/20 text-xs',
                duration >= MAX_DURATION - 60 && 'border-red-500 text-red-500'
              )}
            >
              {formatDuration(duration)}
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Dialing State */}
      {status === 'dialing' && (
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="relative">
            <div className="absolute inset-0 animate-ping">
              <Avatar className="h-24 w-24 bg-purple-600/30">
                <AvatarFallback className="bg-transparent" />
              </Avatar>
            </div>
            <Avatar className="h-24 w-24 bg-purple-600 relative">
              <AvatarFallback className="bg-purple-600 text-white text-2xl">
                {persona?.name[0]}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="mt-6 flex items-center gap-2 text-zinc-400">
            <Phone className="h-4 w-4 animate-bounce" />
            <span>Ringing...</span>
          </div>
        </div>
      )}

      {/* Connecting State */}
      {status === 'connecting' && (
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <Avatar className="h-24 w-24 bg-purple-600">
            <AvatarFallback className="bg-purple-600 text-white text-2xl">
              {persona?.name[0]}
            </AvatarFallback>
          </Avatar>
          <div className="mt-6 flex items-center gap-2 text-zinc-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Connecting...</span>
          </div>
        </div>
      )}

      {/* Connected State */}
      {status === 'connected' && (
        <>
          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Mock Business Info Card (for CRM reference during call) */}
            {mockBusiness && (
              <div className="px-4 pt-3 pb-2 border-b border-zinc-800">
                <div className="rounded-lg bg-zinc-800/50 p-2.5">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Building2 className="h-3.5 w-3.5 text-blue-400" />
                    <span className="text-zinc-200 text-sm font-medium truncate">{mockBusiness.businessName}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px] text-zinc-400">
                    <div className="flex items-center gap-1 truncate">
                      <Briefcase className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{mockBusiness.industry}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 flex-shrink-0" />
                      <span>{mockBusiness.state}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3 flex-shrink-0" />
                      <span>{mockBusiness.phone}</span>
                    </div>
                    <div className="flex items-center gap-1 truncate">
                      <Mail className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{mockBusiness.email}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Avatars */}
            <div className="flex items-center justify-center gap-6 py-3 px-4">
              {/* User */}
              <div className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    'relative rounded-full p-0.5 transition-all',
                    currentSpeaker === 'user' && 'ring-2 ring-blue-500 animate-pulse'
                  )}
                >
                  <Avatar className="h-12 w-12 bg-blue-600">
                    <AvatarFallback className="bg-blue-600 text-white">
                      <User className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  {currentSpeaker === 'user' && (
                    <Volume2 className="absolute -bottom-0.5 -right-0.5 h-4 w-4 text-blue-500" />
                  )}
                </div>
                <span className="text-white text-[10px]">You</span>
              </div>

              {/* Connection dots */}
              <div className="flex gap-1">
                <div className="h-1 w-1 rounded-full bg-green-500 animate-pulse" />
                <div className="h-1 w-1 rounded-full bg-green-500 animate-pulse" style={{ animationDelay: '0.2s' }} />
                <div className="h-1 w-1 rounded-full bg-green-500 animate-pulse" style={{ animationDelay: '0.4s' }} />
              </div>

              {/* Persona */}
              <div className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    'relative rounded-full p-0.5 transition-all',
                    currentSpeaker === 'assistant' && 'ring-2 ring-purple-500 animate-pulse'
                  )}
                >
                  <Avatar className="h-12 w-12 bg-purple-600">
                    <AvatarFallback className="bg-purple-600 text-white text-lg">
                      {persona?.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  {currentSpeaker === 'assistant' && (
                    <Volume2 className="absolute -bottom-0.5 -right-0.5 h-4 w-4 text-purple-500" />
                  )}
                </div>
                <span className="text-white text-[10px]">{persona?.name.split(' ')[0]}</span>
              </div>
            </div>

            {/* Transcript */}
            <div className="flex-1 overflow-hidden px-4 min-h-0">
              <div className="h-full overflow-y-auto space-y-1.5 pr-1">
                {transcript.length === 0 ? (
                  <div className="text-center text-zinc-500 text-xs py-3">
                    Waiting for conversation to start...
                  </div>
                ) : (
                  transcript.slice(-5).map((t, i) => (
                    <div
                      key={i}
                      className={cn(
                        'p-1.5 rounded-lg text-xs',
                        t.role === 'user'
                          ? 'bg-blue-900/50 text-blue-100 ml-3'
                          : 'bg-purple-900/50 text-purple-100 mr-3'
                      )}
                    >
                      <span className="font-medium text-[10px] opacity-70">
                        {t.role === 'user' ? 'You' : persona?.name.split(' ')[0]}:
                      </span>{' '}
                      {t.content}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Live Notes Section */}
            <div className="px-4 py-2 border-t border-zinc-800">
              <div className="flex items-center gap-1.5 mb-1.5">
                <StickyNote className="h-3.5 w-3.5 text-amber-400" />
                <span className="text-zinc-300 text-xs font-medium">Notes</span>
              </div>
              <Textarea
                placeholder="Take notes during the call..."
                value={callNotes}
                onChange={(e) => setCallNotes(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-zinc-200 placeholder:text-zinc-500 resize-none text-xs h-16"
              />
            </div>
          </div>

          {/* Controls */}
          <div className="p-3 border-t border-zinc-800 flex justify-center gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={handleToggleMute}
              className={cn(
                'rounded-full h-12 w-12 border-zinc-700',
                muted
                  ? 'bg-red-500 hover:bg-red-600 text-white border-red-500'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-white'
              )}
            >
              {muted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>

            <Button
              variant="destructive"
              size="lg"
              onClick={endCall}
              className="rounded-full h-12 w-12"
            >
              <PhoneOff className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}

      {/* Ending State */}
      {status === 'ending' && (
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-white mb-4" />
          <p className="text-zinc-400">Analyzing your call...</p>
        </div>
      )}

      {/* Ended State */}
      {status === 'ended' && (
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-4">
            {score ? (
              <>
                {/* Score */}
                <div className="text-center">
                  <div
                    className={cn(
                      'text-5xl font-bold',
                      getScoreColor(score.overall_score)
                    )}
                  >
                    {score.overall_score}
                  </div>
                  <p className="text-zinc-400 text-sm">Overall Score</p>
                </div>

                {/* Score Breakdown */}
                <div className="grid grid-cols-5 gap-1.5">
                  <ScoreBox label="Tone" score={score.tone_score} />
                  <ScoreBox label="Product" score={score.product_knowledge_score} />
                  <ScoreBox label="Object." score={score.objection_handling_score} />
                  <ScoreBox label="Rapport" score={score.rapport_building_score} />
                  <ScoreBox label="Close" score={score.closing_technique_score} />
                </div>

                {/* Feedback */}
                {score.ai_feedback && (
                  <div className="p-3 bg-zinc-800 rounded-lg">
                    <p className="text-zinc-300 text-sm">{score.ai_feedback}</p>
                  </div>
                )}

                {/* Strengths & Improvements */}
                <div className="grid grid-cols-2 gap-3">
                  {score.strengths && score.strengths.length > 0 && (
                    <div>
                      <h4 className="text-green-500 text-xs font-medium mb-1 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Strengths
                      </h4>
                      <ul className="text-zinc-400 text-xs space-y-0.5">
                        {score.strengths.slice(0, 3).map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {score.improvements && score.improvements.length > 0 && (
                    <div>
                      <h4 className="text-orange-500 text-xs font-medium mb-1">
                        To Improve
                      </h4>
                      <ul className="text-zinc-400 text-xs space-y-0.5">
                        {score.improvements.slice(0, 3).map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* XP Gained */}
                {gamification && (
                  <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 rounded-lg p-3 border border-blue-800/50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-blue-400" />
                        <span className="text-blue-300 text-sm font-medium">XP Earned</span>
                      </div>
                      <span className="text-green-400 font-bold">+{gamification.xpGained}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <span className="text-white font-bold text-sm">{gamification.newLevel}</span>
                        </div>
                        <span className="text-zinc-400 text-xs">Level {gamification.newLevel}</span>
                      </div>
                      {gamification.leveledUp && (
                        <Badge className="bg-purple-600 text-white text-xs animate-pulse">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Level Up!
                        </Badge>
                      )}
                    </div>
                    {gamification.newAchievements.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-blue-800/50">
                        <p className="text-xs text-yellow-400 flex items-center gap-1 mb-1">
                          <Trophy className="h-3 w-3" />
                          Achievements Unlocked
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {gamification.newAchievements.map((achievement: Achievement) => (
                            <Badge key={achievement.id} variant="secondary" className="bg-yellow-900/50 text-yellow-300 text-xs">
                              {achievement.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Call Stats */}
                <div className="flex justify-between text-xs text-zinc-500 border-t border-zinc-800 pt-3">
                  <span>Duration: {formatDuration(duration)}</span>
                  <span>Difficulty: {persona?.difficulty_level}/5</span>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-zinc-400">Unable to generate score.</p>
              </div>
            )}

            {/* Persona Reveal - Show for dynamic personas */}
            {personaReveal && (
              <div className="border-t border-zinc-800 pt-4 mt-4">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-purple-400" />
                  <h3 className="text-sm font-semibold text-white">Prospect Revealed</h3>
                </div>

                {/* Personality Type */}
                <div className="rounded-lg bg-gradient-to-r from-purple-900/40 to-blue-900/40 p-3 mb-3">
                  <div className="text-purple-300 text-xs uppercase tracking-wide mb-1">
                    Personality Type
                  </div>
                  <div className="text-white font-medium">
                    {personaReveal.personalityType}
                  </div>
                </div>

                {/* Key Traits */}
                <div className="mb-3">
                  <div className="text-zinc-400 text-xs mb-2 flex items-center gap-1">
                    <Target className="h-3 w-3" /> Key Traits
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {personaReveal.keyTraits.map((trait, i) => (
                      <Badge
                        key={i}
                        variant="secondary"
                        className="bg-zinc-800 text-zinc-300 text-xs"
                      >
                        {trait}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Business Context */}
                <div className="mb-3">
                  <div className="text-zinc-400 text-xs mb-1">Business Context</div>
                  <p className="text-zinc-300 text-sm">{personaReveal.businessInfo}</p>
                </div>

                {/* Tips for Next Time */}
                {personaReveal.tips.length > 0 && (
                  <div className="rounded-lg bg-zinc-800/50 p-3">
                    <div className="text-zinc-400 text-xs mb-2 flex items-center gap-1">
                      <Lightbulb className="h-3 w-3 text-yellow-500" /> Tips for This Type
                    </div>
                    <ul className="text-zinc-300 text-xs space-y-1">
                      {personaReveal.tips.slice(0, 3).map((tip, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <span className="text-zinc-500">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Mock Business Details */}
            {mockBusiness && (
              <div className="border-t border-zinc-800 pt-4 mt-4">
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="h-4 w-4 text-blue-400" />
                  <h3 className="text-sm font-semibold text-white">Business Info</h3>
                </div>
                <div className="rounded-lg bg-zinc-800/50 p-3 space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-3.5 w-3.5 text-zinc-500" />
                    <span className="text-zinc-300">{mockBusiness.businessName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-3.5 w-3.5 text-zinc-500" />
                    <span className="text-zinc-400">{mockBusiness.industry}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-zinc-500" />
                    <span className="text-zinc-400">{mockBusiness.state}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-zinc-500" />
                    <span className="text-zinc-400">{mockBusiness.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-zinc-500" />
                    <span className="text-zinc-400 truncate">{mockBusiness.email}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Call Notes */}
            <div className="border-t border-zinc-800 pt-4 mt-4">
              <div className="flex items-center gap-2 mb-3">
                <StickyNote className="h-4 w-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-white">Call Notes</h3>
              </div>
              <Textarea
                placeholder="Add notes about this call..."
                value={callNotes}
                onChange={(e) => setCallNotes(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-zinc-200 placeholder:text-zinc-500 resize-none min-h-[100px]"
              />
              <Button
                onClick={saveNotes}
                disabled={savingNotes || !callNotes.trim()}
                size="sm"
                className="mt-2 w-full"
                variant="secondary"
              >
                {savingNotes ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-3 w-3" />
                    Save Notes
                  </>
                )}
              </Button>
            </div>

            <Button onClick={handleBackToFeed} className="w-full mt-4">
              Back to Feed
            </Button>
          </div>
        </div>
      )}

      {/* Error State */}
      {status === 'error' && (
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <p className="text-red-400 mb-4">Failed to connect</p>
          <Button onClick={handleBackToFeed} variant="outline">
            Back to Feed
          </Button>
        </div>
      )}
    </aside>
  );
}

function ScoreBox({ label, score }: { label: string; score: number }) {
  const getColor = (s: number) => {
    if (s >= 80) return 'bg-green-900/50 text-green-400 border-green-800';
    if (s >= 60) return 'bg-yellow-900/50 text-yellow-400 border-yellow-800';
    return 'bg-red-900/50 text-red-400 border-red-800';
  };

  return (
    <div className={cn('rounded border p-1.5 text-center', getColor(score))}>
      <div className="text-lg font-bold">{score}</div>
      <div className="text-[10px] opacity-75">{label}</div>
    </div>
  );
}
