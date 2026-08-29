import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.esm.js';
import { usePlayer } from '../../context/PlayerContext';
import { playerEngine } from '../../services/playerEngine';
import { X, Play, Pause, RotateCcw, ShieldCheck } from 'lucide-react';
import {
  loopEditorBackdropVariants,
  loopEditorContentVariants,
  iconCrossfadeVariants,
} from '../../constants/motion';

const waveformCache = new Map<string, { peaks: Array<number[]>; duration: number }>();

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
  const [loadingStatus, setLoadingStatus] = useState<string>('Analyzing Waveform...');
  const [isError, setIsError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isLoopEditorOpen) {
        setIsLoopEditorOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLoopEditorOpen, setIsLoopEditorOpen]);

  useEffect(() => {
    if (!isLoopEditorOpen || !containerRef.current || !currentTrack?.audioUrl) return;

    const cached = waveformCache.get(currentTrack.id);
    let peaks: Array<number[]> | undefined = undefined;
    let duration: number | undefined = undefined;

    if (cached) {
      peaks = cached.peaks;
      duration = cached.duration;
    }

    const t0 = performance.now();
    console.log(`[Waveform] editor opened for track ${currentTrack.id}`);
    console.log(`[Waveform] audio URL available: ${!!currentTrack.audioUrl}`);
    console.log(`[Waveform] media readyState: ${playerEngine.getMediaElement().readyState}`);
    console.log(`[Waveform] media duration: ${playerEngine.getMediaElement().duration}`);

    setLoadingStatus(cached ? 'Loading from cache...' : 'Initializing...');
    setIsError(false);
    setIsReady(false);

    // Completely decouple visual waveform from playback engine
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
      interact: false, // Prevent WaveSurfer from handling its own seeking
      peaks,
      duration,
      // If we don't have cached peaks, provide the URL so WaveSurfer can fetch and decode it independently
      url: !cached ? currentTrack.audioUrl : undefined,
      fetchParams: {
        cache: 'no-cache', // Bypass iOS Safari opaque caching if audio element already fetched it
      }
    });

    // Mute WaveSurfer's internal audio to guarantee it never interferes with iOS audio session
    ws.setVolume(0);

    const wsRegions = ws.registerPlugin(RegionsPlugin.create());

    wavesurferRef.current = ws;
    regionsRef.current = wsRegions;

    // Sync WaveSurfer visual cursor with the main player engine
    const handleTimeUpdate = (time: number) => {
      if (ws && isReady) {
        ws.setTime(time);
      }
    };
    const unsubscribeTime = playerEngine.onTimeUpdate(handleTimeUpdate);

    // Allow clicking the waveform to seek the main player engine instead
    ws.on('click', (relativeX) => {
      const dur = playerEngine.getDuration();
      if (dur) {
        playerEngine.seek(relativeX * dur);
      }
    });

    ws.on('load', () => {
      console.log(`[Waveform] load started — ${Math.round(performance.now() - t0)}ms elapsed`);
      setLoadingStatus('Loading...');
    });
    
    ws.on('loading', (percent) => {
      console.log(`[Waveform] loading progress ${percent}% — ${Math.round(performance.now() - t0)}ms elapsed`);
      setLoadingStatus(`Loading waveform... ${percent}%`);
    });

    ws.on('decode', () => {
      console.log(`[Waveform] decode event — ${Math.round(performance.now() - t0)}ms elapsed`);
      setLoadingStatus('Decoding waveform...');
    });

    ws.on('error', (err: any) => {
      console.error(`[Waveform] ERROR —`, err);
      console.log(`[Waveform] complete error object:`, JSON.stringify(err, Object.getOwnPropertyNames(err)));
      console.log(`[Waveform] error elapsed time: ${Math.round(performance.now() - t0)}ms`);
      setIsError(true);
      // Show actual error message instead of generic swallow
      setLoadingStatus(`Error: ${err?.message || 'Could not load waveform'}`);
    });

    let timeoutId = setTimeout(() => {
      if (!isReady && !isError) {
        setIsError(true);
        setLoadingStatus('Waveform is taking longer than expected.');
      }
    }, 20000);

    ws.on('ready', () => {
      clearTimeout(timeoutId);
      const tReady = performance.now();
      console.log(`[Waveform] ready event — ${Math.round(tReady - t0)}ms elapsed`);
      setIsReady(true);

      // Set initial time
      ws.setTime(playerEngine.getCurrentTime());

      if (!cached && currentTrack) {
        try {
          const exportedPeaks = ws.exportPeaks({ maxLength: 8000 });
          const exportedDuration = ws.getDuration();
          waveformCache.set(currentTrack.id, { peaks: exportedPeaks, duration: exportedDuration });
          console.log(`[Waveform] cached peaks for track ${currentTrack.id}`);
        } catch (err) {
          console.error('[Waveform] Could not export peaks', err);
        }
      }
      
      const audioDuration = ws.getDuration() || playerEngine.getDuration();
      const start = loopA !== null ? loopA : 0;
      const end = loopB !== null ? loopB : audioDuration || 10;
      
      wsRegions.clearRegions();
      wsRegions.addRegion({
        start,
        end,
        color: 'rgba(250, 204, 21, 0.3)', // Yellow #FACC15
        drag: true,
        resize: true,
        id: 'ab-loop',
      });
    });

    wsRegions.on('region-updated', (region) => {
      if (region.id === 'ab-loop') {
        setLoopA(region.start);
        setLoopB(region.end);
        // Do NOT automatically activate the loop
      }
    });

    return () => {
      clearTimeout(timeoutId);
      unsubscribeTime();
      ws.destroy();
      setIsReady(false);
    };
  }, [isLoopEditorOpen, currentTrack?.audioUrl, currentTrack?.id, retryCount]);

  const handleReset = () => {
    if (!wavesurferRef.current || !regionsRef.current) return;
    const duration = wavesurferRef.current.getDuration() || 0;
    
    // reset region visually
    const regions = regionsRef.current.getRegions();
    const abRegion = regions.find(r => r.id === 'ab-loop');
    if (abRegion) {
      abRegion.setOptions({ start: 0, end: duration });
    }
    
    // reset in context
    setLoopA(0);
    setLoopB(duration);
    if (isLoopActive) {
      toggleLoopActive();
    }
  };

  if (!isLoopEditorOpen || !currentTrack) return null;

  return createPortal(
    <div
      style={{
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)',
      }}
      className="fixed inset-0 z-[150] bg-[#000000]/90 backdrop-blur-sm flex flex-col justify-center items-center select-none overflow-hidden touch-none p-4 md:p-10"
      onClick={() => setIsLoopEditorOpen(false)}
    >
      <div
        style={{
          top: 'calc(env(safe-area-inset-top, 0px) + 16px)',
        }}
        className="absolute right-6"
      >
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => setIsLoopEditorOpen(false)}
          className="w-10 h-10 rounded-full bg-[#1C1B1B] text-[#E8BDB3]/60 hover:text-white flex items-center justify-center hover:bg-[#2A2A2A] transition-colors shadow-lg cursor-pointer border border-[#282828]"
          title="Close (Esc)"
        >
          <X className="w-5 h-5" />
        </motion.button>
      </div>

          <motion.div
            variants={loopEditorContentVariants}
            className="w-full max-w-5xl bg-[#0E0E0E] rounded-[8px] border border-[#282828] shadow-2xl p-6 flex flex-col relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            
            <div className="flex items-start justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-[#E5E2E1] tracking-tight">{currentTrack.title}</h2>
                <p className="text-sm text-[#E8BDB3]/60">{currentTrack.artist}</p>
              </div>
              
              <div className="flex items-center gap-3 bg-[#1C1B1B] rounded-[4px] border border-[#282828] p-1.5">
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={togglePlay}
                  className="w-10 h-10 rounded-[4px] bg-[#FF3B00] text-white flex items-center justify-center shadow-md hover:scale-103 transition-transform cursor-pointer overflow-hidden"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {isPlaying ? (
                      <motion.div
                        key="pause"
                        variants={iconCrossfadeVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="flex items-center justify-center"
                      >
                        <Pause className="w-5 h-5 fill-white" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="play"
                        variants={iconCrossfadeVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="flex items-center justify-center"
                      >
                        <Play className="w-5 h-5 fill-white ml-1" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.94 }}
                  onClick={handleReset}
                  className="px-3 h-10 rounded-[4px] bg-transparent hover:bg-[#2A2A2A] text-[#E8BDB3] flex items-center gap-2 transition-colors cursor-pointer text-sm font-semibold"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </motion.button>
              </div>
            </div>

            <div className="relative w-full rounded-[4px] bg-[#131313] border border-[#282828] p-4 flex flex-col">
              {!isReady && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-[#131313] rounded-[4px] space-y-3">
                  <div className={`flex items-center gap-2 font-mono text-sm ${isError ? 'text-red-500' : 'text-[#FF3B00] animate-pulse'}`}>
                    <ShieldCheck className="w-4 h-4" /> {loadingStatus}
                  </div>
                  {isError && (
                    <button
                      onClick={() => {
                        setIsError(false);
                        setLoadingStatus('Retrying...');
                        setRetryCount(r => r + 1);
                      }}
                      className="px-4 py-1.5 rounded-[4px] bg-[#1C1B1B] text-[#E8BDB3] border border-[#282828] hover:bg-[#2A2A2A] text-sm font-semibold transition-colors cursor-pointer shadow-sm"
                    >
                      Retry
                    </button>
                  )}
                </div>
              )}
              <div ref={containerRef} className="w-full h-[200px]" />
            </div>

            <div className="flex justify-between items-center mt-6 text-sm font-mono text-[#E8BDB3]">
              <div className="flex items-center gap-3">
                <span className="text-[#FACC15] font-bold">A:</span>
                <span className="bg-[#1C1B1B] px-2 py-1 rounded-[4px] min-w-[70px] text-center border border-[#282828]">
                  {loopA !== null ? loopA.toFixed(2) : '--.--'}s
                </span>
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleLoopActive}
                  className={`px-3 py-1.5 rounded-[4px] border transition-colors cursor-pointer font-bold ${isLoopActive ? 'bg-[#FACC15] border-[#FACC15] text-black' : 'bg-transparent border-[#282828] text-[#E8BDB3]/50 hover:text-white hover:bg-[#2A2A2A]'}`}
                >
                  {isLoopActive ? 'LOOP ACTIVE' : 'ACTIVATE LOOP'}
                </motion.button>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#FACC15] font-bold">B:</span>
                <span className="bg-[#1C1B1B] px-2 py-1 rounded-[4px] min-w-[70px] text-center border border-[#282828]">
                  {loopB !== null ? loopB.toFixed(2) : '--.--'}s
                </span>
              </div>
            </div>

          </motion.div>
    </div>,
    document.body
  );
};

