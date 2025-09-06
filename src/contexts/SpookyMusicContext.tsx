import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

interface SpookyMusicContextType {
  isMuted: boolean;
  toggleMute: () => void;
  isPlaying: boolean;
}

const SpookyMusicContext = createContext<SpookyMusicContextType | undefined>(undefined);

export const useSpookyMusic = () => {
  const context = useContext(SpookyMusicContext);
  if (!context) {
    throw new Error('useSpookyMusic must be used within a SpookyMusicProvider');
  }
  return context;
};

export const SpookyMusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMuted, setIsMuted] = useState(() => {
    const saved = localStorage.getItem('spookyMusicMuted');
    return saved !== null ? JSON.parse(saved) : false;
  });
  
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio
  useEffect(() => {
    const audio = new Audio('/intro-sound.mp3');
    audio.volume = 0.4;
    audio.loop = true;
    audioRef.current = audio;

    // Start playing automatically
    const startAudio = async () => {
      try {
        if (!isMuted) {
          await audio.play();
          setIsPlaying(true);
          console.log('Spooky music started');
        }
      } catch (error) {
        console.log('Autoplay blocked, waiting for user interaction');
        // Add click listener to start on first user interaction
        const playOnClick = async () => {
          if (!isMuted) {
            try {
              await audio.play();
              setIsPlaying(true);
              console.log('Spooky music started after user interaction');
            } catch (err) {
              console.log('Failed to start music:', err);
            }
          }
          document.removeEventListener('click', playOnClick);
        };
        document.addEventListener('click', playOnClick, { once: true });
      }
    };

    startAudio();

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [isMuted]);

  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    
    if (audioRef.current) {
      if (newMutedState) {
        // Mute and pause
        audioRef.current.pause();
        setIsPlaying(false);
        console.log('Spooky music muted');
      } else {
        // Unmute and play
        audioRef.current.play().then(() => {
          setIsPlaying(true);
          console.log('Spooky music unmuted');
        }).catch(console.log);
      }
    }
  };

  // Save mute state to localStorage
  useEffect(() => {
    localStorage.setItem('spookyMusicMuted', JSON.stringify(isMuted));
  }, [isMuted]);

  return (
    <SpookyMusicContext.Provider value={{ isMuted, toggleMute, isPlaying }}>
      {children}
    </SpookyMusicContext.Provider>
  );
};