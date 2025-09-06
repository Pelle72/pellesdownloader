import React, { useEffect, useState, useRef } from 'react';
import { useSettings } from '@/contexts/SettingsContext';

interface CustomSplashScreenProps {
  onComplete: () => void;
  audioUrl?: string;
}

export const CustomSplashScreen: React.FC<CustomSplashScreenProps> = ({ 
  onComplete, 
  audioUrl = '/intro-sound.mp3' 
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [audioPlayed, setAudioPlayed] = useState(false);
  const { musicEnabled, registerAudio, unregisterAudio } = useSettings();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let audio: HTMLAudioElement | null = null;

    const initializeAudio = async () => {
      if (audioUrl && !audioPlayed) {
        try {
          audio = new Audio(audioUrl);
          audio.volume = 0.5;
          audio.loop = false;
          audioRef.current = audio;
          
          // Register audio with settings context
          registerAudio(audio);
          
          console.log('Attempting to play audio immediately:', audioUrl);
          await audio.play();
          console.log('Audio started successfully');
          
          setAudioPlayed(true);
        } catch (error) {
          console.log('Audio autoplay blocked, will play on user interaction:', error);
          
          // Add click handler to play on first user interaction
          const playOnClick = async () => {
            if (audio) {
              try {
                await audio.play();
                console.log('Audio playing after user interaction');
                setAudioPlayed(true);
              } catch (err) {
                console.log('Audio still failed after click:', err);
              }
            }
            document.removeEventListener('click', playOnClick);
          };
          
          document.addEventListener('click', playOnClick, { once: true });
          setAudioPlayed(true); // Mark as attempted
        }
      }
    };

    // Initialize audio immediately when component mounts
    initializeAudio();

    // Auto-hide splash screen after 3 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 500);
    }, 3000);

    return () => {
      clearTimeout(timer);
      if (audioRef.current) {
        unregisterAudio(audioRef.current);
        audioRef.current.pause();
        audioRef.current = null;
      }
      document.removeEventListener('click', () => {});
    };
  }, [onComplete, audioUrl, audioPlayed, registerAudio, unregisterAudio]);

  // Handle mute button separately - only affects volume, not initial play
  useEffect(() => {
    if (audioRef.current) {
      if (musicEnabled) {
        audioRef.current.muted = false;
        console.log('Audio unmuted');
      } else {
        audioRef.current.muted = true;
        console.log('Audio muted');
      }
    }
  }, [musicEnabled]);

  const handleSkip = () => {
    // Stop audio when skipping
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsVisible(false);
    setTimeout(onComplete, 500);
  };

  if (!isVisible) {
    return (
      <div className="fixed inset-0 bg-background/95 backdrop-blur-sm transition-opacity duration-500 opacity-0 pointer-events-none z-50" />
    );
  }

  return (
    <div className="fixed top-0 left-0 w-screen h-screen bg-gradient-to-b from-purple-900 via-purple-800 to-black z-[9999] flex items-center justify-center">
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Background Image */}
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: `url('/lovable-uploads/0e02c224-538b-4fae-8bc0-f1ecf86fba2a.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        
        {/* Fallback gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/80 via-green-900/60 to-black/90" />
        
        {/* App Title Overlay */}
        <div className="relative z-10 text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-200 to-green-200 bg-clip-text text-transparent">
            Jesper's Awesome Downloader
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-purple-200">
            + Bella's Witchy TikTok Stealer
          </h2>
          <p className="text-lg text-green-200 mt-4">Made by Pelle (c) 2025</p>
        </div>
        
        {/* Skip button */}
        <button
          onClick={handleSkip}
          className="absolute top-6 right-6 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg backdrop-blur-sm transition-all duration-200 text-sm font-medium z-20"
        >
          Skip
        </button>
        
        {/* Loading indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
          <div className="flex items-center space-x-2 text-white/80">
            <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse delay-100"></div>
            <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse delay-200"></div>
          </div>
          <p className="text-center text-white/80 text-sm mt-2 font-medium">Loading magical powers...</p>
        </div>
      </div>
    </div>
  );
};