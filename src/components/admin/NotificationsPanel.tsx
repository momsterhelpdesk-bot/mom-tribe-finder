import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Bell, Send } from "lucide-react";

export default function NotificationsPanel() {
  const [notification, setNotification] = useState({
    title: "",
    message: "",
    targetArea: "",
  });

  const handleSendNotification = async () => {
    if (!notification.title || !notification.message) {
      toast.error("Συμπληρώστε τίτλο και μήνυμα");
      return;
    }

    // Get all users (or filtered by area)
    let query = supabase.from("profiles").select("id");
    
    if (notification.targetArea) {
      query = query.eq("area", notification.targetArea);
    }

    const { data: profiles, error } = await query;

    if (error || !profiles) {
      toast.error("Σφάλμα ανάκτησης χρηστών");
      return;
    }

    // Insert notification for each user
    const notifications = profiles.map((profile) => ({
      user_id: profile.id,
      title: notification.title,
      message: notification.message,
      type: "announcement",
      icon: "📢",
    }));

    const { error: insertError } = await supabase
      .from("notifications")
      .insert(notifications);

    if (insertError) {
      toast.error("Σφάλμα αποστολής");
      return;
    }

    toast.success(`Ειδοποίηση στάλθηκε σε ${profiles.length} χρήστες!`);
    setNotification({ title: "", message: "", targetArea: "" });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Push Notifications
          </CardTitle>
          <CardDescription>
            Αποστολή ειδοποιήσεων σε όλους τους χρήστες ή συγκεκριμένες περιοχές
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Τίτλος</Label>
            <Input
              value={notification.title}
              onChange={(e) => setNotification({ ...notification, title: e.target.value })}
              placeholder="π.χ. Νέα λειτουργία!"
            />
          </div>

          <div>
            <Label>Μήνυμα</Label>
            <Textarea
              value={notification.message}
              onChange={(e) => setNotification({ ...notification, message: e.target.value })}
              placeholder="Το περιεχόμενο της ειδοποίησης..."
              rows={4}
            />
          </div>

          <div>
            <Label>Περιοχή (προαιρετικό)</Label>
            <Input
              value={notification.targetArea}
              onChange={(e) => setNotification({ ...notification, targetArea: e.target.value })}
              placeholder="Αφήστε κενό για αποστολή σε όλους"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Π.χ. "Κολωνάκι", "Γλυφάδα" - Κενό = όλοι οι χρήστες
            </p>
          </div>

          <Button onClick={handleSendNotification} className="w-full">
            <Send className="w-4 h-4 mr-2" />
            Αποστολή Ειδοποίησης
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Templates - Coming soon
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
