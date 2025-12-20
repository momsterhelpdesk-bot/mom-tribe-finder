import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

// Notification sound - using a soft chime sound
const NOTIFICATION_SOUND_URL = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [supported, setSupported] = useState(false);
  const [serviceWorkerReady, setServiceWorkerReady] = useState(false);

  useEffect(() => {
    // Check if browser supports notifications
    if ("Notification" in window) {
      setSupported(true);
      setPermission(Notification.permission);
    }

    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js")
        .then((registration) => {
          console.log("[Push] Service Worker registered:", registration.scope);
          setServiceWorkerReady(true);
        })
        .catch((error) => {
          console.error("[Push] Service Worker registration failed:", error);
        });
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!supported) {
      console.log("[Push] Browser doesn't support notifications");
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === "granted") {
        console.log("[Push] Permission granted");
        // Save preference to user profile
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from("profiles")
            .update({ 
              notification_settings: { 
                push_enabled: true,
                granted_at: new Date().toISOString()
              }
            })
            .eq("id", user.id);
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error("[Push] Error requesting permission:", error);
      return false;
    }
  }, [supported]);

  const showNotification = useCallback((title: string, options?: NotificationOptions & { url?: string }) => {
    if (!supported || permission !== "granted") {
      console.log("[Push] Notifications not permitted");
      return;
    }

    try {
      // Use service worker for better notification handling
      if (serviceWorkerReady && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.showNotification(title, {
            icon: "/app-icons/icon-192.png",
            badge: "/app-icons/icon-96.png",
            data: { url: options?.url || "/" },
            ...options,
          });
        });
      } else {
        // Fallback to native Notification API
        const notification = new Notification(title, {
          icon: "/app-icons/icon-192.png",
          badge: "/app-icons/icon-96.png",
          ...options,
        });

        notification.onclick = () => {
          window.focus();
          if (options?.url) {
            window.location.href = options.url;
          }
          notification.close();
        };
      }
    } catch (error) {
      console.error("[Push] Error showing notification:", error);
    }
  }, [supported, permission, serviceWorkerReady]);

  return {
    supported,
    permission,
    serviceWorkerReady,
    requestPermission,
    showNotification,
  };
}

// Hook to listen for new notifications in real-time
export function useMatchNotifications() {
  const { showNotification, permission, requestPermission, supported } = usePushNotifications();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio(NOTIFICATION_SOUND_URL);
    audioRef.current.volume = 0.5;
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const playNotificationSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((e) => {
        console.log("[Push] Could not play notification sound:", e);
      });
    }
  }, []);

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const setupNotificationListener = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Listen for new notifications
      channel = supabase
        .channel('user-notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            const notification = payload.new as {
              id: string;
              type: string;
              title: string;
              message: string;
              metadata?: { url?: string };
            };
            
            // Play sound for match notifications
            if (notification.type === 'match') {
              playNotificationSound();
            }

            // Show push notification if permitted
            if (permission === "granted") {
              const url = notification.type === 'match' 
                ? '/chats' 
                : notification.type === 'message' 
                  ? notification.metadata?.url || '/chats'
                  : '/notifications';

              showNotification(notification.title || "Νέα ειδοποίηση! 💕", {
                body: notification.message,
                tag: `notification-${notification.id}`,
                requireInteraction: notification.type === 'match',
                url,
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
  }, [permission, showNotification, playNotificationSound]);

  return { requestPermission, supported, permission, playNotificationSound };
}
