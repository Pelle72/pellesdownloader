import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

interface SettingsContextType {
  musicEnabled: boolean;
  setMusicEnabled: (enabled: boolean) => void;
  registerAudio: (audio: HTMLAudioElement) => void;
  unregisterAudio: (audio: HTMLAudioElement) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [musicEnabled, setMusicEnabled] = useState(() => {
    const saved = localStorage.getItem('musicEnabled');
    return saved !== null ? JSON.parse(saved) : true;
  });
  
  const audioElementsRef = useRef<Set<HTMLAudioElement>>(new Set());

  const registerAudio = (audio: HTMLAudioElement) => {
    audioElementsRef.current.add(audio);
  };

  const unregisterAudio = (audio: HTMLAudioElement) => {
    audioElementsRef.current.delete(audio);
  };

  const handleMusicToggle = (enabled: boolean) => {
    setMusicEnabled(enabled);
    
    // Mute/unmute all registered audio elements
    audioElementsRef.current.forEach(audio => {
      if (!enabled) {
        audio.pause();
        audio.currentTime = 0;
      }
      audio.muted = !enabled;
    });
  };

  useEffect(() => {
    localStorage.setItem('musicEnabled', JSON.stringify(musicEnabled));
  }, [musicEnabled]);

  return (
    <SettingsContext.Provider value={{ 
      musicEnabled, 
      setMusicEnabled: handleMusicToggle,
      registerAudio,
      unregisterAudio
    }}>
      {children}
    </SettingsContext.Provider>
  );
};