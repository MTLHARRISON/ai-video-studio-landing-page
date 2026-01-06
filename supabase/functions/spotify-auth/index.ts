import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const action = url.searchParams.get('action');
  const roomId = url.searchParams.get('room_id');

  const clientId = Deno.env.get('SPOTIFY_CLIENT_ID');
  const clientSecret = Deno.env.get('SPOTIFY_CLIENT_SECRET');
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
      const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

      // Delete existing host for this room and insert new one
      await supabase.from('spotify_host').delete().eq('room_id', room_id);
      
      const { error: insertError } = await supabase.from('spotify_host').insert({
        room_id: room_id,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: expiresAt.toISOString(),
      });

      if (insertError) {
        console.error('Error saving tokens:', insertError);
        return new Response(
          JSON.stringify({ error: 'Failed to save tokens' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

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

      const { data: host } = await supabase
        .from('spotify_host')
        .select('expires_at')
        .eq('room_id', roomId)
        .maybeSingle();

      const connected = host && new Date(host.expires_at) > new Date();

      return new Response(
        JSON.stringify({ connected }),
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

      await supabase.from('spotify_host').delete().eq('room_id', roomId);
      
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
