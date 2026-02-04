import { create } from 'zustand';
import { TranscriptEntry, GeminiVoice } from '@/hooks/use-gemini-live';
import { CallScore, MockBusinessDetails, GamificationResult } from '@/types';
import { DynamicPersona, getPersonaSummary, MockBusinessDetails as DynamicMockBusiness } from '@/lib/dynamic-persona';

export interface Persona {
  id: string;
  name: string;
  description: string;
  personality_prompt: string;
  difficulty_level: number;
  // Dynamic persona fields
  voice?: GeminiVoice;
  isDynamic?: boolean;
}

export interface PersonaReveal {
  personalityType: string;
  keyTraits: string[];
  businessInfo: string;
  challengeLevel: string;
  tips: string[];
}

export type CallStatus =
  | 'idle'
  | 'dialing'
  | 'connecting'
  | 'connected'
  | 'ending'
  | 'ended'
  | 'error';

interface CallState {
  // Call state
  status: CallStatus;
  callId: string | null;
  persona: Persona | null;
  dynamicPersona: DynamicPersona | null;
  personaReveal: PersonaReveal | null;
  mockBusiness: MockBusinessDetails | null;
  callNotes: string;
  duration: number;
  transcript: TranscriptEntry[];
  score: CallScore | null;
  gamification: GamificationResult | null;
  error: string | null;
  muted: boolean;
  currentSpeaker: 'user' | 'assistant' | null;

  // Sidebar visibility
  sidebarOpen: boolean;

  // Actions
  startDialing: (callId: string, persona: Persona, dynamicPersona?: DynamicPersona) => void;
  setConnecting: () => void;
  setConnected: () => void;
  setEnding: () => void;
  setEnded: (score: CallScore | null, gamification: GamificationResult | null) => void;
  setError: (error: string) => void;
  updateDuration: (duration: number) => void;
  updateTranscript: (transcript: TranscriptEntry[]) => void;
  setCurrentSpeaker: (speaker: 'user' | 'assistant' | null) => void;
  toggleMute: () => void;
  setMuted: (muted: boolean) => void;
  setCallNotes: (notes: string) => void;
  openSidebar: () => void;
  closeSidebar: () => void;
  reset: () => void;
}

const initialState = {
  status: 'idle' as CallStatus,
  callId: null,
  persona: null,
  dynamicPersona: null,
  personaReveal: null,
  mockBusiness: null,
  callNotes: '',
  duration: 0,
  transcript: [],
  score: null,
  gamification: null,
  error: null,
  muted: false,
  currentSpeaker: null,
  sidebarOpen: false,
};

export const useCallStore = create<CallState>((set) => ({
  ...initialState,

  startDialing: (callId, persona, dynamicPersona) => set({
    status: 'dialing',
    callId,
    persona,
    dynamicPersona: dynamicPersona || null,
    personaReveal: null,
    mockBusiness: dynamicPersona?.mockBusiness || null,
    callNotes: '',
    sidebarOpen: true,
    transcript: [],
    score: null,
    error: null,
    duration: 0,
    muted: false,
  }),

  setConnecting: () => set({ status: 'connecting' }),

  setConnected: () => set({ status: 'connected' }),

  setEnding: () => set({ status: 'ending' }),

  setEnded: (score, gamification) => set((state) => ({
    status: 'ended',
    score,
    gamification,
    personaReveal: state.dynamicPersona ? getPersonaSummary(state.dynamicPersona) : null,
  })),

  setError: (error) => set({ status: 'error', error }),

  updateDuration: (duration) => set({ duration }),

  updateTranscript: (transcript) => set({ transcript }),

  setCurrentSpeaker: (currentSpeaker) => set({ currentSpeaker }),

  toggleMute: () => set((state) => ({ muted: !state.muted })),

  setMuted: (muted) => set({ muted }),

  setCallNotes: (callNotes) => set({ callNotes }),

  openSidebar: () => set({ sidebarOpen: true }),

  closeSidebar: () => set({ sidebarOpen: false }),

  reset: () => set(initialState),
}));
