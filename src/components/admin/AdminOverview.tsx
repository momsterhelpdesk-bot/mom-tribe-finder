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
    totalMessages: 0,
    totalSwipes: 0,
    magicMatchPlays: 0,
    marketplaceSignups: 0,
    usersByArea: [] as { area: string; count: number }[],
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

      // Total messages
      const { count: totalMessages } = await supabase
        .from("chat_messages")
        .select("*", { count: "exact", head: true });

      // Marketplace signups
      const { count: marketplaceSignups } = await supabase
        .from("marketplace_notifications")
        .select("*", { count: "exact", head: true });

      // Magic Match plays (poll votes)
      const { count: magicMatchPlays } = await supabase
        .from("poll_votes")
        .select("*", { count: "exact", head: true });

      // Users by area (top 10)
      const { data: areaData } = await supabase
        .from("profiles")
        .select("area")
        .not("area", "eq", "");

      const areaCounts = areaData?.reduce((acc: any, curr) => {
        const area = curr.area || "Χωρίς περιοχή";
        acc[area] = (acc[area] || 0) + 1;
        return acc;
      }, {});

      const usersByArea = Object.entries(areaCounts || {})
        .map(([area, count]) => ({ area, count: count as number }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      setStats({
        totalUsers: totalUsers || 0,
        newUsersToday: newUsersToday || 0,
        newUsersWeek: newUsersWeek || 0,
        activeUsersToday: 0,
        totalQuestions: totalQuestions || 0,
        questionsToday: questionsToday || 0,
        totalAnswers: totalAnswers || 0,
        answersToday: answersToday || 0,
        totalMatches: totalMatches || 0,
        pendingApprovals: (pendingQuestions || 0) + (pendingAnswers || 0),
        pendingReports: pendingReports || 0,
        totalMessages: totalMessages || 0,
        totalSwipes: 0, // Not tracked currently
        magicMatchPlays: magicMatchPlays || 0,
        marketplaceSignups: marketplaceSignups || 0,
        usersByArea,
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

      {/* Engagement Stats */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">📊 Engagement Στατιστικά</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">{stats.totalMessages}</div>
            <p className="text-sm text-muted-foreground">Μηνύματα</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">{stats.totalSwipes}</div>
            <p className="text-sm text-muted-foreground">Swipes</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">{stats.magicMatchPlays}</div>
            <p className="text-sm text-muted-foreground">Magic Match</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">{stats.marketplaceSignups}</div>
            <p className="text-sm text-muted-foreground">Marketplace Signups</p>
          </div>
        </div>
      </Card>

      {/* Top 10 Areas */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">🗺️ Top 10 Περιοχές</h3>
        <div className="space-y-2">
          {stats.usersByArea.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="font-bold text-lg text-primary">#{idx + 1}</span>
                <span className="font-medium">{item.area}</span>
              </div>
              <span className="text-sm font-semibold text-muted-foreground">{item.count} μαμάδες</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}