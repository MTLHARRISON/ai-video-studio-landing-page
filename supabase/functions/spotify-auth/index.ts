import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// In-memory storage for Spotify host tokens
interface HostToken {
  access_token: string;
  refresh_token: string;
  expires_at: Date;
}

const hostTokens = new Map<string, HostToken>();

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const action = url.searchParams.get('action');
  const roomId = url.searchParams.get('room_id');

  const clientId = Deno.env.get('SPOTIFY_CLIENT_ID');
  const clientSecret = Deno.env.get('SPOTIFY_CLIENT_SECRET');

  // Validate Spotify credentials
  if (!clientId || !clientSecret) {
    console.error('Spotify credentials not configured');
    return new Response(
      JSON.stringify({ error: 'Spotify credentials not configured. Please set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET environment variables.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

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
        const errorText = await tokenResponse.text();
        console.error('Token exchange error:', errorText);
        let errorMessage = 'Failed to exchange code for tokens';
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error_description || errorJson.error || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        return new Response(
          JSON.stringify({ error: errorMessage, details: errorText }),
          { status: tokenResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const tokens = await tokenResponse.json();
      const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

      // Store tokens in memory
      hostTokens.set(room_id, {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: expiresAt,
      });

      console.log('Host authenticated successfully for room:', room_id);

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if host is connected for a specific room
    if (action === 'check-status') {
      if (!roomId) {
        return new Response(
          JSON.stringify({ connected: false }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const host = hostTokens.get(roomId);
      const connected = host && host.expires_at > new Date();

      return new Response(
        JSON.stringify({ connected: !!connected }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get token for a room (internal use by spotify function)
    if (action === 'get-token') {
      if (!roomId) {
        return new Response(
          JSON.stringify({ error: 'room_id required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const host = hostTokens.get(roomId);
      if (!host) {
        return new Response(
          JSON.stringify({ token: null }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ 
          token: {
            access_token: host.access_token,
            refresh_token: host.refresh_token,
            expires_at: host.expires_at.toISOString(),
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update token (internal use by spotify function after refresh)
    if (action === 'update-token') {
      const { room_id, access_token, refresh_token, expires_at } = await req.json();
      
      if (!room_id || !access_token || !refresh_token || !expires_at) {
        return new Response(
          JSON.stringify({ error: 'room_id, access_token, refresh_token, and expires_at required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      hostTokens.set(room_id, {
        access_token,
        refresh_token,
        expires_at: new Date(expires_at),
      });

      return new Response(
        JSON.stringify({ success: true }),
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

      hostTokens.delete(roomId);
      
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
