import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { format } from "date-fns";
import { el } from "date-fns/locale";
import { ArrowLeft, Send, MapPin, Clock, Info, Users } from "lucide-react";

interface MeetDetails {
  id: string;
  meet_type: string;
  area: string;
  city: string;
  meet_date: string;
  meet_time: string;
  exact_location: string | null;
  description: string | null;
}

interface ChatMessage {
  id: string;
  content: string;
  sender_id: string;
  is_system_message: boolean;
  created_at: string;
  sender_name?: string;
}

const CHAT_NAMES = {
  playdate: '🧸 Μαμαδοπαρέα',
  stroller_walk: '🚶‍♀️ Μαμαδοπαρέα σε βόλτα',
  coffee: '☕ Μαμαδοπαρέα για καφέ',
  playground: '🛝 Μαμαδοπαρέα στον παιδότοπο',
  park_walk: '🌳 Μαμαδοπαρέα στο πάρκο',
};

export default function MomMeetChat() {
  const { meetId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [meet, setMeet] = useState<MeetDetails | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
    setupRealtime();
  }, [meetId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadData = async () => {
    if (!meetId) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    setCurrentUserId(user.id);

    // Load meet details
    const { data: meetData } = await supabase
      .from("mom_meets")
      .select("*")
      .eq("id", meetId)
      .single();

    if (meetData) {
      setMeet(meetData);
    }

    // Load messages
    const { data: messagesData } = await supabase
      .from("mom_meet_chats")
      .select("*")
      .eq("mom_meet_id", meetId)
      .order("created_at", { ascending: true });

    if (messagesData) {
      // Get sender names
      const messagesWithNames = await Promise.all(messagesData.map(async (msg) => {
        if (msg.is_system_message) {
          return { ...msg, sender_name: "Momster" };
        }
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", msg.sender_id)
          .single();
        return { ...msg, sender_name: profile?.full_name || "Μαμά" };
      }));
      setMessages(messagesWithNames);
    }
  };

  const setupRealtime = () => {
    if (!meetId) return;

    const channel = supabase
      .channel(`mom-meet-chat-${meetId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'mom_meet_chats',
          filter: `mom_meet_id=eq.${meetId}`,
        },
        async (payload) => {
          const newMsg = payload.new as ChatMessage;
          // Get sender name
          if (!newMsg.is_system_message) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("full_name")
              .eq("id", newMsg.sender_id)
              .single();
            newMsg.sender_name = profile?.full_name || "Μαμά";
          } else {
            newMsg.sender_name = "Momster";
          }
          setMessages(prev => [...prev, newMsg]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentUserId || !meetId) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from("mom_meet_chats")
        .insert({
          mom_meet_id: meetId,
          sender_id: currentUserId,
          content: newMessage.trim(),
        });

      if (error) throw error;
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Σφάλμα αποστολής");
    } finally {
      setSending(false);
    }
  };

  const chatName = meet ? (CHAT_NAMES[meet.meet_type as keyof typeof CHAT_NAMES] || '🫂 Μαμαδοπαρέα') : 'Chat';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-background/95 backdrop-blur-md border-b z-50" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/mom-meets")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="font-semibold">{chatName}</h1>
              {meet && (
                <p className="text-xs text-muted-foreground">
                  {format(new Date(meet.meet_date), "EEEE, d MMMM", { locale: el })} • {meet.meet_time.slice(0, 5)}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Pinned Info */}
      {meet && (
        <div className="fixed top-16 left-0 right-0 bg-rose-50 border-b z-40">
          <div className="max-w-2xl mx-auto px-4 py-2">
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>{meet.area}, {meet.city}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{meet.meet_time.slice(0, 5)}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              🍼 Αν κάτι αλλάξει, γράψτε εδώ
            </p>
          </div>
        </div>
      )}

      {/* System Message */}
      <div className="pt-32 px-4">
        <Card className="bg-blue-50/50 border-blue-200/30 mb-4">
          <div className="p-3 text-xs text-blue-700">
            <Info className="w-4 h-4 inline mr-1" />
            Αυτό το chat είναι μόνο για πρακτικές λεπτομέρειες (σημείο, ώρα, καθυστέρηση). 
            Χωρίς υποχρέωση συμμετοχής 🤍
          </div>
        </Card>

        <Card className="bg-amber-50/50 border-amber-200/30 mb-4">
          <div className="p-3 text-xs text-amber-700">
            📍 Δημόσιοι χώροι μόνο<br />
            🫂 Με προσοχή & ασφάλεια<br />
            Εμπιστεύσου το ένστικτό σου 🤍
          </div>
        </Card>
      </div>

      {/* Messages */}
      <div className="flex-1 px-4 pb-20 overflow-y-auto">
        <div className="space-y-3">
          {messages.map((msg) => {
            const isOwn = msg.sender_id === currentUserId;
            
            if (msg.is_system_message) {
              return (
                <div key={msg.id} className="text-center">
                  <span className="text-xs text-muted-foreground bg-gray-100 px-3 py-1 rounded-full">
                    {msg.content}
                  </span>
                </div>
              );
            }

            return (
              <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] ${isOwn ? 'bg-rose-100' : 'bg-gray-100'} rounded-2xl px-4 py-2`}>
                  {!isOwn && (
                    <p className="text-xs font-medium text-rose-600 mb-1">{msg.sender_name}</p>
                  )}
                  <p className="text-sm">{msg.content}</p>
                  <p className="text-xs text-muted-foreground mt-1 text-right">
                    {format(new Date(msg.created_at), "HH:mm")}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4" style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}>
        <div className="max-w-2xl mx-auto flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Γράψε μήνυμα..."
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
            disabled={sending}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sending}
            size="icon"
            className="bg-rose-400 hover:bg-rose-500"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
