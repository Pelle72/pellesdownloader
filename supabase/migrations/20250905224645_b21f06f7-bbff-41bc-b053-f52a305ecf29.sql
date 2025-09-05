-- Drop existing overly permissive RLS policies
DROP POLICY IF EXISTS "Downloads are viewable by everyone" ON public.downloads;
DROP POLICY IF EXISTS "Anyone can create downloads" ON public.downloads;
DROP POLICY IF EXISTS "Anyone can update downloads" ON public.downloads;
DROP POLICY IF EXISTS "Anyone can delete downloads" ON public.downloads;

-- Create secure RLS policies that protect user privacy
-- Users can only view their own downloads
CREATE POLICY "Users can view their own downloads" 
ON public.downloads 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Users can only create downloads for themselves
CREATE POLICY "Users can create their own downloads" 
ON public.downloads 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can only update their own downloads
CREATE POLICY "Users can update their own downloads" 
ON public.downloads 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own downloads
CREATE POLICY "Users can delete their own downloads" 
ON public.downloads 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- Make user_id column non-nullable to enforce data integrity
ALTER TABLE public.downloads ALTER COLUMN user_id SET NOT NULL;