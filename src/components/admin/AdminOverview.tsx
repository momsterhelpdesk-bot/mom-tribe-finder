import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, MessageSquare, Heart, AlertTriangle, CheckCircle, Clock } from "lucide-react";

export default function AdminOverview() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    newUsersToday: 0,
    newUsersWeek: 0,
    activeUsersToday: 0,
    totalQuestions: 0,
    questionsToday: 0,
    totalAnswers: 0,
    answersToday: 0,
    totalMatches: 0,
    pendingApprovals: 0,
    pendingReports: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);

      // Total users
      const { count: totalUsers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // New users today
      const { count: newUsersToday } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", today.toISOString());

      // New users this week
      const { count: newUsersWeek } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", weekAgo.toISOString());

      // Questions stats
      const { count: totalQuestions } = await supabase
        .from("questions")
        .select("*", { count: "exact", head: true });

      const { count: questionsToday } = await supabase
        .from("questions")
        .select("*", { count: "exact", head: true })
        .gte("created_at", today.toISOString());

      // Answers stats
      const { count: totalAnswers } = await supabase
        .from("answers")
        .select("*", { count: "exact", head: true });

      const { count: answersToday } = await supabase
        .from("answers")
        .select("*", { count: "exact", head: true })
        .gte("created_at", today.toISOString());

      // Matches stats
      const { count: totalMatches } = await supabase
        .from("matches")
        .select("*", { count: "exact", head: true });

      // Pending approvals
      const { count: pendingQuestions } = await supabase
        .from("questions")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      const { count: pendingAnswers } = await supabase
        .from("answers")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      // Pending reports
      const { count: pendingReports } = await supabase
        .from("profile_reports")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      setStats({
        totalUsers: totalUsers || 0,
        newUsersToday: newUsersToday || 0,
        newUsersWeek: newUsersWeek || 0,
        activeUsersToday: 0, // TODO: Track from user_activity
        totalQuestions: totalQuestions || 0,
        questionsToday: questionsToday || 0,
        totalAnswers: totalAnswers || 0,
        answersToday: answersToday || 0,
        totalMatches: totalMatches || 0,
        pendingApprovals: (pendingQuestions || 0) + (pendingAnswers || 0),
        pendingReports: pendingReports || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Σύνολο Μαμάδων</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.newUsersToday} σήμερα, +{stats.newUsersWeek} εβδομάδα
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ερωτήσεις</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalQuestions}</div>
            <p className="text-xs text-muted-foreground">+{stats.questionsToday} σήμερα</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Απαντήσεις</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAnswers}</div>
            <p className="text-xs text-muted-foreground">+{stats.answersToday} σήμερα</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Matches</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMatches}</div>
            <p className="text-xs text-muted-foreground">Magic Matching</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-orange-500/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Εκκρεμείς Εγκρίσεις</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{stats.pendingApprovals}</div>
            <p className="text-xs text-muted-foreground">Ερωτήσεις & Απαντήσεις προς έγκριση</p>
          </CardContent>
        </Card>

        <Card className="border-red-500/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Αναφορές</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{stats.pendingReports}</div>
            <p className="text-xs text-muted-foreground">Εκκρεμείς αναφορές</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}