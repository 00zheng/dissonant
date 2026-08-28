import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Track, Project } from '../types';
import { playerEngine } from '../services/playerEngine';

interface PlayerContextType {
  currentTrack: Track | null;
  currentProject: Project | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  loopA: number | null;
  loopB: number | null;
  isLoopActive: boolean;
  playbackRate: number;
  pitchSemitones: number;

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
  setPitchSemitones: (semitones: number) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

const generateShuffledContext = (project: Project, currentTrack: Track): Track[] => {
  if (!project.tracks) return [];
  const playable = project.tracks.filter(t => t.hasAudio !== false && Boolean(t.audioUrl) && !t.isSample);
  const others = playable.filter(t => t.id !== currentTrack.id);
  for (let i = others.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [others[i], others[j]] = [others[j], others[i]];
  }
  return others;
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
  const [pitchSemitones, setPitchSemitonesState] = useState(0);

  // Queue states
  const [manualQueue, setManualQueue] = useState<Track[]>([]);
  const [isShuffle, setIsShuffle] = useState(false);
  const [shuffledContext, setShuffledContext] = useState<Track[]>([]);
  const [history, setHistory] = useState<Track[]>([]);

  // A-B Loop States
  const [loopA, setLoopAState] = useState<number | null>(null);
  const [loopB, setLoopBState] = useState<number | null>(null);
  const [isLoopActive, setIsLoopActiveState] = useState(false);

  // Refs
  const currentTrackRef = useRef<Track | null>(null);
  const currentProjectRef = useRef<Project | null>(null);
  const manualQueueRef = useRef<Track[]>([]);
  const isShuffleRef = useRef<boolean>(false);
  const shuffledContextRef = useRef<Track[]>([]);
  const historyRef = useRef<Track[]>([]);

  useEffect(() => { currentTrackRef.current = currentTrack; }, [currentTrack]);
  useEffect(() => { currentProjectRef.current = currentProject; }, [currentProject]);
  useEffect(() => { manualQueueRef.current = manualQueue; }, [manualQueue]);
  useEffect(() => { isShuffleRef.current = isShuffle; }, [isShuffle]);
  useEffect(() => { shuffledContextRef.current = shuffledContext; }, [shuffledContext]);
  useEffect(() => { historyRef.current = history; }, [history]);

  const advanceToNext = useCallback(() => {
    const track = currentTrackRef.current;
    if (track) {
      setHistory(prev => [...prev, track]);
    }

    // 1. Check manual queue
    if (manualQueueRef.current.length > 0) {
      const nextTrack = manualQueueRef.current[0];
      setManualQueue(prev => prev.slice(1));
      
      setCurrentTrack(nextTrack);
      setDuration(nextTrack.duration || 0);
      setCurrentTime(0);
      playerEngine.loadAndPlay(nextTrack.audioUrl!);
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
      
      setCurrentTrack(nextTrack);
      setDuration(nextTrack.duration || 0);
      setCurrentTime(0);
      playerEngine.loadAndPlay(nextTrack.audioUrl!);
      return;
    }

    // 3. Normal project tracklist order
    if (track && !isShuffleRef.current) {
      const playableTracks = proj.tracks.filter(
        (t) => t.hasAudio !== false && Boolean(t.audioUrl) && !t.isSample
      );
      const idx = playableTracks.findIndex((t) => t.id === track.id);
      if (idx !== -1 && idx < playableTracks.length - 1) {
        const nextTrack = playableTracks[idx + 1];
        setCurrentTrack(nextTrack);
        setDuration(nextTrack.duration || 0);
        setCurrentTime(0);
        playerEngine.loadAndPlay(nextTrack.audioUrl!);
        return;
      }
    }

    // End of queue/project
    setIsPlaying(false);
    setCurrentTime(0);
  }, []);

  // Subscribe to Player Engine events
  useEffect(() => {
    const unsubState = playerEngine.onStateChange(setIsPlaying);
    const unsubTime = playerEngine.onTimeUpdate(setCurrentTime);
    const unsubDuration = playerEngine.onDurationChange(setDuration);
    const unsubLoop = playerEngine.onLoopChange((a, b, active) => {
      setLoopAState(a);
      setLoopBState(b);
      setIsLoopActiveState(active);
    });
    const unsubRate = playerEngine.onPlaybackRateChange(setPlaybackRateState);
    const unsubPitch = playerEngine.onPitchChange(setPitchSemitonesState);
    const unsubEnded = playerEngine.onEnded(() => {
      advanceToNext();
    });

    return () => {
      unsubState();
      unsubTime();
      unsubDuration();
      unsubLoop();
      unsubRate();
      unsubPitch();
      unsubEnded();
    };
  }, [advanceToNext]);

  const playTrack = useCallback((track: Track, project?: Project) => {
    if (!track.audioUrl || track.hasAudio === false || track.isSample) {
      console.warn(`[Player] Track "${track.title}" has no audio file.`);
      return;
    }

    if (currentTrackRef.current?.id === track.id) {
      playerEngine.togglePlay();
      return;
    }

    if (currentTrackRef.current) {
      setHistory(prev => [...prev, currentTrackRef.current!]);
    }

    setCurrentTrack(track);
    const activeProject = project || currentProjectRef.current;
    if (activeProject) {
      setCurrentProject(activeProject);
      if (isShuffleRef.current) {
        setShuffledContext(generateShuffledContext(activeProject, track));
      }
    }
    
    setDuration(track.duration || 0);
    setCurrentTime(0);
    playerEngine.loadAndPlay(track.audioUrl);
  }, []);

  const togglePlay = useCallback(() => {
    if (!currentTrackRef.current || !currentTrackRef.current.audioUrl || currentTrackRef.current.hasAudio === false) {
      return;
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
    advanceToNext();
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
      
      setCurrentTrack(prevTrack);
      setDuration(prevTrack.duration || 0);
      setCurrentTime(0);
      playerEngine.loadAndPlay(prevTrack.audioUrl!);
      return;
    }

    // No history, fallback to normal project tracklist previous if possible
    const proj = currentProjectRef.current;
    const track = currentTrackRef.current;
    if (!proj || !track || !proj.tracks) return;

    const playableTracks = proj.tracks.filter(
      (t) => t.hasAudio !== false && Boolean(t.audioUrl) && !t.isSample
    );
    const idx = playableTracks.findIndex((t) => t.id === track.id);
    if (idx > 0) {
      const prevTrack = playableTracks[idx - 1];
      setCurrentTrack(prevTrack);
      setDuration(prevTrack.duration || 0);
      setCurrentTime(0);
      playerEngine.loadAndPlay(prevTrack.audioUrl!);
    } else {
      const lastTrack = playableTracks[playableTracks.length - 1];
      if (lastTrack) {
        setCurrentTrack(lastTrack);
        setDuration(lastTrack.duration || 0);
        setCurrentTime(0);
        playerEngine.loadAndPlay(lastTrack.audioUrl!);
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

  const toggleShuffle = useCallback(() => {
    const nextShuffle = !isShuffle;
    setIsShuffle(nextShuffle);
    if (nextShuffle && currentProjectRef.current && currentTrackRef.current) {
      setShuffledContext(generateShuffledContext(currentProjectRef.current, currentTrackRef.current));
    } else {
      setShuffledContext([]);
    }
  }, [isShuffle]);

  // A-B Looping Callbacks
  const setLoopA = useCallback((time?: number) => playerEngine.setLoopA(time), []);
  const setLoopB = useCallback((time?: number) => playerEngine.setLoopB(time), []);
  const toggleLoopActive = useCallback(() => playerEngine.toggleLoopActive(), []);
  const clearLoop = useCallback(() => playerEngine.clearLoop(), []);
  const setPlaybackRate = useCallback((rate: number) => playerEngine.setPlaybackRate(rate), []);
  const setPitchSemitones = useCallback((semitones: number) => playerEngine.setPitchSemitones(semitones), []);

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        currentProject,
        isPlaying,
        currentTime,
        duration: duration || (currentTrack?.duration ?? 0),
        volume,
        isMuted,
        loopA,
        loopB,
        isLoopActive,
        playbackRate,
        pitchSemitones,
        
        manualQueue,
        isShuffle,
        shuffledContext,
        history,

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
        toggleShuffle,

        setLoopA,
        setLoopB,
        toggleLoopActive,
        clearLoop,
        setPlaybackRate,
        setPitchSemitones,
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
