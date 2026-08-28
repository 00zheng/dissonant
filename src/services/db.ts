import { Folder, Project } from '../types';
import { MOCK_FOLDERS, MOCK_PROJECTS } from '../data/mockData';

const DB_NAME = 'dissonant_db';
const DB_VERSION = 1;
const STORE_FOLDERS = 'folders';
const STORE_PROJECTS = 'projects';

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
