import React from 'react';
import { Moon, Sun, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { useSettings } from '@/contexts/SettingsContext';

export const SettingsPanel: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { musicEnabled, setMusicEnabled } = useSettings();

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
        onClick={() => setMusicEnabled(!musicEnabled)}
        className="bg-background/80 backdrop-blur-sm border-border/50"
      >
        {musicEnabled ? (
          <Volume2 className="h-4 w-4" />
        ) : (
          <VolumeX className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};