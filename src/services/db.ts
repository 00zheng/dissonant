import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  writeBatch,
  serverTimestamp,
  query,
  orderBy,
  where
} from 'firebase/firestore';
import { ref, getDownloadURL, deleteObject, uploadBytesResumable, UploadTask } from 'firebase/storage';
import { db, storage } from './firebase';
import { Folder, Project, Track } from '../types';
import { MOCK_FOLDERS, MOCK_PROJECTS } from '../data/mockData';

// --- Local IndexedDB for Binary Audio File Blobs & Offline Fallback ---
const IDB_NAME = 'dissonant_db';
const IDB_VERSION = 2;
const STORE_FOLDERS = 'folders';
const STORE_PROJECTS = 'projects';
const STORE_AUDIO = 'audio_files';

function openIDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(IDB_NAME, IDB_VERSION);

    request.onupgradeneeded = (event) => {
      const dbInstance = (event.target as IDBOpenDBRequest).result;
      if (!dbInstance.objectStoreNames.contains(STORE_FOLDERS)) {
        dbInstance.createObjectStore(STORE_FOLDERS, { keyPath: 'id' });
      }
      if (!dbInstance.objectStoreNames.contains(STORE_PROJECTS)) {
        dbInstance.createObjectStore(STORE_PROJECTS, { keyPath: 'id' });
      }
      if (!dbInstance.objectStoreNames.contains(STORE_AUDIO)) {
        dbInstance.createObjectStore(STORE_AUDIO);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Audio Blob operations in IndexedDB
export async function dbSaveAudioBlob(trackId: string, blob: Blob): Promise<void> {
  const idb = await openIDB();
  return new Promise((resolve, reject) => {
    const tx = idb.transaction(STORE_AUDIO, 'readwrite');
    const store = tx.objectStore(STORE_AUDIO);
    const request = store.put(blob, trackId);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function dbGetAudioBlob(trackId: string): Promise<Blob | null> {
  const idb = await openIDB();
  return new Promise((resolve, reject) => {
    const tx = idb.transaction(STORE_AUDIO, 'readonly');
    const store = tx.objectStore(STORE_AUDIO);
    const request = store.get(trackId);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

export async function dbDeleteAudioBlob(trackId: string): Promise<void> {
  const idb = await openIDB();
  return new Promise((resolve, reject) => {
    const tx = idb.transaction(STORE_AUDIO, 'readwrite');
    const store = tx.objectStore(STORE_AUDIO);
    const request = store.delete(trackId);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function resolveTrackAudio(
  trackId: string,
  rawAudioUrl?: string
): Promise<{ resolvedUrl: string; hasAudio: boolean; isSample: boolean; storagePath?: string }> {
  // 1. Check local IndexedDB binary cache first for instant playback
  try {
    const blob = await dbGetAudioBlob(trackId);
    if (blob && blob.size > 0) {
      const storagePath =
        rawAudioUrl && (rawAudioUrl.startsWith('users/') || rawAudioUrl.startsWith('gs://'))
          ? rawAudioUrl
          : undefined;
      return {
        resolvedUrl: URL.createObjectURL(blob),
        hasAudio: true,
        isSample: false,
        storagePath,
      };
    }
  } catch (err) {
    console.warn(`[IDB] Error checking audio blob for ${trackId}:`, err);
  }

  // 2. Check if rawAudioUrl is a valid Firebase Storage path or download URL
  if (rawAudioUrl) {
    let storagePath = rawAudioUrl;
    if (storagePath.startsWith('gs://')) {
      const url = new URL(storagePath);
      storagePath = url.pathname.slice(1);
    }

    if (storagePath.startsWith('users/')) {
      try {
        const fileRef = ref(storage, storagePath);
        const downloadUrl = await getDownloadURL(fileRef);
        return {
          resolvedUrl: downloadUrl,
          hasAudio: true,
          isSample: false,
          storagePath,
        };
      } catch (err) {
        console.warn(`[Storage] Could not resolve storage path "${storagePath}" for track ${trackId}:`, err);
        return {
          resolvedUrl: '',
          hasAudio: false,
          isSample: true,
          storagePath,
        };
      }
    }

    if (storagePath.startsWith('https://firebasestorage.googleapis.com')) {
      return {
        resolvedUrl: storagePath,
        hasAudio: true,
        isSample: false,
      };
    }
  }

  // 3. Fallback: Only mock/sample metadata exists
  return {
    resolvedUrl: '',
    hasAudio: false,
    isSample: true,
  };
}

export async function dbResolveTrackAudioUrl(track: Track): Promise<string> {
  const result = await resolveTrackAudio(track.id, track.storagePath || track.audioUrl);
  return result.resolvedUrl;
}

// Get local IndexedDB folders and projects (used for migration)
async function getLocalData(): Promise<{ folders: Folder[]; projects: Project[] }> {
  try {
    const idb = await openIDB();
    const foldersTx = idb.transaction(STORE_FOLDERS, 'readonly');
    const foldersStore = foldersTx.objectStore(STORE_FOLDERS);
    const folders = await new Promise<Folder[]>((res, rej) => {
      const req = foldersStore.getAll();
      req.onsuccess = () => res(req.result || []);
      req.onerror = () => rej(req.error);
    });

    const projectsTx = idb.transaction(STORE_PROJECTS, 'readonly');
    const projectsStore = projectsTx.objectStore(STORE_PROJECTS);
    const projects = await new Promise<Project[]>((res, rej) => {
      const req = projectsStore.getAll();
      req.onsuccess = () => res(req.result || []);
      req.onerror = () => rej(req.error);
    });

    return {
      folders: folders.length > 0 ? folders : MOCK_FOLDERS,
      projects: projects.length > 0 ? projects : MOCK_PROJECTS,
    };
  } catch {
    return { folders: MOCK_FOLDERS, projects: MOCK_PROJECTS };
  }
}

// --- Firestore User Data Operations (/users/{userId}/...) ---

export async function initUserData(userId: string): Promise<{ folders: Folder[]; projects: Project[] }> {
  const foldersCol = collection(db, 'users', userId, 'folders');
  const projectsCol = collection(db, 'users', userId, 'projects');
  const tracksCol = collection(db, 'users', userId, 'tracks');

  const [foldersSnap, projectsSnap] = await Promise.all([
    getDocs(foldersCol),
    getDocs(projectsCol),
  ]);

  // If user has no existing Firestore data, migrate from local IndexedDB / initial mock data
  if (foldersSnap.empty && projectsSnap.empty) {
    console.log(`[Firestore] Initializing and migrating metadata to Firestore for user: ${userId}`);
    const localData = await getLocalData();
    await migrateLocalDataToFirestore(userId, localData.folders, localData.projects);
    return initUserData(userId); // Re-fetch freshly migrated data
  }

  // Load Folders
  const folders: Folder[] = foldersSnap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      name: data.name || '',
      description: data.description || '',
      itemCount: data.itemCount || 0,
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toLocaleDateString() : 'JUST NOW',
    };
  });

  // Load Tracks
  const tracksSnap = await getDocs(tracksCol);
  const tracksMap = new Map<string, Track[]>();

  for (const trackDoc of tracksSnap.docs) {
    const data = trackDoc.data();
    const rawAudioUrl = data.audioUrl || '';

    // Check whether track has real audio in Storage / IndexedDB or is mock metadata
    const { resolvedUrl, hasAudio, isSample, storagePath } = await resolveTrackAudio(
      trackDoc.id,
      rawAudioUrl
    );

    const track: Track = {
      id: trackDoc.id,
      projectId: data.projectId,
      order: data.order ?? 0,
      title: data.title || 'Untitled Track',
      artist: data.artist || undefined,
      duration: data.duration || 0,
      durationFormatted: data.durationFormatted || '00:00',
      bpm: data.bpm || undefined,
      key: data.key || undefined,
      versionTag: data.versionTag || undefined,
      stemsCount: data.stemsCount,
      audioUrl: resolvedUrl,
      storagePath,
      coverUrl: data.coverUrl || undefined,
      hasAudio,
      isSample,
    };

    const projectTracks = tracksMap.get(track.projectId!) || [];
    projectTracks.push(track);
    tracksMap.set(track.projectId!, projectTracks);
  }

  // Sort tracks by order ASC for each project
  tracksMap.forEach((tracks) => {
    tracks.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  });

  // Load Projects
  const projects: Project[] = projectsSnap.docs.map((d) => {
    const data = d.data();
    const projTracks = tracksMap.get(d.id) || [];
    return {
      id: d.id,
      title: data.title || '',
      artist: data.artist || '',
      coverUrl: data.coverUrl || '',
      coverStoragePath: data.coverStoragePath || undefined,
      category: data.category || 'Album',
      folderId: data.folderId || undefined,
      releaseDate: data.releaseDate || '',
      tracksCount: projTracks.length || data.tracksCount || 0,
      totalDuration: data.totalDuration || '00m 00s',
      tags: data.tags || [],
      tracks: projTracks,
    };
  });

  return { folders, projects };
}

// Migrate local IndexedDB metadata into Firestore
async function migrateLocalDataToFirestore(
  userId: string,
  folders: Folder[],
  projects: Project[]
): Promise<void> {
  const batch = writeBatch(db);

  // Save Folders
  for (const folder of folders) {
    const folderRef = doc(db, 'users', userId, 'folders', folder.id);
    batch.set(folderRef, {
      id: folder.id,
      name: folder.name,
      description: folder.description || '',
      itemCount: folder.itemCount || 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  // Save Projects and extracted Tracks
  for (const project of projects) {
    const projectRef = doc(db, 'users', userId, 'projects', project.id);
    batch.set(projectRef, {
      id: project.id,
      title: project.title,
      artist: project.artist,
      coverUrl: project.coverUrl || '',
      coverStoragePath: project.coverStoragePath || null,
      category: project.category,
      folderId: project.folderId || null,
      releaseDate: project.releaseDate || '',
      tags: project.tags || [],
      tracksCount: project.tracks?.length || project.tracksCount || 0,
      totalDuration: project.totalDuration || '00m 00s',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    if (project.tracks && project.tracks.length > 0) {
      project.tracks.forEach((track, index) => {
        const trackRef = doc(db, 'users', userId, 'tracks', track.id);
        const trackPayload: any = {
          id: track.id,
          projectId: project.id,
          order: index,
          title: track.title,
          duration: track.duration || 0,
          durationFormatted: track.durationFormatted || '00:00',
          audioUrl: track.audioUrl || '',
          coverUrl: track.coverUrl || null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        if (track.artist) trackPayload.artist = track.artist;
        if (track.bpm) trackPayload.bpm = track.bpm;
        if (track.key) trackPayload.key = track.key;
        if (track.versionTag) trackPayload.versionTag = track.versionTag;
        if (track.stemsCount) trackPayload.stemsCount = track.stemsCount;
        if (track.storagePath) trackPayload.storagePath = track.storagePath;

        batch.set(trackRef, trackPayload);
      });
    }
  }

  await batch.commit();
  console.log(`[Firestore] Migration complete for user: ${userId}`);
}

// Folder Firestore Operations
export async function fsSaveFolder(userId: string, folder: Folder): Promise<Folder> {
  const folderRef = doc(db, 'users', userId, 'folders', folder.id);
  await setDoc(
    folderRef,
    {
      id: folder.id,
      name: folder.name,
      description: folder.description || '',
      itemCount: folder.itemCount || 0,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
  return folder;
}

export async function fsDeleteFolder(userId: string, folderId: string): Promise<void> {
  const folderRef = doc(db, 'users', userId, 'folders', folderId);
  await deleteDoc(folderRef);

  // Update projects in this folder to have no folderId
  const projectsCol = collection(db, 'users', userId, 'projects');
  const q = query(projectsCol, where('folderId', '==', folderId));
  const snap = await getDocs(q);
  const batch = writeBatch(db);
  snap.docs.forEach((d) => {
    batch.update(d.ref, { folderId: null, updatedAt: serverTimestamp() });
  });
  await batch.commit();
}

// Project Firestore Operations
export async function fsSaveProject(userId: string, project: Project): Promise<Project> {
  const projectRef = doc(db, 'users', userId, 'projects', project.id);
  await setDoc(
    projectRef,
    {
      id: project.id,
      title: project.title,
      artist: project.artist,
      coverUrl: project.coverUrl || '',
      coverStoragePath: project.coverStoragePath || null,
      category: project.category,
      folderId: project.folderId || null,
      releaseDate: project.releaseDate || '',
      tags: project.tags || [],
      tracksCount: project.tracks?.length || project.tracksCount || 0,
      totalDuration: project.totalDuration || '00m 00s',
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  // Save tracks if present
  if (project.tracks && project.tracks.length > 0) {
    const batch = writeBatch(db);
    project.tracks.forEach((track, index) => {
      const trackRef = doc(db, 'users', userId, 'tracks', track.id);
      const firestoreAudioUrl =
        track.storagePath ||
        (track.audioUrl?.startsWith('blob:') ? '' : track.audioUrl || '');

      const trackPayload: any = {
        id: track.id,
        projectId: project.id,
        order: track.order ?? index,
        title: track.title,
        duration: track.duration || 0,
        durationFormatted: track.durationFormatted || '00:00',
        audioUrl: firestoreAudioUrl,
        updatedAt: serverTimestamp(),
      };

      if (track.artist !== undefined) trackPayload.artist = track.artist || null;
      if (track.bpm !== undefined) trackPayload.bpm = track.bpm || null;
      if (track.key !== undefined) trackPayload.key = track.key || null;
      if (track.versionTag !== undefined) trackPayload.versionTag = track.versionTag || null;
      if (track.stemsCount !== undefined) trackPayload.stemsCount = track.stemsCount || null;
      if (track.coverUrl !== undefined) trackPayload.coverUrl = track.coverUrl || null;
      if (track.storagePath !== undefined) trackPayload.storagePath = track.storagePath || null;

      batch.set(trackRef, trackPayload, { merge: true });
    });
    await batch.commit();
  }

  return project;
}

export async function fsDeleteProject(userId: string, projectId: string, coverStoragePath?: string): Promise<void> {
  const projectRef = doc(db, 'users', userId, 'projects', projectId);
  await deleteDoc(projectRef);

  if (coverStoragePath) {
    await fsDeleteCoverImage(coverStoragePath);
  }

  // Find all tracks belonging to this project
  const tracksCol = collection(db, 'users', userId, 'tracks');
  const q = query(tracksCol, where('projectId', '==', projectId));
  const snap = await getDocs(q);
  const batch = writeBatch(db);

  for (const trackDoc of snap.docs) {
    const trackData = trackDoc.data();
    batch.delete(trackDoc.ref);
    if (trackData.audioUrl) {
      // attempt delete from storage if user track
      try {
        let storagePath = trackData.audioUrl;
        if (storagePath.startsWith('gs://')) {
          const url = new URL(storagePath);
          storagePath = url.pathname.slice(1);
        }
        if (!storagePath.startsWith('http') && storagePath.startsWith('users/')) {
          const fileRef = ref(storage, storagePath);
          await deleteObject(fileRef);
        }
      } catch (err) {
        console.warn(`[Storage] Failed to delete audio file during project deletion:`, err);
      }
    }
    // Delete local IndexedDB audio blob
    await dbDeleteAudioBlob(trackDoc.id);
  }
  await batch.commit();
}

export async function fsMoveProject(userId: string, projectId: string, folderId?: string): Promise<void> {
  const projectRef = doc(db, 'users', userId, 'projects', projectId);
  await setDoc(
    projectRef,
    {
      folderId: folderId || null,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

// Track Firestore Operations
export async function fsSaveTrack(userId: string, projectId: string, track: Track, order: number): Promise<void> {
  const trackRef = doc(db, 'users', userId, 'tracks', track.id);
  const firestoreAudioUrl =
    track.storagePath ||
    (track.audioUrl?.startsWith('blob:') ? '' : track.audioUrl || '');

  const trackPayload: any = {
    id: track.id,
    projectId,
    order,
    title: track.title,
    duration: track.duration || 0,
    durationFormatted: track.durationFormatted || '00:00',
    audioUrl: firestoreAudioUrl,
    updatedAt: serverTimestamp(),
  };

  if (track.artist !== undefined) trackPayload.artist = track.artist || null;
  if (track.bpm !== undefined) trackPayload.bpm = track.bpm || null;
  if (track.key !== undefined) trackPayload.key = track.key || null;
  if (track.versionTag !== undefined) trackPayload.versionTag = track.versionTag || null;
  if (track.stemsCount !== undefined) trackPayload.stemsCount = track.stemsCount || null;
  if (track.coverUrl !== undefined) trackPayload.coverUrl = track.coverUrl || null;
  if (track.storagePath !== undefined) trackPayload.storagePath = track.storagePath || null;

  await setDoc(trackRef, trackPayload, { merge: true });
}

export async function fsDeleteTrack(userId: string, trackId: string, audioUrl?: string): Promise<void> {
  const trackRef = doc(db, 'users', userId, 'tracks', trackId);
  await deleteDoc(trackRef);
  
  if (audioUrl && (audioUrl.startsWith('http') || audioUrl.startsWith('gs://') || audioUrl.startsWith('users/'))) {
    try {
      let storagePath = audioUrl;
      if (storagePath.startsWith('gs://')) {
        const url = new URL(storagePath);
        storagePath = url.pathname.slice(1);
      }
      
      if (!storagePath.startsWith('http')) {
         const fileRef = ref(storage, storagePath);
         await deleteObject(fileRef);
      }
    } catch (err) {
      console.warn(`[Storage] Failed to delete audio file for ${trackId}:`, err);
    }
  }

  await dbDeleteAudioBlob(trackId);
}

export function fsUploadAudioFile(userId: string, trackId: string, file: File): { task: UploadTask, storagePath: string } {
  const fileExt = file.name.split('.').pop() || 'wav';
  const fileName = `${trackId}.${fileExt}`;
  const storagePath = `users/${userId}/tracks/${trackId}/${fileName}`;
  const fileRef = ref(storage, storagePath);
  const task = uploadBytesResumable(fileRef, file, { contentType: file.type || 'audio/wav' });
  return { task, storagePath };
}

export function fsUploadCoverImage(userId: string, projectId: string, file: File): { task: UploadTask, storagePath: string } {
  const fileExt = file.name.split('.').pop() || 'jpg';
  const fileName = `cover_${Date.now()}.${fileExt}`;
  const storagePath = `users/${userId}/covers/${projectId}/${fileName}`;
  const fileRef = ref(storage, storagePath);
  const task = uploadBytesResumable(fileRef, file, { contentType: file.type || 'image/jpeg' });
  return { task, storagePath };
}

export async function fsDeleteCoverImage(storagePath: string): Promise<void> {
  if (!storagePath) return;
  try {
    let cleanPath = storagePath;
    if (cleanPath.startsWith('gs://')) {
      const url = new URL(cleanPath);
      cleanPath = url.pathname.slice(1);
    }
    if (!cleanPath.startsWith('http')) {
      const fileRef = ref(storage, cleanPath);
      await deleteObject(fileRef);
    }
  } catch (err) {
    console.warn(`[Storage] Failed to delete cover image:`, err);
  }
}

export async function fsReorderTracks(userId: string, tracks: Track[]): Promise<void> {
  const batch = writeBatch(db);
  tracks.forEach((track, index) => {
    const trackRef = doc(db, 'users', userId, 'tracks', track.id);
    batch.update(trackRef, { order: index, updatedAt: serverTimestamp() });
  });
  await batch.commit();
}
