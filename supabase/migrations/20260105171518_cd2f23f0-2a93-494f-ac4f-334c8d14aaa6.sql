-- Create queue table for shared party queue
CREATE TABLE public.queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  spotify_track_id TEXT NOT NULL,
  track_title TEXT NOT NULL,
  track_artist TEXT NOT NULL,
  track_album TEXT,
  track_duration_ms INTEGER,
  track_cover_url TEXT,
  added_by TEXT NOT NULL DEFAULT 'Guest',
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS but allow public access (party mode - no auth required)
ALTER TABLE public.queue ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read the queue
CREATE POLICY "Anyone can view the queue" 
ON public.queue 
FOR SELECT 
USING (true);

-- Allow anyone to add to the queue
CREATE POLICY "Anyone can add to queue" 
ON public.queue 
FOR INSERT 
WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_queue_created_at ON public.queue(created_at DESC);
CREATE INDEX idx_queue_spotify_track_id ON public.queue(spotify_track_id);

-- Enable realtime for the queue table
ALTER PUBLICATION supabase_realtime ADD TABLE public.queue;