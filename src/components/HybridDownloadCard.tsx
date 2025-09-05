import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Download, Music, Video, Link as LinkIcon, Loader2, ExternalLink, Key, Shield, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { downloadVideo, triggerDownload, isSupabaseAvailable, type DownloadResult } from "@/utils/hybridDownloadApi";

interface HybridDownloadCardProps {
  onDownload: (url: string, format: string, apiKey?: string) => Promise<void>;
  isLoading?: boolean;
  downloadResult?: DownloadResult | null;
}

export const HybridDownloadCard = ({ onDownload, isLoading = false, downloadResult }: HybridDownloadCardProps) => {
  const [url, setUrl] = useState("");
  const [format, setFormat] = useState("video");
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
      
      const isReady = isSupabaseAvailable();
      setSupabaseReady(isReady);
      
      if (isReady && !supabaseReady) {
        toast({
          title: "Backend Ready!",
          description: "Secure downloads are now available. No API key required.",
        });
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

  const validateUrl = (input: string) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.|m\.)?(youtube\.com\/(watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/).+/;
    return youtubeRegex.test(input);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a YouTube URL",
        variant: "destructive",
      });
      return;
    }

    if (!validateUrl(url)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid YouTube URL",
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

    await onDownload(url, format, apiKey.trim() || undefined);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
      toast({
        title: "URL Pasted",
        description: "Link pasted from clipboard",
      });
    } catch (err) {
      toast({
        title: "Paste Failed",
        description: "Could not access clipboard",
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
          YouTube Downloader
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Download videos and audio from YouTube (including Shorts)
          <br />
          <div className="flex items-center justify-center gap-2 mt-2">
            {supabaseReady ? (
              <div className="flex items-center gap-1 text-green-400">
                <Shield className="w-3 h-3" />
                <span className="text-xs">Secure backend active</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-yellow-400">
                <Key className="w-3 h-3" />
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

          {/* Backend Status */}
          {supabaseReady ? (
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Secure Backend Active</span>
              </div>
              <p className="text-xs text-green-300/70 mt-1">
                Your downloads are processed securely without exposing your API key
              </p>
            </div>
          ) : (
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-400">
                <Key className="w-4 h-4" />
                <span className="text-sm font-medium">Configuring Backend...</span>
              </div>
              <div className="text-xs text-yellow-300/70 mt-1 space-y-1">
                <p>Status: URL {debugInfo?.urlExists ? '✅' : '❌'} | Key {debugInfo?.keyExists ? '✅' : '❌'}</p>
                <p>Last check: {debugInfo?.timestamp}</p>
                {!debugInfo?.urlExists && <p>⏳ Waiting for Supabase environment variables...</p>}
              </div>
            </div>
          )}

          {/* URL Input */}
          <div className="space-y-2">
            <Label htmlFor="url" className="text-sm font-medium">
              YouTube URL (Videos & Shorts)
            </Label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="url"
                type="url"
                placeholder="Paste YouTube URL or Shorts link here..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="pl-10 h-12 bg-secondary/50 border-border/50 focus:border-primary"
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handlePaste}
                className="absolute right-2 top-2 h-8 text-xs"
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
              onValueChange={setFormat}
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

          <Button
            type="submit"
            variant="hero"
            size="lg"
            className="w-full h-12"
            disabled={isLoading || !url.trim() || (!supabaseReady && !apiKey.trim())}
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
          <div className="mt-6 p-4 bg-secondary/30 rounded-lg border border-border/50">
            {downloadResult.success && downloadResult.data ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Download className="w-4 h-4" />
                  Ready to Download
                </div>
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium">{downloadResult.data.title}</p>
                  {downloadResult.data.duration && (
                    <p>Duration: {downloadResult.data.duration}</p>
                  )}
                </div>
                <Button 
                  onClick={() => downloadResult.data && triggerDownload(
                    downloadResult.data.downloadUrl, 
                    `${downloadResult.data.title}.${format === 'audio' ? 'mp3' : 'mp4'}`
                  )}
                  variant="hero"
                  size="sm"
                  className="w-full"
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