import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { usePlayer } from '../../context/PlayerContext';
import { X, Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Shuffle, Gauge } from 'lucide-react';
import { ProgressBar } from '../ui/ProgressBar';
import { NEUTRAL_COVER_FALLBACK } from '../../data/mockData';

const SPEED_PRESETS = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

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
    pitchSemitones,
    setPitchSemitones,
    isShuffle,
    toggleShuffle,
  } = usePlayer();

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!currentTrack) return null;

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;
  const loopAPct = duration && loopA !== null ? (loopA / duration) * 100 : undefined;
  const loopBPct = duration && loopB !== null ? (loopB / duration) * 100 : undefined;

  const coverSrc = currentTrack.coverUrl || currentProject?.coverUrl || NEUTRAL_COVER_FALLBACK;
  const displayArtist = currentTrack.artist || currentProject?.artist;
  const hasVersion = Boolean(currentTrack.versionTag && currentTrack.versionTag.trim());
  const hasKey = Boolean(currentTrack.key && currentTrack.key.trim() && currentTrack.key !== 'undefined');
  const hasBpm = Boolean(currentTrack.bpm && !isNaN(Number(currentTrack.bpm)));
  const hasMetaTags = hasVersion || hasKey || hasBpm;

  const portalContent = (
    <div
      className="fixed inset-0 z-[100] bg-[#000000]/95 backdrop-blur-xl flex flex-col justify-between p-4 sm:p-6 md:p-10 lg:p-12 select-none overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Full music player"
    >
      {/* Top Header / Close Button */}
      <div className="flex items-center justify-end w-full max-w-4xl mx-auto shrink-0">
        <button
          onClick={onClose}
          className="p-2.5 text-[#E8BDB3]/60 hover:text-white rounded-full bg-[#1C1B1B] border border-[#282828] hover:bg-[#2A2A2A] transition-colors cursor-pointer"
          title="Close (Esc)"
          aria-label="Close player"
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="max-w-4xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 lg:gap-14 items-center py-4 sm:py-6 my-auto">
        {/* Large Album Artwork */}
        <div className="relative aspect-square w-full max-w-[280px] sm:max-w-[340px] md:max-w-md mx-auto rounded-[8px] bg-[#1C1B1B] border border-[#282828] overflow-hidden shadow-2xl shrink-0">
          <img
            src={coverSrc}
            alt={currentTrack.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Track Details & Controls */}
        <div className="space-y-4 sm:space-y-6 flex flex-col justify-center min-w-0">
          <div>
            {hasMetaTags && (
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {hasVersion && (
                  <span className="px-2 py-0.5 rounded-[4px] bg-[#2A2A2A] text-[#FF3B00] font-mono text-[10px] uppercase font-semibold border border-[#282828]">
                    {currentTrack.versionTag}
                  </span>
                )}
                {(hasKey || hasBpm) && (
                  <span className="font-mono text-xs text-[#E8BDB3]/60">
                    {hasKey ? `KEY: ${currentTrack.key}` : ''}
                    {hasKey && hasBpm ? ' • ' : ''}
                    {hasBpm ? `${currentTrack.bpm} BPM` : ''}
                  </span>
                )}
              </div>
            )}
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#E5E2E1] tracking-tight truncate">
              {currentTrack.title}
            </h2>
            {displayArtist && (
              <p className="text-base sm:text-lg text-[#E8BDB3]/70 mt-1 truncate">
                {displayArtist}
              </p>
            )}
          </div>

          {/* Scrubber */}
          <div className="space-y-1.5">
            <ProgressBar
              value={progressPercent}
              onChange={(pct) => seek((pct / 100) * duration)}
              height={4}
              loopAStartPct={loopAPct}
              loopBEndPct={loopBPct}
              isLoopActive={isLoopActive}
            />
            <div className="flex justify-between font-mono text-xs text-[#E8BDB3]/60">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Playback Speed Control Panel */}
          <div className="bg-[#131313] border border-[#282828] rounded-[6px] p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#E8BDB3]/80">
                <Gauge className="w-4 h-4 text-[#FF3B00]" />
                <span>Playback Speed</span>
              </div>
              <span className="text-xs font-mono font-bold text-[#FF3B00]">
                {playbackRate}x
              </span>
            </div>

            <div className="grid grid-cols-6 gap-1.5 text-xs font-mono">
              {SPEED_PRESETS.map((rate) => (
                <button
                  key={rate}
                  onClick={() => setPlaybackRate(rate)}
                  className={`py-1.5 rounded-[4px] border transition-colors cursor-pointer text-center ${
                    playbackRate === rate
                      ? 'bg-[#FF3B00] border-[#FF3B00] text-white font-bold'
                      : 'bg-[#1C1B1B] border-[#282828] text-[#E5E2E1] hover:border-[#353534]'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>
          </div>

          {/* Pitch Control Panel */}
          <div className="bg-[#131313] border border-[#282828] rounded-[6px] p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#E8BDB3]/80">
                <span className="text-[#FF3B00] font-bold">♪</span>
                <span>Pitch (Semitones)</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-[#FF3B00]">
                  {pitchSemitones > 0 ? `+${pitchSemitones}` : pitchSemitones} semi
                </span>
                {pitchSemitones !== 0 && (
                  <button
                    onClick={() => setPitchSemitones(0)}
                    className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-[3px] bg-[#2A2A2A] text-[#E8BDB3]/70 hover:text-white border border-[#282828] transition-colors cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 mt-2">
              <span className="text-xs font-mono text-[#E8BDB3]/40">-12</span>
              <input
                type="range"
                min="-12"
                max="12"
                step="1"
                value={pitchSemitones}
                onChange={(e) => setPitchSemitones(parseInt(e.target.value, 10))}
                className="flex-1 h-1.5 bg-[#1C1B1B] rounded-full appearance-none cursor-pointer border border-[#282828] accent-[#FF3B00]"
              />
              <span className="text-xs font-mono text-[#E8BDB3]/40">+12</span>
            </div>
          </div>

          {/* A-B Section Looping Control Panel */}
          <div className="bg-[#131313] border border-[#282828] rounded-[6px] p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#E8BDB3]/80">
                A-B Section Looping
              </span>
              {isLoopActive && (
                <span className="px-2 py-0.5 rounded-[3px] bg-[#FF3B00] text-white text-[10px] uppercase font-bold tracking-wider animate-pulse">
                  Loop Active
                </span>
              )}
            </div>

            <div className="grid grid-cols-4 gap-2 text-xs">
              <button
                onClick={() => setLoopA()}
                className={`py-2 px-2 sm:px-3 rounded-[4px] border font-mono transition-colors cursor-pointer text-center truncate ${
                  loopA !== null
                    ? 'bg-[#FF3B00]/20 border-[#FF3B00] text-[#FF3B00] font-bold'
                    : 'bg-[#1C1B1B] border-[#282828] text-[#E5E2E1] hover:border-[#353534]'
                }`}
              >
                Set A {loopA !== null ? `(${formatTime(loopA)})` : ''}
              </button>

              <button
                onClick={() => setLoopB()}
                className={`py-2 px-2 sm:px-3 rounded-[4px] border font-mono transition-colors cursor-pointer text-center truncate ${
                  loopB !== null
                    ? 'bg-[#FF3B00]/20 border-[#FF3B00] text-[#FF3B00] font-bold'
                    : 'bg-[#1C1B1B] border-[#282828] text-[#E5E2E1] hover:border-[#353534]'
                }`}
              >
                Set B {loopB !== null ? `(${formatTime(loopB)})` : ''}
              </button>

              <button
                onClick={toggleLoopActive}
                className={`py-2 px-2 sm:px-3 rounded-[4px] border font-semibold transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5 ${
                  isLoopActive
                    ? 'bg-[#FF3B00] border-[#FF3B00] text-white'
                    : 'bg-[#1C1B1B] border-[#282828] text-[#E5E2E1] hover:border-[#353534]'
                }`}
              >
                <Repeat className="w-3.5 h-3.5" />
                <span>{isLoopActive ? 'Loop ON' : 'Loop OFF'}</span>
              </button>

              <button
                onClick={clearLoop}
                className="py-2 px-2 sm:px-3 rounded-[4px] bg-[#1C1B1B] border border-[#282828] text-[#E8BDB3]/70 hover:text-white hover:border-[#5E3F38] transition-colors cursor-pointer text-center"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Primary Playback Controls */}
          <div className="flex items-center justify-center gap-4 sm:gap-6 pt-2">
            <button
              onClick={toggleShuffle}
              className={`p-2.5 rounded-full border transition-colors cursor-pointer ${
                isShuffle
                  ? 'bg-[#FF3B00]/20 border-[#FF3B00] text-[#FF3B00]'
                  : 'bg-[#1C1B1B] border-[#282828] text-[#E8BDB3]/60 hover:text-white'
              }`}
              title={isShuffle ? 'Shuffle is ON' : 'Shuffle is OFF'}
              aria-label="Toggle shuffle"
            >
              <Shuffle className="w-5 h-5" />
            </button>
            <button
              onClick={playPrevious}
              className="p-3 rounded-full bg-[#1C1B1B] border border-[#282828] text-[#E5E2E1] hover:text-white hover:border-[#5E3F38] transition-colors cursor-pointer"
              title="Previous Track"
              aria-label="Previous track"
            >
              <SkipBack className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
            </button>
            <button
              onClick={togglePlay}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#FF3B00] text-white flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-transform cursor-pointer"
              title={isPlaying ? 'Pause' : 'Play'}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-7 h-7 sm:w-8 sm:h-8 fill-white" />
              ) : (
                <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-white ml-1" />
              )}
            </button>
            <button
              onClick={playNext}
              className="p-3 rounded-full bg-[#1C1B1B] border border-[#282828] text-[#E5E2E1] hover:text-white hover:border-[#5E3F38] transition-colors cursor-pointer"
              title="Next Track"
              aria-label="Next track"
            >
              <SkipForward className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
            </button>
          </div>

          {/* Volume Slider */}
          <div className="flex items-center gap-3 pt-3 border-t border-[#282828] max-w-xs mx-auto w-full">
            <button
              onClick={toggleMute}
              className="text-[#E8BDB3]/60 hover:text-white cursor-pointer"
              title={isMuted ? 'Unmute' : 'Mute'}
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
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
      <div className="flex items-center justify-between font-mono text-xs text-[#E8BDB3]/40 border-t border-[#282828] pt-4 max-w-4xl mx-auto w-full shrink-0">
        <span>PROJECT: {currentProject?.title || 'STANDALONE TRACK'}</span>
        <span>RATE: {playbackRate}x | PITCH: {pitchSemitones > 0 ? `+${pitchSemitones}` : pitchSemitones}</span>
      </div>
    </div>
  );

  return createPortal(portalContent, document.body);
};
