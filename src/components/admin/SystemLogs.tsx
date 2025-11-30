import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FileText, AlertCircle, Users } from "lucide-react";

export default function SystemLogs() {
  const [moderationLogs, setModerationLogs] = useState<any[]>([]);
  const [userActivity, setUserActivity] = useState<any[]>([]);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    // Moderation logs
    const { data: modLogs } = await supabase
      .from("moderation_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    setModerationLogs(modLogs || []);

    // User activity
    const { data: activity } = await supabase
      .from("user_activity")
      .select("*")
      .order("last_activity_at", { ascending: false })
      .limit(50);

    setUserActivity(activity || []);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="moderation" className="w-full">
        <TabsList>
          <TabsTrigger value="moderation">Moderation Logs</TabsTrigger>
          <TabsTrigger value="activity">User Activity</TabsTrigger>
          <TabsTrigger value="errors">Errors (Coming Soon)</TabsTrigger>
        </TabsList>

        <TabsContent value="moderation">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Moderation Logs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {moderationLogs.map((log) => (
                  <div key={log.id} className="p-3 bg-secondary/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <Badge variant="outline">{log.action}</Badge>
                        <span className="ml-2 text-sm">{log.target_type}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(log.created_at).toLocaleString("el-GR")}
                      </span>
                    </div>
                    {log.details && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {JSON.stringify(log.details)}
                      </p>
                    )}
                  </div>
                ))}
                
                {moderationLogs.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Δεν υπάρχουν logs
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                User Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {userActivity.map((activity) => (
                  <div key={activity.id} className="p-3 bg-secondary/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">User ID: {activity.user_id.slice(0, 8)}...</span>
                      <span className="text-xs text-muted-foreground">
                        Last active: {new Date(activity.last_activity_at).toLocaleString("el-GR")}
                      </span>
                    </div>
                  </div>
                ))}
                
                {userActivity.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Δεν υπάρχει activity
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Error Logs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">
                Error logging - Coming soon
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
