import React, { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { CustomSplashScreen } from "./components/CustomSplashScreen";
import { SettingsProvider } from "./contexts/SettingsContext";
import { SettingsPanel } from "./components/SettingsPanel";

const queryClient = new QueryClient();

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);

  // Register service worker for PWA
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then(() => console.log('SW registered'))
          .catch(() => console.log('SW registration failed'));
      });
    }
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <SettingsProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            {showSplash && (
              <CustomSplashScreen 
                onComplete={() => setShowSplash(false)}
                audioUrl="/intro-sound.mp3"
              />
            )}
            <SettingsPanel />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
            <Toaster />
            <Sonner />
          </TooltipProvider>
        </QueryClientProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
};

export default App;
