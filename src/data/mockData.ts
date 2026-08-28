import { Folder, Project } from '../types';

// Neutral dark brutalist fallback artwork for projects without custom cover
export const NEUTRAL_COVER_FALLBACK = `data:image/svg+xml;utf8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
    <rect width="400" height="400" fill="#1C1B1B" />
    <rect x="24" y="24" width="352" height="352" fill="none" stroke="#282828" stroke-width="1.5" />
    <circle cx="200" cy="200" r="80" fill="none" stroke="#282828" stroke-width="1.5" />
    <circle cx="200" cy="200" r="28" fill="#131313" stroke="#282828" stroke-width="1.5" />
    <circle cx="200" cy="200" r="8" fill="#E8BDB3" fill-opacity="0.3" />
  </svg>
`)}`;

export const MOCK_FOLDERS: Folder[] = [
  {
    id: 'folder-1',
    name: '2026 Music',
    itemCount: 2,
    description: 'Current songs and track ideas for this year',
    updatedAt: '2 HOURS AGO'
  },
  {
    id: 'folder-2',
    name: 'Piano',
    itemCount: 1,
    description: 'Piano recordings and practice sessions',
    updatedAt: 'YESTERDAY'
  },
  {
    id: 'folder-3',
    name: 'Practice',
    itemCount: 1,
    description: 'Exercises, warm-ups, and acoustic jam takes',
    updatedAt: 'AUG 21'
  },
  {
    id: 'folder-4',
    name: 'Ideas',
    itemCount: 1,
    description: 'Voice memos, chords, and rough sketches',
    updatedAt: 'AUG 15'
  }
];

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    title: 'Album Ideas',
    artist: 'Alex',
    coverUrl: NEUTRAL_COVER_FALLBACK,
    category: 'Album',
    folderId: 'folder-1',
    releaseDate: '2026-08-20',
    tracksCount: 4,
    totalDuration: '15m 26s',
    tags: ['Indie', 'Acoustic', 'Sketches'],
    tracks: [
      {
        id: 't-101',
        title: 'Morning Light',
        duration: 142,
        durationFormatted: '02:22',
        audioUrl: '',
        hasAudio: false,
        isSample: true,
        coverUrl: NEUTRAL_COVER_FALLBACK
      },
      {
        id: 't-102',
        title: 'Dissonant Chords',
        duration: 254,
        durationFormatted: '04:14',
        audioUrl: '',
        hasAudio: false,
        isSample: true,
        coverUrl: NEUTRAL_COVER_FALLBACK
      },
      {
        id: 't-103',
        title: 'Late Night Walk',
        duration: 218,
        durationFormatted: '03:38',
        audioUrl: '',
        hasAudio: false,
        isSample: true,
        coverUrl: NEUTRAL_COVER_FALLBACK
      },
      {
        id: 't-104',
        title: 'Signal Drift',
        duration: 312,
        durationFormatted: '05:12',
        audioUrl: '',
        hasAudio: false,
        isSample: true,
        coverUrl: NEUTRAL_COVER_FALLBACK
      }
    ]
  },
  {
    id: 'proj-2',
    title: 'Beats',
    artist: 'Alex',
    coverUrl: NEUTRAL_COVER_FALLBACK,
    category: 'Album',
    folderId: 'folder-1',
    releaseDate: '2026-08-14',
    tracksCount: 2,
    totalDuration: '10m 00s',
    tags: ['Lo-fi', 'Beats', 'Chill'],
    tracks: [
      {
        id: 't-201',
        title: 'Midnight Coffee',
        duration: 280,
        durationFormatted: '04:40',
        audioUrl: '',
        hasAudio: false,
        isSample: true,
        coverUrl: NEUTRAL_COVER_FALLBACK
      },
      {
        id: 't-202',
        title: 'Rainy Window',
        duration: 320,
        durationFormatted: '05:20',
        audioUrl: '',
        hasAudio: false,
        isSample: true,
        coverUrl: NEUTRAL_COVER_FALLBACK
      }
    ]
  },
  {
    id: 'proj-3',
    title: 'Unfinished Songs',
    artist: 'Alex',
    coverUrl: NEUTRAL_COVER_FALLBACK,
    category: 'Album',
    folderId: 'folder-4',
    releaseDate: '2026-08-01',
    tracksCount: 1,
    totalDuration: '03m 15s',
    tags: ['Demos', 'Vocal', 'Drafts'],
    tracks: [
      {
        id: 't-301',
        title: 'Echoes of You',
        duration: 195,
        durationFormatted: '03:15',
        audioUrl: '',
        hasAudio: false,
        isSample: true,
        coverUrl: NEUTRAL_COVER_FALLBACK
      }
    ]
  },
  {
    id: 'proj-4',
    title: 'Piano Practice',
    artist: 'Alex',
    coverUrl: NEUTRAL_COVER_FALLBACK,
    category: 'Album',
    folderId: 'folder-2',
    releaseDate: '2026-07-28',
    tracksCount: 1,
    totalDuration: '04m 55s',
    tags: ['Piano', 'Classical', 'Solo'],
    tracks: [
      {
        id: 't-401',
        title: 'Nocturne in C Minor',
        duration: 295,
        durationFormatted: '04:55',
        audioUrl: '',
        hasAudio: false,
        isSample: true,
        coverUrl: NEUTRAL_COVER_FALLBACK
      }
    ]
  }
];
