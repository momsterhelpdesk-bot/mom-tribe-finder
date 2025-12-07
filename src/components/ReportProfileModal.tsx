import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ReportProfileModalProps {
  open: boolean;
  onClose: () => void;
  reportedUserId: string;
}

const REPORT_REASONS = [
  { value: "suspicious", label: "🔸 Ύποπτο / ψεύτικο προφίλ" },
  { value: "inappropriate_photos", label: "🔸 Ακατάλληλες φωτογραφίες" },
  { value: "harassment", label: "🔸 Παρενόχληση ή αγενής συμπεριφορά" },
  { value: "other", label: "🔸 Άλλο" },
];

export function ReportProfileModal({ open, onClose, reportedUserId }: ReportProfileModalProps) {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason) {
      toast.error("Επίλεξε έναν λόγο αναφοράς");
      return;
    }

    setSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("profile_reports")
        .insert({
          reporter_id: user.id,
          reported_profile_id: reportedUserId,
          reason,
          description: reason === "other" ? description : null,
          status: "pending"
        });

      if (error) throw error;

      toast.success("💗 Η αναφορά σου καταχωρήθηκε! Η ομάδα μας θα το εξετάσει.", {
        duration: 4000,
        className: "bg-pink-50 border-pink-200"
      });
      
      onClose();
      setReason("");
      setDescription("");
    } catch (error) {
      console.error("Error submitting report:", error);
      toast.error("Σφάλμα κατά την υποβολή της αναφοράς");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-[18px] border-2 border-[#E6D7FF] bg-white shadow-xl">
        <DialogHeader className="space-y-3">
          <div className="mx-auto rounded-full bg-pink-100 p-3 w-fit">
            <AlertTriangle className="h-6 w-6 text-pink-500" />
          </div>
          <DialogTitle className="text-center text-xl font-bold text-[#A34FA0]">
            Αναφορά Προφίλ
          </DialogTitle>
          <DialogDescription className="text-center text-base text-foreground">
            Θέλεις να αναφέρεις αυτό το προφίλ;
            <br />
            <span className="text-sm text-muted-foreground">
              Η αναφορά σου είναι ανώνυμη και μας βοηθά να κρατήσουμε την κοινότητα ασφαλή και ευγενική.
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <RadioGroup value={reason} onValueChange={setReason} className="space-y-3">
            {REPORT_REASONS.map((r) => (
              <div key={r.value} className="flex items-center space-x-3 p-3 rounded-xl hover:bg-pink-50 transition-colors">
                <RadioGroupItem value={r.value} id={r.value} className="border-pink-300 text-pink-500" />
                <Label htmlFor={r.value} className="cursor-pointer font-medium">
                  {r.label}
                </Label>
              </div>
            ))}
          </RadioGroup>

          {reason === "other" && (
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Πες μας τι συνέβη…"
              className="mt-3 border-pink-200 focus:border-pink-400 rounded-xl resize-none"
              rows={3}
              maxLength={500}
            />
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-3">
          <Button
            onClick={handleSubmit}
            disabled={submitting || !reason}
            className="w-full rounded-full py-5 text-base font-semibold bg-[#FF82B2] hover:bg-[#FF6FA5] text-white shadow-md"
          >
            {submitting ? "Υποβολή..." : "Αναφορά"}
          </Button>
          <Button
            onClick={onClose}
            variant="ghost"
            className="w-full text-gray-500"
          >
            Ακύρωση
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}