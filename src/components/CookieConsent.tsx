import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function CookieConsent() {
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkCookieConsent = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;
      
      setUserId(user.id);

      // Check if user has already accepted cookies
      const { data: profile } = await supabase
        .from("profiles")
        .select("cookies_accepted")
        .eq("id", user.id)
        .single();

      // Show popup if cookies_accepted is null or false
      if (profile && (profile.cookies_accepted === null || profile.cookies_accepted === false)) {
        setOpen(true);
      }
    };

    checkCookieConsent();
  }, []);

  const handleAccept = async () => {
    if (!userId) return;

    const { error } = await supabase
      .from("profiles")
      .update({ cookies_accepted: true })
      .eq("id", userId);

    if (error) {
      toast.error("Σφάλμα κατά την αποθήκευση των προτιμήσεων");
      console.error("Error updating cookies preference:", error);
      return;
    }

    setOpen(false);
    toast.success("Ευχαριστούμε! Οι προτιμήσεις σου αποθηκεύτηκαν.");
  };

  const handleDecline = () => {
    setOpen(false);
    toast.info("Μπορείς να αλλάξεις τις επιλογές σου οποτεδήποτε από τις Ρυθμίσεις.");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px] border-2 border-primary/20 bg-gradient-to-br from-background to-pink-50/30">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-primary flex items-center justify-center gap-2" style={{ fontFamily: "'Pacifico', cursive" }}>
            🍪 Cookies
          </DialogTitle>
          <DialogDescription className="text-center text-base leading-relaxed pt-4 space-y-3 text-foreground/90">
            <p>
              Χρησιμοποιούμε cookies για να προσφέρουμε καλύτερη εμπειρία στην εφαρμογή.
            </p>
            <p>
              Με τα cookies μπορούμε να θυμόμαστε τις προτιμήσεις σου, να βελτιώνουμε τη λειτουργικότητα και να κρατάμε ασφαλή τη σύνδεσή σου.
            </p>
            <p>
              Πατώντας «Αποδέχομαι», συμφωνείς στη χρήση cookies όπως περιγράφεται στην Πολιτική Απορρήτου μας.
            </p>
            <p className="text-sm text-muted-foreground italic">
              Μπορείς να αλλάξεις τις επιλογές σου οποτεδήποτε μέσα από τις Ρυθμίσεις.
            </p>
            <p className="font-semibold text-lg pt-2">
              Αποδέχεσαι τα cookies;
            </p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-3 pt-4">
          <Button
            variant="outline"
            onClick={handleDecline}
            className="w-full border-2 hover:bg-muted"
          >
            Όχι τώρα
          </Button>
          <Button
            onClick={handleAccept}
            className="w-full bg-gradient-to-br from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90 text-white font-bold shadow-lg"
          >
            Αποδέχομαι
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
