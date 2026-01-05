import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Music2, Disc3, Wifi, WifiOff, LogOut, Loader2, CheckCircle, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

export default function HostPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  useEffect(() => {
    // Check if returning from Spotify auth
    const code = searchParams.get('code');
    if (code) {
      handleCallback(code);
      return;
    }

    // Check connection status
    checkStatus();
  }, [searchParams]);

  const checkStatus = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${supabaseUrl}/functions/v1/spotify-auth?action=check-status`,
        {
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
          },
        }
      );
      const data = await response.json();
      setIsConnected(data.connected);
    } catch (error) {
      console.error('Error checking status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const redirectUri = `${window.location.origin}/host`;
      
      const response = await fetch(
        `${supabaseUrl}/functions/v1/spotify-auth?action=get-auth-url&redirect_uri=${encodeURIComponent(redirectUri)}`,
        {
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
          },
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

  const handleCallback = async (code: string) => {
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
          body: JSON.stringify({ code, redirect_uri: redirectUri }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setIsConnected(true);
        toast({
          title: "Connected! 🎉",
          description: "Spotify is now connected. Songs added by guests will play on your device!",
        });
        // Clear the URL params
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
    try {
      await fetch(
        `${supabaseUrl}/functions/v1/spotify-auth?action=disconnect`,
        {
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
          },
        }
      );
      setIsConnected(false);
      toast({
        title: "Disconnected",
        description: "Spotify has been disconnected.",
      });
    } catch (error) {
      console.error('Error disconnecting:', error);
    }
  };

  const handleClearQueue = async () => {
    setIsClearing(true);
    try {
      const { error } = await supabase.from('queue').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (error) throw error;
      toast({
        title: "Queue cleared",
        description: "All songs have been removed from the queue.",
      });
    } catch (error) {
      console.error('Error clearing queue:', error);
      toast({
        title: "Failed to clear queue",
        description: "Could not clear the queue. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-violet-900 to-fuchsia-900 text-white">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-lg">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Disc3 className="w-10 h-10 text-pink-400 animate-spin" style={{ animationDuration: "3s" }} />
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Host Control
            </h1>
          </div>
          <p className="text-purple-200">
            Connect your Spotify to receive guest song requests
          </p>
        </header>

        {/* Status Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 text-center">
          {isLoading ? (
            <div className="py-8">
              <Loader2 className="w-12 h-12 mx-auto text-purple-400 animate-spin" />
              <p className="mt-4 text-purple-300">Checking connection...</p>
            </div>
          ) : isConnected ? (
            <>
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-green-400 mb-2">Connected!</h2>
              <p className="text-purple-200 mb-6">
                Your Spotify is connected. Songs added by guests will automatically play on your active device.
              </p>
              <div className="bg-green-500/10 rounded-xl p-4 mb-6 border border-green-500/30">
                <div className="flex items-center justify-center gap-2 text-green-400">
                  <Wifi className="w-5 h-5" />
                  <span className="font-semibold">Ready to receive songs</span>
                </div>
                <p className="text-sm text-purple-300 mt-2">
                  Make sure Spotify is playing on a device
                </p>
              </div>
              <div className="space-y-3">
                <Button
                  onClick={() => navigate('/')}
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
              <h2 className="text-2xl font-bold mb-2">Not Connected</h2>
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

        {/* Back link */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-purple-300 hover:text-white transition-colors"
          >
            ← Back to Jukebox
          </button>
        </div>
      </div>
    </div>
  );
}
