-- Drop the old singleton constraint that prevents multiple hosts
DROP INDEX IF EXISTS idx_spotify_host_singleton;