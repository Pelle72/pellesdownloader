import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Download, Music, Video, Link, Loader2, ExternalLink, Key, Shield, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { downloadVideo, triggerDownload, isSupabaseAvailable, type DownloadResult } from "@/utils/hybridDownloadApi";

interface HybridDownloadCardProps {
  onDownload: (url: string, format: string, apiKey?: string, quality?: string) => Promise<void>;
  isLoading?: boolean;
  downloadResult?: DownloadResult | null;
}

export const HybridDownloadCard = ({ onDownload, isLoading = false, downloadResult }: HybridDownloadCardProps) => {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [tiktokUrl, setTiktokUrl] = useState("");
  const [format, setFormat] = useState<"video" | "audio">("video");
  const [quality, setQuality] = useState("best");
  const [apiKey, setApiKey] = useState("");
  const [supabaseReady, setSupabaseReady] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check Supabase availability every 5 seconds
    const checkSupabase = () => {
      // Get environment info for debugging
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      
      const debug = {
        urlExists: !!supabaseUrl,
        keyExists: !!supabaseKey,
        urlPreview: supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'Not found',
        keyLength: supabaseKey ? supabaseKey.length : 0,
        timestamp: new Date().toLocaleTimeString()
      };
      
      setDebugInfo(debug);
      const available = isSupabaseAvailable();
      
      if (available !== supabaseReady) {
        setSupabaseReady(available);
        if (available) {
          toast({
            title: "Backend Ready",
            description: "Secure downloads are now available!",
          });
        }
      }
    };

    checkSupabase();
    const interval = setInterval(checkSupabase, 5000);
    
    return () => clearInterval(interval);
  }, [supabaseReady, toast]);

  // Load saved API key from localStorage
  useEffect(() => {
    const savedKey = localStorage.getItem('rapidapi_key');
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  const validateYouTubeUrl = (input: string) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.|m\.)?(youtube\.com\/(watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/).+/;
    return youtubeRegex.test(input);
  };

  const validateTikTokUrl = (input: string) => {
    const tiktokRegex = /tiktok/i;
    return tiktokRegex.test(input);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check which URL is provided
    const finalUrl = youtubeUrl.trim() || tiktokUrl.trim();
    
    if (!finalUrl) {
      toast({
        title: "URL Required",
        description: "Please enter either a YouTube or TikTok URL",
        variant: "destructive",
      });
      return;
    }

    // Validate the appropriate URL
    if (youtubeUrl.trim() && !validateYouTubeUrl(youtubeUrl)) {
      toast({
        title: "Invalid YouTube URL",
        description: "Please enter a valid YouTube URL",
        variant: "destructive",
      });
      return;
    }

    if (tiktokUrl.trim() && !validateTikTokUrl(tiktokUrl)) {
      toast({
        title: "Invalid TikTok URL", 
        description: "Please enter a valid TikTok URL",
        variant: "destructive",
      });
      return;
    }

    // If Supabase is ready, we don't need API key
    if (!supabaseReady && !apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your RapidAPI key or wait for backend to be ready",
        variant: "destructive",
      });
      return;
    }

    // Save API key to localStorage for convenience
    if (apiKey.trim()) {
      localStorage.setItem('rapidapi_key', apiKey);
    }

    await onDownload(finalUrl, format, undefined, quality);
  };

  const handleYouTubePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setYoutubeUrl(text);
      setTiktokUrl(""); // Clear the other field
      toast({
        title: "YouTube URL Pasted",
        description: "Link pasted from clipboard",
      });
    } catch (err) {
      toast({
        title: "Paste Error",
        description: "Could not paste from clipboard",
        variant: "destructive",
      });
    }
  };

  const handleTikTokPaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setTiktokUrl(text);
      setYoutubeUrl(""); // Clear the other field
      toast({
        title: "TikTok URL Pasted",
        description: "Link pasted from clipboard",
      });
    } catch (err) {
      toast({
        title: "Paste Error",
        description: "Could not paste from clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-gradient-card border-border/50 shadow-card">
      <CardHeader className="text-center pb-6">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-primary rounded-full flex items-center justify-center shadow-glow">
          <Download className="w-8 h-8 text-primary-foreground" />
        </div>
        <CardTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Pelle's YouTube and TikTok grabber
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Download videos and audio from YouTube and TikTok (including Shorts)
          <br />
          <div className="flex items-center justify-center gap-2 mt-2">
            {supabaseReady ? (
              <div className="flex items-center gap-1 text-green-400">
                <Shield className="w-3 h-3" />
                <span className="text-xs">Secure backend active</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-yellow-400">
                <span className="text-xs">API key required</span>
              </div>
            )}
          </div>
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* API Key Input - only show if Supabase is not ready */}
          {!supabaseReady && (
            <div className="space-y-2">
              <Label htmlFor="apiKey" className="text-sm font-medium">
                RapidAPI Key
              </Label>
              <div className="relative">
                <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="Enter your RapidAPI key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="pl-10 h-12 bg-secondary/50 border-border/50 focus:border-primary"
                  disabled={isLoading}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Get your key from <a href="https://rapidapi.com/ytjar/api/yt-api" target="_blank" className="text-primary hover:underline">YT-API on RapidAPI</a>
              </p>
            </div>
          )}

          {/* YouTube URL Input */}
          <div className="space-y-2">
            <Label htmlFor="youtubeUrl" className="text-sm font-medium">
              YouTube URL
            </Label>
            <div className="relative">
              <Link className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="youtubeUrl"
                type="url"
                placeholder="Paste YouTube link here"
                value={youtubeUrl}
                onChange={(e) => {
                  setYoutubeUrl(e.target.value);
                  if (e.target.value) setTiktokUrl(""); // Clear TikTok field
                }}
                className="pl-10 h-12 bg-secondary/50 border-border/50 focus:border-primary"
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-2 h-8 px-2"
                onClick={handleYouTubePaste}
                disabled={isLoading}
              >
                Paste
              </Button>
            </div>
          </div>

          {/* TikTok URL Input */}
          <div className="space-y-2">
            <Label htmlFor="tiktokUrl" className="text-sm font-medium">
              TikTok URL
            </Label>
            <div className="relative">
              <Music className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="tiktokUrl"
                type="url"
                placeholder="Paste TikTok link here"
                value={tiktokUrl}
                onChange={(e) => {
                  setTiktokUrl(e.target.value);
                  if (e.target.value) setYoutubeUrl(""); // Clear YouTube field
                }}
                className="pl-10 h-12 bg-secondary/50 border-border/50 focus:border-primary"
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-2 h-8 px-2"
                onClick={handleTikTokPaste}
                disabled={isLoading}
              >
                Paste
              </Button>
            </div>
          </div>

          {/* Format Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Download Format</Label>
            <RadioGroup
              value={format}
              onValueChange={(value) => setFormat(value as "video" | "audio")}
              className="grid grid-cols-2 gap-4"
              disabled={isLoading}
            >
              <div className="flex items-center space-x-2 bg-secondary/30 p-4 rounded-lg border border-border/50 hover:bg-secondary/50 transition-colors">
                <RadioGroupItem value="video" id="video" />
                <Label htmlFor="video" className="flex items-center gap-2 cursor-pointer">
                  <Video className="w-4 h-4" />
                  Video
                </Label>
              </div>
              <div className="flex items-center space-x-2 bg-secondary/30 p-4 rounded-lg border border-border/50 hover:bg-secondary/50 transition-colors">
                <RadioGroupItem value="audio" id="audio" />
                <Label htmlFor="audio" className="flex items-center gap-2 cursor-pointer">
                  <Music className="w-4 h-4" />
                  Audio (MP3)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Quality Selection (only for video) */}
          {format === "video" && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Video Quality</Label>
              <RadioGroup
                value={quality}
                onValueChange={setQuality}
                className="grid grid-cols-2 gap-3"
                disabled={isLoading}
              >
                <div className="flex items-center space-x-2 bg-secondary/30 p-3 rounded-lg border border-border/50 hover:bg-secondary/50 transition-colors">
                  <RadioGroupItem value="best" id="best" />
                  <Label htmlFor="best" className="cursor-pointer text-xs">Best Available</Label>
                </div>
                <div className="flex items-center space-x-2 bg-secondary/30 p-3 rounded-lg border border-border/50 hover:bg-secondary/50 transition-colors">
                  <RadioGroupItem value="2160p" id="2160p" />
                  <Label htmlFor="2160p" className="cursor-pointer text-xs">4K (2160p)</Label>
                </div>
                <div className="flex items-center space-x-2 bg-secondary/30 p-3 rounded-lg border border-border/50 hover:bg-secondary/50 transition-colors">
                  <RadioGroupItem value="1080p" id="1080p" />
                  <Label htmlFor="1080p" className="cursor-pointer text-xs">Full HD (1080p)</Label>
                </div>
                <div className="flex items-center space-x-2 bg-secondary/30 p-3 rounded-lg border border-border/50 hover:bg-secondary/50 transition-colors">
                  <RadioGroupItem value="720p" id="720p" />
                  <Label htmlFor="720p" className="cursor-pointer text-xs">HD (720p)</Label>
                </div>
              </RadioGroup>
            </div>
          )}

          <Button
            type="submit"
            variant="hero"
            size="lg"
            className="w-full h-12"
            disabled={isLoading || (!youtubeUrl.trim() && !tiktokUrl.trim()) || (!supabaseReady && !apiKey.trim())}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Download {format === "audio" ? "Audio" : "Video"}
              </>
            )}
          </Button>
        </form>

        {/* Download Result */}
        {downloadResult && (
          <div className="mt-6 p-4 bg-secondary/50 rounded-lg border border-border/50">
            {downloadResult.success && downloadResult.data ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Ready to Download!</span>
                </div>
                <div className="text-sm">
                  <p className="font-medium">{downloadResult.data.title}</p>
                  {downloadResult.data.duration && (
                    <p className="text-muted-foreground">Duration: {downloadResult.data.duration}</p>
                  )}
                </div>
                <Button
                  onClick={() => triggerDownload(downloadResult.data!.downloadUrl, downloadResult.data!.title)}
                  className="w-full"
                  variant="default"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Download File
                </Button>
              </div>
            ) : (
              <div className="text-sm text-destructive">
                ❌ {downloadResult.error || 'Download failed'}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};