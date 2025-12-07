import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

interface PhotoRulesPopupProps {
  open: boolean;
  onAccept: () => void;
  onClose: () => void;
}

export function PhotoRulesPopup({ open, onAccept, onClose }: PhotoRulesPopupProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-[22px] border-2 border-primary/30 bg-gradient-to-br from-[#FFE8F2] to-[#FDF7F9] shadow-xl">
        <DialogHeader className="space-y-4">
          <div className="mx-auto animate-pulse">
            <Heart className="h-10 w-10 text-primary fill-primary/20" />
          </div>
          <DialogTitle className="text-center text-xl font-bold text-[#C0528C]">
            ✨ Ασφαλές & Φιλικό Περιβάλλον ✨
          </DialogTitle>
          <DialogDescription asChild>
            <div className="text-center text-base leading-relaxed text-foreground space-y-4">
              <p>
                Για να κρατήσουμε την κοινότητά μας ζεστή και ασφαλή,
                οι φωτογραφίες πρέπει να δείχνουν <strong className="text-[#C0528C]">πραγματικές μαμάδες</strong>.
              </p>
              
              <div className="space-y-2 text-left bg-white/60 rounded-xl p-4 border border-primary/20">
                <p className="flex items-center gap-2">
                  <span className="text-red-500">❌</span> Χωρίς παιδιά
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-red-500">❌</span> Χωρίς τρίτα άτομα
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-red-500">❌</span> Χωρίς ακατάλληλο περιεχόμενο
                </p>
              </div>
              
              <p className="text-sm text-muted-foreground">
                Κάθε φωτογραφία μπορεί να ελεγχθεί πριν δημοσιευτεί.
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-3 mt-4">
          <Button
            onClick={onAccept}
            className="w-full rounded-[40px] py-6 text-lg font-semibold bg-[#FF99C8] hover:bg-[#FF85BC] text-white shadow-lg transition-all hover:shadow-xl"
          >
            Οκ, το κατάλαβα! 💗
          </Button>
          <button
            onClick={onClose}
            className="text-[#C0528C] text-sm underline hover:no-underline transition-all"
          >
            Δες παραδείγματα →
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}