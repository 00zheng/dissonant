import { Track } from '../types';
import { dbSaveAudioBlob } from './db';

export function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const formattedMins = mins < 10 ? `0${mins}` : `${mins}`;
  const formattedSecs = secs < 10 ? `0${secs}` : `${secs}`;
  return `${formattedMins}:${formattedSecs}`;
}

export function formatTotalDuration(tracks: Track[]): string {
  const totalSeconds = tracks.reduce((acc, t) => acc + (t.duration || 0), 0);
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.floor(totalSeconds % 60);
  return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
}

export function extractAudioMetadata(file: File): Promise<{ duration: number; durationFormatted: string }> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const audio = new Audio();
    audio.preload = 'metadata';

    const cleanUp = () => {
      audio.removeEventListener('loadedmetadata', onLoaded);
      audio.removeEventListener('error', onError);
      URL.revokeObjectURL(url);
    };

    const onLoaded = () => {
      const duration = audio.duration || 0;
      const durationFormatted = formatDuration(duration);
      cleanUp();
      resolve({ duration, durationFormatted });
    };

    const onError = () => {
      cleanUp();
      resolve({ duration: 0, durationFormatted: '00:00' });
    };

    audio.addEventListener('loadedmetadata', onLoaded);
    audio.addEventListener('error', onError);
    audio.src = url;

    // Timeout fallback in case metadata event fails to trigger
    setTimeout(() => {
      if (audio.duration && !isNaN(audio.duration)) {
        onLoaded();
      } else {
        onError();
      }
    }, 2000);
  });
}

export async function processAudioUpload(
  file: File,
  projectArtist: string,
  projectCoverUrl: string,
  storagePath?: string,
  trackId?: string
): Promise<Track> {
  const id = trackId || `t-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  // Always cache file Blob in IndexedDB for instant local playback
  try {
    await dbSaveAudioBlob(id, file);
  } catch (err) {
    console.warn('[IDB] Failed to cache audio blob locally:', err);
  }

  // Extract Audio Metadata
  const { duration, durationFormatted } = await extractAudioMetadata(file);

  // Clean filename for title
  const cleanTitle = file.name.replace(/\.[^/.]+$/, '');

  // Local object URL for immediate playback in current session
  const localBlobUrl = URL.createObjectURL(file);

  const track: Track = {
    id: id,
    title: cleanTitle,
    artist: projectArtist || 'Unknown Artist',
    duration: Math.round(duration),
    durationFormatted,
    bpm: 120,
    key: 'C',
    versionTag: 'Take 1',
    audioUrl: localBlobUrl,
    storagePath: storagePath,
    coverUrl: projectCoverUrl,
    hasAudio: true,
    isSample: false,
  };

  return track;
}
