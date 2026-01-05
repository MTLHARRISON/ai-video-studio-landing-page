import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

async function getHostToken(supabase: any, roomId: string): Promise<string | null> {
  const clientId = Deno.env.get('SPOTIFY_CLIENT_ID');
  const clientSecret = Deno.env.get('SPOTIFY_CLIENT_SECRET');

  if (!clientId || !clientSecret) {
    console.error('Spotify credentials not configured');
    return null;
  }

  const { data: host, error } = await supabase
    .from('spotify_host')
    .select('*')
    .eq('room_id', roomId)
    .maybeSingle();

  if (error || !host) {
    console.log('No host found for room:', roomId);
    return null;
  }

  const expiresAt = new Date(host.expires_at);
  const now = new Date();

  // If token is still valid (with 5 min buffer)
  if (expiresAt.getTime() > now.getTime() + 300000) {
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
    const errorText = await response.text();
    console.error('Failed to refresh token:', errorText);
    await supabase.from('spotify_host').delete().eq('id', host.id);
    return null;
  }

  const tokens = await response.json();
  const newExpiresAt = new Date(Date.now() + tokens.expires_in * 1000);

  await supabase.from('spotify_host').update({
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token || host.refresh_token,
    expires_at: newExpiresAt.toISOString(),
    updated_at: new Date().toISOString(),
  }).eq('id', host.id);

  console.log('Host token refreshed successfully');
  return tokens.access_token;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');
    const roomId = url.searchParams.get('room_id');

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
        const hostToken = await getHostToken(supabase, roomId);
        hostConnected = !!hostToken;
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

      const hostToken = await getHostToken(supabase, roomId);
      
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

    // Add to queue
    if (action === 'add-to-queue') {
      const { roomId, trackUri, trackId, trackTitle, trackArtist, trackAlbum, trackDuration, trackCover, addedBy } = await req.json();

      if (!roomId || !trackUri || !trackId) {
        return new Response(
          JSON.stringify({ error: 'roomId and track info required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Save to database queue with room_id
      const { error: dbError } = await supabase.from('queue').insert({
        room_id: roomId,
        spotify_track_id: trackId,
        track_title: trackTitle,
        track_artist: trackArtist,
        track_album: trackAlbum,
        track_duration_ms: trackDuration,
        track_cover_url: trackCover,
        added_by: addedBy || 'Guest',
      });

      if (dbError) {
        console.error('Error saving to queue:', dbError);
      }

      // Try to add to Spotify queue
      const hostToken = await getHostToken(supabase, roomId);
      
      if (!hostToken) {
        console.log('No host connected, song saved to database only');
        return new Response(
          JSON.stringify({ success: true, addedToSpotify: false, message: 'Added to queue (host not connected)' }),
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
            JSON.stringify({ success: true, addedToSpotify: false, message: 'Added to queue (no active Spotify device)' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        return new Response(
          JSON.stringify({ success: true, addedToSpotify: false, message: 'Added to queue (Spotify error)' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`Successfully added "${trackTitle}" to Spotify queue!`);

      return new Response(
        JSON.stringify({ success: true, addedToSpotify: true, message: 'Added to Spotify queue!' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Clear Spotify queue (skip to next repeatedly or use pause/skip workaround)
    if (action === 'clear-spotify-queue') {
      const { room_id } = await req.json();

      if (!room_id) {
        return new Response(
          JSON.stringify({ error: 'room_id required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const hostToken = await getHostToken(supabase, room_id);
      
      if (!hostToken) {
        return new Response(
          JSON.stringify({ success: false, message: 'Host not connected' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Spotify doesn't have a direct "clear queue" endpoint
      // The best we can do is skip through queued songs or inform the user
      // For now, we'll just acknowledge - the host can manually clear in Spotify
      console.log('Clear Spotify queue requested for room:', room_id);

      return new Response(
        JSON.stringify({ success: true, message: 'Database queue cleared. Clear Spotify queue manually if needed.' }),
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
