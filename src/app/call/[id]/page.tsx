'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  PhoneOff,
  Mic,
  MicOff,
  Loader2,
  Volume2,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { CallScore } from '@/types';
import { useGeminiLive, TranscriptEntry, GeminiVoice } from '@/hooks/use-gemini-live';

interface Persona {
  id: string;
  name: string;
  description: string;
  personality_prompt: string;
  difficulty_level: number;
}

// Map persona difficulty to voice
const getVoiceForPersona = (persona: Persona): GeminiVoice => {
  // Map based on persona characteristics
  const name = persona.name.toLowerCase();
  if (name.includes('friendly') || name.includes('fiona')) return 'Puck';
  if (name.includes('hostile') || name.includes('harry')) return 'Fenrir';
  if (name.includes('skeptical') || name.includes('analytical')) return 'Charon';
  if (name.includes('indecisive') || name.includes('irene')) return 'Aoede';
  return 'Kore'; // Default professional voice
};

export default function CallPage() {
  const params = useParams();
  const router = useRouter();
  const callId = params.id as string;

  const [persona, setPersona] = useState<Persona | null>(null);
  const [status, setStatus] = useState<
    'loading' | 'connecting' | 'connected' | 'ended' | 'error'
  >('loading');
  const [muted, setMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [score, setScore] = useState<CallScore | null>(null);
  const [scoring, setScoring] = useState(false);

  const startTimeRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const MAX_DURATION = 10 * 60; // 10 minutes

  // Gemini Live hook
  const {
    connect,
    disconnect,
    toggleMute: geminiToggleMute,
    sendText,
    getRecordingBase64,
    getTranscript,
    isConnected,
    currentSpeaker,
  } = useGeminiLive({
    onTranscriptUpdate: (newTranscript) => {
      setTranscript(newTranscript);
    },
    onError: (error) => {
      console.error('Gemini error:', error);
      toast.error(error);
    },
  });

  // Update status based on connection
  useEffect(() => {
    if (isConnected && status === 'connecting') {
      setStatus('connected');
      startTimeRef.current = Date.now();

      // Start timer
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current!) / 1000);
        setDuration(elapsed);

        // Auto-end at max duration
        if (elapsed >= MAX_DURATION) {
          endCall();
        }
      }, 1000);

      // Trigger the AI to start the conversation
      setTimeout(() => {
        sendText("Hello? Who's calling?");
      }, 500);
    }
  }, [isConnected, status]);

  // Load call details and start
  useEffect(() => {
    const loadCall = async () => {
      try {
        const res = await fetch(`/api/calls/${callId}`);
        const data = await res.json();

        if (data.error) {
          toast.error(data.error);
          router.push('/');
          return;
        }

        setPersona(data.persona);
        initializeCall(data.persona);
      } catch {
        toast.error('Failed to load call');
        router.push('/');
      }
    };

    loadCall();

    return () => {
      cleanup();
    };
  }, [callId]);

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    disconnect();
  }, [disconnect]);

  const initializeCall = async (personaData: Persona) => {
    setStatus('connecting');

    try {
      // Build persona instruction for Gemini
      const personaInstruction = `${personaData.personality_prompt}

Important instructions:
- You are roleplaying as a business prospect named ${personaData.name}
- The caller is a sales representative trying to sell you business lending products (MCAs, term loans, lines of credit, equipment financing)
- Stay in character throughout the entire conversation
- React authentically based on your persona's personality traits
- If the caller handles your objections well, you may show increased interest
- If they fail to address your concerns, remain skeptical or disengaged
- The call should feel like a real sales conversation
- Keep your responses natural and conversational, not too long (1-3 sentences)
- Occasionally use filler words like "um", "well", "you know" to sound natural
- If you decide to end the call, say goodbye naturally
- Do not break character or mention that you are an AI
- Answer the phone naturally when the call starts`;

      const voice = getVoiceForPersona(personaData);
      await connect(personaInstruction, voice);
    } catch (err) {
      console.error('Call initialization error:', err);
      setStatus('error');
      toast.error('Failed to start call. Please check your microphone permissions.');
    }
  };

  const handleToggleMute = () => {
    const nowMuted = geminiToggleMute();
    setMuted(nowMuted);
  };

  const endCall = async () => {
    setStatus('ended');
    setScoring(true);

    // Get recording and transcript before disconnecting
    const audioBlob = await getRecordingBase64();
    const finalTranscript = getTranscript();

    cleanup();

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

      if (data.score) {
        setScore(data.score);
      }
    } catch (err) {
      console.error('End call error:', err);
      toast.error('Failed to save call results');
    } finally {
      setScoring(false);
    }
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

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-900">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-900 text-white gap-4">
        <p>Failed to start call</p>
        <Button onClick={() => router.push('/')}>Return to Dashboard</Button>
      </div>
    );
  }

  if (status === 'ended') {
    return (
      <div className="min-h-screen bg-zinc-50 p-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Call Complete</h1>

          {scoring ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mb-4" />
                <p>Analyzing your call...</p>
              </CardContent>
            </Card>
          ) : score ? (
            <div className="space-y-6">
              {/* Overall Score */}
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center mb-6">
                    <div
                      className={cn(
                        'text-6xl font-bold',
                        getScoreColor(score.overall_score)
                      )}
                    >
                      {score.overall_score}
                    </div>
                    <p className="text-muted-foreground">Overall Score</p>
                  </div>

                  {/* Score Breakdown */}
                  <div className="grid grid-cols-5 gap-4 mb-6">
                    <ScoreBox label="Tone" score={score.tone_score} />
                    <ScoreBox
                      label="Product"
                      score={score.product_knowledge_score}
                    />
                    <ScoreBox
                      label="Objections"
                      score={score.objection_handling_score}
                    />
                    <ScoreBox
                      label="Rapport"
                      score={score.rapport_building_score}
                    />
                    <ScoreBox
                      label="Closing"
                      score={score.closing_technique_score}
                    />
                  </div>

                  {/* AI Feedback */}
                  {score.ai_feedback && (
                    <div className="p-4 bg-zinc-50 rounded-lg mb-4">
                      <h3 className="font-medium mb-2">AI Feedback</h3>
                      <p className="text-muted-foreground">{score.ai_feedback}</p>
                    </div>
                  )}

                  {/* Strengths & Improvements */}
                  <div className="grid grid-cols-2 gap-4">
                    {score.strengths.length > 0 && (
                      <div>
                        <h3 className="font-medium text-green-600 mb-2">
                          Strengths
                        </h3>
                        <ul className="list-disc list-inside text-sm text-muted-foreground">
                          {score.strengths.map((s, i) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {score.improvements.length > 0 && (
                      <div>
                        <h3 className="font-medium text-orange-600 mb-2">
                          Areas to Improve
                        </h3>
                        <ul className="list-disc list-inside text-sm text-muted-foreground">
                          {score.improvements.map((s, i) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Call Details */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between text-sm text-muted-foreground mb-4">
                    <span>Duration: {formatDuration(duration)}</span>
                    <span>Persona: {persona?.name}</span>
                  </div>

                  {/* Transcript */}
                  {transcript.length > 0 && (
                    <div>
                      <h3 className="font-medium mb-2">Transcript</h3>
                      <div className="max-h-64 overflow-y-auto space-y-2 text-sm">
                        {transcript.map((t, i) => (
                          <div
                            key={i}
                            className={cn(
                              'p-2 rounded',
                              t.role === 'user'
                                ? 'bg-blue-50 text-blue-900'
                                : 'bg-zinc-100'
                            )}
                          >
                            <span className="font-medium">
                              {t.role === 'user' ? 'You' : persona?.name}:
                            </span>{' '}
                            {t.content}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex gap-4">
                <Button onClick={() => router.push('/')} className="flex-1">
                  Back to Feed
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/history')}
                  className="flex-1"
                >
                  View History
                </Button>
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  Call ended. Unable to generate score.
                </p>
                <Button onClick={() => router.push('/')} className="mt-4">
                  Back to Feed
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-800">
        <div className="text-white">
          <span className="text-sm text-zinc-400">Practicing with</span>
          <h1 className="text-lg font-medium">{persona?.name}</h1>
        </div>
        <div className="flex items-center gap-4">
          <Badge
            variant="outline"
            className={cn(
              'text-white border-white/20',
              duration >= MAX_DURATION - 60 && 'border-red-500 text-red-500'
            )}
          >
            {formatDuration(duration)} / {formatDuration(MAX_DURATION)}
          </Badge>
          {status === 'connecting' && (
            <Badge variant="secondary">
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
              Connecting...
            </Badge>
          )}
          {status === 'connected' && (
            <Badge className="bg-green-600">
              Live
            </Badge>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {/* Avatars */}
        <div className="flex items-center gap-16 mb-12">
          {/* User */}
          <div className="flex flex-col items-center gap-3">
            <div
              className={cn(
                'relative rounded-full p-1',
                currentSpeaker === 'user' && 'ring-4 ring-blue-500 animate-pulse'
              )}
            >
              <Avatar className="h-24 w-24 bg-blue-600">
                <AvatarFallback className="bg-blue-600 text-white text-2xl">
                  <User className="h-10 w-10" />
                </AvatarFallback>
              </Avatar>
              {currentSpeaker === 'user' && (
                <Volume2 className="absolute -bottom-1 -right-1 h-6 w-6 text-blue-500" />
              )}
            </div>
            <span className="text-white text-sm">You</span>
          </div>

          {/* Connection indicator */}
          <div className="flex gap-2">
            <div
              className={cn(
                'h-2 w-2 rounded-full',
                status === 'connected' ? 'bg-green-500' : 'bg-zinc-600'
              )}
            />
            <div
              className={cn(
                'h-2 w-2 rounded-full',
                status === 'connected' ? 'bg-green-500' : 'bg-zinc-600'
              )}
            />
            <div
              className={cn(
                'h-2 w-2 rounded-full',
                status === 'connected' ? 'bg-green-500' : 'bg-zinc-600'
              )}
            />
          </div>

          {/* Persona */}
          <div className="flex flex-col items-center gap-3">
            <div
              className={cn(
                'relative rounded-full p-1',
                currentSpeaker === 'assistant' &&
                  'ring-4 ring-purple-500 animate-pulse'
              )}
            >
              <Avatar className="h-24 w-24 bg-purple-600">
                <AvatarFallback className="bg-purple-600 text-white text-2xl">
                  {persona?.name[0]}
                </AvatarFallback>
              </Avatar>
              {currentSpeaker === 'assistant' && (
                <Volume2 className="absolute -bottom-1 -right-1 h-6 w-6 text-purple-500" />
              )}
            </div>
            <span className="text-white text-sm">{persona?.name}</span>
          </div>
        </div>

        {/* Latest transcript */}
        {transcript.length > 0 && (
          <div className="w-full max-w-md mb-8">
            <div
              className={cn(
                'p-3 rounded-lg text-sm',
                transcript[transcript.length - 1].role === 'user'
                  ? 'bg-blue-900/50 text-blue-100'
                  : 'bg-purple-900/50 text-purple-100'
              )}
            >
              <span className="font-medium">
                {transcript[transcript.length - 1].role === 'user'
                  ? 'You'
                  : persona?.name}
                :
              </span>{' '}
              {transcript[transcript.length - 1].content}
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-8 flex justify-center gap-4">
        <Button
          variant="outline"
          size="lg"
          onClick={handleToggleMute}
          className={cn(
            'rounded-full h-16 w-16',
            muted && 'bg-red-500 hover:bg-red-600 text-white border-red-500'
          )}
        >
          {muted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
        </Button>

        <Button
          variant="destructive"
          size="lg"
          onClick={endCall}
          className="rounded-full h-16 w-16"
        >
          <PhoneOff className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}

function ScoreBox({ label, score }: { label: string; score: number }) {
  const getColor = (s: number) => {
    if (s >= 80) return 'bg-green-100 text-green-800 border-green-200';
    if (s >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  return (
    <div className={cn('rounded-lg border p-2 text-center', getColor(score))}>
      <div className="text-xl font-bold">{score}</div>
      <div className="text-xs">{label}</div>
    </div>
  );
}
