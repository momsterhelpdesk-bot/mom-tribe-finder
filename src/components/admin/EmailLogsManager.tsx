import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mail, Search, Calendar, User, FileText, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { el } from "date-fns/locale";

interface EmailLog {
  id: string;
  admin_id: string | null;
  recipient_user_id: string;
  recipient_email: string;
  reason: string;
  template_key: string | null;
  custom_subject: string | null;
  custom_body: string | null;
  created_at: string;
  admin_profile?: {
    full_name: string;
  } | null;
  recipient_profile?: {
    full_name: string;
  } | null;
}

const REASON_LABELS: Record<string, { label: string; emoji: string }> = {
  incomplete_profile: { label: "Ημιτελές προφίλ", emoji: "📝" },
  inactive_7: { label: "Ανενεργή 7 ημέρες", emoji: "💤" },
  inactive_14: { label: "Ανενεργή 14 ημέρες", emoji: "😴" },
  inactive_30: { label: "Ανενεργή 30 ημέρες", emoji: "🌙" },
  welcome: { label: "Welcome", emoji: "🌸" },
  custom: { label: "Custom", emoji: "✍️" },
  bulk_reengagement: { label: "Bulk Re-engagement", emoji: "📧" },
};

export default function EmailLogsManager() {
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterReason, setFilterReason] = useState("all");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("admin_email_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);

      if (error) throw error;

      // Fetch profile names for each log
      const logsWithProfiles = await Promise.all(
        (data || []).map(async (log) => {
          let adminProfile = null;
          let recipientProfile = null;

          if (log.admin_id) {
            const { data: admin } = await supabase
              .from("profiles")
              .select("full_name")
              .eq("id", log.admin_id)
              .single();
            adminProfile = admin;
          }

          const { data: recipient } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", log.recipient_user_id)
            .single();
          recipientProfile = recipient;

          return {
            ...log,
            admin_profile: adminProfile,
            recipient_profile: recipientProfile,
          };
        })
      );

      setLogs(logsWithProfiles);
    } catch (error) {
      console.error("Error fetching email logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        log.recipient_email.toLowerCase().includes(term) ||
        log.recipient_profile?.full_name?.toLowerCase().includes(term) ||
        log.custom_subject?.toLowerCase().includes(term);
      if (!matchesSearch) return false;
    }

    // Reason filter
    if (filterReason !== "all" && log.reason !== filterReason) {
      return false;
    }

    // Date filters
    if (filterDateFrom) {
      const fromDate = new Date(filterDateFrom);
      if (new Date(log.created_at) < fromDate) return false;
    }
    if (filterDateTo) {
      const toDate = new Date(filterDateTo);
      toDate.setHours(23, 59, 59, 999);
      if (new Date(log.created_at) > toDate) return false;
    }

    return true;
  });

  const getReasonInfo = (reason: string) => {
    return REASON_LABELS[reason] || { label: reason, emoji: "📧" };
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterReason("all");
    setFilterDateFrom("");
    setFilterDateTo("");
  };

  const hasActiveFilters = searchTerm || filterReason !== "all" || filterDateFrom || filterDateTo;

  // Stats
  const totalEmails = logs.length;
  const todayEmails = logs.filter(
    (log) => new Date(log.created_at).toDateString() === new Date().toDateString()
  ).length;
  const weekEmails = logs.filter((log) => {
    const logDate = new Date(log.created_at);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return logDate >= weekAgo;
  }).length;

  if (loading) {
    return <div className="text-center py-8">Φόρτωση email logs...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalEmails}</p>
              <p className="text-xs text-muted-foreground">Συνολικά emails</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-full">
              <Calendar className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{todayEmails}</p>
              <p className="text-xs text-muted-foreground">Σήμερα</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-full">
              <FileText className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{weekEmails}</p>
              <p className="text-xs text-muted-foreground">Αυτή τη βδομάδα</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <Label className="text-xs text-muted-foreground">Αναζήτηση</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Email, όνομα, θέμα..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="w-[180px]">
            <Label className="text-xs text-muted-foreground">Λόγος</Label>
            <Select value={filterReason} onValueChange={setFilterReason}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Όλοι</SelectItem>
                {Object.entries(REASON_LABELS).map(([key, { label, emoji }]) => (
                  <SelectItem key={key} value={key}>
                    {emoji} {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-[150px]">
            <Label className="text-xs text-muted-foreground">Από</Label>
            <Input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
            />
          </div>
          <div className="w-[150px]">
            <Label className="text-xs text-muted-foreground">Έως</Label>
            <Input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" onClick={fetchLogs} title="Ανανέωση">
            <RefreshCw className="w-4 h-4" />
          </Button>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Καθαρισμός
            </Button>
          )}
        </div>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <Badge variant="outline">{filteredLogs.length} αποτελέσματα</Badge>
      </div>

      {/* Logs List */}
      <div className="space-y-3">
        {filteredLogs.map((log) => {
          const reasonInfo = getReasonInfo(log.reason);
          return (
            <Card key={log.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Mail className="w-4 h-4 text-primary" />
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">
                        {log.recipient_profile?.full_name || "Unknown"}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        ({log.recipient_email})
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {reasonInfo.emoji} {reasonInfo.label}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {log.template_key ? (
                        <span>
                          Template: <span className="font-mono">{log.template_key}</span>
                        </span>
                      ) : (
                        <span>
                          Custom: <span className="italic">{log.custom_subject}</span>
                        </span>
                      )}
                    </div>
                    {log.admin_profile && (
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <User className="w-3 h-3" />
                        Από: {log.admin_profile.full_name}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right text-xs text-muted-foreground whitespace-nowrap">
                  <p>
                    {formatDistanceToNow(new Date(log.created_at), {
                      addSuffix: true,
                      locale: el,
                    })}
                  </p>
                  <p>{new Date(log.created_at).toLocaleDateString("el-GR")}</p>
                  <p>{new Date(log.created_at).toLocaleTimeString("el-GR", { hour: "2-digit", minute: "2-digit" })}</p>
                </div>
              </div>
            </Card>
          );
        })}

        {filteredLogs.length === 0 && (
          <Card className="p-8 text-center text-muted-foreground">
            <Mail className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Δεν βρέθηκαν email logs</p>
          </Card>
        )}
      </div>
    </div>
  );
}
