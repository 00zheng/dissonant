export interface Track {
  id: string;
  title: string;
  artist: string;
  duration: number; // in seconds
  durationFormatted: string; // e.g. "03:42"
  bpm: number;
  key: string;
  versionTag: string; // e.g. "v2.4 Final", "Stem Mix", "Draft"
  stemsCount?: number;
  audioUrl: string;
  coverUrl: string;
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

export type ViewMode = 'library' | 'folder_detail' | 'project_detail' | 'search';
