import { useState, useRef, useCallback } from "react";

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const HOST = "generativelanguage.googleapis.com";
const URI = `wss://${HOST}/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent`;

// Voice options for different persona types
export type GeminiVoice = "Puck" | "Charon" | "Kore" | "Fenrir" | "Aoede";

export interface TranscriptEntry {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface UseGeminiLiveOptions {
  onTranscriptUpdate?: (transcript: TranscriptEntry[]) => void;
  onSpeakingChange?: (speaker: "user" | "assistant" | null) => void;
  onError?: (error: string) => void;
}

export function useGeminiLive(options: UseGeminiLiveOptions = {}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [currentSpeaker, setCurrentSpeaker] = useState<"user" | "assistant" | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioInputRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioQueueRef = useRef<Int16Array[]>([]);
  const nextPlayTimeRef = useRef<number>(0);
  const transcriptRef = useRef<TranscriptEntry[]>([]);
  const currentAssistantTextRef = useRef<string>("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Initialize Audio Context
  const ensureAudioContext = async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)({
        sampleRate: 24000, // Gemini output rate
      });
      await audioContextRef.current.audioWorklet.addModule("/audio-processor.js");
    }
    if (audioContextRef.current.state === "suspended") {
      await audioContextRef.current.resume();
    }
  };

  // Play audio chunk from Gemini
  const playAudioChunk = useCallback((pcmData: Int16Array) => {
    if (!audioContextRef.current) return;

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
    source.connect(context.destination);

    const currentTime = context.currentTime;
    // Schedule next chunk exactly at the end of the previous one
    const startTime = Math.max(currentTime, nextPlayTimeRef.current);
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

      // Start MediaRecorder for saving the call
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      mediaRecorder.start(1000);

      const context = audioContextRef.current!;
      const source = context.createMediaStreamSource(stream);
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
      if (!GEMINI_API_KEY) {
        console.error("Gemini API Key missing");
        options.onError?.("API Key missing");
        return;
      }

      await ensureAudioContext();

      // Reset state
      transcriptRef.current = [];
      currentAssistantTextRef.current = "";
      audioChunksRef.current = [];
      nextPlayTimeRef.current = 0;

      const ws = new WebSocket(`${URI}?key=${GEMINI_API_KEY}`);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("Connected to Gemini Live");

        // Send Setup Message
        const setupMessage = {
          setup: {
            model: "models/gemini-2.5-flash-native-audio-preview-09-2025",
            generationConfig: {
              responseModalities: ["AUDIO", "TEXT"],
              speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } },
              },
            },
            systemInstruction: {
              parts: [{ text: personaInstruction }],
            },
          },
        };
        ws.send(JSON.stringify(setupMessage));

        setIsConnected(true);
        startRecording();
      };

      ws.onmessage = async (event) => {
        try {
          const response = JSON.parse(event.data);

          // Handle setup completion
          if (response.setupComplete) {
            console.log("Gemini setup complete");
            return;
          }

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
        console.error("WebSocket error:", error);
        options.onError?.("Connection error");
      };

      ws.onclose = () => {
        console.log("Disconnected from Gemini Live");
        setIsConnected(false);
        setIsPlaying(false);
        setCurrentSpeaker(null);
      };
    },
    [options, playAudioChunk, startRecording]
  );

  // Disconnect and cleanup
  const disconnect = useCallback(() => {
    wsRef.current?.close();
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
  const sendText = useCallback((text: string) => {
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

      // Add to transcript
      const entry: TranscriptEntry = {
        role: "user",
        content: text,
        timestamp: Date.now(),
      };
      transcriptRef.current = [...transcriptRef.current, entry];
      options.onTranscriptUpdate?.(transcriptRef.current);
    }
  }, [options]);

  return {
    connect,
    disconnect,
    toggleMute,
    sendText,
    getRecordingBase64,
    getTranscript,
    isConnected,
    isPlaying,
    currentSpeaker,
  };
}
