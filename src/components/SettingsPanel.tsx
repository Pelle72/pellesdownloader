import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';

export const SettingsPanel: React.FC = () => {
  const { theme, setTheme } = useTheme();

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
    </div>
  );
};