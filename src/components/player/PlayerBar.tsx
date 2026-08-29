import React, { useState } from 'react';
import { usePlayer } from '../../context/PlayerContext';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Gauge, Shuffle, ListMusic } from 'lucide-react';
import { ProgressBar } from '../ui/ProgressBar';
import { QueuePanel } from './QueuePanel';
import { LoopEditor } from './LoopEditor';
import { PlayerExpanded } from './PlayerExpanded';
import { NEUTRAL_COVER_FALLBACK } from '../../data/mockData';

const SPEED_PRESETS = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

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
    playbackRate,
    setPlaybackRate,
    isShuffle,
    toggleShuffle,
    isLoopEditorOpen,
    setIsLoopEditorOpen,
  } = usePlayer();

  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubPreviewTime, setScrubPreviewTime] = useState(0);
  const [isQueuePanelOpen, setIsQueuePanelOpen] = useState(false);
  const [isExpandedOpen, setIsExpandedOpen] = useState(false);
  if (!currentTrack) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const displayTime = isScrubbing ? scrubPreviewTime : currentTime;
  const progressPercent = duration ? (displayTime / duration) * 100 : 0;
  const loopAPct = duration && loopA !== null ? (loopA / duration) * 100 : undefined;
  const loopBPct = duration && loopB !== null ? (loopB / duration) * 100 : undefined;

  return (
    <div className="fixed bottom-[calc(3.5rem+env(safe-area-inset-bottom))] md:bottom-0 left-0 right-0 bg-[#0E0E0E]/95 backdrop-blur-md border-t border-[#282828] z-30 flex flex-col select-none shadow-2xl">
      {/* Top 2px Progress Line in Accent #FF3B00 */}
      <div className="w-full relative">
        <ProgressBar
          value={progressPercent}
          onScrubStart={() => {
            setIsScrubbing(true);
            setScrubPreviewTime(currentTime);
          }}
          onScrub={(pct) => {
            setScrubPreviewTime((pct / 100) * duration);
          }}
          onScrubEnd={(pct) => {
            setIsScrubbing(false);
            seek((pct / 100) * duration);
          }}
          height={2}
          className="!py-0 h-[2px]"
          loopAStartPct={loopAPct}
          loopBEndPct={loopBPct}
          isLoopActive={isLoopActive}
        />
      </div>

      {/* Player Controls Bar */}
      <div className="h-14 sm:h-16 px-3 sm:px-4 md:px-6 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Track Info Thumbnail */}
        <div 
          className="flex items-center gap-2.5 sm:gap-3 flex-1 md:flex-initial md:w-1/3 md:min-w-[150px] md:max-w-[280px] min-w-0 cursor-pointer group"
          onClick={() => setIsExpandedOpen(true)}
          title="Open Expanded Player"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-[4px] bg-[#1C1B1B] border border-[#282828] overflow-hidden shrink-0 group-hover:border-[#5E3F38] transition-colors">
            <img
              src={currentTrack.coverUrl || currentProject?.coverUrl || NEUTRAL_COVER_FALLBACK}
              alt={currentTrack.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="truncate min-w-0 pr-1 group-hover:opacity-80 transition-opacity">
            <h4 className="text-xs sm:text-sm font-semibold text-[#E5E2E1] truncate">
              {currentTrack.title}
            </h4>
            <p className="text-[11px] sm:text-xs text-[#E8BDB3]/60 truncate">
              {currentTrack.artist || currentProject?.artist || ''}{currentProject ? ` • ${currentProject.title}` : ''}
            </p>
          </div>
        </div>

        {/* Center: Playback Buttons & Timer */}
        <div className="flex items-center md:flex-col items-center gap-2 sm:gap-3 md:gap-1 shrink-0">
          <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
            <button
              onClick={playPrevious}
              className="text-[#E8BDB3]/60 hover:text-white transition-colors cursor-pointer p-1.5 sm:p-1"
              title="Previous Track"
            >
              <SkipBack className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
            </button>
            <button
              onClick={togglePlay}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#FF3B00] text-white flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-transform cursor-pointer shrink-0"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white" />
              ) : (
                <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white ml-0.5" />
              )}
            </button>
            <button
              onClick={playNext}
              className="text-[#E8BDB3]/60 hover:text-white transition-colors cursor-pointer p-1.5 sm:p-1"
              title="Next Track"
            >
              <SkipForward className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
            </button>
            <button
              onClick={toggleShuffle}
              className={`transition-colors cursor-pointer p-1.5 sm:p-1 ml-1 ${isShuffle ? 'text-[#FF3B00]' : 'text-[#E8BDB3]/60 hover:text-white'}`}
              title="Toggle Shuffle"
            >
              <Shuffle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>

          {/* Time counters (hidden on small mobile to prevent squishing, visible on desktop/tablet) */}
          <div className="hidden md:flex font-mono text-[11px] text-[#E8BDB3]/50 items-center gap-1.5">
            <span>{formatTime(displayTime)}</span>
            <span>/</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right: Speed, A-B Loop Controls & Volume */}
        <div className="flex items-center justify-end gap-2 sm:gap-3 md:w-1/3 md:max-w-[420px] shrink-0">
          {/* Playback Speed Selector (Desktop) */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setShowSpeedMenu(!showSpeedMenu)}
              className={`px-2 py-1 rounded-[4px] border border-[#282828] text-[11px] font-mono font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                playbackRate !== 1.0
                  ? 'bg-[#FF3B00]/20 text-[#FF3B00] border-[#FF3B00]'
                  : 'bg-[#131313] text-[#E8BDB3]/80 hover:text-white'
              }`}
              title="Playback Speed"
            >
              <Gauge className="w-3 h-3" />
              <span>{playbackRate}x</span>
            </button>

            {showSpeedMenu && (
              <div
                className="absolute bottom-9 right-0 z-40 bg-[#1C1B1B] border border-[#282828] rounded-[6px] shadow-xl p-1 text-xs font-mono space-y-0.5 min-w-[80px]"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-2 py-1 text-[10px] text-[#E8BDB3]/50 border-b border-[#282828] font-sans font-semibold uppercase">
                  Speed
                </div>
                {SPEED_PRESETS.map((rate) => (
                  <button
                    key={rate}
                    onClick={() => {
                      setPlaybackRate(rate);
                      setShowSpeedMenu(false);
                    }}
                    className={`w-full text-left px-2 py-1 rounded-[3px] transition-colors cursor-pointer flex items-center justify-between ${
                      playbackRate === rate
                        ? 'bg-[#FF3B00] text-white font-bold'
                        : 'text-[#E5E2E1] hover:bg-[#2A2A2A]'
                    }`}
                  >
                    <span>{rate}x</span>
                    {rate === 1.0 && (
                      <span className="text-[9px] opacity-60 font-sans">Normal</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* A-B Looping Control Group (Desktop) */}
          <div className="hidden lg:flex items-center gap-1 bg-[#131313] border border-[#282828] rounded-[4px] p-0.5 text-[10px] font-mono">
            <button
              onClick={() => setIsLoopEditorOpen(true)}
              className={`px-2 py-0.5 rounded-[3px] transition-colors cursor-pointer flex items-center gap-1.5 ${
                isLoopActive ? 'bg-[#FF3B00] text-white font-bold' : 'text-[#E8BDB3]/70 hover:bg-[#2A2A2A]'
              }`}
              title="Open Loop Editor"
            >
              <Repeat className="w-3 h-3" />
              <span>A-B {isLoopActive ? 'ON' : 'OFF'}</span>
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

          {/* Volume (Desktop) */}
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

          {/* Queue Button */}
          <button
            onClick={() => setIsQueuePanelOpen(!isQueuePanelOpen)}
            className={`p-1.5 rounded-[4px] transition-colors cursor-pointer ${isQueuePanelOpen ? 'bg-[#FF3B00] text-white' : 'text-[#E8BDB3]/60 hover:text-white hover:bg-[#2A2A2A]'}`}
            title="Play Queue"
          >
            <ListMusic className="w-4 h-4" />
          </button>
        </div>
      </div>

      <QueuePanel isOpen={isQueuePanelOpen} onClose={() => setIsQueuePanelOpen(false)} />
      <LoopEditor />
      {isExpandedOpen && (
        <PlayerExpanded onClose={() => setIsExpandedOpen(false)} />
      )}
    </div>
  );
};
