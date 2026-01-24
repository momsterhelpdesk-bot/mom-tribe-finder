import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Mail, Users, Send, Eye, FileText, AlertTriangle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

interface EmailTemplate {
  id: string;
  template_key: string;
  subject_el: string;
  subject_en: string;
  body_el: string;
  body_en: string;
  description: string | null;
}

interface BulkEmailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type UserFilter = "all" | "completed_profile" | "incomplete_profile" | "active_7d" | "inactive_7d" | "inactive_30d";

export default function BulkEmailModal({ open, onOpenChange }: BulkEmailModalProps) {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplateKey, setSelectedTemplateKey] = useState("");
  const [customSubject, setCustomSubject] = useState("");
  const [customBody, setCustomBody] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [userFilter, setUserFilter] = useState<UserFilter>("all");
  const [targetUsers, setTargetUsers] = useState<{ id: string; email: string; full_name: string }[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState(0);
  const [confirmSend, setConfirmSend] = useState(false);
  const [sentCount, setSentCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchTemplates();
      fetchUsers();
    }
  }, [open, userFilter]);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from("email_templates")
        .select("*")
        .order("template_key");

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error("Error fetching templates:", error);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      let query = supabase
        .from("profiles")
        .select("id, email, full_name, profile_completed, updated_at")
        .eq("is_blocked", false)
        .not("email", "is", null);

      // Apply filters
      switch (userFilter) {
        case "completed_profile":
          query = query.eq("profile_completed", true);
          break;
        case "incomplete_profile":
          query = query.eq("profile_completed", false);
          break;
        case "active_7d":
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          query = query.gte("updated_at", sevenDaysAgo.toISOString());
          break;
        case "inactive_7d":
          const inactive7Days = new Date();
          inactive7Days.setDate(inactive7Days.getDate() - 7);
          query = query.lt("updated_at", inactive7Days.toISOString());
          break;
        case "inactive_30d":
          const inactive30Days = new Date();
          inactive30Days.setDate(inactive30Days.getDate() - 30);
          query = query.lt("updated_at", inactive30Days.toISOString());
          break;
      }

      const { data, error } = await query;

      if (error) throw error;
      setTargetUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Σφάλμα",
        description: "Αποτυχία φόρτωσης χρηστών",
        variant: "destructive",
      });
    } finally {
      setLoadingUsers(false);
    }
  };

  const getSelectedTemplate = () => {
    return templates.find(t => t.template_key === selectedTemplateKey);
  };

  const getPreviewContent = () => {
    if (useCustom) {
      return {
        subject: customSubject,
        body: customBody.replace(/{user_name}/g, "μαμά"),
      };
    }
    const template = getSelectedTemplate();
    if (!template) return { subject: "", body: "" };
    return {
      subject: template.subject_el,
      body: template.body_el.replace(/{user_name}/g, "μαμά"),
    };
  };

  const handleSend = async () => {
    if (!confirmSend) {
      setConfirmSend(true);
      return;
    }

    if (useCustom && (!customSubject || !customBody)) {
      toast({
        title: "Σφάλμα",
        description: "Συμπλήρωσε θέμα και μήνυμα",
        variant: "destructive",
      });
      return;
    }

    if (!useCustom && !selectedTemplateKey) {
      toast({
        title: "Σφάλμα",
        description: "Επίλεξε template",
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    setProgress(0);
    setSentCount(0);
    setErrorCount(0);

    let sent = 0;
    let errors = 0;
    const total = targetUsers.length;

    for (let i = 0; i < targetUsers.length; i++) {
      const user = targetUsers[i];
      
      try {
        const payload: any = {
          recipientUserId: user.id,
          recipientEmail: user.email,
          recipientName: user.full_name || "μαμά",
          reason: "bulk_campaign",
          language: "el",
        };

        if (useCustom) {
          payload.customSubject = customSubject;
          payload.customBody = customBody;
        } else {
          payload.templateKey = selectedTemplateKey;
        }

        const { error } = await supabase.functions.invoke("send-admin-email", {
          body: payload,
        });

        if (error) throw error;
        sent++;
        setSentCount(sent);
      } catch (error) {
        console.error(`Error sending to ${user.email}:`, error);
        errors++;
        setErrorCount(errors);
      }

      setProgress(Math.round(((i + 1) / total) * 100));
      
      // Small delay to avoid rate limiting
      if (i < targetUsers.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    setSending(false);
    setConfirmSend(false);

    toast({
      title: "✅ Μαζική αποστολή ολοκληρώθηκε",
      description: `Στάλθηκαν ${sent} emails. Σφάλματα: ${errors}`,
    });

    if (errors === 0) {
      onOpenChange(false);
      resetForm();
    }
  };

  const resetForm = () => {
    setSelectedTemplateKey("");
    setCustomSubject("");
    setCustomBody("");
    setUseCustom(false);
    setShowPreview(false);
    setUserFilter("all");
    setConfirmSend(false);
    setProgress(0);
    setSentCount(0);
    setErrorCount(0);
  };

  const preview = getPreviewContent();

  const filterLabels: Record<UserFilter, string> = {
    all: "Όλοι οι χρήστες",
    completed_profile: "Με ολοκληρωμένο προφίλ",
    incomplete_profile: "Με ημιτελές προφίλ",
    active_7d: "Ενεργοί (τελευταίες 7 μέρες)",
    inactive_7d: "Ανενεργοί (7+ μέρες)",
    inactive_30d: "Ανενεργοί (30+ μέρες)",
  };

  return (
    <Dialog open={open} onOpenChange={(o) => {
      if (!o && !sending) {
        resetForm();
        onOpenChange(false);
      }
    }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Μαζική Αποστολή Email
          </DialogTitle>
          <DialogDescription>
            Στείλε email σε πολλαπλούς χρήστες ταυτόχρονα
          </DialogDescription>
        </DialogHeader>

        {/* User Filter */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">👥 Επιλογή αποδεκτών</Label>
          <Select value={userFilter} onValueChange={(v) => setUserFilter(v as UserFilter)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Όλοι οι χρήστες</SelectItem>
              <SelectItem value="completed_profile">Με ολοκληρωμένο προφίλ</SelectItem>
              <SelectItem value="incomplete_profile">Με ημιτελές προφίλ</SelectItem>
              <SelectItem value="active_7d">Ενεργοί (τελευταίες 7 μέρες)</SelectItem>
              <SelectItem value="inactive_7d">Ανενεργοί (7+ μέρες)</SelectItem>
              <SelectItem value="inactive_30d">Ανενεργοί (30+ μέρες)</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg">
            {loadingUsers ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">
                  <strong>{targetUsers.length}</strong> χρήστες θα λάβουν το email
                </span>
              </>
            )}
          </div>
        </div>

        {/* Use Custom Toggle */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="useCustom"
            checked={useCustom}
            onCheckedChange={(checked) => setUseCustom(checked as boolean)}
          />
          <Label htmlFor="useCustom" className="text-sm cursor-pointer">
            Χρήση custom μηνύματος αντί template
          </Label>
        </div>

        {/* Template Selection */}
        {!useCustom && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">📝 Template</Label>
            <Select value={selectedTemplateKey} onValueChange={setSelectedTemplateKey}>
              <SelectTrigger>
                <SelectValue placeholder="Επίλεξε template..." />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.template_key}>
                    <div className="flex flex-col">
                      <span>{template.subject_el}</span>
                      {template.description && (
                        <span className="text-xs text-muted-foreground">{template.description}</span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Custom Message Fields */}
        {useCustom && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Θέμα</Label>
              <Input
                id="subject"
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                placeholder="π.χ. Νέα χαρακτηριστικά στο Momster! 🎉"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="body">Μήνυμα</Label>
              <Textarea
                id="body"
                value={customBody}
                onChange={(e) => setCustomBody(e.target.value)}
                placeholder="Γράψε το μήνυμά σου... (μπορείς να χρησιμοποιήσεις {user_name} για το όνομα)"
                rows={6}
              />
              <p className="text-xs text-muted-foreground">
                Tip: Χρησιμοποίησε {"{user_name}"} για να εισάγεις το όνομα της χρήστριας
              </p>
            </div>
          </div>
        )}

        {/* Preview Toggle */}
        {(selectedTemplateKey || (useCustom && customSubject)) && (
          <div className="space-y-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              className="w-full"
            >
              <Eye className="w-4 h-4 mr-2" />
              {showPreview ? "Απόκρυψη" : "Προεπισκόπηση"}
            </Button>

            {showPreview && (
              <div className="border rounded-lg p-4 bg-gradient-to-br from-pink-50 to-pink-100 space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  <span className="font-medium text-sm">Θέμα:</span>
                  <span className="text-sm">{preview.subject}</span>
                </div>
                <div className="border-t pt-3">
                  <p className="text-sm whitespace-pre-wrap">{preview.body}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Progress Bar */}
        {sending && (
          <div className="space-y-2">
            <Progress value={progress} />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Στάλθηκαν: {sentCount}</span>
              <span>{progress}%</span>
              <span>Σφάλματα: {errorCount}</span>
            </div>
          </div>
        )}

        {/* Confirmation Warning */}
        {confirmSend && !sending && (
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800">Είσαι σίγουρη;</p>
              <p className="text-sm text-amber-700">
                Πρόκειται να στείλεις <strong>{targetUsers.length}</strong> emails. 
                Αυτή η ενέργεια δεν μπορεί να αναιρεθεί.
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button 
            variant="outline" 
            onClick={() => {
              if (confirmSend) {
                setConfirmSend(false);
              } else {
                onOpenChange(false);
              }
            }}
            disabled={sending}
          >
            {confirmSend ? "Πίσω" : "Ακύρωση"}
          </Button>
          <Button 
            onClick={handleSend} 
            disabled={sending || targetUsers.length === 0 || (useCustom ? !customSubject || !customBody : !selectedTemplateKey)}
            variant={confirmSend ? "destructive" : "default"}
          >
            {sending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Αποστολή...
              </>
            ) : confirmSend ? (
              <>
                <Send className="w-4 h-4 mr-2" />
                Επιβεβαίωση - Στείλε {targetUsers.length} emails
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                Στείλε σε {targetUsers.length} χρήστες
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}