import { useEffect, useState } from "react";

export function useServiceWorker() {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Register service worker
      navigator.serviceWorker.register('/sw.js')
        .then((reg) => {
          setRegistration(reg);
          setIsReady(true);
        })
        .catch((error) => {
          console.error('[SW] Service Worker registration failed:', error);
        });

      // Handle updates
      navigator.serviceWorker.ready.then((reg) => {
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              }
            });
          }
        });
      });
    }
  }, []);

  return { registration, isReady };
}

export function useAdminPushNotifications() {
  const { registration, isReady } = useServiceWorker();
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);
      
      if (permission === 'granted') {
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  const subscribeToPush = async () => {
    if (!registration) {
      return null;
    }

    try {
      // Check if already subscribed
      const existingSubscription = await (registration as any).pushManager.getSubscription();
      if (existingSubscription) {
        setSubscription(existingSubscription);
        return existingSubscription;
      }

      // Subscribe to push
      const newSubscription = await (registration as any).pushManager.subscribe({
        userVisibleOnly: true,
        // Note: In production, you'd use a VAPID key here
        // applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });

      setSubscription(newSubscription);
      return newSubscription;
    } catch (error) {
      console.error('Failed to subscribe to push:', error);
      return null;
    }
  };

  const showLocalNotification = (title: string, options?: NotificationOptions) => {
    if (permissionStatus !== 'granted') {
      return;
    }

    if (registration) {
      registration.showNotification(title, {
        icon: '/app-icons/icon-192.png',
        badge: '/app-icons/icon-96.png',
        ...options,
      });
    } else {
      // Fallback to native Notification API
      new Notification(title, {
        icon: '/app-icons/icon-192.png',
        ...options,
      });
    }
  };

  return {
    isReady,
    permissionStatus,
    subscription,
    requestPermission,
    subscribeToPush,
    showLocalNotification,
  };
}
