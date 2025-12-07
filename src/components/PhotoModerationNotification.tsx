import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface PhotoModerationNotificationProps {
  userId: string;
}

export function PhotoModerationNotification({ userId }: PhotoModerationNotificationProps) {
  const [notification, setNotification] = useState<{
    type: "approved" | "rejected";
    reason?: string;
    photoUrl?: string;
  } | null>(null);

  useEffect(() => {
    // Check for any recent moderation decisions
    const checkModerationStatus = async () => {
      const { data: moderationItems } = await supabase
        .from("photo_moderation_queue")
        .select("*")
        .eq("user_id", userId)
        .in("manual_status", ["approved", "rejected"])
        .order("reviewed_at", { ascending: false })
        .limit(1);

      if (moderationItems && moderationItems.length > 0) {
        const item = moderationItems[0];
        // Check if this notification was already seen (within last 24 hours)
        const lastSeen = localStorage.getItem(`photo_moderation_seen_${item.id}`);
        if (!lastSeen) {
          setNotification({
            type: item.manual_status as "approved" | "rejected",
            reason: item.rejection_reason || undefined,
            photoUrl: item.photo_url
          });
          localStorage.setItem(`photo_moderation_seen_${item.id}`, Date.now().toString());
        }
      }
    };

    checkModerationStatus();

    // Subscribe to realtime updates
    const channel = supabase
      .channel("photo-moderation-updates")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "photo_moderation_queue",
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const item = payload.new as any;
          if (item.manual_status === "approved" || item.manual_status === "rejected") {
            setNotification({
              type: item.manual_status,
              reason: item.rejection_reason || undefined,
              photoUrl: item.photo_url
            });
            localStorage.setItem(`photo_moderation_seen_${item.id}`, Date.now().toString());
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const handleClose = () => {
    setNotification(null);
  };

  if (!notification) return null;

  return (
    <Dialog open={!!notification} onOpenChange={handleClose}>
      <DialogContent className={`sm:max-w-md rounded-[22px] border-2 shadow-xl ${
        notification.type === "approved" 
          ? "border-green-300 bg-gradient-to-br from-green-50 to-white" 
          : "border-pink-300 bg-gradient-to-br from-pink-50 to-white"
      }`}>
        <DialogHeader className="space-y-4">
          <div className="mx-auto">
            {notification.type === "approved" ? (
              <CheckCircle className="h-12 w-12 text-green-500" />
            ) : (
              <XCircle className="h-12 w-12 text-pink-500" />
            )}
          </div>
          <DialogTitle className={`text-center text-xl font-bold ${
            notification.type === "approved" ? "text-green-700" : "text-pink-700"
          }`}>
            {notification.type === "approved" 
              ? "Τέλεια! Η φωτογραφία σου εγκρίθηκε 💕" 
              : "Η φωτογραφία σου δεν εγκρίθηκε 🩷"
            }
          </DialogTitle>
          <DialogDescription className="text-center text-base text-foreground">
            {notification.type === "approved" ? (
              "Το προφίλ σου είναι έτοιμο να εμφανιστεί στις άλλες μαμάδες!"
            ) : (
              notification.reason || "Δοκίμασε μία καθαρή, φυσική φωτογραφία σου όπου φαίνεται το πρόσωπό σου."
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button
            onClick={handleClose}
            className={`w-full rounded-full py-5 text-base font-semibold shadow-md ${
              notification.type === "approved"
                ? "bg-green-500 hover:bg-green-600 text-white"
                : "bg-pink-500 hover:bg-pink-600 text-white"
            }`}
          >
            {notification.type === "approved" ? "Υπέροχα! 🎉" : "Κατάλαβα 💕"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}