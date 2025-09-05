import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Download, Share, Trash2, ExternalLink, FileVideo, Music, Calendar, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Download {
  id: string;
  title: string;
  url: string;
  download_url: string;
  format: string;
  quality?: string;
  file_size?: number;
  duration?: string;
  platform: string;
  downloaded_at: string;
}

interface FileManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FileManager = ({ isOpen, onClose }: FileManagerProps) => {
  const [downloads, setDownloads] = useState<Download[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchDownloads();
    }
  }, [isOpen]);

  const fetchDownloads = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('downloads')
        .select('*')
        .order('downloaded_at', { ascending: false });

      if (error) throw error;
      setDownloads(data || []);
    } catch (error) {
      console.error('Error fetching downloads:', error);
      toast({
        title: "Error",
        description: "Failed to load download history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('downloads')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setDownloads(downloads.filter(d => d.id !== id));
      toast({
        title: "Deleted",
        description: "Download removed from history",
      });
    } catch (error) {
      console.error('Error deleting download:', error);
      toast({
        title: "Error",
        description: "Failed to delete download",
        variant: "destructive",
      });
    }
  };

  const handleShare = async (download: Download) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: download.title,
          text: `Check out this ${download.format}: ${download.title}`,
          url: download.download_url,
        });
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(download.download_url);
        toast({
          title: "Copied to clipboard",
          description: "Download link copied to clipboard",
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast({
        title: "Share failed",
        description: "Could not share the download",
        variant: "destructive",
      });
    }
  };

  const handleDownload = (download: Download) => {
    // Trigger download
    const link = document.createElement('a');
    link.href = download.download_url;
    link.download = download.title;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const clearAllHistory = async () => {
    try {
      const { error } = await supabase
        .from('downloads')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

      if (error) throw error;

      setDownloads([]);
      toast({
        title: "History cleared",
        description: "All download history has been cleared",
      });
    } catch (error) {
      console.error('Error clearing history:', error);
      toast({
        title: "Error",
        description: "Failed to clear history",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Download History</DialogTitle>
          <DialogDescription>
            Manage your downloaded files - share, re-download, or delete them.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Header actions */}
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {downloads.length} downloads in history
            </p>
            {downloads.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={clearAllHistory}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>

          {/* Loading state */}
          {loading && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading download history...</p>
            </div>
          )}

          {/* Empty state */}
          {!loading && downloads.length === 0 && (
            <div className="text-center py-8">
              <FileVideo className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No downloads yet</p>
              <p className="text-sm text-muted-foreground">
                Start downloading videos to see them here
              </p>
            </div>
          )}

          {/* Downloads list */}
          <div className="grid gap-4">
            {downloads.map((download) => (
              <Card key={download.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base line-clamp-2">
                        {download.title}
                      </CardTitle>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          {download.format === 'video' ? (
                            <FileVideo className="w-4 h-4" />
                          ) : (
                            <Music className="w-4 h-4" />
                          )}
                          <span className="capitalize">{download.format}</span>
                          {download.quality && <span>({download.quality})</span>}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDistanceToNow(new Date(download.downloaded_at), { addSuffix: true })}</span>
                        </div>
                        {download.duration && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{download.duration}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(download)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleShare(download)}
                      >
                        <Share className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(download.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4 text-muted-foreground">
                      <span className="capitalize">{download.platform}</span>
                      {download.file_size && (
                        <span>{formatFileSize(download.file_size)}</span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(download.url, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Original
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};