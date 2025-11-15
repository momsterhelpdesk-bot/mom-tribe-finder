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
          .select('profile_completed')
          .eq('id', session.user.id)
          .single();

        // If profile doesn't exist, create it
        if (profileError && profileError.code === 'PGRST116') {
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: session.user.id,
              full_name: session.user.user_metadata.full_name || session.user.user_metadata.name || '',
              email: session.user.email || '',
              city: '',
              area: '',
              child_age_group: '',
              match_preference: '',
              children: [],
              profile_completed: false
            });

          if (insertError) {
            console.error('Error creating profile:', insertError);
            toast.error("Σφάλμα κατά τη δημιουργία προφίλ");
          }
          
          navigate("/profile-setup");
          return;
        }

        // If profile exists but not completed, go to setup
        if (!profile?.profile_completed) {
          navigate("/profile-setup");
          return;
        }

        // Profile completed, go to discover
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
