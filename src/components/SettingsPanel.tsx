import React from 'react';
import { Moon, Sun, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { useSpookyMusic } from '@/contexts/SpookyMusicContext';

export const SettingsPanel: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { isMuted, toggleMute, isPlaying } = useSpookyMusic();

  return (
    <div className="fixed top-4 right-4 z-40 flex gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="bg-background/80 backdrop-blur-sm border-border/50"
      >
        {theme === 'dark' ? (
          <Sun className="h-4 w-4" />
        ) : (
          <Moon className="h-4 w-4" />
        )}
      </Button>
      
      <Button
        variant="outline"
        size="icon"
        onClick={toggleMute}
        className="bg-background/80 backdrop-blur-sm border-border/50 hover:bg-accent relative"
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
    </div>
  );
};