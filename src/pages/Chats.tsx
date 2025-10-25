import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageCircle } from "lucide-react";

export default function Chats() {
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
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30">
      <div className="max-w-2xl mx-auto pt-20 pb-24 px-4">
        <h1 className="text-2xl font-bold mb-6 text-foreground">Messages</h1>

        <div className="space-y-3">
          {chats.map((chat) => (
            <Card
              key={chat.id}
              className="p-4 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <Avatar className="w-14 h-14">
                  <AvatarImage src={chat.avatar} alt={chat.name} />
                  <AvatarFallback>{chat.name[0]}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-foreground">{chat.name}</h3>
                    <span className="text-xs text-muted-foreground">{chat.time}</span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                </div>

                {chat.unread > 0 && (
                  <Badge className="rounded-full px-2">{chat.unread}</Badge>
                )}
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
    </div>
  );
}
