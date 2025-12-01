import { Link, useLocation } from "react-router-dom";
import { Search, MessageCircle, ShoppingBag, User, MessageSquare } from "lucide-react";
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
    { path: "/ask-moms", icon: MessageSquare, label: "Ρώτα μια\nμαμά" },
    { path: "/marketplace", icon: ShoppingBag, label: "Marketplace" },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-white/95 backdrop-blur-sm z-50 py-3 shadow-[0_-2px_16px_rgba(200,120,141,0.12)]">
      <div className="max-w-screen-xl mx-auto flex justify-around items-center px-4 gap-2">
        {navItems.map(({ path, icon: Icon, label, badge, isCenter, isMascot }) => {
          const isActive = location.pathname === path || location.pathname.startsWith(path + '/');
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                "flex flex-col items-center justify-center gap-1.5 transition-all duration-300 relative min-w-[68px]",
                isCenter 
                  ? "px-5 py-4 bg-gradient-to-br from-[#C8788D] to-[#B86B80] text-white rounded-[20px] shadow-[0_4px_16px_rgba(200,120,141,0.35)] hover:shadow-[0_6px_20px_rgba(200,120,141,0.45)] -mt-3 scale-105"
                  : cn(
                      "px-3 py-2.5 rounded-2xl",
                      isActive 
                        ? "bg-gradient-to-br from-[#F5E5EA] to-[#F0D5DD] text-[#C8788D] shadow-sm" 
                        : "bg-transparent text-gray-400 hover:bg-[#FDF7F9] hover:text-[#C8788D]/70"
                    )
              )}
            >
              <div className="relative flex items-center justify-center">
                {isMascot ? (
                  <img src={mascot} alt="Momster" className="w-11 h-11 object-contain drop-shadow-md" />
                ) : (
                  Icon && <Icon 
                    className={cn(
                      "w-6 h-6 transition-all duration-300",
                      isCenter && "stroke-white drop-shadow-sm",
                      !isCenter && isActive && "stroke-[2.5]",
                      !isCenter && !isActive && "stroke-[2]"
                    )} 
                    strokeWidth={isCenter ? 2.5 : isActive ? 2.5 : 2}
                  />
                )}
                {badge !== undefined && badge > 0 && (
                  <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-gradient-to-br from-rose-400 to-rose-500 border border-white shadow-sm animate-pulse" />
                )}
              </div>
              <span className={cn(
                "text-center leading-tight whitespace-pre-line transition-all duration-300",
                isCenter 
                  ? "text-[11px] font-bold tracking-wide" 
                  : "text-[10px] font-semibold",
                isActive && !isCenter && "font-bold"
              )}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
