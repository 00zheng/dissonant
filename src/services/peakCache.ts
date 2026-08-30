const PEAK_DB_NAME = 'dissonant_peaks_db';
const PEAK_DB_VERSION = 1;
const STORE_PEAKS = 'peaks';

export interface CachedPeaks {
  trackId: string;
  peaks: Array<number[]>;
  duration: number;
}

function openPeakDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(PEAK_DB_NAME, PEAK_DB_VERSION);

    request.onupgradeneeded = (event) => {
      const dbInstance = (event.target as IDBOpenDBRequest).result;
      if (!dbInstance.objectStoreNames.contains(STORE_PEAKS)) {
        dbInstance.createObjectStore(STORE_PEAKS, { keyPath: 'trackId' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getPeaksFromIDB(trackId: string): Promise<CachedPeaks | null> {
  try {
    const idb = await openPeakDB();
    return new Promise((resolve, reject) => {
      const tx = idb.transaction(STORE_PEAKS, 'readonly');
      const store = tx.objectStore(STORE_PEAKS);
      const request = store.get(trackId);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('[PeakCache] Error reading from IDB', err);
    return null;
  }
}

export async function savePeaksToIDB(trackId: string, peaks: Array<number[]>, duration: number): Promise<void> {
  try {
    const idb = await openPeakDB();
    return new Promise((resolve, reject) => {
      const tx = idb.transaction(STORE_PEAKS, 'readwrite');
      const store = tx.objectStore(STORE_PEAKS);
      const request = store.put({ trackId, peaks, duration });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('[PeakCache] Error saving to IDB', err);
  }
}
