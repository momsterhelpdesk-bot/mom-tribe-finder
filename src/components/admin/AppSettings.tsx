import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Settings, AlertTriangle } from "lucide-react";

export default function AppSettings() {
  const [settings, setSettings] = useState({
    daily_swipe_limit: 10,
    premium_enabled: false,
    maintenance_mode: false,
    app_version: "1.0.0",
  });

  const [announcementBar, setAnnouncementBar] = useState({
    enabled: false,
    text: "",
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const { data } = await supabase
      .from("app_settings")
      .select("*");

    if (data) {
      data.forEach((setting: any) => {
        if (setting.key === "daily_swipe_limit") {
          setSettings((s) => ({ ...s, daily_swipe_limit: setting.value }));
        }
        if (setting.key === "announcement_bar") {
          setAnnouncementBar(setting.value);
        }
      });
    }
  };

  const handleSaveSettings = async () => {
    const { error } = await supabase
      .from("app_settings")
      .upsert([
        { key: "daily_swipe_limit", value: settings.daily_swipe_limit },
        { key: "premium_enabled", value: settings.premium_enabled },
        { key: "maintenance_mode", value: settings.maintenance_mode },
        { key: "app_version", value: settings.app_version },
      ]);

    if (error) {
      toast.error("Σφάλμα αποθήκευσης");
      return;
    }

    toast.success("Οι ρυθμίσεις ενημερώθηκαν!");
  };

  const handleSaveAnnouncementBar = async () => {
    const { error } = await supabase
      .from("app_settings")
      .upsert([{ key: "announcement_bar", value: announcementBar }]);

    if (error) {
      toast.error("Σφάλμα αποθήκευσης");
      return;
    }

    toast.success("Η μπάρα ανακοίνωσης ενημερώθηκε!");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            App Settings
          </CardTitle>
          <CardDescription>
            Γενικές ρυθμίσεις εφαρμογής
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label>Daily Swipe Limit</Label>
              <Input
                type="number"
                value={settings.daily_swipe_limit}
                onChange={(e) => setSettings({ ...settings, daily_swipe_limit: parseInt(e.target.value) })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Μέγιστος αριθμός swipes ανά ημέρα για κάθε χρήστη
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Premium Features</Label>
                <p className="text-xs text-muted-foreground">
                  Ενεργοποίηση premium λειτουργιών
                </p>
              </div>
              <Switch
                checked={settings.premium_enabled}
                onCheckedChange={(checked) => setSettings({ ...settings, premium_enabled: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  Maintenance Mode
                </Label>
                <p className="text-xs text-muted-foreground">
                  Απενεργοποίηση εφαρμογής για συντήρηση
                </p>
              </div>
              <Switch
                checked={settings.maintenance_mode}
                onCheckedChange={(checked) => setSettings({ ...settings, maintenance_mode: checked })}
              />
            </div>

            <div>
              <Label>App Version</Label>
              <Input
                value={settings.app_version}
                onChange={(e) => setSettings({ ...settings, app_version: e.target.value })}
              />
            </div>
          </div>

          <Button onClick={handleSaveSettings}>Αποθήκευση Ρυθμίσεων</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Announcement Bar</CardTitle>
          <CardDescription>
            Μπάρα ανακοινώσεων στο πάνω μέρος της εφαρμογής
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Ενεργοποίηση</Label>
            <Switch
              checked={announcementBar.enabled}
              onCheckedChange={(checked) => setAnnouncementBar({ ...announcementBar, enabled: checked })}
            />
          </div>
          
          {announcementBar.enabled && (
            <div>
              <Label>Κείμενο</Label>
              <Input
                value={announcementBar.text}
                onChange={(e) => setAnnouncementBar({ ...announcementBar, text: e.target.value })}
                placeholder="π.χ. Νέα λειτουργία: Marketplace coming soon! 🎉"
              />
            </div>
          )}

          <Button onClick={handleSaveAnnouncementBar}>Αποθήκευση</Button>
        </CardContent>
      </Card>
    </div>
  );
}
