import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// In-memory storage for Spotify host tokens (shared with spotify-auth)
interface SpotifyHost {
  access_token: string;
  refresh_token: string;
  expires_at: Date;
  updated_at: Date;
}

const spotifyHosts = new Map<string, SpotifyHost>();

// Token cache for client credentials (search only)
let clientAccessToken: string | null = null;
let clientTokenExpiry: number = 0;

async function getClientAccessToken(): Promise<string> {
  const now = Date.now();
  
  if (clientAccessToken && clientTokenExpiry > now + 300000) {
    return clientAccessToken;
  }

  const clientId = Deno.env.get('SPOTIFY_CLIENT_ID');
  const clientSecret = Deno.env.get('SPOTIFY_CLIENT_SECRET');

  if (!clientId || !clientSecret) {
    throw new Error('Spotify credentials not configured');
  }

  console.log('Fetching new Spotify client access token...');

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + btoa(`${clientId}:${clientSecret}`),
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Spotify token error:', error);
    throw new Error('Failed to get Spotify access token');
  }

  const data = await response.json();
  clientAccessToken = data.access_token;
  clientTokenExpiry = now + (data.expires_in * 1000);

  return clientAccessToken!;
}

async function getHostToken(roomId: string): Promise<string | null> {
  const clientId = Deno.env.get('SPOTIFY_CLIENT_ID');
  const clientSecret = Deno.env.get('SPOTIFY_CLIENT_SECRET');

  const host = spotifyHosts.get(roomId);

  if (!host) {
    console.log('No host found for room:', roomId);
    return null;
  }

  const now = new Date();

  // If token is still valid (with 5 min buffer)
  if (host.expires_at.getTime() > now.getTime() + 300000) {
    return host.access_token;
  }

  // Refresh the token
  console.log('Refreshing host token for room:', roomId);

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + btoa(`${clientId}:${clientSecret}`),
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: host.refresh_token,
    }),
  });

  if (!response.ok) {
    console.error('Failed to refresh token, host needs to re-authenticate');
    spotifyHosts.delete(roomId);
    return null;
  }

  const tokens = await response.json();
  const newExpiresAt = new Date(Date.now() + tokens.expires_in * 1000);

  spotifyHosts.set(roomId, {
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token || host.refresh_token,
    expires_at: newExpiresAt,
    updated_at: new Date(),
  });

  console.log('Host token refreshed successfully');
  return tokens.access_token;
}

// Export for spotify-auth to use
export function setSpotifyHost(roomId: string, host: SpotifyHost): void {
  spotifyHosts.set(roomId, host);
}

export function deleteSpotifyHost(roomId: string): void {
  spotifyHosts.delete(roomId);
}

export function hasSpotifyHost(roomId: string): boolean {
  const host = spotifyHosts.get(roomId);
  return !!host && host.expires_at > new Date();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');
    const roomId = url.searchParams.get('room_id');

    // Store host token (called from spotify-auth)
    if (action === 'store-host') {
      const { room_id, access_token, refresh_token, expires_in } = await req.json();
      
      if (!room_id || !access_token || !refresh_token) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      spotifyHosts.set(room_id, {
        access_token,
        refresh_token,
        expires_at: new Date(Date.now() + expires_in * 1000),
        updated_at: new Date(),
      });

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check host status
    if (action === 'check-host') {
      if (!roomId) {
        return new Response(
          JSON.stringify({ connected: false }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const connected = hasSpotifyHost(roomId);
      return new Response(
        JSON.stringify({ connected }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Disconnect host
    if (action === 'disconnect-host') {
      const { room_id } = await req.json();
      if (room_id) {
        spotifyHosts.delete(room_id);
      }
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Search tracks
    if (action === 'search') {
      const query = url.searchParams.get('q');
      
      if (!query) {
        return new Response(
          JSON.stringify({ error: 'Search query required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const token = await getClientAccessToken();
      
      console.log(`Searching Spotify for: ${query}`);

      const searchResponse = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!searchResponse.ok) {
        const error = await searchResponse.text();
        console.error('Spotify search error:', error);
        throw new Error('Spotify search failed');
      }

      const searchData = await searchResponse.json();
      
      const tracks = searchData.tracks.items.map((track: any) => ({
        id: track.id,
        uri: track.uri,
        title: track.name,
        artist: track.artists.map((a: any) => a.name).join(', '),
        album: track.album.name,
        duration: track.duration_ms,
        durationFormatted: formatDuration(track.duration_ms),
        cover: track.album.images[0]?.url || null,
      }));

      // Check if host is connected for this room
      let hostConnected = false;
      if (roomId) {
        hostConnected = hasSpotifyHost(roomId);
      }

      console.log(`Found ${tracks.length} tracks, host connected: ${hostConnected}`);

      return new Response(
        JSON.stringify({ tracks, hostConnected }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get now playing for a room
    if (action === 'now-playing') {
      if (!roomId) {
        return new Response(
          JSON.stringify({ error: 'room_id required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const hostToken = await getHostToken(roomId);
      
      if (!hostToken) {
        return new Response(
          JSON.stringify({ hostConnected: false, nowPlaying: null }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const playerResponse = await fetch(
        'https://api.spotify.com/v1/me/player/currently-playing',
        {
          headers: { 'Authorization': `Bearer ${hostToken}` },
        }
      );

      if (playerResponse.status === 204 || !playerResponse.ok) {
        return new Response(
          JSON.stringify({ hostConnected: true, nowPlaying: null }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const playerData = await playerResponse.json();
      
      if (!playerData.item) {
        return new Response(
          JSON.stringify({ hostConnected: true, nowPlaying: null }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const nowPlaying = {
        track_id: playerData.item.id,
        title: playerData.item.name,
        artist: playerData.item.artists.map((a: any) => a.name).join(', '),
        album: playerData.item.album.name,
        cover: playerData.item.album.images[0]?.url || null,
        progress_ms: playerData.progress_ms,
        duration_ms: playerData.item.duration_ms,
        is_playing: playerData.is_playing,
      };

      return new Response(
        JSON.stringify({ hostConnected: true, nowPlaying }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Add to Spotify queue only (no database)
    if (action === 'add-to-queue') {
      const { roomId, trackUri, trackTitle } = await req.json();

      if (!roomId || !trackUri) {
        return new Response(
          JSON.stringify({ error: 'roomId and trackUri required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Try to add to Spotify queue
      const hostToken = await getHostToken(roomId);
      
      if (!hostToken) {
        console.log('No host connected, cannot add to Spotify queue');
        return new Response(
          JSON.stringify({ success: false, addedToSpotify: false, message: 'Host not connected' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`Adding to Spotify queue: ${trackTitle}`);

      const queueResponse = await fetch(
        `https://api.spotify.com/v1/me/player/queue?uri=${encodeURIComponent(trackUri)}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${hostToken}`,
          },
        }
      );

      if (!queueResponse.ok) {
        const error = await queueResponse.text();
        console.error('Spotify queue error:', error);
        
        if (queueResponse.status === 404) {
          return new Response(
            JSON.stringify({ success: false, addedToSpotify: false, message: 'No active Spotify device' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        return new Response(
          JSON.stringify({ success: false, addedToSpotify: false, message: 'Spotify error' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`Successfully added "${trackTitle}" to Spotify queue!`);

      return new Response(
        JSON.stringify({ success: true, addedToSpotify: true, message: 'Added to Spotify queue!' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Spotify API error:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
