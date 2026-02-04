// public/audio-processor.js
// AudioWorklet processor for converting Float32 audio to Int16 PCM
// Runs off the main thread to prevent UI jank during audio processing

class PCMProcessor extends AudioWorkletProcessor {
  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (input.length > 0) {
      const float32Data = input[0];
      const int16Data = new Int16Array(float32Data.length);

      // Convert Float32 to Int16 (PCM)
      for (let i = 0; i < float32Data.length; i++) {
        const s = Math.max(-1, Math.min(1, float32Data[i]));
        int16Data[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
      }

      // Send PCM data to main thread
      this.port.postMessage(int16Data.buffer, [int16Data.buffer]);
    }
    return true;
  }
}

registerProcessor("pcm-processor", PCMProcessor);
