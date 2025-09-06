import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSpookyMusic } from '@/contexts/SpookyMusicContext';

export const SpookyMusicToggle: React.FC = () => {
  const { isMuted, toggleMute, isPlaying } = useSpookyMusic();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleMute}
      className="fixed bottom-4 right-4 z-40 bg-background/80 backdrop-blur-sm border-border/50 hover:bg-accent"
      title={isMuted ? 'Unmute spooky music' : 'Mute spooky music'}
    >
      {isMuted ? (
        <VolumeX className="h-4 w-4" />
      ) : (
        <Volume2 className="h-4 w-4" />
      )}
      {isPlaying && !isMuted && (
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
      )}
    </Button>
  );
};