import { Link, useLocation } from "react-router-dom";
import { Search, MessageCircle, ShoppingBag, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/hooks/use-notifications";
import mascot from "@/assets/mascot.jpg";

export default function BottomNav() {
  const location = useLocation();
  const { unreadCount } = useNotifications();

  const navItems = [
    { path: "/discover", icon: Search, label: "Find a mom friend" },
    { path: "/chats", icon: MessageCircle, label: "Chat", badge: unreadCount },
    { path: "/daily-boost", label: "Momster Home", isCenter: true, isMascot: true },
    { path: "/marketplace", icon: ShoppingBag, label: "Marketplace" },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md z-50 py-4 shadow-[0_-2px_20px_rgba(0,0,0,0.08)]">
      <div className="max-w-screen-xl mx-auto flex justify-around items-end px-2">
        {navItems.map(({ path, icon: Icon, label, badge, isCenter, isMascot }) => {
          const isActive = location.pathname === path || location.pathname.startsWith(path + '/');
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                "flex flex-col items-center justify-center gap-2 rounded-2xl transition-all relative min-w-[70px]",
                isCenter 
                  ? "px-5 py-4 bg-nav-pink text-white shadow-lg -mt-6 scale-110"
                  : "px-3 py-2",
                !isCenter && isActive && "text-nav-pink",
                !isCenter && !isActive && "text-gray-500"
              )}
            >
              <div className="relative">
                {isMascot ? (
                  <img src={mascot} alt="Momster" className="w-10 h-10 object-contain" />
                ) : (
                  Icon && <Icon className={cn(
                    isCenter ? "w-8 h-8" : "w-6 h-6",
                    isCenter && "fill-white"
                  )} />
                )}
                {badge && badge > 0 && (
                  <div className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-rose-500 border-2 border-white" />
                )}
              </div>
              <span className={cn(
                "font-bold text-center leading-tight",
                isCenter ? "text-xs whitespace-nowrap" : "text-[11px] max-w-[65px]"
              )}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
