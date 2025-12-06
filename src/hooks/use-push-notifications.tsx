import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    // Check if browser supports notifications
    if ("Notification" in window) {
      setSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    if (!supported) {
      console.log("Browser doesn't support notifications");
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === "granted";
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  };

  const showNotification = (title: string, options?: NotificationOptions) => {
    if (!supported || permission !== "granted") {
      console.log("Notifications not permitted");
      return;
    }

    try {
      const notification = new Notification(title, {
        icon: "/app-icons/icon-192.png",
        badge: "/app-icons/icon-96.png",
        ...options,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch (error) {
      console.error("Error showing notification:", error);
    }
  };

  return {
    supported,
    permission,
    requestPermission,
    showNotification,
  };
}

// Hook to listen for new match notifications in real-time
export function useMatchNotifications() {
  const { showNotification, permission, requestPermission, supported } = usePushNotifications();

  useEffect(() => {
    let channel: any = null;

    const setupNotificationListener = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Request permission on mount if not already granted
      if (supported && permission === "default") {
        requestPermission();
      }

      // Listen for new notifications
      channel = supabase
        .channel('match-notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            const notification = payload.new as any;
            
            // Show push notification for match type
            if (notification.type === 'match' && permission === "granted") {
              showNotification(notification.title || "Νέο Match! 💕", {
                body: notification.message,
                tag: `match-${notification.id}`,
                requireInteraction: true,
              });
            }

            // Also show in-app toast
            toast({
              title: notification.title,
              description: notification.message,
            });
          }
        )
        .subscribe();
    };

    setupNotificationListener();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [permission, supported]);
}
