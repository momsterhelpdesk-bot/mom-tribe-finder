import { Link, useLocation } from "react-router-dom";
import { Heart, MessageCircle, Calendar, ShoppingBag, User, Sparkles, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useNotifications } from "@/hooks/use-notifications";

export default function BottomNav() {
  const location = useLocation();
  const { unreadCount } = useNotifications();

  const navItems = [
    { path: "/discover", icon: Heart, label: "Find a New Friend 🌸" },
    { path: "/ask-moms", icon: MessageCircle, label: "Ρώτα μαμά" },
    { path: "/notifications", icon: Bell, label: "Notifications", badge: unreadCount },
    { path: "/marketplace", icon: ShoppingBag, label: "Marketplace" },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="max-w-screen-xl mx-auto flex justify-around items-center h-16 px-2">
        {navItems.map(({ path, icon: Icon, label, badge }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors flex-1 relative",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="relative">
                <Icon className={cn("w-5 h-5", isActive && "fill-primary")} />
                {badge && badge > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-[10px]"
                  >
                    {badge > 9 ? '9+' : badge}
                  </Badge>
                )}
              </div>
              <span className="text-xs font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
