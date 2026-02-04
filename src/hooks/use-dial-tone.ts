import { useRef, useCallback } from 'react';

// US dial tone frequencies
const DIAL_TONE_FREQ1 = 350;
const DIAL_TONE_FREQ2 = 440;

// Ring tone frequencies (US ringback tone)
const RING_FREQ1 = 440;
const RING_FREQ2 = 480;

export function useDialTone() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillator1Ref = useRef<OscillatorNode | null>(null);
  const oscillator2Ref = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const ringIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const ensureContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  }, []);

  const playDialTone = useCallback(() => {
    const ctx = ensureContext();

    // Stop any existing tones
    stopAllTones();

    // Create gain node
    gainNodeRef.current = ctx.createGain();
    gainNodeRef.current.gain.value = 0.15; // Lower volume for dial tone
    gainNodeRef.current.connect(ctx.destination);

    // Create two oscillators for the dual-tone
    oscillator1Ref.current = ctx.createOscillator();
    oscillator1Ref.current.type = 'sine';
    oscillator1Ref.current.frequency.value = DIAL_TONE_FREQ1;
    oscillator1Ref.current.connect(gainNodeRef.current);

    oscillator2Ref.current = ctx.createOscillator();
    oscillator2Ref.current.type = 'sine';
    oscillator2Ref.current.frequency.value = DIAL_TONE_FREQ2;
    oscillator2Ref.current.connect(gainNodeRef.current);

    oscillator1Ref.current.start();
    oscillator2Ref.current.start();
  }, [ensureContext]);

  const playRingTone = useCallback(() => {
    const ctx = ensureContext();

    // Stop any existing tones
    stopAllTones();

    const playRingCycle = () => {
      // Create gain node
      gainNodeRef.current = ctx.createGain();
      gainNodeRef.current.gain.value = 0.12;
      gainNodeRef.current.connect(ctx.destination);

      // Create two oscillators for ring tone
      oscillator1Ref.current = ctx.createOscillator();
      oscillator1Ref.current.type = 'sine';
      oscillator1Ref.current.frequency.value = RING_FREQ1;
      oscillator1Ref.current.connect(gainNodeRef.current);

      oscillator2Ref.current = ctx.createOscillator();
      oscillator2Ref.current.type = 'sine';
      oscillator2Ref.current.frequency.value = RING_FREQ2;
      oscillator2Ref.current.connect(gainNodeRef.current);

      oscillator1Ref.current.start();
      oscillator2Ref.current.start();

      // Ring for 2 seconds, then silence for 4 seconds (US pattern)
      setTimeout(() => {
        oscillator1Ref.current?.stop();
        oscillator2Ref.current?.stop();
        oscillator1Ref.current = null;
        oscillator2Ref.current = null;
      }, 2000);
    };

    // Play first ring immediately
    playRingCycle();

    // Then repeat every 6 seconds (2s ring + 4s silence)
    ringIntervalRef.current = setInterval(playRingCycle, 6000);
  }, [ensureContext]);

  const stopAllTones = useCallback(() => {
    if (ringIntervalRef.current) {
      clearInterval(ringIntervalRef.current);
      ringIntervalRef.current = null;
    }

    if (oscillator1Ref.current) {
      try {
        oscillator1Ref.current.stop();
      } catch {
        // Already stopped
      }
      oscillator1Ref.current = null;
    }

    if (oscillator2Ref.current) {
      try {
        oscillator2Ref.current.stop();
      } catch {
        // Already stopped
      }
      oscillator2Ref.current = null;
    }

    if (gainNodeRef.current) {
      gainNodeRef.current.disconnect();
      gainNodeRef.current = null;
    }
  }, []);

  const cleanup = useCallback(() => {
    stopAllTones();
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  }, [stopAllTones]);

  return {
    playDialTone,
    playRingTone,
    stopAllTones,
    cleanup,
  };
}
