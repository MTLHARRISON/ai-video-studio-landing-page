import { useState } from "react";
import { Search, Music2, Plus, Check, Clock, Disc3 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

// Mock track data
const mockTracks = [
  { id: "1", title: "Blinding Lights", artist: "The Weeknd", album: "After Hours", duration: "3:20", cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop" },
  { id: "2", title: "Uptown Funk", artist: "Bruno Mars", album: "Uptown Special", duration: "4:30", cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&h=100&fit=crop" },
  { id: "3", title: "Shape of You", artist: "Ed Sheeran", album: "÷", duration: "3:53", cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100&h=100&fit=crop" },
  { id: "4", title: "Don't Start Now", artist: "Dua Lipa", album: "Future Nostalgia", duration: "3:03", cover: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=100&h=100&fit=crop" },
  { id: "5", title: "Levitating", artist: "Dua Lipa", album: "Future Nostalgia", duration: "3:23", cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100&h=100&fit=crop" },
  { id: "6", title: "Flowers", artist: "Miley Cyrus", album: "Endless Summer Vacation", duration: "3:20", cover: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=100&h=100&fit=crop" },
  { id: "7", title: "Anti-Hero", artist: "Taylor Swift", album: "Midnights", duration: "3:20", cover: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=100&h=100&fit=crop" },
  { id: "8", title: "As It Was", artist: "Harry Styles", album: "Harry's House", duration: "2:47", cover: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=100&h=100&fit=crop" },
];

interface QueueItem {
  id: string;
  track: typeof mockTracks[0];
  addedBy: string;
  addedAt: Date;
}

const guestNames = ["Party Guest", "Music Lover", "Dance Floor", "DJ Wannabe", "Vibe Curator", "Song Hunter"];

export default function Index() {
  const [searchQuery, setSearchQuery] = useState("");
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [recentlyAdded, setRecentlyAdded] = useState<Set<string>>(new Set());

  const filteredTracks = searchQuery.length > 0
    ? mockTracks.filter(
        (track) =>
          track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          track.artist.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const addToQueue = (track: typeof mockTracks[0]) => {
    // Check if song was added recently (within last 10 minutes - simulated)
    if (recentlyAdded.has(track.id)) {
      toast({
        title: "Already in queue! 🎵",
        description: "This song was added recently. Try another banger!",
        variant: "destructive",
      });
      return;
    }

    const randomGuest = guestNames[Math.floor(Math.random() * guestNames.length)];
    
    setQueue((prev) => [
      ...prev,
      {
        id: `${track.id}-${Date.now()}`,
        track,
        addedBy: randomGuest,
        addedAt: new Date(),
      },
    ]);

    setRecentlyAdded((prev) => new Set([...prev, track.id]));

    // Remove from recently added after 10 minutes (demo: 30 seconds)
    setTimeout(() => {
      setRecentlyAdded((prev) => {
        const next = new Set(prev);
        next.delete(track.id);
        return next;
      });
    }, 30000);

    toast({
      title: "Added to queue! 🎉",
      description: `"${track.title}" is now in the party queue!`,
    });

    setSearchQuery("");
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
          </div>

          {/* Search Results */}
          {filteredTracks.length > 0 && (
            <div className="mt-4 bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden border border-white/20">
              {filteredTracks.map((track) => (
                <div
                  key={track.id}
                  className="flex items-center gap-4 p-4 hover:bg-white/10 transition-colors border-b border-white/10 last:border-0"
                >
                  <img
                    src={track.cover}
                    alt={track.album}
                    className="w-14 h-14 rounded-lg object-cover shadow-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white truncate">{track.title}</h3>
                    <p className="text-sm text-purple-200 truncate">{track.artist}</p>
                  </div>
                  <span className="text-sm text-purple-300 hidden sm:block">{track.duration}</span>
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

          {searchQuery.length > 0 && filteredTracks.length === 0 && (
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
                  <img
                    src={item.track.cover}
                    alt={item.track.album}
                    className="w-12 h-12 rounded-lg object-cover shadow-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white truncate">{item.track.title}</h3>
                    <p className="text-sm text-purple-200 truncate">{item.track.artist}</p>
                  </div>
                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-purple-300">{item.track.duration}</p>
                    <p className="text-xs text-pink-300">Added by {item.addedBy}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-purple-400 text-sm">
          <p>🎵 Demo Jukebox • Songs are for display only 🎵</p>
        </footer>
      </div>
    </div>
  );
}
