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
import { getPeaksFromIDB, savePeaksToIDB } from '../../services/peakCache';

const waveformCache = new Map<string, { peaks: Array<number[]>; duration: number }>();

const sanitizeErrorMsg = (err: any) => {
  const msg = err?.message || 'Unknown error';
  return msg.replace(/token=[^&\s'"]+/, 'token=HIDDEN');
};

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
  const playheadRef = useRef<HTMLDivElement>(null);
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

    let isSubscribed = true;
    let ws: WaveSurfer | null = null;
    let wsRegions: RegionsPlugin | null = null;
    let unsubscribeTime = () => {};
    let timeoutId: any;
    const t0 = performance.now();

    const loadWaveform = async () => {
      setIsError(false);
      setIsReady(false);

      let cached = waveformCache.get(currentTrack.id);
      let peaks = cached?.peaks;
      let duration = cached?.duration;

      if (!cached) {
        setLoadingStatus('Checking local cache...');
        const idbCached = await getPeaksFromIDB(currentTrack.id);
        if (idbCached && isSubscribed) {
          peaks = idbCached.peaks;
          duration = idbCached.duration;
          waveformCache.set(currentTrack.id, { peaks, duration });
          cached = { peaks, duration };
        }
      }

      if (!isSubscribed) return;

      if (!cached) {
        try {
          setLoadingStatus('Diagnostic: FETCH...');
          const tFetch = performance.now();
          // Attempt the fetch separately to see if it fails at the network layer on iOS
          const res = await fetch(currentTrack.audioUrl, { cache: 'no-cache' });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          console.log(`[Waveform] Diagnostic Fetch OK. Time: ${Math.round(performance.now() - tFetch)}ms`);
        } catch (err: any) {
          console.error('[Waveform] Diagnostic Fetch Error:', err);
          if (isSubscribed) {
            setIsError(true);
            const sourceType = currentTrack.audioUrl.startsWith('blob:') ? 'blob' : 'firebase';
            setLoadingStatus(`Stage: FETCH\nError: ${sanitizeErrorMsg(err)}\nSource: ${sourceType}`);
          }
          return; // Stop here, network failed
        }
      }

      if (!isSubscribed) return;

      setLoadingStatus(cached ? 'Loading from cache...' : 'Initializing...');

      ws = WaveSurfer.create({
        container: containerRef.current!,
        waveColor: '#FF562D',
        progressColor: '#FF3B00',
        cursorColor: 'transparent',
        cursorWidth: 0,
        barWidth: 2,
        barGap: 1,
        barRadius: 2,
        height: 200,
        normalize: true,
        interact: false,
        peaks,
        duration,
        url: !cached ? currentTrack.audioUrl : undefined,
        fetchParams: {
          cache: 'no-cache',
        }
      });

      ws.setVolume(0);
      wavesurferRef.current = ws;

      wsRegions = ws.registerPlugin(RegionsPlugin.create());
      regionsRef.current = wsRegions;

      const handleTimeUpdate = (time: number) => {
        const dur = playerEngine.getDuration();
        if (dur > 0 && playheadRef.current) {
          const percent = (time / dur) * 100;
          playheadRef.current.style.left = `${percent}%`;
        }
      };
      unsubscribeTime = playerEngine.onTimeUpdate(handleTimeUpdate);

      ws.on('click', (relativeX) => {
        const dur = playerEngine.getDuration();
        if (dur) {
          playerEngine.seek(relativeX * dur);
        }
      });

      ws.on('load', () => {
        if (!isSubscribed) return;
        setLoadingStatus('Loading...');
      });
      
      ws.on('loading', (percent) => {
        if (!isSubscribed) return;
        setLoadingStatus(`Loading waveform... ${percent}%`);
      });

      ws.on('decode', () => {
        if (!isSubscribed) return;
        setLoadingStatus('Diagnostic: DECODE...');
      });

      ws.on('error', (err: any) => {
        if (!isSubscribed) return;
        console.error(`[Waveform] ERROR —`, err);
        setIsError(true);
        setLoadingStatus(`Stage: WAVESURFER\nError: ${sanitizeErrorMsg(err)}`);
      });

      timeoutId = setTimeout(() => {
        if (!isReady && !isError && isSubscribed) {
          setIsError(true);
          setLoadingStatus('Stage: READY TIMEOUT\nWaveform took too long.');
        }
      }, 20000);

      ws.on('ready', () => {
        if (!isSubscribed) return;
        clearTimeout(timeoutId);
        setIsReady(true);

        const initialTime = playerEngine.getCurrentTime();
        const dur = ws!.getDuration() || playerEngine.getDuration();
        if (dur > 0 && playheadRef.current) {
          const percent = (initialTime / dur) * 100;
          playheadRef.current.style.left = `${percent}%`;
        }

        if (!cached && currentTrack) {
          try {
            const exportedPeaks = ws!.exportPeaks({ maxLength: 8000 });
            const exportedDuration = ws!.getDuration();
            waveformCache.set(currentTrack.id, { peaks: exportedPeaks, duration: exportedDuration });
            savePeaksToIDB(currentTrack.id, exportedPeaks, exportedDuration).catch(e => console.warn(e));
          } catch (err) {
            console.error('[Waveform] Could not export peaks', err);
          }
        }
        
        const start = loopA !== null ? loopA : 0;
        const end = loopB !== null ? loopB : dur || 10;
        
        wsRegions!.clearRegions();
        wsRegions!.addRegion({
          start,
          end,
          color: 'rgba(250, 204, 21, 0.3)',
          drag: true,
          resize: true,
          id: 'ab-loop',
        });
      });

      wsRegions.on('region-updated', (region) => {
        if (region.id === 'ab-loop') {
          setLoopA(region.start);
          setLoopB(region.end);
        }
      });
    };

    loadWaveform();

    return () => {
      isSubscribed = false;
      clearTimeout(timeoutId);
      unsubscribeTime();
      if (ws) {
        ws.destroy();
      }
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
              <div className="relative w-full h-[200px]">
                <div ref={containerRef} className="w-full h-full" />
                <div 
                  ref={playheadRef}
                  className={`absolute top-0 bottom-0 w-[2px] bg-white z-[20] pointer-events-none shadow-[0_0_4px_rgba(0,0,0,0.5)] transition-opacity duration-200 ${isReady ? 'opacity-100' : 'opacity-0'}`}
                  style={{ left: '0%' }}
                />
              </div>
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

