export interface Track {
  id: string;
  projectId?: string;
  order?: number;
  title: string;
  artist: string;
  duration: number; // in seconds
  durationFormatted: string; // e.g. "03:42"
  bpm: number;
  key: string;
  versionTag: string; // e.g. "Take 1", "Draft"
  stemsCount?: number;
  audioUrl: string;
  storagePath?: string;
  coverUrl: string;
  hasAudio?: boolean; // true if backed by real Firebase Storage file or local IndexedDB Blob
  isSample?: boolean; // true if mock metadata only
}

export type ProjectCategory = 'Album' | 'EP' | 'Single' | 'Stems' | 'Demo';

export interface Project {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  category: ProjectCategory;
  folderId?: string;
  releaseDate: string;
  tracksCount: number;
  totalDuration: string;
  tags: string[];
  tracks: Track[];
}

export interface Folder {
  id: string;
  name: string;
  itemCount: number;
  description: string;
  updatedAt: string;
}

export type ViewMode = 'library' | 'folders' | 'projects' | 'folder_detail' | 'project_detail' | 'search';

export type RouteState =
  | { type: 'library' }
  | { type: 'folders' }
  | { type: 'folder_detail'; folderId: string }
  | { type: 'projects' }
  | { type: 'project_detail'; projectId: string };

