-- Drop the singleton index that prevents multiple rooms from having hosts
-- The room_id UNIQUE constraint is sufficient to ensure one host per room
DROP INDEX IF EXISTS public.idx_spotify_host_singleton;

-- Ensure RLS allows service role to insert/update/delete
-- Service role bypasses RLS, but let's make sure there are no conflicting policies
