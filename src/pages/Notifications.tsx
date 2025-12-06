import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import SwipeableNotification from "@/components/SwipeableNotification";
import { el } from "date-fns/locale";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  icon?: string;
  read: boolean;
  created_at: string;
  metadata?: any;
}

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    
    // Subscribe to realtime updates
    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications'
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", id);

      if (error) throw error;
      
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      ));
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast.error("Failed to mark as read");
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      setNotifications(notifications.filter(n => n.id !== id));
      toast.success("Notification deleted");
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("Failed to delete notification");
    }
  };

  const markAllAsRead = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", user.id)
        .eq("read", false);

      if (error) throw error;
      
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast.error("Failed to mark all as read");
    }
  };


  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 pt-20 pb-24 px-3">
      <div className="container max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bell className="w-6 h-6 text-primary" />
            <div>
              <h1 className="text-xl font-bold text-foreground">Mom Alerts 💞</h1>
              {unreadCount > 0 && (
                <p className="text-xs text-muted-foreground">
                  {unreadCount} νέ{unreadCount === 1 ? 'α' : 'ες'}
                </p>
              )}
            </div>
          </div>
          
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              className="gap-1 text-xs h-8"
            >
              <Check className="w-3 h-3" />
              Διαβάστηκαν
            </Button>
          )}
        </div>

        <ScrollArea className="h-[calc(100vh-160px)]">
          <div className="space-y-2">
            {loading ? (
              <Card className="p-6 text-center">
                <div className="animate-spin text-4xl mb-2">🌸</div>
                <p className="text-muted-foreground text-sm">Φόρτωση...</p>
              </Card>
            ) : notifications.length === 0 ? (
              <Card className="p-8 text-center">
                <Bell className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold text-foreground mb-1">Καμία ειδοποίηση</h3>
                <p className="text-sm text-muted-foreground">
                  Θα δεις ειδοποιήσεις για matches, μηνύματα κ.ά.!
                </p>
              </Card>
            ) : (
              notifications.map((notification) => (
                <SwipeableNotification
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                  onDelete={deleteNotification}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
