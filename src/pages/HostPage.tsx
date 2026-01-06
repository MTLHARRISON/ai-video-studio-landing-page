import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Music2, Disc3, Wifi, WifiOff, LogOut, Loader2, CheckCircle, Trash2, QrCode, Copy, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { QRCodeSVG } from "qrcode.react";

// Generate a random 4-digit PIN
function generatePin(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

interface Room {
  id: string;
  code: string;
  name: string;
  host_pin: string;
  expires_at: string;
}

export default function HostPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Room state
  const [room, setRoom] = useState<Room | null>(null);
  const [roomName, setRoomName] = useState("Party Room");
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [showPinEntry, setShowPinEntry] = useState(false);
  const [pinEntry, setPinEntry] = useState("");
  const [existingRoomCode, setExistingRoomCode] = useState("");
  
  // Spotify state
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  useEffect(() => {
    // Check if returning from Spotify auth with room context
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    
    if (code && state) {
      // state contains room_id
      handleCallback(code, state);
      return;
    }

    // Check for existing room in session
    const storedRoomId = sessionStorage.getItem('host_room_id');
    const storedPin = sessionStorage.getItem('host_room_pin');
    
    if (storedRoomId && storedPin) {
      loadRoom(storedRoomId, storedPin);
    } else {
      setIsLoading(false);
    }
  }, [searchParams]);

  const loadRoom = async (roomId: string, pin: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${supabaseUrl}/functions/v1/rooms?action=get-by-id&id=${roomId}`,
        {
          headers: { 'Authorization': `Bearer ${supabaseKey}` },
        }
      );

      if (!response.ok) {
        sessionStorage.removeItem('host_room_id');
        sessionStorage.removeItem('host_room_pin');
        setIsLoading(false);
        return;
      }

      const roomData = await response.json();

      // Verify PIN
      if (roomData.host_pin !== pin) {
        sessionStorage.removeItem('host_room_id');
        sessionStorage.removeItem('host_room_pin');
        setIsLoading(false);
        return;
      }

      setRoom(roomData);
      await checkSpotifyStatus(roomId);
    } catch (error) {
      console.error('Error loading room:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkSpotifyStatus = async (roomId: string) => {
    try {
      const response = await fetch(
        `${supabaseUrl}/functions/v1/spotify?action=check-host&room_id=${roomId}`,
        {
          headers: { 'Authorization': `Bearer ${supabaseKey}` },
        }
      );
      const data = await response.json();
      setIsConnected(data.connected);
    } catch (error) {
      console.error('Error checking status:', error);
    }
  };

  const createRoom = async () => {
    setIsCreatingRoom(true);
    try {
      const pin = generatePin();

      const response = await fetch(
        `${supabaseUrl}/functions/v1/rooms?action=create`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: roomName.trim() || 'Party Room',
            host_pin: pin,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create room');
      }

      const data = await response.json();

      // Store in session
      sessionStorage.setItem('host_room_id', data.id);
      sessionStorage.setItem('host_room_pin', pin);

      setRoom(data);
      
      toast({
        title: "Room created! 🎉",
        description: `Your PIN is ${pin} - save it to re-access this room.`,
      });
    } catch (error) {
      console.error('Error creating room:', error);
      toast({
        title: "Failed to create room",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingRoom(false);
    }
  };

  const handlePinLogin = async () => {
    if (!existingRoomCode.trim() || !pinEntry.trim()) {
      toast({ title: "Enter both room code and PIN", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `${supabaseUrl}/functions/v1/rooms?action=verify-pin`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code: existingRoomCode.toUpperCase().trim(),
            pin: pinEntry.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!data.valid) {
        toast({ title: data.error || "Invalid credentials", variant: "destructive" });
        setIsLoading(false);
        return;
      }

      sessionStorage.setItem('host_room_id', data.room.id);
      sessionStorage.setItem('host_room_pin', pinEntry.trim());
      setRoom(data.room);
      await checkSpotifyStatus(data.room.id);
      setShowPinEntry(false);
    } catch (error) {
      console.error('Error:', error);
      toast({ title: "Something went wrong", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!room) return;
    setIsConnecting(true);
    try {
      const redirectUri = `${window.location.origin}/host`;
      
      const response = await fetch(
        `${supabaseUrl}/functions/v1/spotify-auth?action=get-auth-url&redirect_uri=${encodeURIComponent(redirectUri)}&room_id=${room.id}`,
        {
          headers: { 'Authorization': `Bearer ${supabaseKey}` },
        }
      );
      
      const data = await response.json();
      
      if (data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        throw new Error('Failed to get auth URL');
      }
    } catch (error) {
      console.error('Error connecting:', error);
      toast({
        title: "Connection failed",
        description: "Could not connect to Spotify. Please try again.",
        variant: "destructive",
      });
      setIsConnecting(false);
    }
  };

  const handleCallback = async (code: string, state: string) => {
    setIsLoading(true);
    try {
      const redirectUri = `${window.location.origin}/host`;
      
      const response = await fetch(
        `${supabaseUrl}/functions/v1/spotify-auth?action=exchange-code`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code, redirect_uri: redirectUri, room_id: state }),
        }
      );

      const data = await response.json();

      if (data.success) {
        // Store the host token in the spotify edge function's memory
        await fetch(
          `${supabaseUrl}/functions/v1/spotify?action=store-host`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              room_id: state,
              access_token: data.access_token,
              refresh_token: data.refresh_token,
              expires_in: data.expires_in,
            }),
          }
        );

        // Load room from state (room_id)
        const storedPin = sessionStorage.getItem('host_room_pin');
        if (storedPin) {
          await loadRoom(state, storedPin);
        }
        setIsConnected(true);
        toast({
          title: "Connected! 🎉",
          description: "Spotify is now connected. Songs added by guests will play on your device!",
        });
        navigate('/host', { replace: true });
      } else {
        throw new Error(data.error || 'Failed to connect');
      }
    } catch (error) {
      console.error('Error exchanging code:', error);
      toast({
        title: "Connection failed",
        description: "Could not complete Spotify authentication.",
        variant: "destructive",
      });
      navigate('/host', { replace: true });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!room) return;
    try {
      await fetch(
        `${supabaseUrl}/functions/v1/spotify?action=disconnect-host`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ room_id: room.id }),
        }
      );
      setIsConnected(false);
      toast({ title: "Disconnected", description: "Spotify has been disconnected." });
    } catch (error) {
      console.error('Error disconnecting:', error);
    }
  };

  const handleClearQueue = async () => {
    if (!room) return;
    setIsClearing(true);
    try {
      // Clear in-memory queue
      await fetch(
        `${supabaseUrl}/functions/v1/rooms?action=clear-queue`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ room_id: room.id }),
        }
      );

      toast({ title: "Queue cleared", description: "All songs have been removed. Note: Spotify's queue must be cleared manually." });
    } catch (error) {
      console.error('Error clearing queue:', error);
      toast({ title: "Failed to clear queue", variant: "destructive" });
    } finally {
      setIsClearing(false);
    }
  };

  const copyRoomCode = () => {
    if (room) {
      navigator.clipboard.writeText(room.code);
      toast({ title: "Copied!", description: "Room code copied to clipboard." });
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('host_room_id');
    sessionStorage.removeItem('host_room_pin');
    setRoom(null);
    setIsConnected(false);
  };

  const partyUrl = room ? `${window.location.origin}/party/${room.code}` : '';

  // No room yet - show create/login screen
  if (!room && !isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-violet-900 to-fuchsia-900 text-white">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        </div>

        <div className="relative z-10 container mx-auto px-4 py-8 max-w-md">
          <header className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Disc3 className="w-10 h-10 text-pink-400 animate-spin" style={{ animationDuration: "3s" }} />
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Host Control
              </h1>
            </div>
            <p className="text-purple-200">Create a party room for your guests</p>
          </header>

          {showPinEntry ? (
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
              <h2 className="text-xl font-bold mb-6 text-center">Access Existing Room</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-purple-300 mb-2">Room Code</label>
                  <Input
                    type="text"
                    placeholder="ABCD12"
                    value={existingRoomCode}
                    onChange={(e) => setExistingRoomCode(e.target.value.toUpperCase())}
                    maxLength={6}
                    className="w-full text-center text-2xl tracking-widest py-4 bg-white/10 border-white/20 text-white placeholder:text-purple-300/50 rounded-xl font-mono"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-purple-300 mb-2">Host PIN</label>
                  <Input
                    type="password"
                    placeholder="••••"
                    value={pinEntry}
                    onChange={(e) => setPinEntry(e.target.value)}
                    maxLength={4}
                    className="w-full text-center text-2xl tracking-widest py-4 bg-white/10 border-white/20 text-white placeholder:text-purple-300/50 rounded-xl font-mono"
                  />
                </div>

                <Button
                  onClick={handlePinLogin}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 py-6 text-lg rounded-xl"
                >
                  Access Room
                </Button>

                <button
                  onClick={() => setShowPinEntry(false)}
                  className="w-full text-purple-300 hover:text-white transition-colors py-2"
                >
                  ← Back
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
              <h2 className="text-xl font-bold mb-6 text-center">Create New Room</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-purple-300 mb-2">Room Name</label>
                  <Input
                    type="text"
                    placeholder="My Awesome Party"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    maxLength={50}
                    className="w-full py-4 bg-white/10 border-white/20 text-white placeholder:text-purple-300/50 rounded-xl"
                  />
                </div>

                <Button
                  onClick={createRoom}
                  disabled={isCreatingRoom}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 py-6 text-lg rounded-xl transition-all hover:scale-105"
                >
                  {isCreatingRoom ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>Create Room</>
                  )}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/20"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-transparent text-purple-300">or</span>
                  </div>
                </div>

                <button
                  onClick={() => setShowPinEntry(true)}
                  className="w-full text-purple-300 hover:text-white transition-colors py-2"
                >
                  Access existing room with PIN
                </button>
              </div>
            </div>
          )}

          <div className="mt-8 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-purple-300 hover:text-white transition-colors"
            >
              ← Back to Join
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-violet-900 to-fuchsia-900 text-white">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-lg">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Disc3 className="w-10 h-10 text-pink-400 animate-spin" style={{ animationDuration: "3s" }} />
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              {room?.name || 'Host Control'}
            </h1>
          </div>
          <p className="text-purple-200">Room expires in 24 hours</p>
        </header>

        {isLoading ? (
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 text-center">
            <Loader2 className="w-12 h-12 mx-auto text-purple-400 animate-spin" />
            <p className="mt-4 text-purple-300">Loading...</p>
          </div>
        ) : (
          <>
            {/* Room Code Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Users className="w-5 h-5 text-cyan-400" />
                  Share with Guests
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowQR(!showQR)}
                  className="text-purple-300 hover:text-white"
                >
                  <QrCode className="w-5 h-5" />
                </Button>
              </div>

              {showQR ? (
                <div className="flex flex-col items-center py-4">
                  <div className="bg-white p-4 rounded-2xl">
                    <QRCodeSVG value={partyUrl} size={200} />
                  </div>
                  <p className="text-sm text-purple-300 mt-4">Scan to join the party</p>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-black/30 rounded-xl p-4 text-center">
                    <p className="text-sm text-purple-300 mb-1">Room Code</p>
                    <p className="text-3xl font-bold tracking-[0.2em] font-mono">{room?.code}</p>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={copyRoomCode}
                    className="p-4 text-purple-300 hover:text-white hover:bg-white/10"
                  >
                    <Copy className="w-6 h-6" />
                  </Button>
                </div>
              )}
            </div>

            {/* Spotify Status Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 text-center">
              {isConnected ? (
                <>
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-green-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-green-400 mb-2">Spotify Connected!</h2>
                  <p className="text-purple-200 mb-6">
                    Songs added by guests will play on your active device.
                  </p>
                  <div className="bg-green-500/10 rounded-xl p-4 mb-6 border border-green-500/30">
                    <div className="flex items-center justify-center gap-2 text-green-400">
                      <Wifi className="w-5 h-5" />
                      <span className="font-semibold">Ready to receive songs</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Button
                      onClick={() => navigate(`/party/${room?.code}`)}
                      className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 py-6 text-lg rounded-xl"
                    >
                      <Music2 className="w-5 h-5 mr-2" />
                      Go to Jukebox
                    </Button>
                    <Button
                      onClick={handleClearQueue}
                      disabled={isClearing}
                      variant="outline"
                      className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10 py-6 rounded-xl"
                    >
                      {isClearing ? (
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      ) : (
                        <Trash2 className="w-5 h-5 mr-2" />
                      )}
                      Clear Queue
                    </Button>
                    <Button
                      onClick={handleDisconnect}
                      variant="outline"
                      className="w-full border-white/20 text-white hover:bg-white/10 py-6 rounded-xl"
                    >
                      <LogOut className="w-5 h-5 mr-2" />
                      Disconnect Spotify
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <WifiOff className="w-10 h-10 text-purple-400" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Connect Spotify</h2>
                  <p className="text-purple-200 mb-6">
                    Connect your Spotify account to let guests add songs to your queue.
                  </p>
                  <div className="bg-amber-500/10 rounded-xl p-4 mb-6 border border-amber-500/30">
                    <p className="text-sm text-amber-300">
                      <strong>Requirements:</strong> Spotify Premium & an active playing device
                    </p>
                  </div>
                  <Button
                    onClick={handleConnect}
                    disabled={isConnecting}
                    className="w-full bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold py-6 text-lg rounded-xl transition-all hover:scale-105"
                  >
                    {isConnecting ? (
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    ) : (
                      <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                      </svg>
                    )}
                    Connect with Spotify
                  </Button>
                </>
              )}
            </div>

            {/* Logout */}
            <div className="mt-6 text-center">
              <button
                onClick={handleLogout}
                className="text-purple-300 hover:text-white transition-colors"
              >
                Exit Room (save your PIN: {room?.host_pin})
              </button>
            </div>
          </>
        )}

        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-purple-300 hover:text-white transition-colors"
          >
            ← Back to Join
          </button>
        </div>
      </div>
    </div>
  );
}
