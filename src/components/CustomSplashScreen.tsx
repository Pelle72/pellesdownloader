import React, { useEffect, useState } from 'react';
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
  const { musicEnabled } = useSettings();

  useEffect(() => {
    // Play intro sound if provided and music is enabled
    if (audioUrl && !audioPlayed && musicEnabled) {
      const audio = new Audio(audioUrl);
      audio.volume = 0.5; // Set volume to 50%
      
      // Try to play audio (user interaction might be required)
      audio.play().catch((error) => {
        console.log('Audio autoplay blocked:', error);
        // Audio will play on first user interaction
      });
      
      setAudioPlayed(true);
    }

    // Auto-hide splash screen after 3 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 500); // Allow fade out animation
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete, audioUrl, audioPlayed, musicEnabled]);

  const handleSkip = () => {
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