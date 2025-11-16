import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, Flag, MapPin, Navigation as NavigationIcon } from "lucide-react";
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

  useEffect(() => {
    loadMatches();
    const channel = setupRealtimeSubscription();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadMatches = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    setCurrentUserId(user.id);

    // Get all matches
    const { data: matchesData } = await supabase
      .from("matches")
      .select("*")
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
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

  const nearbyMoms = [
    {
      id: 1,
      name: "Sarah Johnson",
      distance: "0.5 km",
      children: "2 kids",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100"
    },
    {
      id: 2,
      name: "Maria Papadopoulou",
      distance: "1.2 km",
      children: "1 kid",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
    },
    {
      id: 3,
      name: "Emma Wilson",
      distance: "2.3 km",
      children: "3 kids",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 relative">
      <img 
        src={mascot} 
        alt="Momster Mascot" 
        className="fixed top-24 right-4 w-20 h-20 opacity-20 object-contain pointer-events-none"
      />
      <div className="max-w-2xl mx-auto pt-20 pb-24 px-4">
        <h1 className="text-2xl font-bold mb-6 text-foreground" style={{ fontFamily: "'Pacifico', cursive" }}>
          Συνομιλίες & Χάρτης
        </h1>

        <Tabs defaultValue="chats" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="chats">
              <MessageCircle className="w-4 h-4 mr-2" />
              Συνομιλίες
            </TabsTrigger>
            <TabsTrigger value="map">
              <MapPin className="w-4 h-4 mr-2" />
              Κοντινές
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chats">
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
          </TabsContent>

          <TabsContent value="map">
            {/* Map Placeholder */}
            <Card className="mb-6 h-64 flex items-center justify-center bg-secondary/20">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-primary mx-auto mb-2" />
                <p className="text-muted-foreground">Interactive map coming soon</p>
                <p className="text-sm text-muted-foreground mt-1">
                  View moms and events on a map
                </p>
              </div>
            </Card>

            <h2 className="text-lg font-semibold mb-4 text-foreground">Κοντινές Μαμάδες</h2>
            
            <div className="space-y-3">
              {nearbyMoms.map((mom) => (
                <Card key={mom.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={mom.avatar} alt={mom.name} />
                      <AvatarFallback>{mom.name[0]}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{mom.name}</h3>
                      <p className="text-sm text-muted-foreground">{mom.children}</p>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <NavigationIcon className="w-4 h-4 text-primary" />
                      <span>{mom.distance}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
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
