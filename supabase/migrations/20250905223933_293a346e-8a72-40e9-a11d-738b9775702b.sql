-- Create downloads table to store download history
CREATE TABLE public.downloads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  download_url TEXT NOT NULL,
  format TEXT NOT NULL CHECK (format IN ('video', 'audio')),
  quality TEXT,
  file_size BIGINT,
  duration TEXT,
  thumbnail_url TEXT,
  platform TEXT NOT NULL CHECK (platform IN ('youtube', 'tiktok')),
  downloaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.downloads ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since no auth is implemented)
CREATE POLICY "Downloads are viewable by everyone" 
ON public.downloads 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create downloads" 
ON public.downloads 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update downloads" 
ON public.downloads 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete downloads" 
ON public.downloads 
FOR DELETE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_downloads_updated_at
BEFORE UPDATE ON public.downloads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_downloads_downloaded_at ON public.downloads(downloaded_at DESC);
CREATE INDEX idx_downloads_platform ON public.downloads(platform);