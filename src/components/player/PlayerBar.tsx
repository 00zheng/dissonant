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
    repeatMode,
    toggleRepeat,
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
      {/* Top 4px Progress Line in Accent #FF3B00 */}
      <div className="w-full relative">
        <ProgressBar
          value={progressPercent}
          onScrubStart={() => {
            setIsScrubbing(true);
            setScrubPreviewTime(currentTime);
          }}
          onScrub={(pct) => {
            const newTime = (pct / 100) * duration;
            setScrubPreviewTime(newTime);
            seek(newTime);
          }}
          onScrubEnd={(pct) => {
            setIsScrubbing(false);
            seek((pct / 100) * duration);
          }}
          height={4}
          className="h-4 -my-2"
          loopAStartPct={loopAPct}
          loopBEndPct={loopBPct}
          isLoopActive={isLoopActive}
        />
      </div>

      {/* Player Controls Bar */}
      <div className="h-[68px] sm:h-16 md:h-[88px] px-3 sm:px-4 md:px-6 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Track Info Thumbnail */}
        <div 
          className="flex items-center gap-2.5 sm:gap-3 flex-1 md:flex-initial md:w-1/3 md:min-w-[200px] md:max-w-[320px] min-w-0 cursor-pointer group"
          onClick={() => setIsExpandedOpen(true)}
          title="Open Expanded Player"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-[4px] bg-[#1C1B1B] border border-[#282828] overflow-hidden shrink-0 group-hover:border-[#5E3F38] transition-colors">
            <img
              src={currentProject?.coverUrl || currentTrack.coverUrl || NEUTRAL_COVER_FALLBACK}
              alt={currentTrack.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="truncate min-w-0 pr-1 group-hover:opacity-80 transition-opacity flex flex-col justify-center">
            <h4 className="text-xs sm:text-sm font-semibold text-[#E5E2E1] truncate">
              {currentTrack.title}
            </h4>
            {(currentTrack.artist || currentProject?.artist || currentProject?.title) && (
              <p className="text-[11px] sm:text-xs text-[#E8BDB3]/60 truncate mt-0.5">
                {[currentTrack.artist || currentProject?.artist, currentProject?.title].filter(Boolean).join(' • ')}
              </p>
            )}
          </div>
        </div>

        {/* Center: Playback Buttons & Timer */}
        <div className="flex flex-col items-center gap-1 shrink-0 md:flex-1 md:max-w-[500px]">
          <div className="flex items-center gap-3 sm:gap-4 md:gap-6">
            <button
              onClick={toggleShuffle}
              className={`transition-colors cursor-pointer p-1.5 md:p-2 flex items-center justify-center ${isShuffle ? 'text-[#FF3B00]' : 'text-[#E8BDB3]/60 hover:text-white'}`}
              title="Toggle Shuffle"
            >
              <Shuffle className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <button
              onClick={playPrevious}
              className="text-[#E8BDB3]/60 hover:text-white transition-colors cursor-pointer p-1.5 md:p-2 flex items-center justify-center"
              title="Previous Track"
            >
              <SkipBack className="w-4 h-4 md:w-5 md:h-5 fill-current" />
            </button>
            <button
              onClick={togglePlay}
              className="w-10 h-10 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full bg-[#FF3B00] text-white flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-transform cursor-pointer shrink-0"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 md:w-5 md:h-5 fill-white" />
              ) : (
                <Play className="w-4 h-4 md:w-5 md:h-5 fill-white ml-0.5 md:ml-1" />
              )}
            </button>
            <button
              onClick={playNext}
              className="text-[#E8BDB3]/60 hover:text-white transition-colors cursor-pointer p-1.5 md:p-2 flex items-center justify-center"
              title="Next Track"
            >
              <SkipForward className="w-4 h-4 md:w-5 md:h-5 fill-current" />
            </button>
            <button
              onClick={toggleRepeat}
              className={`transition-colors cursor-pointer p-1.5 md:p-2 flex items-center justify-center relative ${repeatMode !== 'off' ? 'text-[#FF3B00]' : 'text-[#E8BDB3]/60 hover:text-white'}`}
              title={`Repeat: ${repeatMode}`}
            >
              <Repeat className="w-4 h-4 md:w-5 md:h-5" />
              {repeatMode === 'one' && (
                <span className="absolute -top-1 -right-1 bg-[#1C1B1B] text-[#FF3B00] text-[8px] md:text-[9px] font-bold px-1 rounded-full border border-[#282828]">1</span>
              )}
            </button>
          </div>

          {/* Time counters */}
          <div className="hidden md:flex w-full items-center gap-3">
            <span className="font-mono text-[11px] text-[#E8BDB3]/50 w-10 text-right shrink-0">{formatTime(displayTime)}</span>
            <div className="h-1 flex-1 rounded-full opacity-0 pointer-events-none" /> {/* Spacer since bar is at top */}
            <span className="font-mono text-[11px] text-[#E8BDB3]/50 w-10 text-left shrink-0">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right: Speed, A-B Loop Controls & Volume */}
        <div className="flex items-center justify-end gap-2 sm:gap-3 md:w-1/3 md:min-w-[200px] shrink-0">
          {/* Playback Speed Selector (Desktop) */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setShowSpeedMenu(!showSpeedMenu)}
              className={`px-2 py-1 rounded-[4px] border border-[#282828] text-[11px] font-mono font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                playbackRate !== 1.0
                  ? 'bg-[#FF3B00]/20 text-[#FF3B00] border-[#FF3B00]'
                  : 'bg-[#131313] text-[#E8BDB3]/80 hover:text-white'
              }`}
              title="Playback Speed"
            >
              <Gauge className="w-3.5 h-3.5" />
              <span>{playbackRate.toFixed(2).replace(/\.?0+$/, '')}x</span>
            </button>

            {showSpeedMenu && (
              <div
                className="absolute bottom-9 right-0 z-40 bg-[#1C1B1B] border border-[#282828] rounded-[6px] shadow-xl p-1 text-xs font-mono space-y-0.5 min-w-[80px]"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-3 py-2 text-[10px] text-[#E8BDB3]/50 border-b border-[#282828] font-sans font-semibold uppercase flex items-center justify-between">
                  <span>Speed</span>
                  <span className="text-[#FF3B00] font-mono text-xs font-bold">{playbackRate.toFixed(2).replace(/\.?0+$/, '')}x</span>
                </div>
                <div className="p-3 space-y-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setPlaybackRate(Math.max(0.5, playbackRate - 0.05))}
                      className="w-6 h-6 rounded-[4px] bg-[#1C1B1B] border border-[#282828] text-[#E8BDB3]/70 hover:text-white transition-colors cursor-pointer flex items-center justify-center font-bold"
                    >
                      -
                    </button>
                    <input
                      type="range"
                      min="0.5"
                      max="2.0"
                      step="0.05"
                      value={playbackRate}
                      onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
                      className="flex-1 w-24 h-1 bg-[#1C1B1B] rounded-full appearance-none cursor-pointer border border-[#282828] accent-[#FF3B00]"
                    />
                    <button
                      onClick={() => setPlaybackRate(Math.min(2.0, playbackRate + 0.05))}
                      className="w-6 h-6 rounded-[4px] bg-[#1C1B1B] border border-[#282828] text-[#E8BDB3]/70 hover:text-white transition-colors cursor-pointer flex items-center justify-center font-bold"
                    >
                      +
                    </button>
                  </div>
                  {playbackRate !== 1.0 && (
                    <div className="flex justify-end">
                      <button
                        onClick={() => {
                          setPlaybackRate(1.0);
                        }}
                        className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-[3px] bg-[#2A2A2A] text-[#E8BDB3]/70 hover:text-white border border-[#282828] transition-colors cursor-pointer"
                      >
                        Reset
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* A-B Looping Control Group (Desktop) */}
          <div className="hidden lg:flex items-center gap-1 bg-[#131313] border border-[#282828] rounded-[4px] p-0.5 text-[10px] font-mono">
            <button
              onClick={() => setIsLoopEditorOpen(true)}
              className={`px-2.5 py-1 rounded-[3px] transition-colors cursor-pointer flex items-center gap-1.5 ${
                isLoopActive ? 'bg-[#FF3B00] text-white font-bold' : 'text-[#E8BDB3]/70 hover:bg-[#2A2A2A]'
              }`}
              title="Open Loop Editor"
            >
              <Repeat className="w-3.5 h-3.5" />
              <span>Loop</span>
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
