import React from 'react';
import { usePlayer } from '../../context/PlayerContext';
import { X, Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Shuffle, Layers } from 'lucide-react';
import { ProgressBar } from '../ui/ProgressBar';

interface PlayerExpandedProps {
  onClose: () => void;
}

export const PlayerExpanded: React.FC<PlayerExpandedProps> = ({ onClose }) => {
  const {
    currentTrack,
    currentProject,
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    seek,
    volume,
    setVolume,
    isMuted,
    toggleMute,
    playNext,
    playPrevious
  } = usePlayer();

  if (!currentTrack) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-[#000000]/95 backdrop-blur-xl z-50 flex flex-col justify-between p-6 md:p-12 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF3B00] animate-pulse" />
          <span className="font-label-caps text-xs text-[#E8BDB3]/70">HERO PLAYBACK VIEW</span>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-[#E8BDB3]/60 hover:text-white rounded-full bg-[#1C1B1B] border border-[#282828] hover:bg-[#2A2A2A] transition-colors cursor-pointer"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="max-w-4xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 items-center py-6">
        {/* Large Album Artwork */}
        <div className="relative aspect-square w-full max-w-md mx-auto rounded-[8px] bg-[#1C1B1B] border border-[#282828] overflow-hidden shadow-2xl">
          <img
            src={currentTrack.coverUrl}
            alt={currentTrack.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Track Details & Controls */}
        <div className="space-y-6 flex flex-col justify-center">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-[4px] bg-[#2A2A2A] text-[#FF3B00] font-mono-label text-[10px] border border-[#282828]">
                {currentTrack.versionTag}
              </span>
              <span className="font-mono-label text-xs text-[#E8BDB3]/50">
                KEY: {currentTrack.key} • {currentTrack.bpm} BPM
              </span>
            </div>
            <h2 className="font-display-lg text-3xl md:text-4xl font-bold text-[#E5E2E1]">
              {currentTrack.title}
            </h2>
            <p className="font-headline-md text-lg text-[#E8BDB3]/70 mt-1">
              {currentTrack.artist}
            </p>
          </div>

          {/* Scrubber */}
          <div className="space-y-2">
            <ProgressBar
              value={progressPercent}
              onChange={(pct) => seek((pct / 100) * duration)}
              height={4}
            />
            <div className="flex justify-between font-mono-label text-xs text-[#E8BDB3]/60">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Primary Controls */}
          <div className="flex items-center justify-center gap-6 pt-4">
            <button className="text-[#E8BDB3]/50 hover:text-white transition-colors cursor-pointer">
              <Shuffle className="w-5 h-5" />
            </button>
            <button
              onClick={playPrevious}
              className="p-3 rounded-full bg-[#1C1B1B] border border-[#282828] text-[#E5E2E1] hover:text-white hover:border-[#5E3F38] transition-colors cursor-pointer"
            >
              <SkipBack className="w-6 h-6 fill-current" />
            </button>
            <button
              onClick={togglePlay}
              className="w-16 h-16 rounded-full bg-[#FF3B00] text-white flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-transform cursor-pointer"
            >
              {isPlaying ? (
                <Pause className="w-8 h-8 fill-white" />
              ) : (
                <Play className="w-8 h-8 fill-white ml-1" />
              )}
            </button>
            <button
              onClick={playNext}
              className="p-3 rounded-full bg-[#1C1B1B] border border-[#282828] text-[#E5E2E1] hover:text-white hover:border-[#5E3F38] transition-colors cursor-pointer"
            >
              <SkipForward className="w-6 h-6 fill-current" />
            </button>
            <button className="text-[#E8BDB3]/50 hover:text-white transition-colors cursor-pointer">
              <Repeat className="w-5 h-5" />
            </button>
          </div>

          {/* Volume Slider */}
          <div className="flex items-center gap-3 pt-4 border-t border-[#282828] max-w-xs mx-auto w-full">
            <button onClick={toggleMute} className="text-[#E8BDB3]/60 hover:text-white cursor-pointer">
              {isMuted || volume === 0 ? <VolumeX className="w-5 h-5 text-[#FF3B00]" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <ProgressBar
              value={isMuted ? 0 : volume * 100}
              onChange={(pct) => setVolume(pct / 100)}
              height={3}
            />
          </div>
        </div>
      </div>

      {/* Footer Meta */}
      <div className="flex items-center justify-between font-mono-label text-xs text-[#E8BDB3]/40 border-t border-[#282828] pt-4">
        <span>PROJECT: {currentProject?.title ?? 'STANDALONE TRACK'}</span>
        <span>AUDIO ENGINE: HIGH-RES STEREO</span>
      </div>
    </div>
  );
};
