import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, Send, Check, AlertCircle, Volume2, Vibrate } from "lucide-react";
import { usePushNotifications, useMatchNotifications } from "@/hooks/use-push-notifications";
import { useHaptic } from "@/hooks/use-haptic";
import { toast } from "sonner";

interface NotificationSettingsCardProps {
  profile: any;
  language: string;
  onNotificationChange: (key: string, value: boolean) => void;
}

// Haptic toggle sub-component
function HapticToggle({ language }: { language: string }) {
  const { hapticEnabled, toggleHaptic } = useHaptic();
  
  return (
    <div className="flex items-center justify-between">
      <Label htmlFor="haptic" className="text-sm font-medium flex items-center gap-2">
        📳 {language === "el" ? "Δονήσεις (haptic)" : "Vibration (haptic)"}
      </Label>
      <Switch
        id="haptic"
        checked={hapticEnabled}
        onCheckedChange={toggleHaptic}
      />
    </div>
  );
}

export function NotificationSettingsCard({ 
  profile, 
  language, 
  onNotificationChange 
}: NotificationSettingsCardProps) {
  const { 
    supported, 
    permission, 
    requestPermission, 
    showNotification 
  } = usePushNotifications();
  const { playNotificationSound } = useMatchNotifications();
  const [testing, setTesting] = useState(false);

  const handleEnablePush = async () => {
    const granted = await requestPermission();
    if (granted) {
      toast.success(language === "el" ? "Οι ειδοποιήσεις ενεργοποιήθηκαν!" : "Notifications enabled!");
      onNotificationChange('push_enabled', true);
    } else {
      toast.error(language === "el" ? "Οι ειδοποιήσεις δεν επιτράπηκαν" : "Notifications not allowed");
    }
  };

  const handleTestNotification = async () => {
    if (permission !== "granted") {
      toast.error(language === "el" ? "Πρώτα ενεργοποίησε τις ειδοποιήσεις" : "Enable notifications first");
      return;
    }

    setTesting(true);
    
    // Play sound and show notification
    playNotificationSound();
    
    setTimeout(() => {
      showNotification("🎉 Test Notification!", {
        body: language === "el" 
          ? "Οι ειδοποιήσεις λειτουργούν σωστά! Θα λαμβάνεις ειδοποιήσεις για νέα matches." 
          : "Notifications are working! You'll receive alerts for new matches.",
        tag: "test-notification",
        url: "/profile",
      });
      
      toast.success(language === "el" ? "Test notification στάλθηκε!" : "Test notification sent!");
      setTesting(false);
    }, 300);
  };

  const handleTestSound = () => {
    playNotificationSound();
    toast.success(language === "el" ? "Ήχος ειδοποίησης!" : "Notification sound!");
  };

  const getPushStatusIcon = () => {
    if (!supported) return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
    if (permission === "granted") return <Check className="w-4 h-4 text-green-500" />;
    if (permission === "denied") return <AlertCircle className="w-4 h-4 text-destructive" />;
    return <Bell className="w-4 h-4 text-primary" />;
  };

  const getPushStatusText = () => {
    if (!supported) return language === "el" ? "Δεν υποστηρίζεται" : "Not supported";
    if (permission === "granted") return language === "el" ? "Ενεργές" : "Enabled";
    if (permission === "denied") return language === "el" ? "Αποκλεισμένες" : "Blocked";
    return language === "el" ? "Απενεργοποιημένες" : "Disabled";
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-white/90 to-[#FDF7F9] border-2 border-[#F3DCE5] rounded-[28px] shadow-md">
      <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
        <Bell className="w-5 h-5 text-primary" />
        {language === "el" ? "Ρυθμίσεις Ειδοποιήσεων" : "Notification Settings"}
      </h3>
      
      <div className="space-y-4">
        {/* Push Notifications Status & Enable Button */}
        <div className="p-4 bg-gradient-to-r from-primary/5 to-pink-50 rounded-2xl border border-primary/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {getPushStatusIcon()}
              <span className="text-sm font-medium">Push Notifications</span>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${
              permission === "granted" 
                ? "bg-green-100 text-green-700" 
                : permission === "denied"
                  ? "bg-red-100 text-red-700"
                  : "bg-muted text-muted-foreground"
            }`}>
              {getPushStatusText()}
            </span>
          </div>

          {supported && permission !== "granted" && permission !== "denied" && (
            <Button
              onClick={handleEnablePush}
              className="w-full rounded-full bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90 text-white"
              size="sm"
            >
              <Bell className="w-4 h-4 mr-2" />
              {language === "el" ? "Ενεργοποίηση Push" : "Enable Push"}
            </Button>
          )}

          {permission === "denied" && (
            <p className="text-xs text-muted-foreground mt-2">
              {language === "el" 
                ? "Οι ειδοποιήσεις είναι αποκλεισμένες. Ενεργοποίησέ τες από τις ρυθμίσεις του browser." 
                : "Notifications are blocked. Enable them in browser settings."}
            </p>
          )}

          {permission === "granted" && (
            <div className="flex gap-2">
              <Button
                onClick={handleTestNotification}
                disabled={testing}
                variant="outline"
                className="flex-1 rounded-full border-primary/30 hover:bg-primary/5"
                size="sm"
              >
                <Send className="w-4 h-4 mr-2" />
                {testing 
                  ? (language === "el" ? "..." : "...") 
                  : (language === "el" ? "Test" : "Test")}
              </Button>
              <Button
                onClick={handleTestSound}
                variant="outline"
                className="rounded-full border-primary/30 hover:bg-primary/5"
                size="sm"
              >
                <Volume2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Other notification toggles */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="matches" className="text-sm font-medium flex items-center gap-2">
              💕 {language === "el" ? "Ειδοποιήσεις για matches" : "Match notifications"}
            </Label>
            <Switch
              id="matches"
              checked={profile?.notification_settings?.matches ?? true}
              onCheckedChange={(checked) => onNotificationChange('matches', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="messages" className="text-sm font-medium flex items-center gap-2">
              💬 {language === "el" ? "Ειδοποιήσεις μηνυμάτων" : "Message notifications"}
            </Label>
            <Switch
              id="messages"
              checked={profile?.notification_settings?.messages ?? true}
              onCheckedChange={(checked) => onNotificationChange('messages', checked)}
            />
          </div>

          <HapticToggle language={language} />
        </div>
      </div>
    </Card>
  );
}
