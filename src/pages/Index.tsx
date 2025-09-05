import { useState } from "react";
import { Button } from "@/components/ui/button";
import { HybridDownloadCard } from "@/components/HybridDownloadCard";
import { FileManager } from "@/components/FileManager";
import { useToast } from "@/hooks/use-toast";
import { downloadVideo } from "@/utils/hybridDownloadApi";
import { supabase } from "@/integrations/supabase/client";
import { Youtube, History } from "lucide-react";

const Index = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadResult, setDownloadResult] = useState(null);
  const [showFileManager, setShowFileManager] = useState(false);
  const { toast } = useToast();

  const handleDownload = async (url: string, format: string, apiKey?: string, quality?: string) => {
    setIsDownloading(true);
    setDownloadResult(null);
    
    try {
      toast({
        title: "Processing Video",
        description: "Fetching video information...",
      });

      const result = await downloadVideo(url, format as 'video' | 'audio', apiKey, quality);
      
      if (result.success && result.data) {
        // Save to download history
        try {
          const platform = url.includes('tiktok') ? 'tiktok' : 'youtube';
          await supabase.from('downloads').insert({
            title: result.data.title,
            url: url,
            download_url: result.data.downloadUrl,
            format: format,
            quality: quality,
            duration: result.data.duration,
            platform: platform,
          });
        } catch (dbError) {
          console.error('Error saving to history:', dbError);
          // Don't show error to user, just log it
        }

        toast({
          title: "Download Ready!",
          description: `${result.data.title} is ready to download`,
        });
        setDownloadResult(result);
      } else {
        toast({
          title: "Download Failed", 
          description: result.error || "Could not process the video",
          variant: "destructive",
        });
        setDownloadResult(result);
      }
    } catch (error) {
      console.error('Download error:', error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      setDownloadResult({ success: false, error: errorMessage });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground"
         style={{ backgroundColor: '#0f0f23', color: '#ffffff' }}>
      {/* Debug element */}
      <div className="p-4 text-white bg-red-500">DEBUG: App is loading</div>
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

          {/* History Button */}
          <div className="mb-8">
            <Button
              variant="outline"
              onClick={() => setShowFileManager(true)}
              className="flex items-center gap-2"
            >
              <History className="w-4 h-4" />
              History
            </Button>
          </div>

          {/* Download Card */}
          <div className="mb-16">
            <HybridDownloadCard onDownload={handleDownload} isLoading={isDownloading} downloadResult={downloadResult} />
          </div>
        </div>
      </div>

      {/* File Manager */}
      <FileManager 
        isOpen={showFileManager} 
        onClose={() => setShowFileManager(false)} 
      />
    </div>
  );
};

export default Index;
