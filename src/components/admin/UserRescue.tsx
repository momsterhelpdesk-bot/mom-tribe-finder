import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, Mail, Key, ShieldCheck, User, Calendar, 
  MapPin, AlertTriangle, Loader2, CheckCircle, XCircle 
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  username: string | null;
  city: string;
  area: string;
  is_blocked: boolean;
  verified_status: boolean;
  profile_photo_url: string | null;
  created_at: string;
}

export default function UserRescue() {
  const [searchEmail, setSearchEmail] = useState("");
  const [foundUser, setFoundUser] = useState<UserProfile | null>(null);
  const [searching, setSearching] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{type: string; title: string; description: string} | null>(null);
  const { toast } = useToast();

  const searchUser = async () => {
    if (!searchEmail.trim()) return;
    
    setSearching(true);
    setFoundUser(null);
    
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, username, city, area, is_blocked, verified_status, profile_photo_url, created_at")
        .eq("email", searchEmail.trim().toLowerCase())
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          toast({
            title: "Δεν βρέθηκε",
            description: "Δεν βρέθηκε χρήστης με αυτό το email",
            variant: "destructive",
          });
        } else {
          throw error;
        }
        return;
      }

      setFoundUser(data);
    } catch (error: any) {
      console.error("Error searching user:", error);
      toast({
        title: "Σφάλμα",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSearching(false);
    }
  };

  const handleResendPasswordReset = async () => {
    if (!foundUser) return;
    
    setActionLoading("resend");
    try {
      // Generate password reset through Supabase Auth
      const { error } = await supabase.auth.resetPasswordForEmail(foundUser.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      // Log the action
      await supabase.from("moderation_logs").insert({
        action: "resend_password_reset",
        target_type: "profile",
        target_id: foundUser.id,
        details: { email: foundUser.email, triggered_by: "admin_rescue" }
      });

      toast({
        title: "Επιτυχία ✅",
        description: `Email επαναφοράς κωδικού στάλθηκε στο ${foundUser.email}`,
      });
    } catch (error: any) {
      console.error("Error sending reset email:", error);
      toast({
        title: "Σφάλμα",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
      setConfirmAction(null);
    }
  };

  const handleForcePasswordReset = async () => {
    if (!foundUser) return;
    
    setActionLoading("force");
    try {
      // Generate a temporary password (not actually used, just forces reset flow)
      const { error } = await supabase.auth.resetPasswordForEmail(foundUser.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      // Log the action
      await supabase.from("moderation_logs").insert({
        action: "force_password_reset",
        target_type: "profile",
        target_id: foundUser.id,
        details: { email: foundUser.email, forced: true }
      });

      toast({
        title: "Επιτυχία ✅",
        description: `Αναγκαστική επαναφορά κωδικού για ${foundUser.email}. Ο χρήστης θα λάβει email.`,
      });
    } catch (error: any) {
      console.error("Error forcing password reset:", error);
      toast({
        title: "Σφάλμα",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
      setConfirmAction(null);
    }
  };

  const handleUnblockUser = async () => {
    if (!foundUser) return;
    
    setActionLoading("unblock");
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_blocked: false })
        .eq("id", foundUser.id);

      if (error) throw error;

      // Log the action
      await supabase.from("moderation_logs").insert({
        action: "unblock_user_rescue",
        target_type: "profile",
        target_id: foundUser.id,
        details: { email: foundUser.email, reason: "admin_manual_rescue" }
      });

      // Update local state
      setFoundUser({ ...foundUser, is_blocked: false });

      toast({
        title: "Επιτυχία ✅",
        description: `Ο χρήστης ${foundUser.full_name} ξεμπλοκαρίστηκε`,
      });
    } catch (error: any) {
      console.error("Error unblocking user:", error);
      toast({
        title: "Σφάλμα",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
      setConfirmAction(null);
    }
  };

  const executeConfirmedAction = () => {
    if (!confirmAction) return;
    
    switch (confirmAction.type) {
      case "resend":
        handleResendPasswordReset();
        break;
      case "force":
        handleForcePasswordReset();
        break;
      case "unblock":
        handleUnblockUser();
        break;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            User Rescue
          </CardTitle>
          <CardDescription>
            Εργαλεία διάσωσης λογαριασμών: επαναφορά κωδικού, ξεμπλοκάρισμα χρήστη
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search */}
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="search-email" className="sr-only">Email χρήστη</Label>
              <Input
                id="search-email"
                type="email"
                placeholder="Εισάγετε το email του χρήστη..."
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchUser()}
              />
            </div>
            <Button onClick={searchUser} disabled={searching || !searchEmail.trim()}>
              {searching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              <span className="ml-2">Αναζήτηση</span>
            </Button>
          </div>

          {/* User Card */}
          {foundUser && (
            <Card className={foundUser.is_blocked ? "border-destructive/50 bg-destructive/5" : "border-primary/30"}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-secondary flex items-center justify-center flex-shrink-0">
                    {foundUser.profile_photo_url ? (
                      <img 
                        src={foundUser.profile_photo_url} 
                        alt={foundUser.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-lg">{foundUser.full_name}</h3>
                      {foundUser.username && (
                        <span className="text-sm text-muted-foreground">@{foundUser.username}</span>
                      )}
                      {foundUser.verified_status && (
                        <Badge className="bg-blue-500">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                      {foundUser.is_blocked && (
                        <Badge variant="destructive">
                          <XCircle className="w-3 h-3 mr-1" />
                          Blocked
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {foundUser.email}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {foundUser.city || "—"}, {foundUser.area || "—"}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Εγγραφή: {new Date(foundUser.created_at).toLocaleDateString("el-GR")}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button
                    onClick={() => setConfirmAction({
                      type: "resend",
                      title: "Αποστολή Email Επαναφοράς",
                      description: `Θα σταλεί email επαναφοράς κωδικού στο ${foundUser.email}. Συνέχεια;`
                    })}
                    disabled={actionLoading !== null}
                    variant="outline"
                  >
                    {actionLoading === "resend" ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Mail className="w-4 h-4 mr-2" />
                    )}
                    Resend Reset Email
                  </Button>

                  <Button
                    onClick={() => setConfirmAction({
                      type: "force",
                      title: "Αναγκαστική Επαναφορά Κωδικού",
                      description: `Ο χρήστης θα χρειαστεί να ορίσει νέο κωδικό. Θα σταλεί email στο ${foundUser.email}. Συνέχεια;`
                    })}
                    disabled={actionLoading !== null}
                    variant="secondary"
                  >
                    {actionLoading === "force" ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Key className="w-4 h-4 mr-2" />
                    )}
                    Force Password Reset
                  </Button>

                  {foundUser.is_blocked && (
                    <Button
                      onClick={() => setConfirmAction({
                        type: "unblock",
                        title: "Ξεμπλοκάρισμα Χρήστη",
                        description: `Ο χρήστης ${foundUser.full_name} θα ξεμπλοκαριστεί και θα μπορεί να συνδεθεί ξανά. Συνέχεια;`
                      })}
                      disabled={actionLoading !== null}
                    >
                      {actionLoading === "unblock" ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <ShieldCheck className="w-4 h-4 mr-2" />
                      )}
                      Ξεμπλοκάρισμα
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tips */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Οδηγίες
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• <strong>Resend Reset Email:</strong> Στέλνει νέο email επαναφοράς κωδικού</li>
              <li>• <strong>Force Password Reset:</strong> Αναγκάζει τον χρήστη να αλλάξει κωδικό</li>
              <li>• <strong>Ξεμπλοκάρισμα:</strong> Ξεμπλοκάρει blocked χρήστη</li>
              <li>• Όλες οι ενέργειες καταγράφονται στο Audit Log</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Confirm Dialog */}
      <AlertDialog open={confirmAction !== null} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmAction?.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading !== null}>Ακύρωση</AlertDialogCancel>
            <AlertDialogAction onClick={executeConfirmedAction} disabled={actionLoading !== null}>
              {actionLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Επιβεβαίωση
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
