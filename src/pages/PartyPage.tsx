import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Search, Music2, Plus, Check, Clock, Disc3, Loader2, Wifi, WifiOff, Volume2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface SpotifyTrack {
  id: string;
  uri: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  durationFormatted: string;
  cover: string | null;
}

interface QueueItem {
  id: string;
  spotify_track_id: string;
  track_title: string;
  track_artist: string;
  track_album: string | null;
  track_duration_ms: number | null;
  track_cover_url: string | null;
  added_by: string;
  created_at: string;
}

interface NowPlaying {
  track_id: string;
  title: string;
  artist: string;
  album: string;
  cover: string | null;
  progress_ms: number;
  duration_ms: number;
  is_playing: boolean;
}

interface Room {
  id: string;
  code: string;
  name: string;
  expires_at: string;
}

function getSessionId(): string {
  let sessionId = localStorage.getItem('jukebox_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('jukebox_session_id', sessionId);
  }
  return sessionId;
}

function getGuestName(): string {
  return localStorage.getItem('jukebox_guest_name') || 'Party Guest';
}

export default function PartyPage() {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  
  const [room, setRoom] = useState<Room | null>(null);
  const [isLoadingRoom, setIsLoadingRoom] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SpotifyTrack[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentlyAdded, setRecentlyAdded] = useState<Set<string>>(new Set());
  const [lastAddTime, setLastAddTime] = useState<number>(0);
  const [hostConnected, setHostConnected] = useState(false);
  const [isAdding, setIsAdding] = useState<string | null>(null);
  const [nowPlaying, setNowPlaying] = useState<NowPlaying | null>(null);

  const sessionId = getSessionId();
  const guestName = getGuestName();

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  // Load room on mount
  useEffect(() => {
    if (roomCode) {
      loadRoom();
    }
  }, [roomCode]);

  // Load queue and poll for updates when room is loaded
  useEffect(() => {
    if (!room) return;

    loadQueue();
    fetchNowPlaying();

    // Poll for now playing and queue every 5 seconds
    const pollInterval = setInterval(() => {
      fetchNowPlaying();
      loadQueue();
    }, 5000);

    return () => {
      clearInterval(pollInterval);
    };
  }, [room]);

  const loadRoom = async () => {
    setIsLoadingRoom(true);
    try {
      const response = await fetch(
        `${supabaseUrl}/functions/v1/rooms?action=get-by-code&code=${roomCode?.toUpperCase()}`,
        {
          headers: { 'Authorization': `Bearer ${supabaseKey}` },
        }
      );

      if (response.status === 404 || response.status === 410) {
        toast({
          title: response.status === 410 ? "Room expired" : "Room not found",
          description: response.status === 410 ? "This party room has expired." : "This party room doesn't exist.",
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to load room');
      }

      const roomData = await response.json();
      setRoom(roomData);
      sessionStorage.setItem('current_room_id', roomData.id);
      sessionStorage.setItem('current_room_code', roomData.code);
      sessionStorage.setItem('current_room_name', roomData.name);
    } catch (error) {
      console.error('Error loading room:', error);
      navigate('/');
    } finally {
      setIsLoadingRoom(false);
    }
  };

  const loadQueue = useCallback(async () => {
    if (!room) return;
    
    try {
      const response = await fetch(
        `${supabaseUrl}/functions/v1/rooms?action=get-queue&room_id=${room.id}`,
        {
          headers: { 'Authorization': `Bearer ${supabaseKey}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setQueue(data || []);
      }
    } catch (error) {
      console.error('Error loading queue:', error);
    }
  }, [room, supabaseUrl, supabaseKey]);

  const fetchNowPlaying = useCallback(async () => {
    if (!room) return;

    try {
      const response = await fetch(
        `${supabaseUrl}/functions/v1/spotify?action=now-playing&room_id=${room.id}`,
        {
          headers: { 'Authorization': `Bearer ${supabaseKey}` },
        }
      );

      if (!response.ok) return;

      const data = await response.json();
      setHostConnected(data.hostConnected || false);
      
      if (data.nowPlaying) {
        setNowPlaying(data.nowPlaying);
      } else {
        setNowPlaying(null);
      }
    } catch (error) {
      console.error('Error fetching now playing:', error);
    }
  }, [room, supabaseUrl, supabaseKey]);

  // Debounced search
  useEffect(() => {
    if (searchQuery.length < 2 || !room) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(() => {
      searchSpotify(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, room]);

  const searchSpotify = async (query: string) => {
    if (!room) return;
    setIsSearching(true);
    try {
      const response = await fetch(
        `${supabaseUrl}/functions/v1/spotify?action=search&q=${encodeURIComponent(query)}&room_id=${room.id}`,
        {
          headers: { 'Authorization': `Bearer ${supabaseKey}` },
        }
      );

      if (!response.ok) throw new Error('Search failed');

      const result = await response.json();
      setSearchResults(result.tracks || []);
      setHostConnected(result.hostConnected || false);
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search failed",
        description: "Could not search Spotify. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const addToQueue = async (track: SpotifyTrack) => {
    if (!room) return;

    const now = Date.now();
    const timeSinceLastAdd = now - lastAddTime;
    const cooldownMs = 120000;

    if (timeSinceLastAdd < cooldownMs) {
      const remainingSeconds = Math.ceil((cooldownMs - timeSinceLastAdd) / 1000);
      toast({
        title: "Slow down! 🎵",
        description: `Wait ${remainingSeconds} seconds before adding another song.`,
        variant: "destructive",
      });
      return;
    }

    // Check for recent duplicates in local queue
    const tenMinutesAgo = new Date(now - 600000).toISOString();
    const recentDuplicate = queue.find(
      (item) => item.spotify_track_id === track.id && item.created_at > tenMinutesAgo
    );

    if (recentDuplicate) {
      toast({
        title: "Already in queue! 🎵",
        description: "This song was added recently. Try another banger!",
        variant: "destructive",
      });
      return;
    }

    setIsAdding(track.id);

    try {
      // Add to local queue via rooms edge function
      const queueResponse = await fetch(
        `${supabaseUrl}/functions/v1/rooms?action=add-to-queue`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            room_id: room.id,
            spotify_track_id: track.id,
            track_title: track.title,
            track_artist: track.artist,
            track_album: track.album,
            track_duration_ms: track.duration,
            track_cover_url: track.cover,
            added_by: guestName,
            session_id: sessionId,
          }),
        }
      );

      if (!queueResponse.ok) {
        throw new Error('Failed to add to queue');
      }

      // Try to add to Spotify queue if host is connected
      let addedToSpotify = false;
      if (hostConnected) {
        const spotifyResponse = await fetch(
          `${supabaseUrl}/functions/v1/spotify?action=add-to-queue`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              roomId: room.id,
              trackUri: track.uri,
              trackTitle: track.title,
            }),
          }
        );

        const spotifyResult = await spotifyResponse.json();
        addedToSpotify = spotifyResult.addedToSpotify;
      }

      setLastAddTime(now);
      setRecentlyAdded((prev) => new Set([...prev, track.id]));

      // Refresh queue
      loadQueue();

      toast({
        title: addedToSpotify ? "Playing soon! 🎉" : "Added to queue! 🎉",
        description: addedToSpotify 
          ? `"${track.title}" is now in Spotify's queue!`
          : `"${track.title}" added! ${hostConnected ? '' : '(Waiting for host to connect)'}`,
      });

      setSearchQuery("");
      setSearchResults([]);
    } catch (error) {
      console.error('Error adding to queue:', error);
      toast({
        title: "Failed to add",
        description: "Could not add song to queue. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAdding(null);
    }
  };

  const formatDuration = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (isLoadingRoom) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-violet-900 to-fuchsia-900 text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 mx-auto text-purple-400 animate-spin" />
          <p className="mt-4 text-purple-300">Joining party...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-violet-900 to-fuchsia-900 text-white">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-2xl">
        {/* Host status banner */}
        <div className="mb-4">
          {hostConnected ? (
            <div className="flex items-center justify-center gap-2 text-green-400 text-sm bg-green-500/10 rounded-full py-2 px-4 border border-green-500/30">
              <Wifi className="w-4 h-4" />
              <span>Connected to host's Spotify</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 text-amber-400 text-sm bg-amber-500/10 rounded-full py-2 px-4 border border-amber-500/30">
              <WifiOff className="w-4 h-4" />
              <span>Waiting for host to connect Spotify</span>
            </div>
          )}
        </div>

        {/* Header */}
        <header className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Disc3 className="w-10 h-10 text-pink-400 animate-spin" style={{ animationDuration: "3s" }} />
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              {room?.name || 'Party Jukebox'}
            </h1>
            <Disc3 className="w-10 h-10 text-cyan-400 animate-spin" style={{ animationDuration: "3s", animationDirection: "reverse" }} />
          </div>
          <p className="text-lg text-purple-200 flex items-center justify-center gap-2">
            <Music2 className="w-5 h-5" />
            Room: {room?.code}
          </p>
          <p className="text-sm text-purple-400 mt-1">Hi, {guestName}!</p>
        </header>

        {/* Now Playing */}
        {nowPlaying && (
          <div className="mb-6 bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-md rounded-2xl p-4 border border-green-500/30">
            <div className="flex items-center gap-4">
              <div className="relative">
                {nowPlaying.cover ? (
                  <img
                    src={nowPlaying.cover}
                    alt={nowPlaying.album}
                    className="w-16 h-16 rounded-lg object-cover shadow-lg"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-green-800 flex items-center justify-center">
                    <Music2 className="w-8 h-8 text-green-400" />
                  </div>
                )}
                {nowPlaying.is_playing && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <Volume2 className="w-2.5 h-2.5 text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-green-400 font-semibold uppercase tracking-wider mb-1">
                  {nowPlaying.is_playing ? '♪ Now Playing' : '⏸ Paused'}
                </p>
                <h3 className="font-bold text-white truncate">{nowPlaying.title}</h3>
                <p className="text-sm text-green-200 truncate">{nowPlaying.artist}</p>
              </div>
              <div className="text-right text-sm text-green-300">
                {formatDuration(nowPlaying.progress_ms)} / {formatDuration(nowPlaying.duration_ms)}
              </div>
            </div>
            {/* Progress bar */}
            <div className="mt-3 h-1 bg-green-900/50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-400 rounded-full transition-all duration-1000"
                style={{ width: `${(nowPlaying.progress_ms / nowPlaying.duration_ms) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Search Section */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300" />
            <Input
              type="text"
              placeholder="Search for a song or artist..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-6 text-lg bg-white/10 border-white/20 text-white placeholder:text-purple-300 rounded-2xl focus:ring-2 focus:ring-pink-400 focus:border-transparent"
            />
            {isSearching && (
              <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300 animate-spin" />
            )}
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-4 bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden border border-white/20">
              {searchResults.map((track) => (
                <div
                  key={track.id}
                  className="flex items-center gap-4 p-4 hover:bg-white/10 transition-colors border-b border-white/10 last:border-0"
                >
                  {track.cover ? (
                    <img
                      src={track.cover}
                      alt={track.album}
                      className="w-14 h-14 rounded-lg object-cover shadow-lg"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-purple-800 flex items-center justify-center">
                      <Music2 className="w-6 h-6 text-purple-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white truncate">{track.title}</h3>
                    <p className="text-sm text-purple-200 truncate">{track.artist}</p>
                  </div>
                  <span className="text-sm text-purple-300 hidden sm:block">{track.durationFormatted}</span>
                  <Button
                    onClick={() => addToQueue(track)}
                    disabled={recentlyAdded.has(track.id) || isAdding === track.id}
                    className={`rounded-xl px-6 py-6 text-base font-semibold transition-all ${
                      recentlyAdded.has(track.id)
                        ? "bg-green-500/50 cursor-not-allowed"
                        : "bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 hover:scale-105"
                    }`}
                  >
                    {isAdding === track.id ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : recentlyAdded.has(track.id) ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Plus className="w-5 h-5" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}

          {searchQuery.length >= 2 && !isSearching && searchResults.length === 0 && (
            <div className="mt-4 text-center py-8 text-purple-300">
              <Music2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No songs found. Try a different search!</p>
            </div>
          )}
        </div>

        {/* Queue Section */}
        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Clock className="w-6 h-6 text-cyan-400" />
            Party Queue
            <span className="text-sm font-normal text-purple-300 ml-2">
              ({queue.length} {queue.length === 1 ? "song" : "songs"})
            </span>
          </h2>

          {queue.length === 0 ? (
            <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10">
              <Disc3 className="w-16 h-16 mx-auto mb-4 text-purple-400 opacity-50" />
              <p className="text-purple-300 text-lg">The queue is empty!</p>
              <p className="text-purple-400 text-sm mt-1">Search for a song above to get the party started 🎉</p>
            </div>
          ) : (
            <div className="space-y-3">
              {queue.map((item, index) => {
                const isCurrentlyPlaying = nowPlaying?.track_id === item.spotify_track_id;
                
                return (
                  <div
                    key={item.id}
                    className={`flex items-center gap-4 p-4 backdrop-blur-sm rounded-2xl border transition-all ${
                      isCurrentlyPlaying
                        ? 'bg-green-500/20 border-green-500/50 ring-2 ring-green-500/30'
                        : 'bg-white/10 border-white/20 hover:bg-white/15'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      isCurrentlyPlaying
                        ? 'bg-gradient-to-br from-green-400 to-emerald-500'
                        : 'bg-gradient-to-br from-pink-500 to-purple-500'
                    }`}>
                      {isCurrentlyPlaying ? (
                        <Volume2 className="w-4 h-4" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    {item.track_cover_url ? (
                      <img
                        src={item.track_cover_url}
                        alt={item.track_album || ''}
                        className={`w-12 h-12 rounded-lg object-cover shadow-lg ${isCurrentlyPlaying ? 'ring-2 ring-green-400' : ''}`}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-purple-800 flex items-center justify-center">
                        <Music2 className="w-5 h-5 text-purple-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-semibold truncate ${isCurrentlyPlaying ? 'text-green-300' : 'text-white'}`}>
                        {item.track_title}
                      </h3>
                      <p className={`text-sm truncate ${isCurrentlyPlaying ? 'text-green-200' : 'text-purple-200'}`}>
                        {item.track_artist}
                      </p>
                    </div>
                    <div className="text-right hidden sm:block">
                      <p className={`text-xs ${isCurrentlyPlaying ? 'text-green-300' : 'text-purple-300'}`}>
                        {item.track_duration_ms ? formatDuration(item.track_duration_ms) : ''}
                      </p>
                      <p className={`text-xs ${isCurrentlyPlaying ? 'text-green-300' : 'text-pink-300'}`}>
                        Added by {item.added_by}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-purple-400 text-sm">
          <p>🎵 Powered by Spotify • No playback controls 🎵</p>
          <button
            onClick={() => navigate('/')}
            className="mt-2 text-purple-300 hover:text-white transition-colors"
          >
            ← Leave Party
          </button>
        </footer>
      </div>
    </div>
  );
}
