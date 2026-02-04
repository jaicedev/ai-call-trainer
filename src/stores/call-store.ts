import { create } from 'zustand';
import { TranscriptEntry } from '@/hooks/use-gemini-live';
import { CallScore } from '@/types';

export interface Persona {
  id: string;
  name: string;
  description: string;
  personality_prompt: string;
  difficulty_level: number;
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
  duration: number;
  transcript: TranscriptEntry[];
  score: CallScore | null;
  error: string | null;
  muted: boolean;
  currentSpeaker: 'user' | 'assistant' | null;

  // Sidebar visibility
  sidebarOpen: boolean;

  // Actions
  startDialing: (callId: string, persona: Persona) => void;
  setConnecting: () => void;
  setConnected: () => void;
  setEnding: () => void;
  setEnded: (score: CallScore | null) => void;
  setError: (error: string) => void;
  updateDuration: (duration: number) => void;
  updateTranscript: (transcript: TranscriptEntry[]) => void;
  setCurrentSpeaker: (speaker: 'user' | 'assistant' | null) => void;
  toggleMute: () => void;
  setMuted: (muted: boolean) => void;
  openSidebar: () => void;
  closeSidebar: () => void;
  reset: () => void;
}

const initialState = {
  status: 'idle' as CallStatus,
  callId: null,
  persona: null,
  duration: 0,
  transcript: [],
  score: null,
  error: null,
  muted: false,
  currentSpeaker: null,
  sidebarOpen: false,
};

export const useCallStore = create<CallState>((set) => ({
  ...initialState,

  startDialing: (callId, persona) => set({
    status: 'dialing',
    callId,
    persona,
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

  setEnded: (score) => set({ status: 'ended', score }),

  setError: (error) => set({ status: 'error', error }),

  updateDuration: (duration) => set({ duration }),

  updateTranscript: (transcript) => set({ transcript }),

  setCurrentSpeaker: (currentSpeaker) => set({ currentSpeaker }),

  toggleMute: () => set((state) => ({ muted: !state.muted })),

  setMuted: (muted) => set({ muted }),

  openSidebar: () => set({ sidebarOpen: true }),

  closeSidebar: () => set({ sidebarOpen: false }),

  reset: () => set(initialState),
}));
