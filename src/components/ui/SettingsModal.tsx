import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Settings, RotateCcw } from 'lucide-react';
import { useAudioSettings, EQ_PRESETS, PresetName } from '../../context/AudioSettingsContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDiagnostics?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onOpenDiagnostics }) => {
  const { settings, updateSettings, resetEQ } = useAudioSettings();
  
  // Local state for dragging smoothness
  const [localGains, setLocalGains] = useState<number[]>(settings.eqGains);
  
  useEffect(() => {
    setLocalGains(settings.eqGains);
  }, [settings.eqGains]);

  if (!isOpen) return null;

  const handleGainChange = (index: number, value: number) => {
    const newGains = [...localGains];
    newGains[index] = value;
    setLocalGains(newGains);
    
    // Also update context so it applies to audio immediately
    const contextGains = [...settings.eqGains];
    contextGains[index] = value;
    updateSettings({ eqGains: contextGains, eqPreset: 'Custom' });
  };

  const bands = ['60', '150', '400', '1K', '2.4K', '15K'];

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-[#0E0E0E] w-full max-w-md border border-[#282828] rounded-[8px] shadow-2xl flex flex-col max-h-[90vh]"
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#282828] shrink-0">
            <div className="flex items-center gap-2 text-[#E5E2E1]">
              <Settings className="w-4 h-4" />
              <h2 className="text-sm font-bold tracking-wide">Settings</h2>
            </div>
            <button
              onClick={onClose}
              className="text-[#E8BDB3]/60 hover:text-white transition-colors cursor-pointer p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 overflow-y-auto flex-1 space-y-8 select-none">
            {/* Audio Normalization */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-[#E5E2E1]">Normalize Volume</h3>
                  <p className="text-[11px] text-[#E8BDB3]/60 mt-0.5 max-w-[250px]">
                    Keeps songs at a more consistent perceived loudness.
                  </p>
                </div>
                <button
                  onClick={() => updateSettings({ normalizeEnabled: !settings.normalizeEnabled })}
                  className={`w-11 h-6 rounded-full p-1 transition-colors ${
                    settings.normalizeEnabled ? 'bg-[#FF3B00]' : 'bg-[#1C1B1B] border border-[#282828]'
                  }`}
                >
                  <motion.div
                    className="w-4 h-4 bg-white rounded-full shadow-sm"
                    animate={{ x: settings.normalizeEnabled ? 20 : 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>
            </div>

            <div className="h-px bg-[#282828] w-full" />

            {/* Equalizer */}
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[#E5E2E1]">Equalizer</h3>
                <button
                  onClick={() => updateSettings({ eqEnabled: !settings.eqEnabled })}
                  className={`w-11 h-6 rounded-full p-1 transition-colors ${
                    settings.eqEnabled ? 'bg-[#FF3B00]' : 'bg-[#1C1B1B] border border-[#282828]'
                  }`}
                >
                  <motion.div
                    className="w-4 h-4 bg-white rounded-full shadow-sm"
                    animate={{ x: settings.eqEnabled ? 20 : 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>

              <div className={`transition-opacity ${settings.eqEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                {/* Preset Selector */}
                <div className="flex items-center justify-between mb-6">
                  <span className="text-xs font-medium text-[#E8BDB3]/70">Preset</span>
                  <select
                    value={settings.eqPreset}
                    onChange={(e) => updateSettings({ eqPreset: e.target.value as PresetName })}
                    className="bg-[#1C1B1B] border border-[#282828] text-xs font-medium text-[#E5E2E1] px-3 py-1.5 rounded-[4px] cursor-pointer outline-none focus:border-[#FF3B00]"
                  >
                    {Object.keys(EQ_PRESETS).map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                    <option value="Custom">Custom</option>
                  </select>
                </div>

                {/* EQ Sliders */}
                <div className="relative pt-6 pb-8 px-2">
                  <div className="absolute top-0 left-0 text-[10px] text-[#E8BDB3]/40 font-mono">+12dB</div>
                  <div className="absolute bottom-0 left-0 text-[10px] text-[#E8BDB3]/40 font-mono">-12dB</div>
                  
                  {/* Grid Lines */}
                  <div className="absolute top-3 left-8 right-4 h-px bg-[#282828] border-dashed border-b" />
                  <div className="absolute top-[50%] left-8 right-4 h-px bg-[#282828]" />
                  <div className="absolute bottom-5 left-8 right-4 h-px bg-[#282828] border-dashed border-b" />

                  <div className="flex justify-between items-end h-40 pl-8 pr-4">
                    {bands.map((label, i) => (
                      <div key={label} className="flex flex-col items-center justify-end h-full gap-2 group relative z-10 w-10">
                        {/* Custom touch-friendly vertical slider */}
                        <div className="relative h-32 w-1.5 bg-[#1C1B1B] rounded-full flex justify-center items-center">
                          <input
                            type="range"
                            min="-12"
                            max="12"
                            step="0.5"
                            value={localGains[i]}
                            onChange={(e) => handleGainChange(i, parseFloat(e.target.value))}
                            className="absolute appearance-none w-32 h-8 -rotate-90 bg-transparent cursor-pointer"
                            style={{
                              WebkitAppearance: 'none',
                            }}
                          />
                          <div 
                            className="absolute w-4 h-4 bg-white rounded-full shadow border-2 border-[#1C1B1B] pointer-events-none group-hover:scale-110 transition-transform"
                            style={{
                              bottom: `${((localGains[i] + 12) / 24) * 100}%`,
                              transform: 'translateY(50%)'
                            }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-[#E8BDB3]/60">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reset Button */}
                <div className="flex justify-between items-center mt-4">
                  <button
                    onClick={() => onOpenDiagnostics?.()}
                    className="text-[11px] font-bold uppercase tracking-wider text-[#E8BDB3]/30 hover:text-[#E8BDB3]/60 transition-colors cursor-pointer px-3 py-1.5 rounded-[4px] hover:bg-[#1C1B1B]"
                  >
                    Diagnostics
                  </button>
                  <button
                    onClick={resetEQ}
                    className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#E8BDB3]/50 hover:text-white transition-colors cursor-pointer px-3 py-1.5 rounded-[4px] hover:bg-[#1C1B1B]"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
