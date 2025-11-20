import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useActivityTracker() {
  useEffect(() => {
    const trackActivity = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Update user activity timestamp
        await supabase
          .from('user_activity')
          .upsert({
            user_id: session.user.id,
            last_activity_at: new Date().toISOString(),
          });
      }
    };

    // Track activity on mount
    trackActivity();

    // Track activity every 5 minutes
    const interval = setInterval(trackActivity, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);
}
