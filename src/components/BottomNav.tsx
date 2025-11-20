import { Link, useLocation } from "react-router-dom";
import { Heart, MessageCircle, ShoppingBag, User, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useNotifications } from "@/hooks/use-notifications";
import mascot from "@/assets/mascot.jpg";
import logo from "@/assets/logo.jpg";

export default function BottomNav() {
  const location = useLocation();
  const { unreadCount } = useNotifications();

  const navItems = [
    { path: "/discover", icon: Heart, label: "Find a New Friend" },
    { path: "/ask-moms", icon: MessageCircle, label: "Ρώτα μαμά" },
    { path: "/daily-boost", icon: Sparkles, label: "Daily Boost" },
    { path: "/marketplace", icon: ShoppingBag, label: "Marketplace" },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-pink-50/95 to-purple-50/95 backdrop-blur-md border-t-2 border-primary/30 z-50 px-2 py-2 shadow-lg">
      <div className="max-w-screen-xl mx-auto flex justify-around items-center gap-1">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-2xl transition-all flex-1 relative",
                isActive
                  ? "bg-gradient-to-br from-primary to-pink-500 text-white shadow-xl scale-110 border-2 border-white"
                  : "text-primary hover:text-primary hover:bg-white/50 border-2 border-transparent"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive && "fill-white")} />
              <span className="text-[10px] font-bold text-center leading-tight">{label}</span>
            </Link>
          );
        })}
      </div>
      {/* Logo and Mascot Footer */}
      <div className="flex items-center justify-center gap-2 mt-1 pb-1">
        <img src={logo} alt="Momster Logo" className="h-4 object-contain opacity-60" />
        <img src={mascot} alt="Momster Mascot" className="h-5 object-contain opacity-60" />
      </div>
    </nav>
  );
}
