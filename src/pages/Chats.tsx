import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle, Flag, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { el } from "date-fns/locale";
import mascot from "@/assets/mascot.jpg";

export default function Chats() {
  const navigate = useNavigate();
  const [matches, setMatches] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Pull-to-refresh state
  const containerRef = useRef<HTMLDivElement>(null);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const touchStartY = useRef(0);
  const PULL_THRESHOLD = 70;
  const MAX_PULL = 120;

  useEffect(() => {
    loadMatches();
    const channel = setupRealtimeSubscription();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadMatches();
    setIsRefreshing(false);
  }, []);

  // Pull-to-refresh touch handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (containerRef.current?.scrollTop === 0) {
      touchStartY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling) return;
    const deltaY = e.touches[0].clientY - touchStartY.current;
    if (deltaY > 0) {
      setPullDistance(Math.min(deltaY * 0.5, MAX_PULL));
    }
  }, [isPulling]);

  const handleTouchEnd = useCallback(async () => {
    if (pullDistance >= PULL_THRESHOLD) {
      await handleRefresh();
    }
    setPullDistance(0);
    setIsPulling(false);
  }, [pullDistance, handleRefresh]);

  const loadMatches = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    setCurrentUserId(user.id);

    // Admin profile ID to always exclude
    const ADMIN_PROFILE_ID = 'fb6eac18-8940-4f14-9cc7-8d828c21179a';

    // Get all matches (excluding admin)
    const { data: matchesData } = await supabase
      .from("matches")
      .select("*")
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .neq("user1_id", ADMIN_PROFILE_ID)
      .neq("user2_id", ADMIN_PROFILE_ID)
      .order("last_message_at", { ascending: false, nullsFirst: false });

    if (!matchesData) {
      setLoading(false);
      return;
    }

    // Get profiles and last messages for each match
    const enrichedMatches = await Promise.all(
      matchesData.map(async (match) => {
        const otherUserId = match.user1_id === user.id ? match.user2_id : match.user1_id;
        
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", otherUserId)
          .single();

        const { data: lastMsg } = await supabase
          .from("chat_messages")
          .select("*")
          .eq("match_id", match.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        const { count: unreadCount } = await supabase
          .from("chat_messages")
          .select("*", { count: "exact", head: true })
          .eq("match_id", match.id)
          .neq("sender_id", user.id)
          .is("read_at", null);

        return {
          ...match,
          profile,
          lastMessage: lastMsg,
          unreadCount: unreadCount || 0
        };
      })
    );

    setMatches(enrichedMatches);
    setLoading(false);
  };

  const setupRealtimeSubscription = () => {
    return supabase
      .channel("matches-updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chat_messages"
        },
        () => {
          loadMatches();
        }
      )
      .subscribe();
  };

  const handleReportProfile = (name: string) => {
    toast.success(`Αναφορά για ${name} καταχωρήθηκε`);
  };

  const handleChatClick = (matchId: string) => {
    navigate(`/chat/${matchId}`);
  };

  return (
    <div 
      ref={containerRef}
      className="min-h-screen bg-gradient-to-br from-background to-secondary/30 relative overflow-auto"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull-to-refresh indicator */}
      <div 
        className="absolute left-0 right-0 flex items-center justify-center transition-all duration-200 overflow-hidden z-10"
        style={{ 
          height: pullDistance, 
          top: 0,
          opacity: pullDistance / PULL_THRESHOLD 
        }}
      >
        <RefreshCw className={`w-6 h-6 text-primary ${pullDistance >= PULL_THRESHOLD ? 'animate-spin' : ''}`} />
        <span className="ml-2 text-sm text-muted-foreground">
          {pullDistance >= PULL_THRESHOLD ? 'Αφήστε για ανανέωση' : 'Τραβήξτε για ανανέωση'}
        </span>
      </div>

      <img 
        src={mascot} 
        alt="Momster Mascot" 
        className="fixed top-24 right-4 w-20 h-20 opacity-20 object-contain pointer-events-none"
      />
      <div className="max-w-2xl mx-auto pt-20 pb-24 px-4" style={{ marginTop: pullDistance }}>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Pacifico', cursive" }}>
            Συνομιλίες
          </h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-8 w-8"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Φόρτωση...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {matches.map((match) => (
              <Card
                key={match.id}
                className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleChatClick(match.id)}
              >
                <div className="flex items-center gap-4">
                  <Avatar className="w-14 h-14">
                    <AvatarImage src={match.profile?.profile_photo_url} alt={match.profile?.full_name} />
                    <AvatarFallback>{match.profile?.full_name?.[0] || "M"}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-foreground">{match.profile?.full_name}</h3>
                      <span className="text-xs text-muted-foreground">
                        {match.lastMessage
                          ? formatDistanceToNow(new Date(match.lastMessage.created_at), {
                              addSuffix: true,
                              locale: el
                            })
                          : "Νέο match!"}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {match.lastMessage?.content || "Πες γεια! 👋"}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {match.unreadCount > 0 && (
                      <Badge className="rounded-full px-2">{match.unreadCount}</Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReportProfile(match.profile?.full_name);
                      }}
                    >
                      <Flag className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}

            {matches.length === 0 && (
              <div className="text-center py-12">
                <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Κανένα match ακόμα.</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Κάνε swipe στη σελίδα Discover! 💕
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="fixed bottom-20 left-0 right-0 py-3 px-4 bg-background/80 backdrop-blur-md border-t border-border">
        <div className="max-w-2xl mx-auto flex items-center justify-center gap-2">
          <img src={mascot} alt="Momster Mascot" className="w-8 h-8 object-contain" />
          <span className="text-sm text-muted-foreground">Together, moms thrive!</span>
        </div>
      </footer>
    </div>
  );
}
