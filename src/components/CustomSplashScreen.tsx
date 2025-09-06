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
    <div className="fixed inset-0 bg-gradient-to-b from-background via-background/95 to-background z-50 flex items-center justify-center">
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Background Image */}
        <img 
          src="/lovable-uploads/0e02c224-538b-4fae-8bc0-f1ecf86fba2a.png"
          alt="Mystical Forest Splash Screen"
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => {
            // Fallback to a dark gradient if image fails to load
            e.currentTarget.style.display = 'none';
          }}
        />
        
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/30" />
        
        {/* Skip button */}
        <button
          onClick={handleSkip}
          className="absolute top-6 right-6 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg backdrop-blur-sm transition-all duration-200 text-sm font-medium"
        >
          Skip
        </button>
        
        {/* Loading indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="flex items-center space-x-2 text-white/80">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-100"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-200"></div>
          </div>
          <p className="text-center text-white/60 text-sm mt-2">Loading...</p>
        </div>
      </div>
    </div>
  );
};