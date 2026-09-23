import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Track, Project } from '../types';
import { playerEngine, audioPreloader } from '../services/playerEngine';
import { resolvePlayableTrack, fsUpdateTrackDuration } from '../services/db';
import { useAuth } from './AuthContext';
import { prefetchTrackAudio } from '../services/prefetch';
import { formatDuration } from '../services/audio';
import { useAudioSettings } from './AudioSettingsContext';
import { analyzeLoudness, calculateNormalizationGain } from '../services/audioAnalysis';
import { diagnostics } from '../utils/diagnostics';

interface PlayerContextType {
  currentTrack: Track | null;
  currentProject: Project | null;
  updateCurrentProject: (project: Project) => void;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  loopA: number | null;
  loopB: number | null;
  isLoopActive: boolean;
  playbackRate: number;

  manualQueue: Track[];
  isShuffle: boolean;
  shuffledContext: Track[];
  history: Track[];

  playTrack: (track: Track, project?: Project) => void;
  togglePlay: () => void;
  seek: (seconds: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  playNext: () => void;
  playPrevious: () => void;

  addToQueue: (track: Track) => void;
  playNextInQueue: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  reorderQueue: (startIndex: number, endIndex: number) => void;
  toggleShuffle: () => void;

  setLoopA: (time?: number) => void;
  setLoopB: (time?: number) => void;
  toggleLoopActive: () => void;
  clearLoop: () => void;
  setPlaybackRate: (rate: number) => void;

  repeatMode: 'off' | 'all' | 'one';
  toggleRepeat: () => void;

  sessionContext: Track[] | null;
  reorderShuffledContext: (startIndex: number, endIndex: number) => void;
  reorderSessionContext: (startIndex: number, endIndex: number) => void;

  isLoopEditorOpen: boolean;
  setIsLoopEditorOpen: (isOpen: boolean) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

const generateShuffledContext = (project: Project, currentTrack: Track): Track[] => {
  if (!project.tracks) return [];
  const playable = project.tracks.filter(t => t.hasAudio !== false && !t.isSample);
  
  // Exclude current track
  const remaining = playable.filter(t => t.id !== currentTrack.id);
  
  // Fisher-Yates shuffle
  for (let i = remaining.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
  }
  return remaining;
};

const generateSessionContext = (project: Project, currentTrack: Track): Track[] => {
  if (!project.tracks) return [];
  const playable = project.tracks.filter(t => t.hasAudio !== false && !t.isSample);
  const idx = playable.findIndex(t => t.id === currentTrack.id);
  if (idx !== -1) {
    return playable.slice(idx + 1);
  }
  return [];
};

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [isMuted, setIsMutedState] = useState(false);
  const [playbackRate, setPlaybackRateState] = useState(1.0);

  // Queue states
  const [manualQueue, setManualQueue] = useState<Track[]>([]);
  const [isShuffle, setIsShuffle] = useState(false);
  const [shuffledContext, setShuffledContext] = useState<Track[]>([]);
  const [sessionContext, setSessionContext] = useState<Track[] | null>(null);
  const [history, setHistory] = useState<Track[]>([]);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');

  // A-B Loop States
  const [loopA, setLoopAState] = useState<number | null>(null);
  const [loopB, setLoopBState] = useState<number | null>(null);
  const [isLoopActive, setIsLoopActiveState] = useState(false);
  const [isLoopEditorOpen, setIsLoopEditorOpen] = useState(false);
  const { user } = useAuth();
  const { settings } = useAudioSettings();

  // Refs
  const currentTrackRef = useRef<Track | null>(null);
  const currentProjectRef = useRef<Project | null>(null);
  const manualQueueRef = useRef<Track[]>([]);
  const isShuffleRef = useRef<boolean>(false);
  const shuffledContextRef = useRef<Track[]>([]);
  const sessionContextRef = useRef<Track[] | null>(null);
  const historyRef = useRef<Track[]>([]);
  const repeatModeRef = useRef<'off' | 'all' | 'one'>('off');
  const prefetchedUrlRef = useRef<Record<string, string>>({});
  const playRequestIdRef = useRef<number>(0);
  const loadingTrackIdRef = useRef<string | null>(null);
  const togglePlayRef = useRef<(() => void) | null>(null);
  const activeEngineTrackIdRef = useRef<string | null>(null);
  const isLoadingRef = useRef<boolean>(false);
  // Set when the user explicitly pauses while a URL is resolving.
  // Checked after resolution to prevent unwanted auto-start.
  const userPausedDuringLoadRef = useRef<boolean>(false);
  // Track the last track ID whose load/play failed, enabling retry on same tap.
  const lastFailedTrackIdRef = useRef<string | null>(null);
  // Whether currentTrack metadata has been committed (URL resolved, play started).
  // Prevents premature Media Session metadata push during async resolution.
  const metadataCommittedRef = useRef<boolean>(false);

  useEffect(() => { currentTrackRef.current = currentTrack; }, [currentTrack]);
  useEffect(() => { currentProjectRef.current = currentProject; }, [currentProject]);
  useEffect(() => { manualQueueRef.current = manualQueue; }, [manualQueue]);
  useEffect(() => { isShuffleRef.current = isShuffle; }, [isShuffle]);
  useEffect(() => { shuffledContextRef.current = shuffledContext; }, [shuffledContext]);
  useEffect(() => { sessionContextRef.current = sessionContext; }, [sessionContext]);
  useEffect(() => { historyRef.current = history; }, [history]);
  useEffect(() => { repeatModeRef.current = repeatMode; }, [repeatMode]);

  useEffect(() => {
    playerEngine.applyAudioProcessing(
      settings.eqEnabled,
      settings.eqGains,
      settings.normalizeEnabled,
      currentTrack?.normalizationGainDb || 0
    );
  }, [settings, currentTrack]);

  useEffect(() => {
    const track = currentTrack;
    if (!track || track.hasAudio === false || track.isSample) return;
    
    // Lazy LUFS analysis on first playback if missing
    if (track.normalizationGainDb === undefined) {
      resolvePlayableTrack(track).then(url => {
        if (!url) return;
        analyzeLoudness(url).then(lufs => {
          const gain = calculateNormalizationGain(lufs);
          if (currentTrackRef.current?.id === track.id) {
            setCurrentTrack(prev => prev ? { ...prev, loudnessLUFS: lufs, normalizationGainDb: gain } : null);
            // Engine effect above will catch this state update and apply the gain
          }
        }).catch(err => console.warn('[Player] LUFS analysis failed:', err));
      });
    }
  }, [currentTrack]);

  const commitMetadata = useCallback((track: Track, project: Project | null) => {
    metadataCommittedRef.current = true;
    diagnostics.log('PlayerContext', 'commitMetadata', { trackId: track.id, title: track.title, hasMediaSession: 'mediaSession' in navigator });
    if ('mediaSession' in navigator) {
      const coverSrc = project?.coverUrl || track.coverUrl;
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title || 'Unknown Title',
        artist: project?.title || '',
        album: project?.title || 'Dissonant',
        artwork: coverSrc ? [
          { src: coverSrc, sizes: '96x96' },
          { src: coverSrc, sizes: '128x128' },
          { src: coverSrc, sizes: '192x192' },
          { src: coverSrc, sizes: '256x256' },
          { src: coverSrc, sizes: '384x384' },
          { src: coverSrc, sizes: '512x512' },
        ] : undefined
      });
      playerEngine.syncMediaSessionPosition();
    }
  }, []);

  const playResolvedTrack = async (track: Track, trySync: boolean = false) => {
    const requestId = playerEngine.bumpRequestId();
    playRequestIdRef.current = requestId;
    loadingTrackIdRef.current = track.id;
    userPausedDuringLoadRef.current = false;
    lastFailedTrackIdRef.current = null;
    metadataCommittedRef.current = false;

    // Set duration/time immediately for UI responsiveness, but DON'T set
    // currentTrack yet when we need async resolution — that would push
    // the new song's title to Media Session before audio is ready.
    setDuration(track.duration || 0);
    setCurrentTime(0);

    const cachedUrl = prefetchedUrlRef.current[track.id];

    if (cachedUrl) {
      // Fast path: URL is already resolved.  Commit metadata immediately.
      loadingTrackIdRef.current = null;
      commitMetadata(track, currentProjectRef.current);
      setCurrentTrack(track);
      activeEngineTrackIdRef.current = track.id;
      playerEngine.setKnownDuration(track.duration || 0);
      if (trySync) {
        playerEngine.loadAndPlaySync(cachedUrl, 0, requestId);
      } else {
        playerEngine.loadAndPlay(cachedUrl, 0, requestId);
      }
    } else {
      // Slow path: need async URL resolution.
      // Use transitionPause (not pause) to silence old audio without
      // flashing "Paused" on the iOS lock screen.
      playerEngine.transitionPause();

      // Show the pending track in the in-app UI, but mark metadata as
      // uncommitted so the Media Session effect skips this update.
      setCurrentTrack(track);

      console.log(`[Player] Resolving URL for "${track.title}" (reqId=${requestId})`);
      const url = await resolvePlayableTrack(track);

      if (playRequestIdRef.current !== requestId) {
        // A newer command took over — abandon this one
        console.log(`[Player] Abandoned stale resolution (reqId=${requestId}, current=${playRequestIdRef.current})`);
        if (loadingTrackIdRef.current === track.id) {
          loadingTrackIdRef.current = null;
        }
        return;
      }

      loadingTrackIdRef.current = null;

      if (!url) {
        console.warn(`[Player] Failed to resolve playable URL for track ${track.id}`);
        lastFailedTrackIdRef.current = track.id;
        setIsPlaying(false);
        return;
      }

      // User may have pressed Pause while we were resolving
      if (userPausedDuringLoadRef.current) {
        console.log('[Player] User paused during URL resolution — not auto-starting');
        // Still set the src so a subsequent Play will work
        activeEngineTrackIdRef.current = track.id;
        metadataCommittedRef.current = true;
        // Load the source but don't play
        const mediaEl = playerEngine.getMediaElement();
        if (playerEngine.getCurrentSrc() !== url) {
          mediaEl.src = url;
        }
        return;
      }

      // Commit metadata now that we're about to start playback
      commitMetadata(track, currentProjectRef.current);
      activeEngineTrackIdRef.current = track.id;
      playerEngine.setKnownDuration(track.duration || 0);
      playerEngine.loadAndPlay(url, 0, requestId);
    }
  };

  const getNextLogicalTrack = (): Track | null => {
    if (manualQueueRef.current.length > 0) {
      return manualQueueRef.current[0];
    }
    if (isShuffleRef.current && shuffledContextRef.current.length > 0) {
      return shuffledContextRef.current[0];
    }
    if (!isShuffleRef.current && sessionContextRef.current && sessionContextRef.current.length > 0) {
      return sessionContextRef.current[0];
    }
    return null;
  };

  // Prefetch side-effect based on current queue/context states
  useEffect(() => {
    const nextTrack = (() => {
      if (manualQueue.length > 0) return manualQueue[0];
      if (isShuffle && shuffledContext.length > 0) return shuffledContext[0];
      if (!isShuffle && sessionContext && sessionContext.length > 0) return sessionContext[0];
      const proj = currentProject;
      if (repeatMode === 'all' && proj && proj.tracks) {
        const playableTracks = proj.tracks.filter((t) => t.hasAudio !== false && !t.isSample);
        if (playableTracks.length > 0 && !isShuffle) {
          return playableTracks[0];
        }
      }
      return null;
    })();

    if (!nextTrack) {
      audioPreloader.clear();
      prefetchedUrlRef.current = {};
      return;
    }

    let isSubscribed = true;
    const doPrefetch = async () => {
      if (!isSubscribed) return;
      
      // Layer 2: reliable mobile background fetch
      prefetchTrackAudio(nextTrack, currentTrackRef.current?.id).catch(console.warn);

      // Layer 1: standard audio element preload
      const url = await resolvePlayableTrack(nextTrack);
      if (isSubscribed && url) {
        audioPreloader.preload(nextTrack.id, url);
        prefetchedUrlRef.current = { [nextTrack.id]: url };
      }
    };

    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => {
        setTimeout(() => doPrefetch(), 500);
      });
    } else {
      setTimeout(() => doPrefetch(), 500);
    }

    return () => {
      isSubscribed = false;
    };
  }, [manualQueue, isShuffle, shuffledContext, sessionContext, repeatMode, currentProject]);

  const advanceToNext = useCallback((isManualSkip: boolean = false) => {
    const track = currentTrackRef.current;
    
    // Spotify behavior: Repeat One + manual skip = change to Repeat All and advance.
    if (isManualSkip && repeatModeRef.current === 'one') {
      setRepeatMode('all');
      repeatModeRef.current = 'all'; // update ref immediately for this cycle
    } else if (!isManualSkip && repeatModeRef.current === 'one' && track) {
      // Natural end of track on Repeat One: seek to 0 and play again
      setCurrentTime(0);
      playerEngine.seek(0);
      playerEngine.play();
      return;
    }

    if (track) {
      setHistory(prev => [...prev, track]);
    }

    // 1. Check manual queue
    if (manualQueueRef.current.length > 0) {
      const nextTrack = manualQueueRef.current[0];
      setManualQueue(prev => prev.slice(1));
      playResolvedTrack(nextTrack, true);
      return;
    }

    const proj = currentProjectRef.current;
    if (!proj || !proj.tracks) {
      setIsPlaying(false);
      setCurrentTime(0);
      return;
    }

    // 2. Check shuffle queue
    if (isShuffleRef.current && shuffledContextRef.current.length > 0) {
      const nextTrack = shuffledContextRef.current[0];
      setShuffledContext(prev => prev.slice(1));
      playResolvedTrack(nextTrack, true);
      return;
    }

    // 3. Normal project tracklist order from sessionContext
    if (!isShuffleRef.current && sessionContextRef.current && sessionContextRef.current.length > 0) {
      const nextTrack = sessionContextRef.current[0];
      setSessionContext(prev => prev ? prev.slice(1) : []);
      playResolvedTrack(nextTrack, true);
      return;
    }

    // End of queue/project
    if (repeatModeRef.current === 'all' && proj) {
      const playableTracks = proj.tracks.filter(
        (t) => t.hasAudio !== false && !t.isSample
      );
      
      if (playableTracks.length > 0) {
        if (isShuffleRef.current) {
          // New shuffle cycle
          const startTrack = playableTracks[Math.floor(Math.random() * playableTracks.length)];
          const newShuffled = generateShuffledContext(proj, startTrack);
          setShuffledContext(newShuffled);
          playResolvedTrack(startTrack, true);
          return;
        } else {
          // Restart project from beginning
          const startTrack = playableTracks[0];
          setSessionContext(generateSessionContext(proj, startTrack));
          playResolvedTrack(startTrack, true);
          return;
        }
      }
    }

    setIsPlaying(false);
    setCurrentTime(0);
  }, []);

  // Subscribe to Player Engine events
  useEffect(() => {
    const unsubState = playerEngine.onStateChange(setIsPlaying);
    const unsubTime = playerEngine.onTimeUpdate(setCurrentTime);
    const unsubDuration = playerEngine.onDurationChange((dur) => {
      setDuration(dur);
      const track = currentTrackRef.current;
      if (track && dur > 0 && isFinite(dur) && Math.abs(dur - (track.duration || 0)) > 1) {
        const roundedDur = Math.round(dur);
        const newFormatted = formatDuration(roundedDur);
        setCurrentTrack(prev => prev ? { ...prev, duration: roundedDur, durationFormatted: newFormatted } : null);
        
        if (user?.uid) {
           fsUpdateTrackDuration(user.uid, track.id, roundedDur, newFormatted)
             .catch(err => console.warn('[Player] Failed to update corrected track duration', err));
        }
      }
    });
    const unsubLoop = playerEngine.onLoopChange((a, b, active) => {
      setLoopAState(a);
      setLoopBState(b);
      setIsLoopActiveState(active);
    });
    const unsubRate = playerEngine.onPlaybackRateChange(setPlaybackRateState);
    const unsubEnded = playerEngine.onEnded(() => {
      advanceToNext(false); // Natural end
    });

    return () => {
      unsubState();
      unsubTime();
      unsubDuration();
      unsubLoop();
      unsubRate();
      unsubEnded();
    };
  }, [advanceToNext]);

  const playTrack = useCallback(async (track: Track, project?: Project) => {
    if (track.hasAudio === false || track.isSample) {
      console.warn(`[Player] Track "${track.title}" has no audio file.`);
      return;
    }

    if (currentTrackRef.current?.id === track.id) {
      // If the track is still loading its URL, the user tapping it again
      // means "I'm waiting, keep going" — don't toggle old audio.
      if (loadingTrackIdRef.current === track.id) {
        console.log('[Player] Track is still loading — tap ignored');
        return;
      }

      // If the previous attempt for this same track FAILED, retry it
      // instead of toggling (which would do nothing useful since the src
      // was never set).  This fixes the "must select another song first" bug.
      if (lastFailedTrackIdRef.current === track.id) {
        console.log(`[Player] Retrying previously failed track "${track.title}"`);
        lastFailedTrackIdRef.current = null;
        playResolvedTrack(track, true);
        return;
      }

      // Also retry if the audio element has no valid src (cold state)
      const mediaEl = playerEngine.getMediaElement();
      if (!mediaEl.src || mediaEl.src === window.location.href || mediaEl.src === window.location.origin + '/') {
        console.log('[Player] Audio element has no src — re-resolving');
        playResolvedTrack(track, false);
        return;
      }

      playerEngine.togglePlay();
      return;
    }

    if (currentTrackRef.current) {
      setHistory(prev => [...prev, currentTrackRef.current!]);
    }

    const activeProject = project || currentProjectRef.current;
    if (activeProject) {
      setCurrentProject(activeProject);
      if (isShuffleRef.current) {
        setShuffledContext(generateShuffledContext(activeProject, track));
      } else {
        setSessionContext(generateSessionContext(activeProject, track));
      }
    }
    
    playResolvedTrack(track, true); // trySync is true since it's a direct user tap
  }, []);

  const updateCurrentProject = useCallback((project: Project) => {
    if (currentProjectRef.current?.id === project.id) {
      setCurrentProject(project);
    }
  }, []);

  const togglePlay = useCallback(async () => {
    if (!currentTrackRef.current || currentTrackRef.current.hasAudio === false) {
      return;
    }

    // If a track is loading its URL:
    // - If user is pausing → set the flag so auto-start is suppressed
    // - If user is playing → let the load continue (it will auto-start)
    if (loadingTrackIdRef.current) {
      // During loading, the only meaningful toggle is "cancel auto-start"
      if (!userPausedDuringLoadRef.current) {
        userPausedDuringLoadRef.current = true;
        setIsPlaying(false);
        console.log('[Player] User paused during URL loading');
      } else {
        // They paused during load, now pressing play again → clear the flag
        userPausedDuringLoadRef.current = false;
        console.log('[Player] User resumed during URL loading — will auto-start');
      }
      return;
    }
    
    // If we're toggling play and audio src isn't set, we might need to resolve it
    const mediaEl = playerEngine.getMediaElement();
    if (!mediaEl.src || mediaEl.src === window.location.href || mediaEl.src === window.location.origin + '/') {
        const requestId = playerEngine.bumpRequestId();
        playRequestIdRef.current = requestId;
        const url = await resolvePlayableTrack(currentTrackRef.current);
        if (playRequestIdRef.current !== requestId) return; // Stale — a newer command took over
        if (url) {
            playerEngine.loadAndPlay(url, playerEngine.getCurrentTime(), requestId);
            return;
        }
    }
    
    playerEngine.togglePlay();
  }, []);

  const seek = useCallback((seconds: number) => {
    playerEngine.seek(seconds);
    setCurrentTime(seconds);
  }, []);

  const setVolume = useCallback((vol: number) => {
    setVolumeState(vol);
    playerEngine.setVolume(vol);
    if (vol > 0 && isMuted) {
      setIsMutedState(false);
    }
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    const nextMuted = !isMuted;
    setIsMutedState(nextMuted);
    playerEngine.setMuted(nextMuted);
  }, [isMuted]);

  const playNext = useCallback(() => {
    advanceToNext(true); // Manual skip
  }, [advanceToNext]);

  const playPrevious = useCallback(() => {
    if (playerEngine.getCurrentTime() > 3) {
      playerEngine.seek(0);
      setCurrentTime(0);
      return;
    }

    const hist = historyRef.current;
    if (hist.length > 0) {
      const prevTrack = hist[hist.length - 1];
      setHistory(prev => prev.slice(0, -1));
      
      playResolvedTrack(prevTrack);
      return;
    }

    // No history, fallback to normal project tracklist previous if possible
    const proj = currentProjectRef.current;
    const track = currentTrackRef.current;
    if (!proj || !track || !proj.tracks) return;

    const playableTracks = proj.tracks.filter(
      (t) => t.hasAudio !== false && !t.isSample
    );
    const idx = playableTracks.findIndex((t) => t.id === track.id);
    if (idx > 0) {
      const prevTrack = playableTracks[idx - 1];
      playResolvedTrack(prevTrack);
    } else {
      const lastTrack = playableTracks[playableTracks.length - 1];
      if (lastTrack) {
        playResolvedTrack(lastTrack);
      }
    }
  }, []);

  const addToQueue = useCallback((track: Track) => {
    setManualQueue(prev => [...prev, track]);
  }, []);

  const playNextInQueue = useCallback((track: Track) => {
    setManualQueue(prev => [track, ...prev]);
  }, []);

  const removeFromQueue = useCallback((index: number) => {
    setManualQueue(prev => prev.filter((_, i) => i !== index));
  }, []);

  const reorderQueue = useCallback((startIndex: number, endIndex: number) => {
    setManualQueue(prev => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    });
  }, []);

  const reorderShuffledContext = useCallback((startIndex: number, endIndex: number) => {
    setShuffledContext(prev => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    });
  }, []);

  const reorderSessionContext = useCallback((startIndex: number, endIndex: number) => {
    setSessionContext(prev => {
      if (!prev) return prev;
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    });
  }, []);

  const toggleShuffle = useCallback(() => {
    const nextShuffle = !isShuffle;
    setIsShuffle(nextShuffle);
    if (nextShuffle && currentProjectRef.current && currentTrackRef.current) {
      setShuffledContext(generateShuffledContext(currentProjectRef.current, currentTrackRef.current));
      setSessionContext(null);
    } else {
      setShuffledContext([]);
      if (currentProjectRef.current && currentTrackRef.current) {
        setSessionContext(generateSessionContext(currentProjectRef.current, currentTrackRef.current));
      }
    }
  }, [isShuffle]);

  const toggleRepeat = useCallback(() => {
    setRepeatMode(prev => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  }, []);

  // A-B Looping Callbacks
  const setLoopA = useCallback((time?: number) => playerEngine.setLoopA(time), []);
  const setLoopB = useCallback((time?: number) => playerEngine.setLoopB(time), []);
  const toggleLoopActive = useCallback(() => playerEngine.toggleLoopActive(), []);
  const clearLoop = useCallback(() => playerEngine.clearLoop(), []);
  const setPlaybackRate = useCallback((rate: number) => playerEngine.setPlaybackRate(rate), []);

  // --- Media Session API Integration ---
  const playNextRef = useRef(playNext);
  const playPreviousRef = useRef(playPrevious);

  useEffect(() => {
    playNextRef.current = playNext;
    playPreviousRef.current = playPrevious;
    togglePlayRef.current = togglePlay;
  }, [playNext, playPrevious, togglePlay]);

  useEffect(() => {
    if ('mediaSession' in navigator) {
      // --- PLAY handler: MUST be idempotent.  On iOS the lock-screen fires
      // 'play' even when audio is already playing (e.g. after a brief
      // transition or state resync).  Calling togglePlay here would PAUSE
      // an already-playing track.
      navigator.mediaSession.setActionHandler('play', () => {
        diagnostics.log('MediaSession', 'action:play', { loading: !!loadingTrackIdRef.current, userPaused: userPausedDuringLoadRef.current });
        console.log('[MediaSession] play action');
        // If a track is loading, clear the pause-during-load flag so it auto-starts
        if (loadingTrackIdRef.current) {
          userPausedDuringLoadRef.current = false;
          return;
        }
        // Idempotent: only starts if not already playing
        playerEngine.idempotentPlay();
      });

      // --- PAUSE handler: MUST be idempotent.  Must never start playback.
      navigator.mediaSession.setActionHandler('pause', () => {
        diagnostics.log('MediaSession', 'action:pause', { loading: !!loadingTrackIdRef.current });
        console.log('[MediaSession] pause action');
        // If a track is loading, prevent auto-start
        if (loadingTrackIdRef.current) {
          userPausedDuringLoadRef.current = true;
          setIsPlaying(false);
          return;
        }
        // Idempotent: only pauses if currently playing
        playerEngine.idempotentPause();
      });

      // --- PREVIOUS / NEXT: route through PlayerContext queue logic
      navigator.mediaSession.setActionHandler('previoustrack', () => {
        diagnostics.log('MediaSession', 'action:previoustrack', {});
        console.log('[MediaSession] previoustrack action');
        if (playPreviousRef.current) playPreviousRef.current();
      });
      navigator.mediaSession.setActionHandler('nexttrack', () => {
        diagnostics.log('MediaSession', 'action:nexttrack', {});
        console.log('[MediaSession] nexttrack action');
        if (playNextRef.current) playNextRef.current();
      });

      // Explicitly remove seek handlers to ensure OS shows Previous/Next track instead of +/- 10s
      try { navigator.mediaSession.setActionHandler('seekbackward', null); } catch (e) {}
      try { navigator.mediaSession.setActionHandler('seekforward', null); } catch (e) {}
    }

    return () => {
      // Cleanup not strictly needed for mediaSession but good practice
    };
  }, []);

  useEffect(() => {
    if (currentTrack && metadataCommittedRef.current) {
      commitMetadata(currentTrack, currentProject);
    }
  }, [currentTrack, currentProject, commitMetadata]);

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        currentProject,
        updateCurrentProject,
        isPlaying,
        currentTime,
        duration: duration || (currentTrack?.duration ?? 0),
        volume,
        isMuted,
        loopA,
        loopB,
        isLoopActive,
        playbackRate,

        manualQueue,
        isShuffle,
        shuffledContext,
        sessionContext,
        history,
        repeatMode,

        playTrack,
        togglePlay,
        seek,
        setVolume,
        toggleMute,
        playNext,
        playPrevious,

        addToQueue,
        playNextInQueue,
        removeFromQueue,
        reorderQueue,
        reorderShuffledContext,
        reorderSessionContext,
        toggleShuffle,
        toggleRepeat,

        setLoopA,
        setLoopB,
        toggleLoopActive,
        clearLoop,
        setPlaybackRate,

        isLoopEditorOpen,
        setIsLoopEditorOpen,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};
