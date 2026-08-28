import React, { useState } from 'react';
import { usePlayer } from '../../context/PlayerContext';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Maximize2, Repeat } from 'lucide-react';
import { ProgressBar } from '../ui/ProgressBar';
import { PlayerExpanded } from './PlayerExpanded';

export const PlayerBar: React.FC = () => {
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
    playPrevious,
    loopA,
    loopB,
    isLoopActive,
    setLoopA,
    setLoopB,
    toggleLoopActive,
    clearLoop,
  } = usePlayer();

  const [isExpanded, setIsExpanded] = useState(false);

  if (!currentTrack) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;
  const loopAPct = duration && loopA !== null ? (loopA / duration) * 100 : undefined;
  const loopBPct = duration && loopB !== null ? (loopB / duration) * 100 : undefined;

  return (
    <>
      <div className="fixed bottom-14 md:bottom-0 left-0 right-0 bg-[#0E0E0E] border-t border-[#282828] z-30 flex flex-col select-none">
        {/* Top 2px Progress Line in Accent #FF3B00 */}
        <div className="w-full relative">
          <ProgressBar
            value={progressPercent}
            onChange={(pct) => seek((pct / 100) * duration)}
            height={2}
            className="!py-0 h-[2px]"
            loopAStartPct={loopAPct}
            loopBEndPct={loopBPct}
            isLoopActive={isLoopActive}
          />
        </div>

        {/* Player Controls Bar */}
        <div className="h-16 px-4 md:px-6 flex items-center justify-between gap-4">
          {/* Left: Track Info Thumbnail */}
          <div className="flex items-center gap-3 w-1/3 min-w-[150px] max-w-[280px]">
            <div
              onClick={() => setIsExpanded(true)}
              className="w-10 h-10 rounded-[4px] bg-[#1C1B1B] border border-[#282828] overflow-hidden shrink-0 cursor-pointer group relative"
            >
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Maximize2 className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="truncate">
              <h4
                onClick={() => setIsExpanded(true)}
                className="text-sm font-semibold text-[#E5E2E1] hover:text-white truncate cursor-pointer"
              >
                {currentTrack.title}
              </h4>
              <p className="text-xs text-[#E8BDB3]/60 truncate">
                {currentTrack.artist}{currentProject ? ` • ${currentProject.title}` : ''}
              </p>
            </div>
          </div>

          {/* Center: Playback Buttons & Timer */}
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-3">
              <button
                onClick={playPrevious}
                className="text-[#E8BDB3]/60 hover:text-white transition-colors cursor-pointer p-1"
                title="Previous Track"
              >
                <SkipBack className="w-4 h-4 fill-current" />
              </button>
              <button
                onClick={togglePlay}
                className="w-9 h-9 rounded-full bg-[#FF3B00] text-white flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 fill-white" />
                ) : (
                  <Play className="w-4 h-4 fill-white ml-0.5" />
                )}
              </button>
              <button
                onClick={playNext}
                className="text-[#E8BDB3]/60 hover:text-white transition-colors cursor-pointer p-1"
                title="Next Track"
              >
                <SkipForward className="w-4 h-4 fill-current" />
              </button>
            </div>

            {/* Time counters */}
            <div className="font-mono text-[11px] text-[#E8BDB3]/50 flex items-center gap-1.5">
              <span>{formatTime(currentTime)}</span>
              <span>/</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right: A-B Loop Controls, Volume & Expand */}
          <div className="flex items-center justify-end gap-3 w-1/3 max-w-[340px]">
            {/* A-B Looping Control Group */}
            <div className="hidden lg:flex items-center gap-1 bg-[#131313] border border-[#282828] rounded-[4px] p-0.5 text-[10px] font-mono">
              <button
                onClick={() => setLoopA()}
                className={`px-1.5 py-0.5 rounded-[3px] transition-colors cursor-pointer ${
                  loopA !== null ? 'bg-[#FF3B00] text-white font-bold' : 'text-[#E8BDB3]/70 hover:bg-[#2A2A2A]'
                }`}
                title="Set Loop Point A"
              >
                A{loopA !== null ? `:${formatTime(loopA)}` : ''}
              </button>

              <button
                onClick={() => setLoopB()}
                className={`px-1.5 py-0.5 rounded-[3px] transition-colors cursor-pointer ${
                  loopB !== null ? 'bg-[#FF3B00] text-white font-bold' : 'text-[#E8BDB3]/70 hover:bg-[#2A2A2A]'
                }`}
                title="Set Loop Point B"
              >
                B{loopB !== null ? `:${formatTime(loopB)}` : ''}
              </button>

              <button
                onClick={toggleLoopActive}
                className={`px-1.5 py-0.5 rounded-[3px] transition-colors cursor-pointer flex items-center gap-1 ${
                  isLoopActive ? 'bg-[#FF3B00] text-white font-bold' : 'text-[#E8BDB3]/70 hover:bg-[#2A2A2A]'
                }`}
                title={isLoopActive ? 'A-B Loop ON' : 'A-B Loop OFF'}
              >
                <Repeat className="w-3 h-3" />
                <span>{isLoopActive ? 'ON' : 'OFF'}</span>
              </button>

              {(loopA !== null || loopB !== null) && (
                <button
                  onClick={clearLoop}
                  className="px-1.5 py-0.5 text-[#FF3B00] hover:bg-[#2A2A2A] rounded-[3px] cursor-pointer"
                  title="Clear A-B Loop"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="hidden sm:flex items-center gap-2 w-24">
              <button onClick={toggleMute} className="text-[#E8BDB3]/60 hover:text-white cursor-pointer">
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-[#FF3B00]" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <ProgressBar
                value={isMuted ? 0 : volume * 100}
                onChange={(pct) => setVolume(pct / 100)}
                height={2}
              />
            </div>

            <button
              onClick={() => setIsExpanded(true)}
              className="p-1.5 text-[#E8BDB3]/60 hover:text-white rounded-[4px] hover:bg-[#1C1B1B] transition-colors cursor-pointer"
              title="Expand Player"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Hero Player Modal */}
      {isExpanded && <PlayerExpanded onClose={() => setIsExpanded(false)} />}
    </>
  );
};
