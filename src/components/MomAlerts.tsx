import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks/use-notifications";
import { Bell, X } from "lucide-react";

export default function MomAlerts() {
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const [bubbleDismissed, setBubbleDismissed] = useState(false);

  const go = () => navigate("/notifications");

  const dismissBubble = (e: React.MouseEvent) => {
    e.stopPropagation();
    setBubbleDismissed(true);
  };

  return (
    <>
      {/* Top-right bell button */}
      <Button
        aria-label="Mom Alerts"
        onClick={go}
        variant="secondary"
        size="icon"
        className="fixed top-4 right-4 z-50 rounded-full bg-card border border-border shadow-md hover:shadow-lg transition-transform active:scale-95"
      >
        <div className="relative">
          <Bell className="w-5 h-5 text-foreground" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-[10px]"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </div>
      </Button>

      {/* Floating bottom bubble - compact and easy to dismiss */}
      {unreadCount > 0 && !bubbleDismissed && (
        <div className="fixed bottom-24 right-3 left-3 z-50 flex justify-center pointer-events-none">
          <button
            onClick={go}
            className="pointer-events-auto bg-card/95 backdrop-blur-sm text-foreground border border-border shadow-lg px-4 py-2.5 rounded-full flex items-center gap-2 animate-fade-in max-w-[280px]"
          >
            <span className="text-base">🌸</span>
            <span className="text-sm font-medium truncate">
              {unreadCount} {unreadCount === 1 ? "ειδοποίηση" : "ειδοποιήσεις"}
            </span>
            <button
              onClick={dismissBubble}
              className="ml-1 w-7 h-7 rounded-full bg-muted hover:bg-destructive/20 flex items-center justify-center transition-colors flex-shrink-0"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </button>
        </div>
      )}
    </>
  );
}
