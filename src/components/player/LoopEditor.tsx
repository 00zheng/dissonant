import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.esm.js';
import { usePlayer } from '../../context/PlayerContext';
import { playerEngine } from '../../services/playerEngine';
import { X, Play, Pause, RotateCcw, ShieldCheck } from 'lucide-react';

export const LoopEditor: React.FC = () => {
  const {
    currentTrack,
    isLoopEditorOpen,
    setIsLoopEditorOpen,
    isPlaying,
    togglePlay,
    loopA,
    loopB,
    setLoopA,
    setLoopB,
    isLoopActive,
    toggleLoopActive,
    clearLoop
  } = usePlayer();

  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const regionsRef = useRef<RegionsPlugin | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!isLoopEditorOpen || !containerRef.current || !currentTrack?.audioUrl) return;

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: '#FF562D',
      progressColor: '#FF3B00',
      cursorColor: '#FFFFFF',
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      height: 200,
      normalize: true,
      media: playerEngine.getMediaElement(),
    });

    const wsRegions = ws.registerPlugin(RegionsPlugin.create());

    wavesurferRef.current = ws;
    regionsRef.current = wsRegions;

    ws.on('ready', () => {
      setIsReady(true);
      
      const duration = ws.getDuration();
      const start = loopA !== null ? loopA : 0;
      const end = loopB !== null ? loopB : duration || 10;
      
      wsRegions.clearRegions();
      wsRegions.addRegion({
        start,
        end,
        color: 'rgba(255, 59, 0, 0.3)',
        drag: true,
        resize: true,
        id: 'ab-loop',
      });
    });

    wsRegions.on('region-updated', (region) => {
      if (region.id === 'ab-loop') {
        setLoopA(region.start);
        setLoopB(region.end);
        if (!isLoopActive) {
          toggleLoopActive();
        }
      }
    });

    return () => {
      ws.destroy();
      setIsReady(false);
    };
  }, [isLoopEditorOpen, currentTrack?.audioUrl]);

  if (!isLoopEditorOpen || !currentTrack) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 bg-[#000000]/90 backdrop-blur-sm flex flex-col justify-center items-center select-none overflow-hidden touch-none p-4 md:p-10">
      <div className="absolute top-6 right-6">
        <button
          onClick={() => setIsLoopEditorOpen(false)}
          className="w-10 h-10 rounded-full bg-[#1C1B1B] text-white flex items-center justify-center hover:bg-[#FF3B00] transition-colors shadow-lg cursor-pointer border border-[#282828]"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="w-full max-w-5xl bg-[#0E0E0E] rounded-[8px] border border-[#282828] shadow-2xl p-6 flex flex-col relative overflow-hidden">
        
        <div className="flex items-start justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-[#E5E2E1] tracking-tight">{currentTrack.title}</h2>
            <p className="text-sm text-[#E8BDB3]/60">{currentTrack.artist}</p>
          </div>
          
          <div className="flex items-center gap-3 bg-[#1C1B1B] rounded-[4px] border border-[#282828] p-1.5">
            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-[4px] bg-[#FF3B00] text-white flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-transform cursor-pointer"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-white" />
              ) : (
                <Play className="w-5 h-5 fill-white ml-1" />
              )}
            </button>
            <button
              onClick={clearLoop}
              className="px-3 h-10 rounded-[4px] bg-transparent hover:bg-[#2A2A2A] text-[#E8BDB3] flex items-center gap-2 transition-colors cursor-pointer text-sm font-semibold"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          </div>
        </div>

        <div className="relative w-full rounded-[4px] bg-[#131313] border border-[#282828] p-4 flex flex-col">
          {!isReady && (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-[#131313] rounded-[4px]">
              <div className="animate-pulse flex items-center gap-2 text-[#FF3B00] font-mono text-sm">
                <ShieldCheck className="w-4 h-4" /> Analyzing Waveform...
              </div>
            </div>
          )}
          <div ref={containerRef} className="w-full h-[200px]" />
        </div>

        <div className="flex justify-between items-center mt-6 text-sm font-mono text-[#E8BDB3]">
          <div className="flex items-center gap-3">
            <span className="text-[#FF3B00] font-bold">A:</span>
            <span className="bg-[#1C1B1B] px-2 py-1 rounded-[4px] min-w-[70px] text-center border border-[#282828]">
              {loopA !== null ? loopA.toFixed(2) : '--.--'}s
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleLoopActive}
              className={`px-3 py-1.5 rounded-[4px] border transition-colors cursor-pointer ${isLoopActive ? 'bg-[#FF3B00] border-[#FF3B00] text-white' : 'bg-transparent border-[#282828] text-[#E8BDB3]/50 hover:text-white hover:bg-[#2A2A2A]'}`}
            >
              {isLoopActive ? 'LOOP ACTIVE' : 'LOOP INACTIVE'}
            </button>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[#FF3B00] font-bold">B:</span>
            <span className="bg-[#1C1B1B] px-2 py-1 rounded-[4px] min-w-[70px] text-center border border-[#282828]">
              {loopB !== null ? loopB.toFixed(2) : '--.--'}s
            </span>
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
};
