import { useState, useRef, useCallback } from "react";

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const HOST = "generativelanguage.googleapis.com";
const URI = `wss://${HOST}/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent`;

// All available Gemini 2.5 voice options
export const GEMINI_VOICES = [
  "Zephyr", "Puck", "Charon", "Kore", "Fenrir", "Leda", "Orus", "Aoede",
  "Callirrhoe", "Autonoe", "Enceladus", "Iapetus", "Algieba", "Despina",
  "Erinome", "Algenib", "Rasalgethi", "Laomedeia", "Achernar", "Alnilam",
  "Schedar", "Gacrux", "Pulcherrima", "Achird", "Zubenelgenubi", "Vindemiatrix",
  "Sadachbia", "Sadaltager", "Sulafat", "Orbit"
] as const;

export type GeminiVoice = typeof GEMINI_VOICES[number];

export interface TranscriptEntry {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface UseGeminiLiveOptions {
  onTranscriptUpdate?: (transcript: TranscriptEntry[]) => void;
  onSpeakingChange?: (speaker: "user" | "assistant" | null) => void;
  onError?: (error: string) => void;
  onSetupComplete?: () => void;
}

export function useGeminiLive(options: UseGeminiLiveOptions = {}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [currentSpeaker, setCurrentSpeaker] = useState<"user" | "assistant" | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const audioInputRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioQueueRef = useRef<Int16Array[]>([]);
  const nextPlayTimeRef = useRef<number>(0);
  const transcriptRef = useRef<TranscriptEntry[]>([]);
  const currentAssistantTextRef = useRef<string>("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const isPlayingAudioRef = useRef<boolean>(false);
  const isConnectingRef = useRef<boolean>(false);
  const connectionIdRef = useRef<number>(0);
  // For combined recording (user mic + AI audio)
  const recordingDestinationRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const userMicGainRef = useRef<GainNode | null>(null);
  // Timeout handling for setup and inactivity
  const setupTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  // Initialize Audio Context
  const ensureAudioContext = async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)({
        sampleRate: 24000, // Gemini output rate
      });

      // Create and connect gain node for volume control
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.gain.value = 1.0; // Full volume
      gainNodeRef.current.connect(audioContextRef.current.destination);

      // Create recording destination for combined audio (user mic + AI audio)
      recordingDestinationRef.current = audioContextRef.current.createMediaStreamDestination();

      // Connect AI audio to recording destination too
      gainNodeRef.current.connect(recordingDestinationRef.current);

      // Create gain node for user mic (will connect later when mic is available)
      userMicGainRef.current = audioContextRef.current.createGain();
      userMicGainRef.current.gain.value = 1.0;
      userMicGainRef.current.connect(recordingDestinationRef.current);

      await audioContextRef.current.audioWorklet.addModule("/audio-processor.js");
    }
    if (audioContextRef.current.state === "suspended") {
      await audioContextRef.current.resume();
    }
    return audioContextRef.current;
  };

  // Play audio chunk from Gemini
  const playAudioChunk = useCallback((pcmData: Int16Array) => {
    if (!audioContextRef.current || !gainNodeRef.current) return;

    const context = audioContextRef.current;
    const float32Data = new Float32Array(pcmData.length);

    // Convert Int16 to Float32
    for (let i = 0; i < pcmData.length; i++) {
      float32Data[i] = pcmData[i] / 32768.0;
    }

    const buffer = context.createBuffer(1, float32Data.length, 24000);
    buffer.copyToChannel(float32Data, 0);

    const source = context.createBufferSource();
    source.buffer = buffer;
    // Connect to gain node for proper volume control
    source.connect(gainNodeRef.current);

    const currentTime = context.currentTime;
    // Schedule next chunk with a small buffer to prevent gaps
    const startTime = Math.max(currentTime + 0.01, nextPlayTimeRef.current);

    source.onended = () => {
      // Track when audio playback finishes
      if (nextPlayTimeRef.current <= context.currentTime + 0.1) {
        isPlayingAudioRef.current = false;
      }
    };

    isPlayingAudioRef.current = true;
    source.start(startTime);
    nextPlayTimeRef.current = startTime + buffer.duration;
  }, []);

  // Start microphone recording
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
        },
      });
      streamRef.current = stream;

      const context = audioContextRef.current!;

      // Create source from mic stream for sending to Gemini
      const source = context.createMediaStreamSource(stream);

      // Connect mic to recording destination via userMicGain for combined recording
      // (this captures user's voice alongside AI audio)
      if (userMicGainRef.current) {
        source.connect(userMicGainRef.current);
      }

      // Start MediaRecorder on the COMBINED stream (user mic + AI audio)
      if (recordingDestinationRef.current) {
        const combinedStream = recordingDestinationRef.current.stream;
        const mediaRecorder = new MediaRecorder(combinedStream, {
          mimeType: 'audio/webm;codecs=opus'
        });
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };
        mediaRecorder.start(1000);
      }

      // Process mic audio to send to Gemini
      const processor = new AudioWorkletNode(context, "pcm-processor");

      processor.port.onmessage = (e) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          // Convert Int16Array buffer to base64
          const pcmData = new Int16Array(e.data);
          const buffer = pcmData.buffer;
          let binary = "";
          const bytes = new Uint8Array(buffer);
          const len = bytes.byteLength;
          for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          const base64 = btoa(binary);

          const msg = {
            realtimeInput: {
              mediaChunks: [
                {
                  mimeType: "audio/pcm",
                  data: base64,
                },
              ],
            },
          };
          wsRef.current.send(JSON.stringify(msg));
        }
      };

      source.connect(processor);
      audioInputRef.current = source;
      workletNodeRef.current = processor;
      setIsPlaying(true);
    } catch (err) {
      console.error("Mic error:", err);
      options.onError?.("Failed to access microphone");
    }
  }, [options]);

  // Connect to Gemini Live
  const connect = useCallback(
    async (personaInstruction: string, voice: GeminiVoice = "Puck") => {
      // Prevent double connections
      if (isConnectingRef.current || wsRef.current?.readyState === WebSocket.OPEN) {
        console.log("[Gemini] Connection already in progress or active, skipping");
        return;
      }

      if (!GEMINI_API_KEY) {
        console.error("[Gemini] API Key missing");
        options.onError?.("API Key missing");
        return;
      }

      // Mark as connecting and increment connection ID
      isConnectingRef.current = true;
      connectionIdRef.current += 1;
      const thisConnectionId = connectionIdRef.current;
      console.log(`[Gemini] Starting connection #${thisConnectionId}`);

      await ensureAudioContext();

      // Reset state
      transcriptRef.current = [];
      currentAssistantTextRef.current = "";
      audioChunksRef.current = [];
      nextPlayTimeRef.current = 0;

      const ws = new WebSocket(`${URI}?key=${GEMINI_API_KEY}`);
      wsRef.current = ws;

      // Set up a timeout for setup completion (15 seconds)
      // If setup doesn't complete in time, something is wrong
      setupTimeoutRef.current = setTimeout(() => {
        if (isConnectingRef.current) {
          console.error(`[Gemini] Setup timeout for connection #${thisConnectionId}`);
          options.onError?.("Connection timed out - the agent didn't respond. Please try again.");
          ws.close();
          isConnectingRef.current = false;
        }
      }, 15000);

      ws.onopen = () => {
        console.log(`[Gemini] WebSocket opened for connection #${thisConnectionId}`);

        // Send Setup Message - using snake_case for raw WebSocket protocol
        const setupMessage = {
          setup: {
            model: "models/gemini-2.5-flash-native-audio-preview-12-2025",
            generation_config: {
              response_modalities: ["AUDIO"],
              speech_config: {
                voice_config: {
                  prebuilt_voice_config: { voice_name: voice },
                },
              },
            },
            system_instruction: {
              parts: [{ text: personaInstruction }],
            },
            // Configure Voice Activity Detection (VAD) to prevent cutting off mid-response
            // and improve handling of natural conversation flow
            realtime_input_config: {
              automatic_activity_detection: {
                // Use LOW sensitivity for end of speech to prevent early cutoff
                // This gives users more time to pause/think without being interrupted
                start_of_speech_sensitivity: "START_SENSITIVITY_HIGH",
                end_of_speech_sensitivity: "END_SENSITIVITY_LOW",
                // Increase silence duration before triggering response (default is 100ms which is too short)
                // 500ms gives natural pauses without awkward delays
                silence_duration_ms: 500,
                // Add prefix padding to capture the beginning of speech
                prefix_padding_ms: 100,
              },
            },
          },
        };
        ws.send(JSON.stringify(setupMessage));

        setIsConnected(true);
        startRecording();
      };

      ws.onmessage = async (event) => {
        try {
          // Handle both string and Blob data from WebSocket
          let data: string;
          if (event.data instanceof Blob) {
            data = await event.data.text();
          } else {
            data = event.data;
          }
          const response = JSON.parse(data);

          // Handle setup completion
          if (response.setupComplete) {
            console.log(`[Gemini] Setup complete for connection #${thisConnectionId}`);
            // Clear the setup timeout since we connected successfully
            if (setupTimeoutRef.current) {
              clearTimeout(setupTimeoutRef.current);
              setupTimeoutRef.current = null;
            }
            isConnectingRef.current = false;
            lastActivityRef.current = Date.now();
            options.onSetupComplete?.();
            return;
          }

          // Update activity timestamp on any response
          lastActivityRef.current = Date.now();

          // Handle server content (audio and text responses)
          if (response.serverContent?.modelTurn?.parts) {
            setCurrentSpeaker("assistant");
            options.onSpeakingChange?.("assistant");

            for (const part of response.serverContent.modelTurn.parts) {
              // Handle audio
              if (part.inlineData?.mimeType?.startsWith("audio/pcm")) {
                const base64 = part.inlineData.data;
                const binary = atob(base64);
                const bytes = new Uint8Array(binary.length);
                for (let i = 0; i < binary.length; i++) {
                  bytes[i] = binary.charCodeAt(i);
                }
                const pcmData = new Int16Array(bytes.buffer);
                playAudioChunk(pcmData);
              }

              // Handle text (for transcript)
              if (part.text) {
                currentAssistantTextRef.current += part.text;
              }
            }
          }

          // Handle turn complete - save transcript
          if (response.serverContent?.turnComplete) {
            if (currentAssistantTextRef.current.trim()) {
              const entry: TranscriptEntry = {
                role: "assistant",
                content: currentAssistantTextRef.current.trim(),
                timestamp: Date.now(),
              };
              transcriptRef.current = [...transcriptRef.current, entry];
              options.onTranscriptUpdate?.(transcriptRef.current);
              currentAssistantTextRef.current = "";
            }
            setCurrentSpeaker(null);
            options.onSpeakingChange?.(null);
          }

          // Handle user speech activity (if Gemini reports it)
          if (response.realtimeInput?.speechActivity) {
            const activity = response.realtimeInput.speechActivity;
            if (activity.speechStarted) {
              setCurrentSpeaker("user");
              options.onSpeakingChange?.("user");
            } else if (activity.speechEnded) {
              setCurrentSpeaker(null);
              options.onSpeakingChange?.(null);
            }
          }

          // Handle transcribed user input (if available)
          if (response.serverContent?.inputTranscript) {
            const userText = response.serverContent.inputTranscript;
            if (userText.trim()) {
              const entry: TranscriptEntry = {
                role: "user",
                content: userText.trim(),
                timestamp: Date.now(),
              };
              transcriptRef.current = [...transcriptRef.current, entry];
              options.onTranscriptUpdate?.(transcriptRef.current);
            }
          }
        } catch (err) {
          console.error("Error parsing Gemini response:", err);
        }
      };

      ws.onerror = (error) => {
        console.error(`[Gemini] WebSocket error for connection #${thisConnectionId}:`, error);
        // Clear setup timeout on error
        if (setupTimeoutRef.current) {
          clearTimeout(setupTimeoutRef.current);
          setupTimeoutRef.current = null;
        }
        isConnectingRef.current = false;
        options.onError?.("Connection error");
      };

      ws.onclose = (event) => {
        console.log(`[Gemini] WebSocket closed for connection #${thisConnectionId}, code: ${event.code}, reason: ${event.reason || 'none'}`);
        // Clear setup timeout on close
        if (setupTimeoutRef.current) {
          clearTimeout(setupTimeoutRef.current);
          setupTimeoutRef.current = null;
        }
        isConnectingRef.current = false;
        setIsConnected(false);
        setIsPlaying(false);
        setCurrentSpeaker(null);
      };
    },
    [options, playAudioChunk, startRecording]
  );

  // Disconnect and cleanup
  const disconnect = useCallback(() => {
    console.log(`[Gemini] Disconnect called, closing connection #${connectionIdRef.current}`);
    isConnectingRef.current = false;

    // Clear any pending timeouts
    if (setupTimeoutRef.current) {
      clearTimeout(setupTimeoutRef.current);
      setupTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    streamRef.current?.getTracks().forEach((track) => track.stop());
    audioInputRef.current?.disconnect();
    workletNodeRef.current?.disconnect();

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }

    setIsConnected(false);
    setIsPlaying(false);
    setCurrentSpeaker(null);
  }, []);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        return !audioTrack.enabled; // Returns true if now muted
      }
    }
    return false;
  }, []);

  // Get recorded audio as base64
  const getRecordingBase64 = useCallback(async (): Promise<string | null> => {
    if (audioChunksRef.current.length === 0) return null;

    const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(",")[1];
        resolve(base64);
      };
      reader.readAsDataURL(blob);
    });
  }, []);

  // Get transcript
  const getTranscript = useCallback(() => {
    return transcriptRef.current;
  }, []);

  // Send a text message to trigger response (useful for starting conversation)
  const sendText = useCallback((text: string, addToTranscript: boolean = true) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const msg = {
        clientContent: {
          turns: [
            {
              role: "user",
              parts: [{ text }],
            },
          ],
          turnComplete: true,
        },
      };
      wsRef.current.send(JSON.stringify(msg));

      // Add to transcript only if requested
      if (addToTranscript) {
        const entry: TranscriptEntry = {
          role: "user",
          content: text,
          timestamp: Date.now(),
        };
        transcriptRef.current = [...transcriptRef.current, entry];
        options.onTranscriptUpdate?.(transcriptRef.current);
      }
    }
  }, [options]);

  // Set playback volume
  const setVolume = useCallback((volume: number) => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = Math.max(0, Math.min(1, volume));
    }
  }, []);

  return {
    connect,
    disconnect,
    toggleMute,
    sendText,
    getRecordingBase64,
    getTranscript,
    setVolume,
    isConnected,
    isPlaying,
    currentSpeaker,
  };
}
