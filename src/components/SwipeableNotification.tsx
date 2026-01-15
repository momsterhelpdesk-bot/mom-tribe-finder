import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Trash2, Bell, MessageCircle, Heart, Calendar, ShoppingBag } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { el } from "date-fns/locale";
import { hapticFeedback } from "@/hooks/use-haptic";

interface SwipeableNotificationProps {
  notification: {
    id: string;
    type: string;
    title: string;
    message: string;
    read: boolean;
    created_at: string;
  };
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function SwipeableNotification({
  notification,
  onMarkAsRead,
  onDelete,
}: SwipeableNotificationProps) {
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const startX = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isDeleting) return;
    startX.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || isDeleting) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX.current;
    // Only allow left swipe (negative values)
    if (diff < 0) {
      setTranslateX(Math.max(diff, -100));
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (translateX < -60) {
      hapticFeedback.light();
      triggerDelete();
    } else {
      setTranslateX(0);
    }
  };

  const triggerDelete = () => {
    setIsDeleting(true);
    setTimeout(() => onDelete(notification.id), 300);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "message":
        return <MessageCircle className="w-5 h-5 text-primary" />;
      case "match":
        return <Heart className="w-5 h-5 text-primary" />;
      case "playdate":
        return <Calendar className="w-5 h-5 text-accent" />;
      case "marketplace":
        return <ShoppingBag className="w-5 h-5 text-accent" />;
      default:
        return <Bell className="w-5 h-5 text-muted-foreground" />;
    }
  };

  return (
    <div 
      className={`relative overflow-hidden rounded-lg transition-all duration-300 ${
        isDeleting ? "opacity-0 scale-95 -translate-x-4 h-0 mb-0" : "opacity-100 scale-100 h-auto"
      }`}
      style={{ 
        maxHeight: isDeleting ? 0 : 200,
        marginBottom: isDeleting ? 0 : undefined,
        transitionProperty: "opacity, transform, max-height, margin"
      }}
    >
      {/* Delete background */}
      <div className="absolute inset-y-0 right-0 w-24 bg-destructive flex items-center justify-center rounded-r-lg">
        <Trash2 className="w-5 h-5 text-destructive-foreground" />
      </div>

      {/* Swipeable card */}
      <Card
        ref={cardRef}
        className={`p-3 relative transition-transform ${
          !notification.read ? "bg-primary/5 border-primary/30" : ""
        } ${isDragging ? "" : "duration-200"}`}
        style={{ transform: `translateX(${translateX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center">
            {getIcon(notification.type)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="font-semibold text-foreground text-sm truncate">
                {notification.title}
              </h3>
              {!notification.read && (
                <Badge variant="default" className="text-[10px] px-1.5 py-0">
                  Νέο
                </Badge>
              )}
            </div>

            <p className="text-xs text-muted-foreground line-clamp-2 mb-1.5">
              {notification.message}
            </p>

            <div className="flex items-center justify-between">
              <p className="text-[10px] text-muted-foreground">
                {formatDistanceToNow(new Date(notification.created_at), {
                  addSuffix: true,
                  locale: el,
                })}
              </p>

              <div className="flex gap-1">
                {!notification.read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onMarkAsRead(notification.id)}
                    className="h-7 px-2"
                  >
                    <Check className="w-3 h-3" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={triggerDelete}
                  className="h-7 px-2 text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
