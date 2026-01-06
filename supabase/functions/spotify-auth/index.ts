import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// In-memory storage for Spotify host tokens (keyed by room_id)
interface SpotifyHost {
  access_token: string;
  refresh_token: string;
  expires_at: Date;
  updated_at: Date;
}

const spotifyHosts = new Map<string, SpotifyHost>();

// Clean up expired tokens periodically
setInterval(() => {
  const now = new Date();
  for (const [roomId, host] of spotifyHosts.entries()) {
    // Remove if token expired more than 1 hour ago (giving buffer for refresh)
    if (host.expires_at.getTime() < now.getTime() - 3600000) {
      spotifyHosts.delete(roomId);
    }
  }
}, 60000);

// Export for use by spotify function
export function getSpotifyHost(roomId: string): SpotifyHost | null {
  return spotifyHosts.get(roomId) || null;
}

export function setSpotifyHost(roomId: string, host: SpotifyHost): void {
  spotifyHosts.set(roomId, host);
}

export function deleteSpotifyHost(roomId: string): void {
  spotifyHosts.delete(roomId);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const action = url.searchParams.get('action');
  const roomId = url.searchParams.get('room_id');

  const clientId = Deno.env.get('SPOTIFY_CLIENT_ID');
  const clientSecret = Deno.env.get('SPOTIFY_CLIENT_SECRET');

  try {
    // Generate auth URL for host to login
    if (action === 'get-auth-url') {
      const redirectUri = url.searchParams.get('redirect_uri');
      if (!redirectUri || !roomId) {
        return new Response(
          JSON.stringify({ error: 'redirect_uri and room_id required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const scopes = 'user-modify-playback-state user-read-playback-state user-read-currently-playing';
      // Use room_id as state to pass back after auth
      const state = roomId;
      
      const authUrl = `https://accounts.spotify.com/authorize?` +
        `client_id=${clientId}` +
        `&response_type=code` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&scope=${encodeURIComponent(scopes)}` +
        `&state=${state}`;

      console.log('Generated auth URL for host login, room:', roomId);

      return new Response(
        JSON.stringify({ authUrl, state }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Exchange code for tokens
    if (action === 'exchange-code') {
      const { code, redirect_uri, room_id } = await req.json();
      
      if (!code || !redirect_uri || !room_id) {
        return new Response(
          JSON.stringify({ error: 'code, redirect_uri, and room_id required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Exchanging code for tokens, room:', room_id);

      const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + btoa(`${clientId}:${clientSecret}`),
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri,
        }),
      });

      if (!tokenResponse.ok) {
        const error = await tokenResponse.text();
        console.error('Token exchange error:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to exchange code' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const tokens = await tokenResponse.json();

      console.log('Host authenticated successfully for room:', room_id);

      // Return tokens to client so it can store them via spotify function
      return new Response(
        JSON.stringify({ 
          success: true,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_in: tokens.expires_in,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if host is connected - delegate to spotify function
    if (action === 'check-status') {
      // This is now handled by the spotify function
      return new Response(
        JSON.stringify({ connected: false, message: 'Use spotify function check-host action' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Disconnect host for a specific room
    if (action === 'disconnect') {
      if (!roomId) {
        return new Response(
          JSON.stringify({ error: 'room_id required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      spotifyHosts.delete(roomId);
      
      console.log('Host disconnected for room:', roomId);

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Spotify auth error:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
