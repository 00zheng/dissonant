import { Folder, Project, Track } from '../types';
import { MOCK_FOLDERS, MOCK_PROJECTS } from '../data/mockData';

const DB_NAME = 'dissonant_db';
const DB_VERSION = 2;
const STORE_FOLDERS = 'folders';
const STORE_PROJECTS = 'projects';
const STORE_AUDIO = 'audio_files';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_FOLDERS)) {
        db.createObjectStore(STORE_FOLDERS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_PROJECTS)) {
        db.createObjectStore(STORE_PROJECTS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_AUDIO)) {
        db.createObjectStore(STORE_AUDIO);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function initDB(): Promise<{ folders: Folder[]; projects: Project[] }> {
  const db = await openDB();

  // Check if initial seeding is needed
  const folderCount = await getStoreCount(db, STORE_FOLDERS);
  const projectCount = await getStoreCount(db, STORE_PROJECTS);

  if (folderCount === 0) {
    await populateStore(db, STORE_FOLDERS, MOCK_FOLDERS);
  }
  if (projectCount === 0) {
    await populateStore(db, STORE_PROJECTS, MOCK_PROJECTS);
  }

  const folders = await getAllItems<Folder>(db, STORE_FOLDERS);
  const projects = await getAllItems<Project>(db, STORE_PROJECTS);

  // Resolve dynamic object URLs for tracks stored in IndexedDB
  for (const project of projects) {
    if (project.tracks) {
      for (const track of project.tracks) {
        track.audioUrl = await dbResolveTrackAudioUrl(track);
      }
    }
  }

  return { folders, projects };
}

function getStoreCount(db: IDBDatabase, storeName: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.count();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function populateStore<T>(db: IDBDatabase, storeName: string, items: T[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    items.forEach((item) => store.put(item));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

function getAllItems<T>(db: IDBDatabase, storeName: string): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result as T[]);
    request.onerror = () => reject(request.error);
  });
}

export async function dbSaveFolder(folder: Folder): Promise<Folder> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_FOLDERS, 'readwrite');
    const store = tx.objectStore(STORE_FOLDERS);
    const request = store.put(folder);
    request.onsuccess = () => resolve(folder);
    request.onerror = () => reject(request.error);
  });
}

export async function dbDeleteFolder(folderId: string): Promise<void> {
  const db = await openDB();
  
  // Also update any projects in this folder to have no folderId
  const projects = await getAllItems<Project>(db, STORE_PROJECTS);
  const tx = db.transaction([STORE_FOLDERS, STORE_PROJECTS], 'readwrite');
  
  const folderStore = tx.objectStore(STORE_FOLDERS);
  folderStore.delete(folderId);

  const projectStore = tx.objectStore(STORE_PROJECTS);
  projects.forEach((proj) => {
    if (proj.folderId === folderId) {
      const updated = { ...proj, folderId: undefined };
      projectStore.put(updated);
    }
  });

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function dbSaveProject(project: Project): Promise<Project> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_PROJECTS, 'readwrite');
    const store = tx.objectStore(STORE_PROJECTS);
    const request = store.put(project);
    request.onsuccess = () => resolve(project);
    request.onerror = () => reject(request.error);
  });
}

export async function dbDeleteProject(projectId: string): Promise<void> {
  const db = await openDB();
  
  // Delete project and associated track audio blobs
  const projects = await getAllItems<Project>(db, STORE_PROJECTS);
  const project = projects.find((p) => p.id === projectId);
  
  if (project && project.tracks) {
    for (const track of project.tracks) {
      await dbDeleteAudioBlob(track.id);
    }
  }

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_PROJECTS, 'readwrite');
    const store = tx.objectStore(STORE_PROJECTS);
    const request = store.delete(projectId);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function dbMoveProject(projectId: string, folderId?: string): Promise<Project> {
  const db = await openDB();
  const tx = db.transaction(STORE_PROJECTS, 'readwrite');
  const store = tx.objectStore(STORE_PROJECTS);

  const project: Project = await new Promise((resolve, reject) => {
    const getReq = store.get(projectId);
    getReq.onsuccess = () => resolve(getReq.result);
    getReq.onerror = () => reject(getReq.error);
  });

  if (!project) throw new Error('Project not found');

  const updatedProject = { ...project, folderId: folderId || undefined };

  return new Promise((resolve, reject) => {
    const putReq = store.put(updatedProject);
    putReq.onsuccess = () => resolve(updatedProject);
    putReq.onerror = () => reject(putReq.error);
  });
}

// --- Binary Audio File Blob Storage ---

export async function dbSaveAudioBlob(trackId: string, blob: Blob): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_AUDIO, 'readwrite');
    const store = tx.objectStore(STORE_AUDIO);
    const request = store.put(blob, trackId);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function dbGetAudioBlob(trackId: string): Promise<Blob | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_AUDIO, 'readonly');
    const store = tx.objectStore(STORE_AUDIO);
    const request = store.get(trackId);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

export async function dbDeleteAudioBlob(trackId: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_AUDIO, 'readwrite');
    const store = tx.objectStore(STORE_AUDIO);
    const request = store.delete(trackId);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function dbResolveTrackAudioUrl(track: Track): Promise<string> {
  const blob = await dbGetAudioBlob(track.id);
  if (blob) {
    return URL.createObjectURL(blob);
  }
  return track.audioUrl;
}
