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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Mail, User, Send, Eye, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EmailTemplate {
  id: string;
  template_key: string;
  subject_el: string;
  subject_en: string;
  body_el: string;
  body_en: string;
  description: string | null;
}

interface SendEmailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    id: string;
    full_name: string;
    email: string;
    profile_completed?: boolean;
    last_activity_at?: string | null;
  } | null;
  suggestedReason?: string;
}

const REASONS = [
  { value: "incomplete_profile", label: "Δεν έχει ολοκληρώσει το προφίλ", emoji: "📝" },
  { value: "inactive_7", label: "Ανενεργή (7 ημέρες)", emoji: "💤" },
  { value: "inactive_14", label: "Ανενεργή (14 ημέρες)", emoji: "😴" },
  { value: "inactive_30", label: "Ανενεργή (30 ημέρες)", emoji: "🌙" },
  { value: "welcome", label: "Welcome / Resend", emoji: "🌸" },
  { value: "custom", label: "Custom μήνυμα", emoji: "✍️" },
];

const REASON_TO_TEMPLATE: Record<string, string> = {
  incomplete_profile: "incomplete_profile",
  inactive_7: "inactive_user",
  inactive_14: "inactive_user",
  inactive_30: "inactive_user",
  welcome: "welcome_resend",
};

export default function SendEmailModal({ 
  open, 
  onOpenChange, 
  user,
  suggestedReason 
}: SendEmailModalProps) {
  const [reason, setReason] = useState(suggestedReason || "");
  const [selectedTemplateKey, setSelectedTemplateKey] = useState("");
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [customSubject, setCustomSubject] = useState("");
  const [customBody, setCustomBody] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [sending, setSending] = useState(false);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchTemplates();
      // Auto-suggest reason based on user status
      if (suggestedReason) {
        setReason(suggestedReason);
        const templateKey = REASON_TO_TEMPLATE[suggestedReason];
        if (templateKey) {
          setSelectedTemplateKey(templateKey);
        }
      }
    }
  }, [open, suggestedReason]);

  useEffect(() => {
    if (reason && reason !== "custom") {
      const templateKey = REASON_TO_TEMPLATE[reason];
      if (templateKey) {
        setSelectedTemplateKey(templateKey);
      }
    } else if (reason === "custom") {
      setSelectedTemplateKey("");
    }
  }, [reason]);

  const fetchTemplates = async () => {
    setLoadingTemplates(true);
    try {
      const { data, error } = await supabase
        .from("email_templates")
        .select("*")
        .order("template_key");

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error("Error fetching templates:", error);
    } finally {
      setLoadingTemplates(false);
    }
  };

  const getSelectedTemplate = () => {
    return templates.find(t => t.template_key === selectedTemplateKey);
  };

  const getPreviewContent = () => {
    if (reason === "custom") {
      return {
        subject: customSubject,
        body: customBody.replace(/{user_name}/g, user?.full_name || "μαμά"),
      };
    }
    const template = getSelectedTemplate();
    if (!template) return { subject: "", body: "" };
    return {
      subject: template.subject_el,
      body: template.body_el.replace(/{user_name}/g, user?.full_name || "μαμά"),
    };
  };

  const handleSend = async () => {
    if (!user) return;

    if (reason === "custom" && (!customSubject || !customBody)) {
      toast({
        title: "Σφάλμα",
        description: "Συμπλήρωσε θέμα και μήνυμα",
        variant: "destructive",
      });
      return;
    }

    if (reason !== "custom" && !selectedTemplateKey) {
      toast({
        title: "Σφάλμα",
        description: "Επίλεξε template",
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const payload: any = {
        recipientUserId: user.id,
        recipientEmail: user.email,
        recipientName: user.full_name,
        reason: reason,
        language: "el",
      };

      if (reason === "custom") {
        payload.customSubject = customSubject;
        payload.customBody = customBody;
      } else {
        payload.templateKey = selectedTemplateKey;
      }

      const { error } = await supabase.functions.invoke("send-admin-email", {
        body: payload,
      });

      if (error) throw error;

      toast({
        title: "✅ Email στάλθηκε",
        description: `Το email στάλθηκε στην ${user.full_name}`,
      });

      onOpenChange(false);
      resetForm();
    } catch (error: any) {
      console.error("Error sending email:", error);
      toast({
        title: "Σφάλμα",
        description: error.message || "Αποτυχία αποστολής email",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const resetForm = () => {
    setReason("");
    setSelectedTemplateKey("");
    setCustomSubject("");
    setCustomBody("");
    setShowPreview(false);
  };

  if (!user) return null;

  const preview = getPreviewContent();

  return (
    <Dialog open={open} onOpenChange={(o) => {
      if (!o) resetForm();
      onOpenChange(o);
    }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            Αποστολή Email
          </DialogTitle>
          <DialogDescription>
            Στείλε email στη χρήστρια με βάση τη δραστηριότητά της
          </DialogDescription>
        </DialogHeader>

        {/* Recipient Info */}
        <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
          <User className="w-5 h-5 text-muted-foreground" />
          <div>
            <p className="font-medium">{user.full_name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          {!user.profile_completed && (
            <Badge variant="secondary" className="ml-auto">Ημιτελές προφίλ</Badge>
          )}
        </div>

        {/* Reason Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">🧠 Επιλογή λόγου</Label>
          <RadioGroup value={reason} onValueChange={setReason} className="grid grid-cols-2 gap-2">
            {REASONS.map((r) => (
              <div key={r.value} className="flex items-center space-x-2">
                <RadioGroupItem value={r.value} id={r.value} />
                <Label 
                  htmlFor={r.value} 
                  className="text-sm cursor-pointer flex items-center gap-1"
                >
                  <span>{r.emoji}</span>
                  {r.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Template Selection (for non-custom) */}
        {reason && reason !== "custom" && (
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
        {reason === "custom" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Θέμα</Label>
              <Input
                id="subject"
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                placeholder="π.χ. Σε περιμένουμε 🤍"
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
        {(selectedTemplateKey || (reason === "custom" && customSubject)) && (
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

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Ακύρωση
          </Button>
          <Button 
            onClick={handleSend} 
            disabled={sending || !reason || (reason === "custom" ? !customSubject || !customBody : !selectedTemplateKey)}
          >
            {sending ? (
              "Αποστολή..."
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Στείλε Email
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
