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
  playTrack: (track: Track, project?: Project) => void;
  togglePlay: () => void;
  seek: (seconds: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  playNext: () => void;
  playPrevious: () => void;
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

    const unsubEnded = playerEngine.onEnded(() => {
      // Auto-advance to next track in project track order
      const proj = currentProjectRef.current;
      const track = currentTrackRef.current;
      if (proj && track && proj.tracks) {
        const idx = proj.tracks.findIndex((t) => t.id === track.id);
        if (idx !== -1 && idx < proj.tracks.length - 1) {
          const nextTrack = proj.tracks[idx + 1];
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
      unsubEnded();
    };
  }, []);

  const playTrack = useCallback((track: Track, project?: Project) => {
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
    if (!currentTrackRef.current) return;
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

    const idx = proj.tracks.findIndex((t) => t.id === track.id);
    if (idx !== -1 && idx < proj.tracks.length - 1) {
      const nextTrack = proj.tracks[idx + 1];
      playTrack(nextTrack, proj);
    } else {
      // Loop back to first track in project
      playTrack(proj.tracks[0], proj);
    }
  }, [playTrack]);

  const playPrevious = useCallback(() => {
    const proj = currentProjectRef.current;
    const track = currentTrackRef.current;
    if (!proj || !track || !proj.tracks || proj.tracks.length === 0) return;

    // If more than 3 seconds elapsed, restart current track
    if (playerEngine.getCurrentTime() > 3) {
      playerEngine.seek(0);
      setCurrentTime(0);
      return;
    }

    const idx = proj.tracks.findIndex((t) => t.id === track.id);
    if (idx > 0) {
      const prevTrack = proj.tracks[idx - 1];
      playTrack(prevTrack, proj);
    } else {
      // Go to last track in project
      playTrack(proj.tracks[proj.tracks.length - 1], proj);
    }
  }, [playTrack]);

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
        playTrack,
        togglePlay,
        seek,
        setVolume,
        toggleMute,
        playNext,
        playPrevious,
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
