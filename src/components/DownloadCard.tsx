import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Download, Music, Video, Link as LinkIcon, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DownloadCardProps {
  onDownload: (url: string, format: string) => void;
  isLoading?: boolean;
}

export const DownloadCard = ({ onDownload, isLoading = false }: DownloadCardProps) => {
  const [url, setUrl] = useState("");
  const [format, setFormat] = useState("video");
  const { toast } = useToast();

  const validateUrl = (input: string) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    const tiktokRegex = /^(https?:\/\/)?(www\.)?(tiktok\.com|vm\.tiktok\.com)\/.+/;
    return youtubeRegex.test(input) || tiktokRegex.test(input);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a YouTube or TikTok URL",
        variant: "destructive",
      });
      return;
    }

    if (!validateUrl(url)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid YouTube or TikTok URL",
        variant: "destructive",
      });
      return;
    }

    onDownload(url, format);
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
          Video Downloader
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Download videos from YouTube and TikTok
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="url" className="text-sm font-medium">
              Video URL
            </Label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="url"
                type="url"
                placeholder="Paste YouTube or TikTok URL here..."
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
            disabled={isLoading || !url.trim()}
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
      </CardContent>
    </Card>
  );
};