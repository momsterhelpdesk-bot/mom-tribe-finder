import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Send, Flag, Heart, Coffee, Baby, MoreVertical, UserX, Ban, Check, CheckCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { el } from "date-fns/locale";
import MomGifPicker from "@/components/chat/MomGifPicker";
import SmartReplySuggestions from "@/components/chat/SmartReplySuggestions";
import { hapticFeedback } from "@/hooks/use-haptic";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const QUICK_REPLIES = [
  "Γεια σου μανούλα! Πώς είσαι σήμερα; 😊",
  "Hello mama! Πώς κυλάει η μέρα σου; 💕",
  "Hey mama! Χάρηκα πολύ για το match μας! 🥰",
  "Γειά! Αν είμαστε κοντά, θα ήταν τέλειο να κανονίσουμε playdate! 🧸💕"
];

const EMOJI_SHORTCUTS = [
  { icon: Heart, emoji: "💕" },
  { icon: Coffee, emoji: "☕" },
  { icon: Baby, emoji: "👶" },
  { text: "🌸" },
  { text: "😊" },
  { text: "🥰" },
  { text: "😴" },
  { text: "🧸" }
];

export default function ChatView() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [otherUser, setOtherUser] = useState<any>(null);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [showSafetyTip, setShowSafetyTip] = useState(true);
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [lastSeen, setLastSeen] = useState<string | null>(null);
  const [showUnmatchDialog, setShowUnmatchDialog] = useState(false);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadChatData();
    const channel = setupRealtimeSubscription();
    const presenceChannel = setupPresenceChannel();
    
    return () => {
      supabase.removeChannel(channel);
      if (presenceChannel) supabase.removeChannel(presenceChannel);
    };
  }, [matchId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (messages.length === 0) {
      setShowQuickReplies(true);
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadChatData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    setCurrentUserId(user.id);

    // Get match details
    const { data: match } = await supabase
      .from("matches")
      .select("*")
      .eq("id", matchId)
      .single();

    if (!match) {
      toast.error("Το chat δεν βρέθηκε");
      navigate("/chats");
      return;
    }

    // Get other user's profile
    const otherUserId = match.user1_id === user.id ? match.user2_id : match.user1_id;
    const { data: profile } = await supabase
      .from("profiles_safe")
      .select("*")
      .eq("id", otherUserId)
      .single();

    setOtherUser(profile);

    // Load messages
    const { data: msgs } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("match_id", matchId)
      .order("created_at", { ascending: true });

    setMessages(msgs || []);

    // Mark messages as read
    await supabase
      .from("chat_messages")
      .update({ read_at: new Date().toISOString() })
      .eq("match_id", matchId)
      .is("read_at", null)
      .neq("sender_id", user.id);
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel(`chat:${matchId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `match_id=eq.${matchId}`
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
          // Reset typing indicator when message arrives
          if (payload.new.sender_id !== currentUserId) {
            setIsOtherUserTyping(false);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "chat_messages",
          filter: `match_id=eq.${matchId}`
        },
        (payload) => {
          // Update message read status in real-time
          setMessages((prev) => 
            prev.map((msg) => 
              msg.id === payload.new.id ? { ...msg, read_at: payload.new.read_at } : msg
            )
          );
        }
      )
      .subscribe();

    return channel;
  };

  const setupPresenceChannel = () => {
    if (!matchId || !currentUserId) return null;

    const channel = supabase.channel(`presence:${matchId}`)
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users = Object.values(state).flat();
        const otherUserPresent = users.some((u: any) => u.user_id !== currentUserId);
        setIsOnline(otherUserPresent);
        if (!otherUserPresent) {
          setLastSeen(new Date().toISOString());
        }
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        const isOther = newPresences.some((p: any) => p.user_id !== currentUserId);
        if (isOther) setIsOnline(true);
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        const wasOther = leftPresences.some((p: any) => p.user_id !== currentUserId);
        if (wasOther) {
          setIsOnline(false);
          setLastSeen(new Date().toISOString());
        }
      })
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (payload.user_id !== currentUserId) {
          setIsOtherUserTyping(true);
          // Clear typing after 3 seconds
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => {
            setIsOtherUserTyping(false);
          }, 3000);
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ user_id: currentUserId, online_at: new Date().toISOString() });
        }
      });

    return channel;
  };

  const broadcastTyping = () => {
    supabase.channel(`presence:${matchId}`).send({
      type: 'broadcast',
      event: 'typing',
      payload: { user_id: currentUserId }
    });
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || !currentUserId) return;

    const { error } = await supabase
      .from("chat_messages")
      .insert({
        match_id: matchId,
        sender_id: currentUserId,
        content: content.trim()
      });

    if (error) {
      hapticFeedback.error();
      toast.error("Σφάλμα αποστολής μηνύματος");
      return;
    }

    hapticFeedback.light();
    setNewMessage("");
    setShowQuickReplies(false);
  };

  const handleQuickReply = (message: string) => {
    sendMessage(message);
  };

  const handleReport = () => {
    toast.success("Αναφορά καταχωρήθηκε. Θα εξεταστεί από την ομάδα μας.");
  };

  const handleUnmatch = async () => {
    if (!matchId || !otherUser) return;
    
    try {
      // Delete all messages first
      await supabase
        .from("chat_messages")
        .delete()
        .eq("match_id", matchId);
      
      // Delete the match
      await supabase
        .from("matches")
        .delete()
        .eq("id", matchId);
      
      // Delete the swipes (both directions)
      await supabase
        .from("swipes")
        .delete()
        .or(`and(from_user_id.eq.${currentUserId},to_user_id.eq.${otherUser.id}),and(from_user_id.eq.${otherUser.id},to_user_id.eq.${currentUserId})`);
      
      toast.success("Το match διαγράφηκε");
      navigate("/chats");
    } catch (error) {
      console.error("Unmatch error:", error);
      toast.error("Σφάλμα κατά την αφαίρεση του match");
    }
  };

  const handleBlock = async () => {
    if (!otherUser) return;
    
    try {
      // Add to blocked users
      await supabase
        .from("blocked_users")
        .insert({
          blocker_id: currentUserId,
          blocked_id: otherUser.id,
          reason: "Blocked from chat"
        });
      
      // Also unmatch
      await handleUnmatch();
      
      toast.success(`Η ${otherUser.full_name} αποκλείστηκε`);
    } catch (error) {
      console.error("Block error:", error);
      toast.error("Σφάλμα κατά τον αποκλεισμό");
    }
  };

  const addEmoji = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    broadcastTyping();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 flex flex-col">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-4 flex items-center gap-3 sticky top-0 z-10 shadow-sm">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/chats")}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>

        <button 
          onClick={() => otherUser && navigate(`/profile/${otherUser.id}`)}
          className="relative cursor-pointer hover:scale-105 transition-transform"
        >
          {/* Floral outline */}
          <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-pink-200 via-purple-200 to-pink-300 animate-pulse" />
          <Avatar className="w-12 h-12 relative border-2 border-white shadow-md">
            <AvatarImage src={otherUser?.profile_photo_url} className="object-cover" />
            <AvatarFallback className="bg-gradient-to-br from-pink-100 to-purple-100">
              {otherUser?.full_name?.[0] || "M"}
            </AvatarFallback>
          </Avatar>
          {/* Online indicator */}
          {isOnline && (
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm" />
          )}
        </button>

        <div className="flex-1">
          <h2 className="font-bold text-base text-foreground">{otherUser?.full_name}</h2>
          <p className="text-xs text-muted-foreground">
            {isOnline ? (
              <span className="text-green-500 font-medium">Online τώρα</span>
            ) : lastSeen ? (
              `Τελευταία σύνδεση ${formatDistanceToNow(new Date(lastSeen), { addSuffix: true, locale: el })}`
            ) : (
              otherUser?.area
            )}
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={handleReport} className="text-amber-600">
              <Flag className="w-4 h-4 mr-2" />
              Αναφορά
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setShowUnmatchDialog(true)} className="text-orange-600">
              <UserX className="w-4 h-4 mr-2" />
              Unmatch
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowBlockDialog(true)} className="text-destructive">
              <Ban className="w-4 h-4 mr-2" />
              Αποκλεισμός
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Unmatch Dialog */}
      <AlertDialog open={showUnmatchDialog} onOpenChange={setShowUnmatchDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Αφαίρεση Match;</AlertDialogTitle>
            <AlertDialogDescription>
              Θα διαγραφεί το match και όλα τα μηνύματα με την {otherUser?.full_name}. 
              Η ενέργεια δεν αναιρείται.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Ακύρωση</AlertDialogCancel>
            <AlertDialogAction onClick={handleUnmatch} className="bg-orange-600 hover:bg-orange-700">
              Unmatch
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Block Dialog */}
      <AlertDialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Αποκλεισμός Χρήστη;</AlertDialogTitle>
            <AlertDialogDescription>
              Η {otherUser?.full_name} δεν θα μπορεί να σε δει ή να επικοινωνήσει μαζί σου. 
              Θα διαγραφεί επίσης το match και τα μηνύματα.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Ακύρωση</AlertDialogCancel>
            <AlertDialogAction onClick={handleBlock} className="bg-destructive hover:bg-destructive/90">
              Αποκλεισμός
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Safety Tip */}
      {showSafetyTip && (
        <div className="bg-secondary/20 border-b border-border px-4 py-2 flex items-start gap-2">
          <span className="text-xs text-muted-foreground flex-1">
            🌸 Υπενθύμιση: Το Momster είναι χώρος καλοσύνης & σεβασμού. Για ιατρικές συμβουλές, απευθυνθείτε πάντα σε επαγγελματία.
          </span>
          <button
            onClick={() => setShowSafetyTip(false)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-40 scroll-pb-40 space-y-3">
        {messages.map((message) => {
          const isOwn = message.sender_id === currentUserId;
          return (
            <div
              key={message.id}
              className={`flex gap-2 ${isOwn ? "justify-end" : "justify-start"}`}
            >
              {!isOwn && (
                <Avatar className="w-8 h-8 mt-1 flex-shrink-0">
                  <AvatarImage src={otherUser?.profile_photo_url} className="object-cover" />
                  <AvatarFallback>{otherUser?.full_name?.[0]}</AvatarFallback>
                </Avatar>
              )}
              
              <div className={`max-w-[75%] ${isOwn ? "items-end" : "items-start"} flex flex-col`}>
                <Card
                  className={`px-4 py-2 ${
                    isOwn
                      ? "bg-[#F7D7E8] border-[#F7D7E8] rounded-[18px] rounded-br-sm"
                      : "bg-[#EAE2FF] border-[#EAE2FF] rounded-[18px] rounded-bl-sm"
                  }`}
                  style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}
                >
                  {message.content.startsWith('[GIF]') ? (
                    <img 
                      src={message.content.replace('[GIF] ', '')} 
                      alt="GIF" 
                      className="max-w-[200px] rounded-lg"
                      loading="lazy"
                    />
                  ) : (
                    <p className="text-sm text-foreground whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                  )}
                </Card>
                <div className="flex items-center gap-1 mt-1 px-1">
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(message.created_at), {
                      addSuffix: true,
                      locale: el
                    })}
                  </span>
                  {isOwn && (
                    <span className="flex items-center">
                      {message.read_at ? (
                        <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                      ) : (
                        <Check className="w-3.5 h-3.5 text-muted-foreground" />
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        
        {/* Typing Indicator */}
        {isOtherUserTyping && (
          <div className="flex gap-2 justify-start">
            <Avatar className="w-8 h-8 mt-1 flex-shrink-0">
              <AvatarImage src={otherUser?.profile_photo_url} className="object-cover" />
              <AvatarFallback>{otherUser?.full_name?.[0]}</AvatarFallback>
            </Avatar>
            <Card className="bg-[#EAE2FF] border-[#EAE2FF] rounded-[18px] rounded-bl-sm px-4 py-3">
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground mr-2">μαμά πληκτρολογεί</span>
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </Card>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies */}
      {showQuickReplies && messages.length === 0 && (
        <div className="px-4 pb-2 space-y-2">
          <p className="text-xs text-muted-foreground text-center mb-2">
            Επίλεξε ένα γρήγορο μήνυμα ή γράψε το δικό σου! 💕
          </p>
          {QUICK_REPLIES.map((reply, index) => (
            <Button
              key={index}
              variant="outline"
              className="w-full justify-start text-left h-auto py-2 px-3"
              onClick={() => handleQuickReply(reply)}
            >
              <span className="text-sm">{reply}</span>
            </Button>
          ))}
        </div>
      )}

      {/* Smart Reply Suggestions */}
      {messages.length > 0 && messages[messages.length - 1]?.sender_id !== currentUserId && (
        <SmartReplySuggestions
          lastMessage={messages[messages.length - 1]?.content || ""}
          senderName={otherUser?.full_name?.split(' ')[0]}
          onSelect={(reply) => sendMessage(reply)}
        />
      )}

      {/* Emoji & GIF Bar */}
      <div className="px-4 py-2 border-t border-border bg-card flex gap-2 overflow-x-auto items-center">
        <MomGifPicker onSelect={(gifUrl) => sendMessage(`[GIF] ${gifUrl}`)} />
        <div className="w-px h-6 bg-border" />
        {EMOJI_SHORTCUTS.map((item, index) => (
          <Button
            key={index}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 flex-shrink-0"
            onClick={() => addEmoji(item.text || item.emoji || "")}
          >
            {item.icon ? <item.icon className="w-4 h-4" /> : item.text}
          </Button>
        ))}
      </div>

      {/* Input Area */}
      <div className="bg-card border-t border-border px-4 py-3 pb-24">
        <div className="flex gap-2">
          <Textarea
            value={newMessage}
            onChange={handleInputChange}
            placeholder="Γράψε το μήνυμά σου..."
            className="min-h-[44px] max-h-[120px] resize-none rounded-[22px] bg-background"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage(newMessage);
              }
            }}
          />
          <Button
            size="icon"
            className="rounded-full h-[44px] w-[44px] flex-shrink-0"
            onClick={() => sendMessage(newMessage)}
            disabled={!newMessage.trim()}
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
