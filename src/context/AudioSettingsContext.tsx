import React, { createContext, useContext, useState, useEffect } from 'react';

export type PresetName = 
  | 'Flat' 
  | 'Bass Booster' 
  | 'Bass Reducer' 
  | 'Treble Booster' 
  | 'Treble Reducer' 
  | 'Vocal' 
  | 'Electronic' 
  | 'Rock' 
  | 'Pop'
  | 'Custom';

export const EQ_PRESETS: Record<Exclude<PresetName, 'Custom'>, number[]> = {
  'Flat': [0, 0, 0, 0, 0, 0],
  'Bass Booster': [5, 4, 1, 0, 0, 0],
  'Bass Reducer': [-5, -4, -1, 0, 0, 0],
  'Treble Booster': [0, 0, 0, 1, 4, 5],
  'Treble Reducer': [0, 0, 0, -1, -4, -5],
  'Vocal': [-2, -1, 2, 4, 3, -1],
  'Electronic': [4, 3, -2, 1, 3, 4],
  'Rock': [4, 2, -2, 1, 3, 4],
  'Pop': [-1, 1, 3, 3, 2, -1]
};

export interface AudioSettings {
  eqEnabled: boolean;
  normalizeEnabled: boolean;
  eqPreset: PresetName;
  eqGains: number[];
}

interface AudioSettingsContextValue {
  settings: AudioSettings;
  updateSettings: (updates: Partial<AudioSettings>) => void;
  resetEQ: () => void;
}

const defaultSettings: AudioSettings = {
  eqEnabled: false,
  normalizeEnabled: false,
  eqPreset: 'Flat',
  eqGains: [0, 0, 0, 0, 0, 0]
};

const AudioSettingsContext = createContext<AudioSettingsContextValue | undefined>(undefined);

export const AudioSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AudioSettings>(() => {
    try {
      const stored = localStorage.getItem('dissonant_audio_settings');
      if (stored) {
        return { ...defaultSettings, ...JSON.parse(stored) };
      }
    } catch (err) {
      console.warn('Failed to parse audio settings from localStorage', err);
    }
    return defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('dissonant_audio_settings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (updates: Partial<AudioSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...updates };
      // Handle preset changes
      if (updates.eqPreset && updates.eqPreset !== 'Custom') {
        next.eqGains = [...EQ_PRESETS[updates.eqPreset as keyof typeof EQ_PRESETS]];
      }
      return next;
    });
  };

  const resetEQ = () => {
    setSettings(prev => ({
      ...prev,
      eqPreset: 'Flat',
      eqGains: [0, 0, 0, 0, 0, 0]
    }));
  };

  return (
    <AudioSettingsContext.Provider value={{ settings, updateSettings, resetEQ }}>
      {children}
    </AudioSettingsContext.Provider>
  );
};

export const useAudioSettings = () => {
  const context = useContext(AudioSettingsContext);
  if (!context) {
    throw new Error('useAudioSettings must be used within an AudioSettingsProvider');
  }
  return context;
};
