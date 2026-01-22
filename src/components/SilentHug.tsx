import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useHaptic } from "@/hooks/use-haptic";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import mascot from "@/assets/mascot.jpg";

interface SilentHugProps {
  language: 'el' | 'en';
}

export default function SilentHug({ language }: SilentHugProps) {
  const [isRequesting, setIsRequesting] = useState(false);
  const [activeHugRequest, setActiveHugRequest] = useState<any>(null);
  const [hugsReceived, setHugsReceived] = useState(0);
  const [showCounter, setShowCounter] = useState(false);
  const { toast } = useToast();
  const { triggerHaptic } = useHaptic();
  const { showNotification, permission } = usePushNotifications();

  useEffect(() => {
    checkActiveHugRequest();
  }, []);

  // Subscribe to realtime updates for the user's hug request
  useEffect(() => {
    if (!activeHugRequest) return;

    const channel = supabase
      .channel(`hug-${activeHugRequest.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'silent_hugs',
          filter: `id=eq.${activeHugRequest.id}`,
        },
        (payload) => {
          const newCount = payload.new.hugs_received;
          setHugsReceived(newCount);
          if (newCount > hugsReceived) {
            triggerHaptic('light');
            // Send push notification for each new hug received
            if (permission === 'granted') {
              showNotification(
                language === 'el' ? '🫂 Αγκαλιά!' : '🫂 Hug!',
                {
                  body: language === 'el' 
                    ? `${newCount} μαμάδες σε αγκαλιάζουν` 
                    : `${newCount} moms are hugging you`,
                  tag: `hug-${activeHugRequest.id}`,
                  url: '/',
                }
              );
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeHugRequest, hugsReceived, triggerHaptic]);

  const checkActiveHugRequest = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check for active (non-expired) hug request
      const { data, error } = await supabase
        .from('silent_hugs')
        .select('*')
        .eq('requester_id', user.id)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (data && !error) {
        setActiveHugRequest(data);
        setHugsReceived(data.hugs_received);
        setShowCounter(true);
      }
    } catch (error) {
      // No active request found, which is fine
    }
  };

  const handleRequestHug = async () => {
    setIsRequesting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: language === 'el' ? 'Σφάλμα' : 'Error',
          description: language === 'el' ? 'Πρέπει να συνδεθείς' : 'You need to be logged in',
          variant: 'destructive',
        });
        return;
      }

      // Get user's city for targeting
      const { data: profile } = await supabase
        .from('profiles')
        .select('city')
        .eq('id', user.id)
        .single();

      // Create the silent hug request
      const { data: hugRequest, error: hugError } = await supabase
        .from('silent_hugs')
        .insert({
          requester_id: user.id,
          city: profile?.city || null,
          country: 'Greece',
        })
        .select()
        .single();

      if (hugError) throw hugError;

      // Send anonymous notifications to 3-5 random active moms
      await sendAnonymousNotifications(user.id, profile?.city);

      setActiveHugRequest(hugRequest);
      setHugsReceived(0);
      setShowCounter(true);
      triggerHaptic('medium');

      toast({
        title: language === 'el' ? '🫂 Στάλθηκε' : '🫂 Sent',
        description: language === 'el' 
          ? 'Μια αγκαλιά είναι καθ\' οδόν...' 
          : 'A hug is on the way...',
      });

    } catch (error) {
      console.error('Error requesting hug:', error);
      toast({
        title: language === 'el' ? 'Σφάλμα' : 'Error',
        description: language === 'el' ? 'Δοκίμασε ξανά' : 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsRequesting(false);
    }
  };

  const sendAnonymousNotifications = async (requesterId: string, city?: string) => {
    try {
      // Get 3-5 random active users (active in last 24h) from same country, preferably same city
      const { data: activeUsers } = await supabase
        .from('user_activity')
        .select('user_id')
        .gt('last_activity_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .neq('user_id', requesterId)
        .limit(20);

      if (!activeUsers || activeUsers.length === 0) return;

      // Shuffle and pick 3-5 random users
      const shuffled = activeUsers.sort(() => Math.random() - 0.5);
      const selectedUsers = shuffled.slice(0, Math.min(5, Math.max(3, shuffled.length)));

      // Send anonymous notifications
      const notifications = selectedUsers.map(user => ({
        user_id: user.user_id,
        type: 'silent_hug',
        title: language === 'el' ? '🫂 Σιωπηλή Αγκαλιά' : '🫂 Silent Hug',
        message: language === 'el' 
          ? 'Μια μαμά χρειάζεται μια αγκαλιά αυτή τη στιγμή. Στείλε της λίγη ζεστασιά 🤍' 
          : 'A mom needs a hug right now. Send her some warmth 🤍',
        icon: '🫂',
        metadata: {
          hug_request_id: activeUsers ? undefined : undefined, // Keep it anonymous - no ID exposed
          is_anonymous: true,
        },
      }));

      await supabase.from('notifications').insert(notifications);
    } catch (error) {
      console.error('Error sending notifications:', error);
    }
  };

  const handleCloseCounter = () => {
    setShowCounter(false);
    setActiveHugRequest(null);
  };

  // Render the counter view when active
  if (showCounter && activeHugRequest) {
    return (
      <Card className="p-6 bg-gradient-to-br from-[#F8E9EE] to-[#F5E0E8] border-[#E8C5D0] overflow-hidden relative rounded-[24px] shadow-lg">
        <div className="flex flex-col items-center text-center space-y-4">
          {/* Animated mascot with gentle breathing */}
          <div className="relative">
            <img
              src={mascot}
              alt="Momster"
              className="w-20 h-20 object-contain animate-pulse"
              style={{ animationDuration: '3s' }}
            />
            <span className="absolute -top-1 -right-1 text-2xl animate-bounce" style={{ animationDuration: '2s' }}>
              🫂
            </span>
          </div>

          {/* Real-time counter with animation */}
          <div className="space-y-2">
            <div className="text-4xl font-bold text-[#C8788D] animate-pulse">
              {hugsReceived}
            </div>
            <p className="text-[#C8788D] font-medium">
              {language === 'el' 
                ? `${hugsReceived === 0 ? 'Περιμένουμε αγκαλιές...' : hugsReceived === 1 ? 'μαμά είναι εδώ μαζί σου' : 'μαμάδες είναι εδώ μαζί σου'}`
                : `${hugsReceived === 0 ? 'Waiting for hugs...' : hugsReceived === 1 ? 'mom is here with you' : 'moms are here with you'}`
              }
            </p>
          </div>

          {/* Gentle floating hearts */}
          <div className="flex gap-2 opacity-60">
            {[...Array(Math.min(hugsReceived, 5))].map((_, i) => (
              <span 
                key={i} 
                className="text-xl animate-float-heart"
                style={{ animationDelay: `${i * 0.3}s` }}
              >
                💕
              </span>
            ))}
          </div>

          {/* Close button - very subtle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCloseCounter}
            className="text-[#C8788D]/60 hover:text-[#C8788D] text-xs mt-2"
          >
            {language === 'el' ? 'Κλείσιμο' : 'Close'}
          </Button>
        </div>
      </Card>
    );
  }

  // Render the request button
  return (
    <Card className="p-5 bg-gradient-to-br from-[#F8E9EE] to-[#F5E0E8] border-[#E8C5D0] overflow-hidden relative rounded-[24px] shadow-md hover:shadow-lg transition-all">
      <div className="flex items-center gap-4">
        {/* Mascot with subtle idle animation */}
        <div className="relative shrink-0">
          <img
            src={mascot}
            alt="Momster"
            className="w-14 h-14 object-contain"
            style={{ 
              animation: 'float 4s ease-in-out infinite',
            }}
          />
        </div>

        {/* Button area */}
        <div className="flex-1 space-y-2">
          <Button
            onClick={handleRequestHug}
            disabled={isRequesting}
            className="w-full bg-white/80 hover:bg-white text-[#C8788D] border border-[#E8C5D0] shadow-sm hover:shadow-md transition-all rounded-xl py-3 font-medium"
            variant="outline"
          >
            <span className="mr-2">🫂</span>
            {isRequesting 
              ? (language === 'el' ? 'Στέλνεται...' : 'Sending...')
              : (language === 'el' ? 'Χρειάζομαι μια αγκαλιά' : 'I need a hug')
            }
          </Button>
          <p className="text-[10px] text-[#C8788D]/60 text-center">
            {language === 'el' ? 'Ανώνυμα · Χωρίς υποχρέωση' : 'Anonymous · No pressure'}
          </p>
        </div>
      </div>
    </Card>
  );
}
