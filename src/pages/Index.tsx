import { useState, useEffect, useCallback } from "react";
import { Search, Music2, Plus, Check, Clock, Disc3, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SpotifyTrack {
  id: string;
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

const guestNames = ["Party Guest", "Music Lover", "Dance Floor", "DJ Wannabe", "Vibe Curator", "Song Hunter"];

// Get or create a session ID for rate limiting
function getSessionId(): string {
  let sessionId = localStorage.getItem('jukebox_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('jukebox_session_id', sessionId);
  }
  return sessionId;
}

// Get or create a guest name
function getGuestName(): string {
  let guestName = localStorage.getItem('jukebox_guest_name');
  if (!guestName) {
    guestName = guestNames[Math.floor(Math.random() * guestNames.length)];
    localStorage.setItem('jukebox_guest_name', guestName);
  }
  return guestName;
}

export default function Index() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SpotifyTrack[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentlyAdded, setRecentlyAdded] = useState<Set<string>>(new Set());
  const [lastAddTime, setLastAddTime] = useState<number>(0);

  const sessionId = getSessionId();
  const guestName = getGuestName();

  // Load queue on mount and subscribe to realtime updates
  useEffect(() => {
    loadQueue();

    const channel = supabase
      .channel('queue-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'queue',
        },
        () => {
          loadQueue();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadQueue = async () => {
    const { data, error } = await supabase
      .from('queue')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading queue:', error);
      return;
    }

    setQueue(data || []);
  };

  // Debounced search
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(() => {
      searchSpotify(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const searchSpotify = async (query: string) => {
    setIsSearching(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/spotify?action=search&q=${encodeURIComponent(query)}`,
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const result = await response.json();
      setSearchResults(result.tracks || []);
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
    // Rate limit: 1 song every 2 minutes per session
    const now = Date.now();
    const timeSinceLastAdd = now - lastAddTime;
    const cooldownMs = 120000; // 2 minutes

    if (timeSinceLastAdd < cooldownMs) {
      const remainingSeconds = Math.ceil((cooldownMs - timeSinceLastAdd) / 1000);
      toast({
        title: "Slow down! 🎵",
        description: `Wait ${remainingSeconds} seconds before adding another song.`,
        variant: "destructive",
      });
      return;
    }

    // Check for duplicate in last 10 minutes
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

    // Add to database
    const { error } = await supabase.from('queue').insert({
      spotify_track_id: track.id,
      track_title: track.title,
      track_artist: track.artist,
      track_album: track.album,
      track_duration_ms: track.duration,
      track_cover_url: track.cover,
      added_by: guestName,
      session_id: sessionId,
    });

    if (error) {
      console.error('Error adding to queue:', error);
      toast({
        title: "Failed to add",
        description: "Could not add song to queue. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setLastAddTime(now);
    setRecentlyAdded((prev) => new Set([...prev, track.id]));

    toast({
      title: "Added to queue! 🎉",
      description: `"${track.title}" is now in the party queue!`,
    });

    setSearchQuery("");
    setSearchResults([]);
  };

  const formatDuration = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-violet-900 to-fuchsia-900 text-white">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Disc3 className="w-12 h-12 text-pink-400 animate-spin" style={{ animationDuration: "3s" }} />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Party Jukebox
            </h1>
            <Disc3 className="w-12 h-12 text-cyan-400 animate-spin" style={{ animationDuration: "3s", animationDirection: "reverse" }} />
          </div>
          <p className="text-lg text-purple-200 flex items-center justify-center gap-2">
            <Music2 className="w-5 h-5" />
            Search a song and add it to the party queue 🎶
          </p>
          <p className="text-sm text-purple-400 mt-2">Hi, {guestName}!</p>
        </header>

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
                    disabled={recentlyAdded.has(track.id)}
                    className={`rounded-xl px-6 py-6 text-base font-semibold transition-all ${
                      recentlyAdded.has(track.id)
                        ? "bg-green-500/50 cursor-not-allowed"
                        : "bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 hover:scale-105"
                    }`}
                  >
                    {recentlyAdded.has(track.id) ? (
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
              {queue.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 transition-all hover:bg-white/15"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  {item.track_cover_url ? (
                    <img
                      src={item.track_cover_url}
                      alt={item.track_album || ''}
                      className="w-12 h-12 rounded-lg object-cover shadow-lg"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-purple-800 flex items-center justify-center">
                      <Music2 className="w-5 h-5 text-purple-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white truncate">{item.track_title}</h3>
                    <p className="text-sm text-purple-200 truncate">{item.track_artist}</p>
                  </div>
                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-purple-300">
                      {item.track_duration_ms ? formatDuration(item.track_duration_ms) : ''}
                    </p>
                    <p className="text-xs text-pink-300">Added by {item.added_by}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-purple-400 text-sm">
          <p>🎵 Powered by Spotify • No playback controls 🎵</p>
        </footer>
      </div>
    </div>
  );
}
