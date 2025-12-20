import { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePushNotifications } from "@/hooks/use-push-notifications";

export function NotificationPermissionBanner() {
  const { supported, permission, requestPermission } = usePushNotifications();
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user has already dismissed this banner
    const wasDismissed = localStorage.getItem("notification_banner_dismissed");
    if (wasDismissed) {
      setDismissed(true);
    }
  }, []);

  // Don't show if not supported, already granted/denied, or dismissed
  if (!supported || permission !== "default" || dismissed) {
    return null;
  }

  const handleEnable = async () => {
    setLoading(true);
    await requestPermission();
    setLoading(false);
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem("notification_banner_dismissed", "true");
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-primary text-primary-foreground px-4 py-3 shadow-lg animate-in slide-in-from-top duration-300">
      <div className="max-w-lg mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Bell className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm">
            Ενεργοποίησε τις ειδοποιήσεις για να μαθαίνεις πρώτη για νέα matches!
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={handleEnable}
            disabled={loading}
            className="whitespace-nowrap"
          >
            {loading ? "..." : "Ενεργοποίηση"}
          </Button>
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-primary-foreground/10 rounded"
            aria-label="Κλείσιμο"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
