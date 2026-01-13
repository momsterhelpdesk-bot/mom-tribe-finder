import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Activity, 
  Clock, 
  TrendingUp, 
  Users, 
  Calendar,
  Zap,
  Mail,
  RefreshCw,
  CheckCircle2,
  X
} from "lucide-react";
import { formatDistanceToNow, differenceInDays, differenceInHours, format, subDays } from "date-fns";
import { el } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";

interface UserActivity {
  user_id: string;
  full_name: string;
  email: string;
  last_activity_at: string;
  first_activity_at: string;
  visit_count: number;
  created_at: string;
}

interface DailyStats {
  date: string;
  displayDate: string;
  activeUsers: number;
  newUsers: number;
}

interface ActivityStats {
  totalActiveUsers: number;
  activeToday: number;
  activeThisWeek: number;
  activeThisMonth: number;
  averageSessionsPerUser: number;
  mostActiveUsers: UserActivity[];
  recentlyActive: UserActivity[];
  inactiveUsers: UserActivity[];
  dailyStats: DailyStats[];
}

export default function UserActivityStats() {
  const [stats, setStats] = useState<ActivityStats>({
    totalActiveUsers: 0,
    activeToday: 0,
    activeThisWeek: 0,
    activeThisMonth: 0,
    averageSessionsPerUser: 0,
    mostActiveUsers: [],
    recentlyActive: [],
    inactiveUsers: [],
    dailyStats: []
  });
  const [loading, setLoading] = useState(true);
  const [sendingEmails, setSendingEmails] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    fetchActivityStats();
  }, []);

  const fetchActivityStats = async () => {
    try {
      setLoading(true);

      // Get all user activity with profile data
      const { data: activityData, error } = await supabase
        .from('user_activity')
        .select(`
          user_id,
          last_activity_at,
          created_at
        `)
        .order('last_activity_at', { ascending: false });

      if (error) throw error;

      // Get profiles for all users
      const userIds = activityData?.map(a => a.user_id) || [];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name, email, created_at')
        .in('id', userIds);

      const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);

      // Calculate stats
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const enrichedActivity: UserActivity[] = (activityData || []).map(a => {
        const profile = profilesMap.get(a.user_id);
        return {
          user_id: a.user_id,
          full_name: profile?.full_name || 'Unknown',
          email: profile?.email || '',
          last_activity_at: a.last_activity_at,
          first_activity_at: a.created_at,
          visit_count: calculateVisitCount(a.created_at, a.last_activity_at),
          created_at: profile?.created_at || a.created_at
        };
      });

      const activeToday = enrichedActivity.filter(a => 
        new Date(a.last_activity_at) >= todayStart
      ).length;

      const activeThisWeek = enrichedActivity.filter(a => 
        new Date(a.last_activity_at) >= weekAgo
      ).length;

      const activeThisMonth = enrichedActivity.filter(a => 
        new Date(a.last_activity_at) >= monthAgo
      ).length;

      // Users inactive for more than 14 days
      const inactiveUsers = enrichedActivity.filter(a => 
        differenceInDays(now, new Date(a.last_activity_at)) > 14
      );

      // Calculate daily stats for the last 14 days
      const dailyStats: DailyStats[] = [];
      for (let i = 13; i >= 0; i--) {
        const date = subDays(now, i);
        const dateStr = format(date, 'yyyy-MM-dd');
        const displayDate = format(date, 'dd/MM', { locale: el });
        
        const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
        
        const activeUsers = enrichedActivity.filter(a => {
          const lastActivity = new Date(a.last_activity_at);
          return lastActivity >= dayStart && lastActivity < dayEnd;
        }).length;

        const newUsers = (profilesData || []).filter(p => {
          const createdAt = new Date(p.created_at);
          return createdAt >= dayStart && createdAt < dayEnd;
        }).length;

        dailyStats.push({ date: dateStr, displayDate, activeUsers, newUsers });
      }

      setStats({
        totalActiveUsers: enrichedActivity.length,
        activeToday,
        activeThisWeek,
        activeThisMonth,
        averageSessionsPerUser: enrichedActivity.length > 0 
          ? Math.round(enrichedActivity.reduce((acc, a) => acc + a.visit_count, 0) / enrichedActivity.length)
          : 0,
        mostActiveUsers: enrichedActivity.slice(0, 10),
        recentlyActive: enrichedActivity.slice(0, 20),
        inactiveUsers: inactiveUsers.slice(0, 50),
        dailyStats
      });
    } catch (error) {
      console.error("Error fetching activity stats:", error);
    } finally {
      setLoading(false);
    }
  };

  // Estimate visit count based on activity period
  const calculateVisitCount = (firstActivity: string, lastActivity: string): number => {
    const days = differenceInDays(new Date(lastActivity), new Date(firstActivity));
    // Rough estimate: assume user visits at least once per day they were active
    return Math.max(1, Math.round(days * 0.7));
  };

  const getActivityBadge = (lastActivity: string) => {
    const hours = differenceInHours(new Date(), new Date(lastActivity));
    
    if (hours < 1) {
      return <Badge className="bg-green-500">Online τώρα</Badge>;
    } else if (hours < 24) {
      return <Badge className="bg-blue-500">Σήμερα</Badge>;
    } else if (hours < 168) { // 7 days
      return <Badge variant="secondary">Αυτή τη βδομάδα</Badge>;
    } else if (hours < 720) { // 30 days
      return <Badge variant="outline">Αυτό το μήνα</Badge>;
    } else {
      return <Badge variant="destructive">Ανενεργή</Badge>;
    }
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedUsers.size === stats.inactiveUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(stats.inactiveUsers.map(u => u.user_id)));
    }
  };

  const handleSendReengagementEmails = async () => {
    if (selectedUsers.size === 0) {
      toast({
        title: "Δεν επιλέχθηκαν χρήστες",
        description: "Επιλέξτε τουλάχιστον έναν χρήστη",
        variant: "destructive"
      });
      return;
    }

    setSendingEmails(true);
    try {
      // Get selected users' data
      const usersToEmail = stats.inactiveUsers.filter(u => selectedUsers.has(u.user_id));
      
      let successCount = 0;
      let failCount = 0;

      for (const user of usersToEmail) {
        try {
          // Use the new send-admin-email function with proper logging
          const { error } = await supabase.functions.invoke('send-admin-email', {
            body: {
              recipientUserId: user.user_id,
              recipientEmail: user.email,
              recipientName: user.full_name,
              reason: 'bulk_reengagement',
              templateKey: 'inactive_user',
              language: 'el'
            }
          });

          if (error) throw error;
          successCount++;
        } catch (err) {
          console.error(`Failed to send email to ${user.email}:`, err);
          failCount++;
        }
      }

      toast({
        title: "Αποστολή ολοκληρώθηκε",
        description: `Επιτυχία: ${successCount}, Αποτυχία: ${failCount}`,
        variant: successCount > 0 ? "default" : "destructive"
      });

      setSelectedUsers(new Set());
    } catch (error) {
      console.error("Error sending re-engagement emails:", error);
      toast({
        title: "Σφάλμα",
        description: "Αποτυχία αποστολής emails",
        variant: "destructive"
      });
    } finally {
      setSendingEmails(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Φόρτωση στατιστικών...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-full">
                <Zap className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.activeToday}</p>
                <p className="text-xs text-muted-foreground">Ενεργές σήμερα</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.activeThisWeek}</p>
                <p className="text-xs text-muted-foreground">Αυτή τη βδομάδα</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-full">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.activeThisMonth}</p>
                <p className="text-xs text-muted-foreground">Αυτό το μήνα</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-full">
                <Users className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalActiveUsers}</p>
                <p className="text-xs text-muted-foreground">Σύνολο tracked</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Δραστηριότητα Τελευταίων 14 Ημερών
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.dailyStats}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="displayDate" 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  labelStyle={{ fontWeight: 'bold' }}
                />
                <Legend />
                <Bar 
                  dataKey="activeUsers" 
                  name="Ενεργοί Χρήστες" 
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="newUsers" 
                  name="Νέοι Χρήστες" 
                  fill="hsl(142 76% 36%)" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recently Active Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Πρόσφατα Ενεργές Μαμάδες
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Χρήστης</TableHead>
                <TableHead>Τελευταία Δραστηριότητα</TableHead>
                <TableHead>Κατάσταση</TableHead>
                <TableHead>Πρώτη Είσοδος</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.recentlyActive.map((user) => (
                <TableRow key={user.user_id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{user.full_name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">
                        {formatDistanceToNow(new Date(user.last_activity_at), { 
                          addSuffix: true, 
                          locale: el 
                        })}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getActivityBadge(user.last_activity_at)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(user.first_activity_at), 'dd/MM/yyyy', { locale: el })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Inactive Users with Re-engagement */}
      {stats.inactiveUsers.length > 0 && (
        <Card className="border-orange-200">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <CardTitle className="flex items-center gap-2 text-orange-600">
                <Clock className="w-5 h-5" />
                Ανενεργές Χρήστες ({">"}14 μέρες) - {stats.inactiveUsers.length} χρήστες
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSelectAll}
                >
                  {selectedUsers.size === stats.inactiveUsers.length ? (
                    <>
                      <X className="w-4 h-4 mr-1" />
                      Αποεπιλογή όλων
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Επιλογή όλων
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  onClick={handleSendReengagementEmails}
                  disabled={sendingEmails || selectedUsers.size === 0}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  {sendingEmails ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                      Αποστολή...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-1" />
                      Αποστολή Re-engagement ({selectedUsers.size})
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10"></TableHead>
                  <TableHead>Χρήστης</TableHead>
                  <TableHead>Τελευταία Είσοδος</TableHead>
                  <TableHead>Μέρες Απουσίας</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.inactiveUsers.map((user) => (
                  <TableRow key={user.user_id}>
                    <TableCell>
                      <Checkbox 
                        checked={selectedUsers.has(user.user_id)}
                        onCheckedChange={() => handleSelectUser(user.user_id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{user.full_name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(user.last_activity_at), 'dd/MM/yyyy HH:mm', { locale: el })}
                    </TableCell>
                    <TableCell>
                      <Badge variant="destructive">
                        {differenceInDays(new Date(), new Date(user.last_activity_at))} μέρες
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
