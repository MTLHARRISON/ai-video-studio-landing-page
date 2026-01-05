-- Create table for storing host Spotify tokens
CREATE TABLE public.spotify_host (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Only allow one host at a time (singleton pattern)
CREATE UNIQUE INDEX idx_spotify_host_singleton ON public.spotify_host ((true));

-- Enable RLS
ALTER TABLE public.spotify_host ENABLE ROW LEVEL SECURITY;

-- Allow the edge function to read/write (using service role)
-- No public policies - only edge functions with service role can access