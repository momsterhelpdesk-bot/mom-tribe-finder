import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle, Flag } from "lucide-react";
import { toast } from "sonner";
import mascot from "@/assets/mascot.jpg";

export default function Chats() {
  const handleReportProfile = (name: string) => {
    toast.success(`Αναφορά για ${name} καταχωρήθηκε`);
  };

  const chats = [
    {
      id: 1,
      name: "Sarah Johnson",
      lastMessage: "Would love to meet at the park tomorrow!",
      time: "10:30 AM",
      unread: 2,
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100"
    },
    {
      id: 2,
      name: "Maria Papadopoulou",
      lastMessage: "Thanks for the baby tips! 💕",
      time: "Yesterday",
      unread: 0,
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
    },
    {
      id: 3,
      name: "Emma Wilson",
      lastMessage: "Are you going to the playdate on Friday?",
      time: "2 days ago",
      unread: 1,
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
          Συνομιλίες
        </h1>

        <div className="space-y-3">
          {chats.map((chat) => (
            <Card
              key={chat.id}
              className="p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                <Avatar className="w-14 h-14 cursor-pointer">
                  <AvatarImage src={chat.avatar} alt={chat.name} />
                  <AvatarFallback>{chat.name[0]}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0 cursor-pointer">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-foreground">{chat.name}</h3>
                    <span className="text-xs text-muted-foreground">{chat.time}</span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                </div>

                <div className="flex items-center gap-2">
                  {chat.unread > 0 && (
                    <Badge className="rounded-full px-2">{chat.unread}</Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReportProfile(chat.name);
                    }}
                  >
                    <Flag className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {chats.length === 0 && (
          <div className="text-center py-12">
            <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No messages yet. Start connecting with moms!</p>
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
