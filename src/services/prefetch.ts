import { Track } from '../types';
import { dbGetAudioBlob, dbSaveAudioBlob } from './db';
import { ref, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

const inFlightPrefetches = new Map<string, AbortController>();

export async function prefetchTrackAudio(track: Track, activeTrackId?: string): Promise<void> {
  // Cancel previous prefetches that are not this track
  for (const [id, controller] of inFlightPrefetches.entries()) {
    if (id !== track.id) {
      controller.abort();
      inFlightPrefetches.delete(id);
    }
  }

  // If already prefetching this track, do nothing
  if (inFlightPrefetches.has(track.id)) {
    return;
  }

  if (!track.audioUrl && !track.storagePath) {
    return;
  }

  const abortController = new AbortController();
  inFlightPrefetches.set(track.id, abortController);

  try {
    // 1. Check if already in IndexedDB
    const existingBlob = await dbGetAudioBlob(track.id);
    if (existingBlob && existingBlob.size > 0) {
      inFlightPrefetches.delete(track.id);
      return; // Already cached
    }

    // 2. Resolve URL
    let downloadUrl = '';
    let storagePath = track.storagePath || track.audioUrl || '';
    if (storagePath.startsWith('gs://')) {
      const url = new URL(storagePath);
      storagePath = url.pathname.slice(1);
    }

    if (storagePath.startsWith('users/')) {
      const fileRef = ref(storage, storagePath);
      downloadUrl = await getDownloadURL(fileRef);
    } else if (storagePath.startsWith('http')) {
      downloadUrl = storagePath;
    }

    if (!downloadUrl) {
      throw new Error('Could not resolve download URL');
    }

    // 3. Fetch Blob in background
    const response = await fetch(downloadUrl, {
      signal: abortController.signal
    });

    if (!response.ok) {
      throw new Error(`Fetch failed with status ${response.status}`);
    }

    const blob = await response.blob();

    // 4. Save to IndexedDB
    await dbSaveAudioBlob(track.id, blob, activeTrackId);
    
  } catch (err: any) {
    if (err.name === 'AbortError') {
      console.log(`[Prefetch] Aborted prefetch for ${track.id}`);
    } else {
      console.warn(`[Prefetch] Failed to prefetch audio for track ${track.id}:`, err);
    }
  } finally {
    if (inFlightPrefetches.get(track.id) === abortController) {
      inFlightPrefetches.delete(track.id);
    }
  }
}
