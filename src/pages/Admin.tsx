import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

export default function Admin() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [verificationRequests, setVerificationRequests] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    checkAdminStatus();
    loadData();
  }, []);

  const checkAdminStatus = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id);

    const hasAdminRole = roles?.some(r => r.role === 'admin');
    
    if (!hasAdminRole) {
      toast.error("Δεν έχετε δικαιώματα διαχειριστή");
      navigate("/discover");
      return;
    }

    setIsAdmin(true);
    setLoading(false);
  };

  const loadData = async () => {
    // Load verification requests - use profiles instead of profiles_safe for admin
    const { data: requests } = await supabase
      .from('verification_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (requests) {
      // Fetch profile data separately for each request
      const requestsWithProfiles = await Promise.all(
        requests.map(async (req) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', req.profile_id)
            .single();
          
          return {
            ...req,
            profiles: profile
          };
        })
      );
      setVerificationRequests(requestsWithProfiles);
    }

    // Load reports
    const { data: reportData } = await supabase
      .from('profile_reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (reportData) {
      // Fetch profile data separately for each report
      const reportsWithProfiles = await Promise.all(
        reportData.map(async (report) => {
          const { data: reportedProfile } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', report.reported_profile_id)
            .single();
          
          const { data: reporter } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', report.reporter_id)
            .single();
          
          return {
            ...report,
            reported_profile: reportedProfile,
            reporter: reporter
          };
        })
      );
      setReports(reportsWithProfiles);
    }

    setReports(reportData || []);
  };

  const handleVerificationDecision = async (requestId: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('verification_requests')
        .update({ status })
        .eq('id', requestId);

      if (error) throw error;

      if (status === 'approved') {
        // Update profile to set verified status
        const request = verificationRequests.find(r => r.id === requestId);
        if (request) {
          await supabase
            .from('profiles')
            .update({ 
              verified_status: true,
              mom_badge: 'verified'
            })
            .eq('id', request.profile_id);
        }
      }

      toast.success(`Αίτημα ${status === 'approved' ? 'εγκρίθηκε' : 'απορρίφθηκε'}`);
      loadData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleReportDecision = async (reportId: string, status: 'reviewed' | 'resolved') => {
    try {
      const { error } = await supabase
        .from('profile_reports')
        .update({ status })
        .eq('id', reportId);

      if (error) throw error;

      toast.success("Η αναφορά ενημερώθηκε");
      loadData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleBlockUser = async (profileId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_blocked: true })
        .eq('id', profileId);

      if (error) throw error;

      toast.success("Ο χρήστης μπλοκαρίστηκε");
      loadData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Φόρτωση...</p>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 p-4 py-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        <Tabs defaultValue="verifications" className="space-y-4">
          <TabsList>
            <TabsTrigger value="verifications">
              Επαληθεύσεις 
              <Badge variant="secondary" className="ml-2">
                {verificationRequests.filter(r => r.status === 'pending').length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="reports">
              Αναφορές
              <Badge variant="secondary" className="ml-2">
                {reports.filter(r => r.status === 'pending').length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="verifications" className="space-y-4">
            {verificationRequests.map(request => (
              <Card key={request.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{request.profiles?.full_name}</h3>
                      <Badge variant={
                        request.status === 'pending' ? 'default' :
                        request.status === 'approved' ? 'default' : 'destructive'
                      }>
                        {request.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{request.profiles?.email}</p>
                    <p className="text-sm"><strong>Ονόματα παιδιών:</strong> {request.child_names}</p>
                    <p className="text-xs text-muted-foreground">
                      Υποβλήθηκε: {new Date(request.created_at).toLocaleDateString('el-GR')}
                    </p>
                    
                    {request.selfie_photo_url && (
                      <img 
                        src={request.selfie_photo_url} 
                        alt="Selfie" 
                        className="w-48 h-48 object-cover rounded-lg mt-4"
                      />
                    )}
                  </div>

                  {request.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleVerificationDecision(request.id, 'approved')}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Έγκριση
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleVerificationDecision(request.id, 'rejected')}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Απόρριψη
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}

            {verificationRequests.length === 0 && (
              <Card className="p-8 text-center text-muted-foreground">
                Δεν υπάρχουν αιτήματα επαλήθευσης
              </Card>
            )}
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            {reports.map(report => (
              <Card key={report.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-destructive" />
                      <h3 className="font-semibold">
                        Αναφορά για: {report.reported_profile?.full_name}
                      </h3>
                      <Badge variant={
                        report.status === 'pending' ? 'destructive' :
                        report.status === 'reviewed' ? 'default' : 'secondary'
                      }>
                        {report.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Από: {report.reporter?.full_name}
                    </p>
                    <p className="text-sm"><strong>Λόγος:</strong> {report.reason}</p>
                    {report.description && (
                      <p className="text-sm"><strong>Περιγραφή:</strong> {report.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {new Date(report.created_at).toLocaleDateString('el-GR')}
                    </p>
                  </div>

                  {report.status === 'pending' && (
                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReportDecision(report.id, 'reviewed')}
                      >
                        Σήμανση ως Ελεγμένη
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleReportDecision(report.id, 'resolved')}
                      >
                        Επίλυση
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleBlockUser(report.reported_profile_id)}
                      >
                        Μπλοκάρισμα Χρήστη
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}

            {reports.length === 0 && (
              <Card className="p-8 text-center text-muted-foreground">
                Δεν υπάρχουν αναφορές
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
