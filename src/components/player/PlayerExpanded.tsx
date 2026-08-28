import React from 'react';
import { usePlayer } from '../../context/PlayerContext';
import { X, Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Shuffle, Gauge } from 'lucide-react';
import { ProgressBar } from '../ui/ProgressBar';

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
  } = usePlayer();

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
    <div className="fixed inset-0 bg-[#000000]/95 backdrop-blur-xl z-50 flex flex-col justify-between p-6 md:p-12 animate-in fade-in duration-200 select-none">
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
              loopAStartPct={loopAPct}
              loopBEndPct={loopBPct}
              isLoopActive={isLoopActive}
            />
            <div className="flex justify-between font-mono-label text-xs text-[#E8BDB3]/60">
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
                <span className="text-[#FF3B00]">♪</span>
                <span>Pitch (Semitones)</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-[#FF3B00]">
                  {pitchSemitones > 0 ? `+${pitchSemitones}` : pitchSemitones} semi
                </span>
                {pitchSemitones !== 0 && (
                  <button
                    onClick={() => setPitchSemitones(0)}
                    className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-[3px] bg-[#2A2A2A] text-[#E8BDB3]/70 hover:text-white border border-[#282828] transition-colors"
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
                className={`py-2 px-3 rounded-[4px] border font-mono transition-colors cursor-pointer text-center ${
                  loopA !== null
                    ? 'bg-[#FF3B00]/20 border-[#FF3B00] text-[#FF3B00] font-bold'
                    : 'bg-[#1C1B1B] border-[#282828] text-[#E5E2E1] hover:border-[#353534]'
                }`}
              >
                Set A {loopA !== null ? `(${formatTime(loopA)})` : ''}
              </button>

              <button
                onClick={() => setLoopB()}
                className={`py-2 px-3 rounded-[4px] border font-mono transition-colors cursor-pointer text-center ${
                  loopB !== null
                    ? 'bg-[#FF3B00]/20 border-[#FF3B00] text-[#FF3B00] font-bold'
                    : 'bg-[#1C1B1B] border-[#282828] text-[#E5E2E1] hover:border-[#353534]'
                }`}
              >
                Set B {loopB !== null ? `(${formatTime(loopB)})` : ''}
              </button>

              <button
                onClick={toggleLoopActive}
                className={`py-2 px-3 rounded-[4px] border font-semibold transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5 ${
                  isLoopActive
                    ? 'bg-[#FF3B00] border-[#FF3B00] text-white'
                    : 'bg-[#1C1B1B] border-[#282828] text-[#E5E2E1] hover:border-[#353534]'
                }`}
              >
                <Repeat className="w-4 h-4" />
                <span>{isLoopActive ? 'Loop ON' : 'Loop OFF'}</span>
              </button>

              <button
                onClick={clearLoop}
                className="py-2 px-3 rounded-[4px] bg-[#1C1B1B] border border-[#282828] text-[#E8BDB3]/70 hover:text-white hover:border-[#5E3F38] transition-colors cursor-pointer text-center"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Primary Playback Controls */}
          <div className="flex items-center justify-center gap-6 pt-2">
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
        <span>RATE: {playbackRate}x | PITCH: {pitchSemitones > 0 ? `+${pitchSemitones}` : pitchSemitones}</span>
      </div>
    </div>
  );
};
