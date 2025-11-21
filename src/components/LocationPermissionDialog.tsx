import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface LocationPermissionDialogProps {
  open: boolean;
  onAllow: () => void;
  onDeny: () => void;
}

export function LocationPermissionDialog({
  open,
  onAllow,
  onDeny,
}: LocationPermissionDialogProps) {
  const { language } = useLanguage();

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onDeny()}>
      <DialogContent className="sm:max-w-md rounded-3xl border-2 border-primary/30 bg-gradient-to-br from-background via-primary/5 to-accent/10">
        <DialogHeader className="space-y-4">
          <div className="mx-auto rounded-full bg-primary/20 p-4 w-fit">
            <MapPin className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-center text-2xl font-bold text-primary">
            {language === "el"
              ? "Θέλουμε την τοποθεσία σας"
              : "We Need Your Location"}
          </DialogTitle>
          <DialogDescription className="text-center text-base leading-relaxed text-foreground">
            {language === "el" ? (
              <>
                Για να σας δείχνουμε μαμάδες κοντινές στην περιοχή σας και να
                βελτιώσουμε τις προτάσεις γνωριμίας, η εφαρμογή χρειάζεται
                πρόσβαση στην τοποθεσία σας.
                <br />
                <br />
                <strong className="text-primary">
                  Η ακριβής διεύθυνση δεν εμφανίζεται ποτέ σε άλλες χρήστριες
                </strong>{" "}
                — χρησιμοποιούμε μόνο την κατά προσέγγιση περιοχή σας για
                ασφαλές matching.
              </>
            ) : (
              <>
                To show you nearby moms and improve matching suggestions, the
                app needs access to your location.
                <br />
                <br />
                <strong className="text-primary">
                  Your exact address is never shown to other users
                </strong>{" "}
                — we only use your approximate area for safe matching.
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-col gap-3 mt-4">
          <Button
            onClick={onAllow}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-full py-6 text-lg font-semibold shadow-lg"
          >
            {language === "el" ? "Επιτρέπω" : "Allow"}
          </Button>
          <Button
            onClick={onDeny}
            variant="outline"
            className="w-full rounded-full py-6 text-lg border-2 border-primary/30 text-primary hover:bg-primary/10"
          >
            {language === "el" ? "Δεν επιτρέπω" : "Don't Allow"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
