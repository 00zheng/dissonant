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
    name: 'Work In Progress',
    itemCount: 4,
    description: 'Active album production & mixing stages',
    updatedAt: '2 HOURS AGO'
  },
  {
    id: 'folder-2',
    name: 'Mastered 2026',
    itemCount: 2,
    description: 'Final masters ready for distribution',
    updatedAt: 'YESTERDAY'
  },
  {
    id: 'folder-3',
    name: 'Stem Archives',
    itemCount: 3,
    description: 'Raw multi-track stems & acoustic captures',
    updatedAt: 'AUG 21'
  },
  {
    id: 'folder-4',
    name: 'Live Demos & Skits',
    itemCount: 5,
    description: 'Field recordings, synth jams & sketches',
    updatedAt: 'AUG 15'
  }
];

// Sample public domain royalty free audio file for real playback test
const SAMPLE_AUDIO_1 = 'https://cdn.freesound.org/previews/682/682087_11861866-lq.mp3';
const SAMPLE_AUDIO_2 = 'https://cdn.freesound.org/previews/612/612610_11861866-lq.mp3';
const SAMPLE_AUDIO_3 = 'https://cdn.freesound.org/previews/567/567015_11861866-lq.mp3';

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    title: 'Synthetic After Dark',
    artist: 'NOCTURNE LABS',
    coverUrl: createSvgCover('Synthetic After Dark', '#0E0E0E', '#1C1B1B', '#FF3B00'),
    category: 'Album',
    folderId: 'folder-1',
    releaseDate: '2026-08-20',
    tracksCount: 8,
    totalDuration: '32m 45s',
    tags: ['Cyberpunk', 'Industrial', 'Analogue'],
    tracks: [
      {
        id: 't-101',
        title: 'Neon Monochrome (Intro)',
        artist: 'NOCTURNE LABS',
        duration: 142,
        durationFormatted: '02:22',
        bpm: 124,
        key: 'Fm',
        versionTag: 'v3.1 Master',
        stemsCount: 8,
        audioUrl: SAMPLE_AUDIO_1,
        coverUrl: createSvgCover('Synthetic After Dark', '#0E0E0E', '#1C1B1B', '#FF3B00')
      },
      {
        id: 't-102',
        title: 'Dissonant Transmissions',
        artist: 'NOCTURNE LABS feat. KAI',
        duration: 254,
        durationFormatted: '04:14',
        bpm: 128,
        key: 'Am',
        versionTag: 'v2.4 Final',
        stemsCount: 16,
        audioUrl: SAMPLE_AUDIO_2,
        coverUrl: createSvgCover('Synthetic After Dark', '#0E0E0E', '#1C1B1B', '#FF3B00')
      },
      {
        id: 't-103',
        title: 'Sub-Zero Resonance',
        artist: 'NOCTURNE LABS',
        duration: 218,
        durationFormatted: '03:38',
        bpm: 130,
        key: 'Dm',
        versionTag: 'Stem Mix',
        stemsCount: 12,
        audioUrl: SAMPLE_AUDIO_3,
        coverUrl: createSvgCover('Synthetic After Dark', '#0E0E0E', '#1C1B1B', '#FF3B00')
      },
      {
        id: 't-104',
        title: 'Analog Signal Decay',
        artist: 'NOCTURNE LABS',
        duration: 312,
        durationFormatted: '05:12',
        bpm: 120,
        key: 'Em',
        versionTag: 'v1.8 Draft',
        stemsCount: 6,
        audioUrl: SAMPLE_AUDIO_1,
        coverUrl: createSvgCover('Synthetic After Dark', '#0E0E0E', '#1C1B1B', '#FF3B00')
      },
      {
        id: 't-105',
        title: 'Modular Overdrive',
        artist: 'NOCTURNE LABS',
        duration: 275,
        durationFormatted: '04:35',
        bpm: 132,
        key: 'G#m',
        versionTag: 'v2.0 Mix',
        stemsCount: 14,
        audioUrl: SAMPLE_AUDIO_2,
        coverUrl: createSvgCover('Synthetic After Dark', '#0E0E0E', '#1C1B1B', '#FF3B00')
      }
    ]
  },
  {
    id: 'proj-2',
    title: 'Echo Chamber EP',
    artist: 'DISSONANT AUDIO',
    coverUrl: createSvgCover('Echo Chamber', '#131313', '#201F1F', '#E5E2E1'),
    category: 'EP',
    folderId: 'folder-1',
    releaseDate: '2026-08-14',
    tracksCount: 4,
    totalDuration: '18m 10s',
    tags: ['Ambient', 'Minimal', 'Dub'],
    tracks: [
      {
        id: 't-201',
        title: 'Reverb Reflections',
        artist: 'DISSONANT AUDIO',
        duration: 280,
        durationFormatted: '04:40',
        bpm: 110,
        key: 'Cm',
        versionTag: 'Final Master',
        stemsCount: 10,
        audioUrl: SAMPLE_AUDIO_1,
        coverUrl: createSvgCover('Echo Chamber', '#131313', '#201F1F', '#E5E2E1')
      },
      {
        id: 't-202',
        title: 'Feedback Loop 09',
        artist: 'DISSONANT AUDIO',
        duration: 320,
        durationFormatted: '05:20',
        bpm: 115,
        key: 'Gm',
        versionTag: 'v1.2',
        stemsCount: 8,
        audioUrl: SAMPLE_AUDIO_2,
        coverUrl: createSvgCover('Echo Chamber', '#131313', '#201F1F', '#E5E2E1')
      }
    ]
  },
  {
    id: 'proj-3',
    title: 'Hyperdrive Stems Vol 1',
    artist: 'KINETIC SOUNDS',
    coverUrl: createSvgCover('Hyperdrive', '#1F0B05', '#351107', '#FF562D'),
    category: 'Stems',
    folderId: 'folder-3',
    releaseDate: '2026-08-01',
    tracksCount: 12,
    totalDuration: '45m 00s',
    tags: ['Raw Stems', 'Drums', 'Synths'],
    tracks: [
      {
        id: 't-301',
        title: 'Kick & Bass Sub-System',
        artist: 'KINETIC SOUNDS',
        duration: 195,
        durationFormatted: '03:15',
        bpm: 140,
        key: 'F#m',
        versionTag: 'Stem Solo',
        stemsCount: 4,
        audioUrl: SAMPLE_AUDIO_3,
        coverUrl: createSvgCover('Hyperdrive', '#1F0B05', '#351107', '#FF562D')
      }
    ]
  },
  {
    id: 'proj-4',
    title: 'Nocturne Sessions',
    artist: 'GHOST COLLECTIVE',
    coverUrl: createSvgCover('Nocturne Sessions', '#090E17', '#1A2332', '#00F0FF'),
    category: 'Single',
    folderId: 'folder-2',
    releaseDate: '2026-07-28',
    tracksCount: 2,
    totalDuration: '09m 15s',
    tags: ['Live', 'Experimental'],
    tracks: [
      {
        id: 't-401',
        title: 'Late Night Tape Loop',
        artist: 'GHOST COLLECTIVE',
        duration: 295,
        durationFormatted: '04:55',
        bpm: 98,
        key: 'Bm',
        versionTag: 'Direct Tape',
        stemsCount: 2,
        audioUrl: SAMPLE_AUDIO_1,
        coverUrl: createSvgCover('Nocturne Sessions', '#090E17', '#1A2332', '#00F0FF')
      }
    ]
  }
];
