// This provides a lightweight approximation of BS.1770 LUFS using K-weighted RMS.
// Exact LUFS calculation requires gating and block analysis, but this provides a
// reasonable proxy for normalization purposes without adding heavy dependencies.

export const TARGET_LUFS = -14;
export const MAX_NORM_GAIN_DB = 8;
export const MIN_NORM_GAIN_DB = -12;

export async function analyzeLoudness(fileOrUrl: File | string): Promise<number> {
  let arrayBuffer: ArrayBuffer;

  if (typeof fileOrUrl === 'string') {
    const response = await fetch(fileOrUrl);
    if (!response.ok) throw new Error(`Failed to fetch audio for analysis: ${response.statusText}`);
    arrayBuffer = await response.arrayBuffer();
  } else {
    arrayBuffer = await fileOrUrl.arrayBuffer();
  }

  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContextClass) throw new Error('AudioContext not supported');

  // We use a temporary standard AudioContext just to decode the audio data.
  const tempCtx = new AudioContextClass();
  let audioBuffer: AudioBuffer;
  try {
    audioBuffer = await tempCtx.decodeAudioData(arrayBuffer);
  } finally {
    tempCtx.close().catch(() => {});
  }

  // Use an OfflineAudioContext to apply K-weighting filters and calculate RMS.
  // To save memory and processing time, we can downmix to mono and use a lower sample rate if possible,
  // but we'll use the decoded buffer's properties for simplicity.
  const offlineCtx = new OfflineAudioContext(1, audioBuffer.length, audioBuffer.sampleRate);
  
  const source = offlineCtx.createBufferSource();
  source.buffer = audioBuffer;

  // K-Weighting Filter 1: High shelf filter
  const highShelf = offlineCtx.createBiquadFilter();
  highShelf.type = 'highshelf';
  highShelf.frequency.value = 1500;
  highShelf.gain.value = 4;

  // K-Weighting Filter 2: High pass filter
  const highPass = offlineCtx.createBiquadFilter();
  highPass.type = 'highpass';
  highPass.frequency.value = 38;

  // Route: source -> highShelf -> highPass -> destination
  source.connect(highShelf);
  highShelf.connect(highPass);
  highPass.connect(offlineCtx.destination);

  source.start(0);

  const renderedBuffer = await offlineCtx.startRendering();
  const channelData = renderedBuffer.getChannelData(0);

  let sumSquares = 0;
  // Calculate Mean Square
  for (let i = 0; i < channelData.length; i++) {
    const sample = channelData[i];
    sumSquares += sample * sample;
  }

  const meanSquare = sumSquares / channelData.length;
  if (meanSquare === 0) return -70; // Silence

  // RMS to dB
  const rmsDb = 10 * Math.log10(meanSquare);

  // Calibration offset (rough approximation to map RMS to LUFS)
  // Usually a sine wave at 1kHz peaking at 0dBFS is -3.01 LUFS
  const lufsApproximation = rmsDb - 0.691;

  return lufsApproximation;
}

export function calculateNormalizationGain(lufs: number, targetLufs: number = TARGET_LUFS): number {
  let diff = targetLufs - lufs;
  
  // Clamp the gain
  if (diff > MAX_NORM_GAIN_DB) diff = MAX_NORM_GAIN_DB;
  if (diff < MIN_NORM_GAIN_DB) diff = MIN_NORM_GAIN_DB;

  return diff;
}
