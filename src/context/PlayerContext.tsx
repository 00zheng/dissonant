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
  playTrack: (track: Track, project?: Project) => void;
  togglePlay: () => void;
  seek: (seconds: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  playNext: () => void;
  playPrevious: () => void;
  setLoopA: (time?: number) => void;
  setLoopB: (time?: number) => void;
  toggleLoopActive: () => void;
  clearLoop: () => void;
  setPlaybackRate: (rate: number) => void;
  setPitchSemitones: (semitones: number) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

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

  // A-B Loop States
  const [loopA, setLoopAState] = useState<number | null>(null);
  const [loopB, setLoopBState] = useState<number | null>(null);
  const [isLoopActive, setIsLoopActiveState] = useState(false);

  // Refs for tracking current values inside callbacks
  const currentTrackRef = useRef<Track | null>(null);
  const currentProjectRef = useRef<Project | null>(null);

  useEffect(() => {
    currentTrackRef.current = currentTrack;
  }, [currentTrack]);

  useEffect(() => {
    currentProjectRef.current = currentProject;
  }, [currentProject]);

  // Subscribe to Player Engine events
  useEffect(() => {
    const unsubState = playerEngine.onStateChange((playing) => {
      setIsPlaying(playing);
    });

    const unsubTime = playerEngine.onTimeUpdate((time) => {
      setCurrentTime(time);
    });

    const unsubDuration = playerEngine.onDurationChange((dur) => {
      setDuration(dur);
    });

    const unsubLoop = playerEngine.onLoopChange((a, b, active) => {
      setLoopAState(a);
      setLoopBState(b);
      setIsLoopActiveState(active);
    });

    const unsubRate = playerEngine.onPlaybackRateChange((rate) => {
      setPlaybackRateState(rate);
    });

    const unsubPitch = playerEngine.onPitchChange((pitch) => {
      setPitchSemitonesState(pitch);
    });

    const unsubEnded = playerEngine.onEnded(() => {
      // Auto-advance to next playable track in project track order
      const proj = currentProjectRef.current;
      const track = currentTrackRef.current;
      if (proj && track && proj.tracks) {
        const playableTracks = proj.tracks.filter(
          (t) => t.hasAudio !== false && Boolean(t.audioUrl) && !t.isSample
        );
        const idx = playableTracks.findIndex((t) => t.id === track.id);
        if (idx !== -1 && idx < playableTracks.length - 1) {
          const nextTrack = playableTracks[idx + 1];
          setCurrentTrack(nextTrack);
          setDuration(nextTrack.duration || 0);
          setCurrentTime(0);
          playerEngine.loadAndPlay(nextTrack.audioUrl);
          return;
        }
      }
      setIsPlaying(false);
      setCurrentTime(0);
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
  }, []);

  const playTrack = useCallback((track: Track, project?: Project) => {
    // Prevent attempting playback on tracks with only mock metadata
    if (!track.audioUrl || track.hasAudio === false || track.isSample) {
      console.warn(`[Player] Track "${track.title}" has no audio file (sample metadata only). Skipping playback.`);
      return;
    }

    if (currentTrackRef.current?.id === track.id) {
      playerEngine.togglePlay();
      return;
    }

    setCurrentTrack(track);
    if (project) {
      setCurrentProject(project);
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
    const proj = currentProjectRef.current;
    const track = currentTrackRef.current;
    if (!proj || !track || !proj.tracks || proj.tracks.length === 0) return;

    const playableTracks = proj.tracks.filter(
      (t) => t.hasAudio !== false && Boolean(t.audioUrl) && !t.isSample
    );
    if (playableTracks.length === 0) return;

    const idx = playableTracks.findIndex((t) => t.id === track.id);
    if (idx !== -1 && idx < playableTracks.length - 1) {
      const nextTrack = playableTracks[idx + 1];
      playTrack(nextTrack, proj);
    } else {
      playTrack(playableTracks[0], proj);
    }
  }, [playTrack]);

  const playPrevious = useCallback(() => {
    const proj = currentProjectRef.current;
    const track = currentTrackRef.current;
    if (!proj || !track || !proj.tracks || proj.tracks.length === 0) return;

    if (playerEngine.getCurrentTime() > 3) {
      playerEngine.seek(0);
      setCurrentTime(0);
      return;
    }

    const playableTracks = proj.tracks.filter(
      (t) => t.hasAudio !== false && Boolean(t.audioUrl) && !t.isSample
    );
    if (playableTracks.length === 0) return;

    const idx = playableTracks.findIndex((t) => t.id === track.id);
    if (idx > 0) {
      const prevTrack = playableTracks[idx - 1];
      playTrack(prevTrack, proj);
    } else {
      playTrack(playableTracks[playableTracks.length - 1], proj);
    }
  }, [playTrack]);

  // A-B Looping Callbacks
  const setLoopA = useCallback((time?: number) => {
    playerEngine.setLoopA(time);
  }, []);

  const setLoopB = useCallback((time?: number) => {
    playerEngine.setLoopB(time);
  }, []);

  const toggleLoopActive = useCallback(() => {
    playerEngine.toggleLoopActive();
  }, []);

  const clearLoop = useCallback(() => {
    playerEngine.clearLoop();
  }, []);

  // Playback Rate Callback
  const setPlaybackRate = useCallback((rate: number) => {
    playerEngine.setPlaybackRate(rate);
  }, []);

  const setPitchSemitones = useCallback((semitones: number) => {
    playerEngine.setPitchSemitones(semitones);
  }, []);

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
        playTrack,
        togglePlay,
        seek,
        setVolume,
        toggleMute,
        playNext,
        playPrevious,
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
