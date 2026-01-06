import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Disc3, Music2, ArrowRight, Loader2, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const funnyNames = [
  "DJ Snooze", "Vibe Lord", "Bass Face", "Party Panda", "Groove Machine",
  "Disco Duck", "Beat Wizard", "Funky Monkey", "Rhythm Robot", "Tune Tiger",
  "Melody Muffin", "Sound Sloth", "Echo Eagle", "Tempo Turtle", "Wave Whale"
];

function generateRandomName(): string {
  return funnyNames[Math.floor(Math.random() * funnyNames.length)];
}

export default function JoinRoomPage() {
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState("");
  const [guestName, setGuestName] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  // Load saved name on mount
  useEffect(() => {
    const savedName = localStorage.getItem('jukebox_guest_name');
    if (savedName) {
      setGuestName(savedName);
    }
  }, []);

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!roomCode.trim()) {
      toast({
        title: "Enter a room code",
        description: "Please enter the party room code to join.",
        variant: "destructive",
      });
      return;
    }

    setIsJoining(true);

    try {
      const response = await fetch(
        `${supabaseUrl}/functions/v1/rooms?action=get-by-code&code=${roomCode.toUpperCase().trim()}`,
        {
          headers: { 'Authorization': `Bearer ${supabaseKey}` },
        }
      );

      if (response.status === 404) {
        toast({
          title: "Room not found",
          description: "Check the code and try again.",
          variant: "destructive",
        });
        return;
      }

      if (response.status === 410) {
        toast({
          title: "Room expired",
          description: "This party room has expired.",
          variant: "destructive",
        });
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to join room');
      }

      const room = await response.json();

      // Save the guest name (generate random if empty)
      const finalName = guestName.trim() || generateRandomName();
      localStorage.setItem('jukebox_guest_name', finalName);

      // Store room in session and navigate
      sessionStorage.setItem('current_room_id', room.id);
      sessionStorage.setItem('current_room_code', room.code);
      sessionStorage.setItem('current_room_name', room.name);
      navigate(`/party/${room.code}`);
    } catch (error) {
      console.error('Error joining room:', error);
      toast({
        title: "Failed to join",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-violet-900 to-fuchsia-900 text-white">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12 max-w-md flex flex-col items-center justify-center min-h-screen">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Disc3 className="w-12 h-12 text-pink-400 animate-spin" style={{ animationDuration: "3s" }} />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Party Jukebox
            </h1>
          </div>
          <p className="text-lg text-purple-200 flex items-center justify-center gap-2">
            <Music2 className="w-5 h-5" />
            Join a party and add your songs 🎶
          </p>
        </header>

        {/* Join Form */}
        <form onSubmit={handleJoinRoom} className="w-full">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
            <h2 className="text-xl font-bold mb-6 text-center">Join a Party</h2>
            
            {/* Name Input */}
            <div className="mb-4">
              <label className="block text-sm text-purple-300 mb-2 flex items-center gap-2">
                <User className="w-4 h-4" />
                Your Name (optional)
              </label>
              <Input
                type="text"
                placeholder="Leave blank for a random name"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                maxLength={30}
                className="w-full py-4 bg-white/10 border-white/20 text-white placeholder:text-purple-300/50 rounded-xl"
              />
            </div>

            {/* Room Code Input */}
            <div className="mb-6">
              <label className="block text-sm text-purple-300 mb-2">Room Code</label>
              <Input
                type="text"
                placeholder="ABCD12"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="w-full text-center text-3xl tracking-[0.3em] py-6 bg-white/10 border-white/20 text-white placeholder:text-purple-300/50 rounded-xl focus:ring-2 focus:ring-pink-400 font-mono"
              />
            </div>

            <Button
              type="submit"
              disabled={isJoining || roomCode.length < 4}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 py-6 text-lg rounded-xl transition-all hover:scale-105"
            >
              {isJoining ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Join Party
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Host link */}
        <div className="mt-8 text-center">
          <p className="text-purple-300 mb-2">Want to host a party?</p>
          <button
            onClick={() => navigate('/host')}
            className="text-pink-400 hover:text-pink-300 font-semibold transition-colors"
          >
            Create a Room →
          </button>
        </div>
      </div>
    </div>
  );
}
