import { Folder, Project, Track } from '../types';

// High quality abstract dark brutalist SVG cover generators
const createSvgCover = (title: string, bg1: string, bg2: string, accent: string) => {
  const encodedSvg = encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${bg1}" />
          <stop offset="100%" stop-color="${bg2}" />
        </linearGradient>
      </defs>
      <rect width="400" height="400" fill="url(#g)" />
      <rect x="30" y="30" width="340" height="340" fill="none" stroke="${accent}" stroke-width="1.5" stroke-opacity="0.3" />
      <circle cx="200" cy="200" r="110" fill="none" stroke="${accent}" stroke-width="3" />
      <circle cx="200" cy="200" r="40" fill="${accent}" />
      <line x1="200" y1="30" x2="200" y2="370" stroke="${accent}" stroke-width="1" stroke-opacity="0.4" />
      <line x1="30" y1="200" x2="370" y2="200" stroke="${accent}" stroke-width="1" stroke-opacity="0.4" />
      <text x="45" y="355" font-family="sans-serif" font-size="20" font-weight="800" fill="#E5E2E1" letter-spacing="2">${title.toUpperCase()}</text>
    </svg>
  `);
  return `data:image/svg+xml;utf8,${encodedSvg}`;
};

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
    coverUrl: createSvgCover('Album Ideas', '#0E0E0E', '#1C1B1B', '#FF3B00'),
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
        artist: 'Alex',
        duration: 142,
        durationFormatted: '02:22',
        bpm: 124,
        key: 'Fm',
        versionTag: 'Take 2',
        audioUrl: '',
        hasAudio: false,
        isSample: true,
        coverUrl: createSvgCover('Album Ideas', '#0E0E0E', '#1C1B1B', '#FF3B00')
      },
      {
        id: 't-102',
        title: 'Dissonant Chords',
        artist: 'Alex',
        duration: 254,
        durationFormatted: '04:14',
        bpm: 128,
        key: 'Am',
        versionTag: 'Mix 1',
        audioUrl: '',
        hasAudio: false,
        isSample: true,
        coverUrl: createSvgCover('Album Ideas', '#0E0E0E', '#1C1B1B', '#FF3B00')
      },
      {
        id: 't-103',
        title: 'Late Night Walk',
        artist: 'Alex',
        duration: 218,
        durationFormatted: '03:38',
        bpm: 130,
        key: 'Dm',
        versionTag: 'Acoustic',
        audioUrl: '',
        hasAudio: false,
        isSample: true,
        coverUrl: createSvgCover('Album Ideas', '#0E0E0E', '#1C1B1B', '#FF3B00')
      },
      {
        id: 't-104',
        title: 'Signal Drift',
        artist: 'Alex',
        duration: 312,
        durationFormatted: '05:12',
        bpm: 120,
        key: 'Em',
        versionTag: 'Rough Draft',
        audioUrl: '',
        hasAudio: false,
        isSample: true,
        coverUrl: createSvgCover('Album Ideas', '#0E0E0E', '#1C1B1B', '#FF3B00')
      }
    ]
  },
  {
    id: 'proj-2',
    title: 'Beats',
    artist: 'Alex',
    coverUrl: createSvgCover('Beats', '#131313', '#201F1F', '#E5E2E1'),
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
        artist: 'Alex',
        duration: 280,
        durationFormatted: '04:40',
        bpm: 110,
        key: 'Cm',
        versionTag: 'Mix 2',
        audioUrl: '',
        hasAudio: false,
        isSample: true,
        coverUrl: createSvgCover('Beats', '#131313', '#201F1F', '#E5E2E1')
      },
      {
        id: 't-202',
        title: 'Rainy Window',
        artist: 'Alex',
        duration: 320,
        durationFormatted: '05:20',
        bpm: 115,
        key: 'Gm',
        versionTag: 'Demo',
        audioUrl: '',
        hasAudio: false,
        isSample: true,
        coverUrl: createSvgCover('Beats', '#131313', '#201F1F', '#E5E2E1')
      }
    ]
  },
  {
    id: 'proj-3',
    title: 'Unfinished Songs',
    artist: 'Alex',
    coverUrl: createSvgCover('Unfinished Songs', '#1F0B05', '#351107', '#FF562D'),
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
        artist: 'Alex',
        duration: 195,
        durationFormatted: '03:15',
        bpm: 140,
        key: 'F#m',
        versionTag: 'Take 1',
        audioUrl: '',
        hasAudio: false,
        isSample: true,
        coverUrl: createSvgCover('Unfinished Songs', '#1F0B05', '#351107', '#FF562D')
      }
    ]
  },
  {
    id: 'proj-4',
    title: 'Piano Practice',
    artist: 'Alex',
    coverUrl: createSvgCover('Piano Practice', '#090E17', '#1A2332', '#00F0FF'),
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
        artist: 'Alex',
        duration: 295,
        durationFormatted: '04:55',
        bpm: 98,
        key: 'Bm',
        versionTag: 'Practice Take',
        audioUrl: '',
        hasAudio: false,
        isSample: true,
        coverUrl: createSvgCover('Piano Practice', '#090E17', '#1A2332', '#00F0FF')
      }
    ]
  }
];
