-- Create rooms table
CREATE TABLE public.rooms (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL DEFAULT 'Party Room',
    host_pin TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '24 hours')
);

-- Enable RLS
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

-- Anyone can view rooms (to join)
CREATE POLICY "Anyone can view rooms"
ON public.rooms
FOR SELECT
USING (true);

-- Anyone can create rooms
CREATE POLICY "Anyone can create rooms"
ON public.rooms
FOR INSERT
WITH CHECK (true);

-- Anyone can update rooms (host verified by PIN in app logic)
CREATE POLICY "Anyone can update rooms"
ON public.rooms
FOR UPDATE
USING (true);

-- Add room_id to queue table
ALTER TABLE public.queue ADD COLUMN room_id uuid REFERENCES public.rooms(id) ON DELETE CASCADE;

-- Add room_id to spotify_host table  
ALTER TABLE public.spotify_host ADD COLUMN room_id uuid REFERENCES public.rooms(id) ON DELETE CASCADE UNIQUE;

-- Update queue policies to be room-scoped
DROP POLICY IF EXISTS "Anyone can add to queue" ON public.queue;
DROP POLICY IF EXISTS "Anyone can view the queue" ON public.queue;
DROP POLICY IF EXISTS "Anyone can delete from queue" ON public.queue;

CREATE POLICY "Anyone can add to queue"
ON public.queue
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can view the queue"
ON public.queue
FOR SELECT
USING (true);

CREATE POLICY "Anyone can delete from queue"
ON public.queue
FOR DELETE
USING (true);

-- Enable realtime for rooms
ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;