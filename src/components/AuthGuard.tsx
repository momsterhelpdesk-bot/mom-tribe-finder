import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingProfile, setCheckingProfile] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        
        if (!session) {
          setLoading(false);
          navigate("/auth");
        } else {
          // Defer profile check to avoid Supabase deadlock
          setTimeout(() => {
            checkProfileStatus(session.user.id);
          }, 0);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      
      if (!session) {
        setLoading(false);
        navigate("/auth");
      } else {
        checkProfileStatus(session.user.id);
      }
    }).catch((error) => {
      console.error('Session error:', error);
      setLoading(false);
      navigate("/auth");
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkProfileStatus = async (userId: string) => {
    if (checkingProfile) return;
    setCheckingProfile(true);
    
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('has_completed_onboarding, profile_completed')
        .eq('id', userId)
        .single();

      // Skip redirect logic if we're already on the target page
      const currentPath = location.pathname;
      
      if (!profile) {
        // No profile, go to profile setup
        if (currentPath !== '/profile-setup') {
          navigate('/profile-setup');
        }
      } else if (!profile.profile_completed) {
        // Profile not complete, go to profile setup
        if (currentPath !== '/profile-setup') {
          navigate('/profile-setup');
        }
      } else if (!profile.has_completed_onboarding) {
        // Profile complete but onboarding not done - only redirect if not already on onboarding
        if (currentPath !== '/onboarding') {
          navigate('/onboarding');
        }
      }
      // If both complete, stay on current page
    } catch (error) {
      console.error('Profile check error:', error);
    } finally {
      setLoading(false);
      setCheckingProfile(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Φόρτωση...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return <>{children}</>;
}
