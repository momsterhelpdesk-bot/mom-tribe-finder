import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks/use-notifications";
import { Bell, X } from "lucide-react";

export default function MomAlerts() {
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const [bubbleDismissed, setBubbleDismissed] = useState(false);
  const [showBubble, setShowBubble] = useState(false);

  const go = () => navigate("/notifications");

  const dismissBubble = (e: React.MouseEvent) => {
    e.stopPropagation();
    setBubbleDismissed(true);
  };

  // Auto-dismiss bubble after 5 seconds
  useEffect(() => {
    if (unreadCount > 0 && !bubbleDismissed) {
      setShowBubble(true);
      const timer = setTimeout(() => {
        setShowBubble(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [unreadCount, bubbleDismissed]);

  return (
    <>
      {/* Top-right bell button - minimal and subtle */}
      <Button
        aria-label="Mom Alerts"
        onClick={go}
        variant="ghost"
        size="icon"
        className="fixed right-4 z-40 rounded-full bg-background/60 backdrop-blur-sm border border-border/50 shadow-sm hover:shadow-md transition-all hover:bg-background/80"
        style={{ top: 'calc(0.8rem + env(safe-area-inset-top, 0px))' }}
      >
        <div className="relative">
          <Bell className="w-4 h-4 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[9px] font-bold">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </div>
      </Button>

      {/* Floating bottom bubble - subtle, auto-dismiss, tap anywhere to go */}
      {unreadCount > 0 && !bubbleDismissed && showBubble && (
        <div 
          className="fixed left-1/2 -translate-x-1/2 z-40 animate-in fade-in slide-in-from-bottom-4 duration-300"
          style={{ bottom: 'calc(6rem + var(--bottom-nav-h))' }}
          onClick={go}
        >
          <div className="bg-background/90 backdrop-blur-md text-foreground border border-border/50 shadow-lg px-4 py-2 rounded-full flex items-center gap-2 cursor-pointer hover:bg-background transition-colors">
            <span className="text-sm">🌸</span>
            <span className="text-xs font-medium">
              {unreadCount} {unreadCount === 1 ? "νέα ειδοποίηση" : "νέες ειδοποιήσεις"}
            </span>
            <button
              onClick={dismissBubble}
              className="ml-1 w-5 h-5 rounded-full hover:bg-muted flex items-center justify-center transition-colors flex-shrink-0"
              aria-label="Dismiss"
            >
              <X className="w-3 h-3 text-muted-foreground" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
