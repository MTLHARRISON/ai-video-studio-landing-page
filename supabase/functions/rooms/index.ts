import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// In-memory storage for rooms
interface Room {
  id: string;
  code: string;
  name: string;
  host_pin: string;
  created_at: Date;
  expires_at: Date;
}

const rooms = new Map<string, Room>(); // key: room code (uppercase)
const roomsById = new Map<string, Room>(); // key: room id

// In-memory storage for queue
interface QueueItem {
  id: string;
  room_id: string;
  spotify_track_id: string;
  track_title: string;
  track_artist: string;
  track_album: string | null;
  track_duration_ms: number | null;
  track_cover_url: string | null;
  added_by: string;
  session_id: string | null;
  created_at: Date;
}

const queue = new Map<string, QueueItem[]>(); // key: room_id

// Generate a random 6-character room code
function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Clean up expired rooms periodically
setInterval(() => {
  const now = new Date();
  for (const [code, room] of rooms.entries()) {
    if (room.expires_at < now) {
      rooms.delete(code);
      roomsById.delete(room.id);
      queue.delete(room.id);
    }
  }
}, 60000); // Check every minute

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const action = url.searchParams.get('action');

  try {
    // Create room
    if (action === 'create') {
      const { name, host_pin } = await req.json();
      
      if (!host_pin) {
        return new Response(
          JSON.stringify({ error: 'host_pin required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      let code = generateRoomCode();
      // Ensure unique code
      while (rooms.has(code)) {
        code = generateRoomCode();
      }

      const id = crypto.randomUUID();
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

      const room: Room = {
        id,
        code,
        name: name || 'Party Room',
        host_pin,
        created_at: now,
        expires_at: expiresAt,
      };

      rooms.set(code, room);
      roomsById.set(id, room);
      queue.set(id, []);

      return new Response(
        JSON.stringify(room),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get room by code
    if (action === 'get-by-code') {
      const code = url.searchParams.get('code');
      
      if (!code) {
        return new Response(
          JSON.stringify({ error: 'code required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const room = rooms.get(code.toUpperCase());
      
      if (!room) {
        return new Response(
          JSON.stringify({ error: 'Room not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (room.expires_at < new Date()) {
        rooms.delete(room.code);
        roomsById.delete(room.id);
        queue.delete(room.id);
        return new Response(
          JSON.stringify({ error: 'Room expired' }),
          { status: 410, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify(room),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get room by ID
    if (action === 'get-by-id') {
      const id = url.searchParams.get('id');
      
      if (!id) {
        return new Response(
          JSON.stringify({ error: 'id required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const room = roomsById.get(id);
      
      if (!room) {
        return new Response(
          JSON.stringify({ error: 'Room not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (room.expires_at < new Date()) {
        rooms.delete(room.code);
        roomsById.delete(room.id);
        queue.delete(room.id);
        return new Response(
          JSON.stringify({ error: 'Room expired' }),
          { status: 410, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify(room),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify PIN
    if (action === 'verify-pin') {
      const { code, pin } = await req.json();
      
      if (!code || !pin) {
        return new Response(
          JSON.stringify({ error: 'code and pin required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const room = rooms.get(code.toUpperCase());
      
      if (!room) {
        return new Response(
          JSON.stringify({ valid: false, error: 'Room not found' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (room.expires_at < new Date()) {
        rooms.delete(room.code);
        roomsById.delete(room.id);
        queue.delete(room.id);
        return new Response(
          JSON.stringify({ valid: false, error: 'Room expired' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ valid: room.host_pin === pin, room: room.host_pin === pin ? room : null }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get queue for a room
    if (action === 'get-queue') {
      const roomId = url.searchParams.get('room_id');
      
      if (!roomId) {
        return new Response(
          JSON.stringify({ error: 'room_id required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const roomQueue = queue.get(roomId) || [];
      
      return new Response(
        JSON.stringify(roomQueue),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Add to queue
    if (action === 'add-to-queue') {
      const { room_id, spotify_track_id, track_title, track_artist, track_album, track_duration_ms, track_cover_url, added_by, session_id } = await req.json();
      
      if (!room_id || !spotify_track_id || !track_title || !track_artist) {
        return new Response(
          JSON.stringify({ error: 'room_id, spotify_track_id, track_title, and track_artist required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!roomsById.has(room_id)) {
        return new Response(
          JSON.stringify({ error: 'Room not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const roomQueue = queue.get(room_id) || [];
      const queueItem: QueueItem = {
        id: crypto.randomUUID(),
        room_id,
        spotify_track_id,
        track_title,
        track_artist,
        track_album: track_album || null,
        track_duration_ms: track_duration_ms || null,
        track_cover_url: track_cover_url || null,
        added_by: added_by || 'Guest',
        session_id: session_id || null,
        created_at: new Date(),
      };

      roomQueue.push(queueItem);
      queue.set(room_id, roomQueue);

      return new Response(
        JSON.stringify(queueItem),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Clear queue
    if (action === 'clear-queue') {
      const { room_id } = await req.json();
      
      if (!room_id) {
        return new Response(
          JSON.stringify({ error: 'room_id required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      queue.set(room_id, []);

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
    console.error('Rooms API error:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
