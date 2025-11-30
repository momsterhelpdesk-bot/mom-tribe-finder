import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate("/auth");
          return;
        }

        // Check if profile exists
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('profile_completed, has_completed_onboarding')
          .eq('id', session.user.id)
          .maybeSingle();

        // If profile doesn't exist yet, wait a bit and retry (trigger might be running)
        if (profileError || !profile) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const { data: retryProfile } = await supabase
            .from('profiles')
            .select('profile_completed, has_completed_onboarding')
            .eq('id', session.user.id)
            .maybeSingle();
          
          if (!retryProfile?.profile_completed) {
            navigate("/profile-setup");
            return;
          }
          
          if (!retryProfile?.has_completed_onboarding) {
            navigate("/onboarding");
            return;
          }
        }

        // If profile exists but not completed, go to setup
        if (!profile?.profile_completed) {
          navigate("/profile-setup");
          return;
        }

        // If profile completed but onboarding not done, go to onboarding
        if (!profile?.has_completed_onboarding) {
          navigate("/onboarding");
          return;
        }

        // Everything completed, go to discover
        navigate("/discover");
      } catch (error: any) {
        console.error('Auth callback error:', error);
        toast.error("Σφάλμα κατά τη σύνδεση");
        navigate("/auth");
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Σύνδεση...</h2>
        <p className="text-muted-foreground">Παρακαλώ περιμένετε</p>
      </div>
    </div>
  );
}
