import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [playedLaugh, setPlayedLaugh] = useState(false);

  useEffect(() => {
    // Play sinister laugh after a short delay
    const laughTimer = setTimeout(() => {
      if (!playedLaugh) {
        playEvilLaugh();
        setPlayedLaugh(true);
      }
    }, 1000);

    // Hide splash screen after 3 seconds
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 500); // Allow fade out animation
    }, 3000);

    return () => {
      clearTimeout(laughTimer);
      clearTimeout(hideTimer);
    };
  }, [onComplete, playedLaugh]);

  const playEvilLaugh = () => {
    // Create evil laugh using Web Audio API
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create a more sinister laugh sound
      const createLaughTone = (frequency: number, duration: number, delay: number) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime + delay);
        
        // Add vibrato effect for more sinister sound
        oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.8, audioContext.currentTime + delay + duration);
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime + delay);
        gainNode.gain.exponentialRampToValueAtTime(0.3, audioContext.currentTime + delay + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + delay + duration);
        
        oscillator.start(audioContext.currentTime + delay);
        oscillator.stop(audioContext.currentTime + delay + duration);
      };

      // Create multiple tones for a more complex evil laugh
      createLaughTone(150, 0.3, 0);    // Low base tone
      createLaughTone(200, 0.2, 0.1);  // Mid tone
      createLaughTone(180, 0.25, 0.3); // Falling tone
      createLaughTone(160, 0.3, 0.6);  // Final low tone
      
    } catch (error) {
      console.log("Audio not supported in this browser");
    }
  };

  if (!isVisible) return null;

  return (
    <div className={cn(
      "fixed inset-0 z-50 flex items-center justify-center",
      "bg-gradient-to-b from-green-900/90 via-green-800/80 to-black/90",
      "transition-opacity duration-500",
      isVisible ? "opacity-100" : "opacity-0"
    )}>
      {/* Background forest effect */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-70"
        style={{
          backgroundImage: `url('/lovable-uploads/811f3234-7612-49e5-abe6-352960330de9.png')`,
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      />
      
      {/* Dark overlay for better text visibility */}
      <div className="absolute inset-0 bg-black/40" />
      
      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-2xl">
        <div className="space-y-6 animate-pulse">
          <h1 className="text-4xl md:text-6xl font-bold text-red-500 drop-shadow-2xl tracking-wider">
            Jesper's Awesome
          </h1>
          <h2 className="text-3xl md:text-5xl font-bold text-red-400 drop-shadow-2xl">
            Downloader
          </h2>
          <div className="text-6xl md:text-8xl text-red-600 my-8">
            +
          </div>
          <h3 className="text-2xl md:text-4xl font-bold text-red-500 drop-shadow-2xl">
            Bella's Witchy TikTok
          </h3>
          <h4 className="text-2xl md:text-4xl font-bold text-red-400 drop-shadow-2xl">
            Stealer
          </h4>
          
          <div className="mt-12 text-white/80 text-lg md:text-xl">
            Made by Pelle © 2025
          </div>
        </div>
        
        {/* Mystical particles effect */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-green-400 rounded-full animate-ping"
              style={{
                left: `${20 + (i * 15)}%`,
                top: `${30 + (i % 3) * 20}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: '2s'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};