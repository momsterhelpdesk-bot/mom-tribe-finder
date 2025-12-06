import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks/use-notifications";
import { Bell } from "lucide-react";

export default function MomAlerts() {
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  const go = () => navigate("/notifications");

  return (
    <>
      {/* Top-right pastel bell */}
      <Button
        aria-label="Mom Alerts"
        onClick={go}
        variant="secondary"
        size="icon"
        className="fixed top-4 right-4 z-50 rounded-full bg-card border border-border shadow-md hover:shadow-lg hover-scale"
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

      {/* Floating bottom-right bubble - only when there are alerts - with easy dismiss */}
      {unreadCount > 0 && (
        <button
          onClick={go}
          className="fixed bottom-24 right-4 z-50 rounded-full bg-secondary text-foreground border border-border shadow-lg pl-4 pr-2 py-2 flex items-center gap-2 animate-enter hover-scale group"
        >
          <span className="text-lg">🌸</span>
          <span className="text-sm font-semibold">Mom Alerts</span>
          <Badge variant="default" className="ml-1">{unreadCount}</Badge>
          <span 
            onClick={(e) => {
              e.stopPropagation();
              // Hide the bubble for this session
              const bubble = e.currentTarget.closest('button');
              if (bubble) bubble.style.display = 'none';
            }}
            className="ml-1 w-6 h-6 rounded-full bg-muted hover:bg-muted-foreground/20 flex items-center justify-center text-xs cursor-pointer"
            aria-label="Dismiss"
          >
            ✕
          </span>
        </button>
      )}
    </>
  );
}
