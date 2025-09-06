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
    
    // Apply mute/unmute to all registered audio elements
    audioElementsRef.current.forEach(audio => {
      audio.muted = !enabled; // When enabled=true, muted=false (play sound)
      
      if (!enabled) {
        // When disabled (muted), pause the audio
        audio.pause();
      } else {
        // When enabled (unmuted), try to resume if audio exists
        if (audio.paused && audio.currentTime > 0) {
          audio.play().catch(console.log);
        }
      }
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