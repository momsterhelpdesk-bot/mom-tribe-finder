import { Link, useLocation } from "react-router-dom";
import { Search, MessageCircle, ShoppingBag, User, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/hooks/use-notifications";
import mascot from "@/assets/mascot.jpg";

export default function BottomNav() {
  const location = useLocation();
  const { unreadCount } = useNotifications();

  const navItems = [
    { path: "/discover", icon: Search, label: "Find a mom friend" },
    { path: "/chats", icon: MessageCircle, label: "Chat", badge: unreadCount },
    { path: "/daily-boost", icon: Sparkles, label: "Momster Home", isCenter: true },
    { path: "/marketplace", icon: ShoppingBag, label: "Marketplace" },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md z-50 py-3 shadow-[0_-2px_20px_rgba(0,0,0,0.08)]">
      <div className="max-w-screen-xl mx-auto flex justify-center items-end gap-2 px-4">
        {navItems.map(({ path, icon: Icon, label, badge, isCenter }) => {
          const isActive = location.pathname === path || location.pathname.startsWith(path + '/');
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                "flex flex-col items-center justify-center gap-1.5 rounded-3xl transition-all relative",
                isCenter 
                  ? "px-6 py-3 bg-nav-pink text-white shadow-lg -mt-4"
                  : "px-4 py-2",
                !isCenter && isActive && "text-nav-pink",
                !isCenter && !isActive && "text-gray-400"
              )}
            >
              <div className="relative">
                <Icon className={cn(
                  isCenter ? "w-7 h-7" : "w-6 h-6",
                  isCenter && "fill-white"
                )} />
                {badge && badge > 0 && (
                  <div className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-rose-500 border-2 border-white" />
                )}
              </div>
              <span className={cn(
                "font-semibold text-center leading-tight whitespace-nowrap",
                isCenter ? "text-xs" : "text-[10px]"
              )}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
