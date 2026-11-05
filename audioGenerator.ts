// Utility to generate seekable synthetic audio files or encode recorded audio chunks

export function createWavBlob(durationSeconds: number, frequency: number = 440): Blob {
  const sampleRate = 44100;
  const numChannels = 1;
  const numSamples = Math.floor(sampleRate * durationSeconds);
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = numSamples * blockAlign;

  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  // RIFF identifier
  writeString(view, 0, 'RIFF');
  // RIFF chunk length
  view.setUint32(4, 36 + dataSize, true);
  // RIFF type
  writeString(view, 8, 'WAVE');
  // format chunk identifier
  writeString(view, 12, 'fmt ');
  // format chunk length
  view.setUint32(16, 16, true);
  // sample format (1 = PCM)
  view.setUint16(20, 1, true);
  // channel count
  view.setUint16(22, numChannels, true);
  // sample rate
  view.setUint32(24, sampleRate, true);
  // byte rate
  view.setUint32(28, byteRate, true);
  // block align
  view.setUint16(32, blockAlign, true);
  // bits per sample
  view.setUint16(34, 16, true);
  // data chunk identifier
  writeString(view, 36, 'data');
  // data chunk length
  view.setUint32(40, dataSize, true);

  // Synthesize realistic speech-like modulated hum and lecture tone variations
  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    // modulated cadence resembling classroom speaking rhythms
    const rhythmMod = Math.sin(2 * Math.PI * 1.8 * t);
    const pauseGate = Math.sin(2 * Math.PI * 0.25 * t) > -0.2 ? 1 : 0.05;
    
    // Multi-frequency harmonic tone to simulate voice formants
    const f0 = frequency + Math.sin(2 * Math.PI * 0.8 * t) * 35;
    const sampleVal = (
      0.5 * Math.sin(2 * Math.PI * f0 * t) +
      0.3 * Math.sin(2 * Math.PI * (f0 * 1.5) * t) +
      0.2 * Math.sin(2 * Math.PI * (f0 * 2.2) * t)
    ) * rhythmMod * pauseGate * 0.25;

    const clamped = Math.max(-1, Math.min(1, sampleVal));
    view.setInt16(offset, clamped < 0 ? clamped * 0x8000 : clamped * 0x7FFF, true);
    offset += 2;
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

// Convert audio blob to base64 for persistent localStorage
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
