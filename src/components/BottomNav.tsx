import { Link, useLocation } from "react-router-dom";
import { Search, MessageCircle, ShoppingBag, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/hooks/use-notifications";
import mascot from "@/assets/mascot.jpg";

export default function BottomNav() {
  const location = useLocation();
  const { unreadCount } = useNotifications();

  const navItems = [
    { path: "/discover", icon: Search, label: "Find a mom\nfriend" },
    { path: "/chats", icon: MessageCircle, label: "Chat", badge: unreadCount },
    { path: "/daily-boost", label: "Momster Home", isCenter: true, isMascot: true },
    { path: "/marketplace", icon: ShoppingBag, label: "Marketplace" },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white z-50 py-4 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
      <div className="max-w-screen-xl mx-auto flex justify-around items-center px-3">
        {navItems.map(({ path, icon: Icon, label, badge, isCenter, isMascot }) => {
          const isActive = location.pathname === path || location.pathname.startsWith(path + '/');
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                "flex flex-col items-center justify-center gap-2 transition-all relative",
                isCenter 
                  ? "px-6 py-5 bg-nav-pink text-white rounded-3xl shadow-xl -mt-4"
                  : "px-2 py-2",
                !isCenter && isActive && "text-nav-pink",
                !isCenter && !isActive && "text-gray-400"
              )}
            >
              <div className="relative flex items-center justify-center">
                {isMascot ? (
                  <img src={mascot} alt="Momster" className="w-12 h-12 object-contain" />
                ) : (
                  Icon && <Icon 
                    className={cn(
                      "w-7 h-7",
                      isCenter && "stroke-white",
                      !isCenter && "stroke-[2]"
                    )} 
                    strokeWidth={2.5}
                  />
                )}
                {badge && badge > 0 && (
                  <div className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-rose-500 border-2 border-white" />
                )}
              </div>
              <span className={cn(
                "text-center leading-tight whitespace-pre-line",
                isCenter 
                  ? "text-sm font-semibold" 
                  : "text-xs font-medium"
              )}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
