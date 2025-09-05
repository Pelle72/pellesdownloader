import { useState } from "react";
import { DownloadCard } from "@/components/DownloadCard";
import { FeatureGrid } from "@/components/FeatureGrid";
import { useToast } from "@/hooks/use-toast";
import { Youtube, Clock, CheckCircle } from "lucide-react";

const Index = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  const handleDownload = async (url: string, format: string) => {
    setIsDownloading(true);
    
    // Demo simulation - in production this would call your backend API
    toast({
      title: "Demo Mode",
      description: "This is a demo interface. Real downloads require backend integration.",
    });

    // Simulate more realistic download process
    setTimeout(() => {
      toast({
        title: "Processing Video",
        description: "Analyzing video metadata...",
      });
    }, 1000);

    setTimeout(() => {
      setIsDownloading(false);
      toast({
        title: "Demo Complete",
        description: `Demo ${format} processing finished. Integrate with yt-dlp or similar for real downloads.`,
      });
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary-glow/10" />
        <div className="relative container mx-auto px-4 py-12 lg:py-20">
          <div className="text-center mb-12">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow">
              <Youtube className="w-10 h-10 text-primary-foreground" />
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
              Video Downloader
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Download videos and audio from YouTube and TikTok instantly. 
              Fast, secure, and mobile-friendly.
            </p>
          </div>

          {/* Download Card */}
          <div className="mb-16">
            <DownloadCard onDownload={handleDownload} isLoading={isDownloading} />
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-16">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-gradient-primary rounded-full flex items-center justify-center">
                <Youtube className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="text-2xl font-bold text-foreground">500K+</div>
              <div className="text-sm text-muted-foreground">Videos Downloaded</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-gradient-primary rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="text-2xl font-bold text-foreground">&lt; 30s</div>
              <div className="text-sm text-muted-foreground">Average Process Time</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-gradient-primary rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="text-2xl font-bold text-foreground">99.9%</div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-foreground">
            Powerful Features
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to download and convert videos from your favorite platforms
          </p>
        </div>
        <FeatureGrid />
      </div>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              © 2024 Video Downloader. Fast, secure, and reliable downloads.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
