import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sparkles, Check, X, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { hapticFeedback } from "@/hooks/use-haptic";
import { AvatarDisplay } from "./AvatarDisplay";

interface MagicMatchRequest {
  id: string;
  from_user_id: string;
  match_score: number | null;
  message: string | null;
  created_at: string;
  from_profile?: {
    full_name: string;
    profile_photo_url: string | null;
    avatar_data: any;
    city: string;
    area: string;
  };
}

export default function MagicMatchRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<MagicMatchRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('magic-match-requests')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'magic_match_requests'
        },
        () => {
          fetchRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchRequests = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch pending requests where current user is the recipient
      const { data: requestsData, error } = await supabase
        .from('magic_match_requests')
        .select('*')
        .eq('to_user_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (requestsData && requestsData.length > 0) {
        // Fetch profiles for each request
        const fromUserIds = requestsData.map(r => r.from_user_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, profile_photo_url, avatar_data, city, area')
          .in('id', fromUserIds);

        const requestsWithProfiles = requestsData.map(request => ({
          ...request,
          from_profile: profiles?.find(p => p.id === request.from_user_id)
        }));

        setRequests(requestsWithProfiles);
      } else {
        setRequests([]);
      }
    } catch (error) {
      console.error('Error fetching magic match requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (request: MagicMatchRequest) => {
    setProcessingId(request.id);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Update request status
      const { error: updateError } = await supabase
        .from('magic_match_requests')
        .update({ 
          status: 'accepted',
          responded_at: new Date().toISOString()
        })
        .eq('id', request.id);

      if (updateError) throw updateError;

      // Create a match between the two users
      const { data: matchData, error: matchError } = await supabase
        .from('matches')
        .insert({
          user1_id: request.from_user_id,
          user2_id: user.id
        })
        .select()
        .single();

      if (matchError) throw matchError;

      // Send initial message if there was one
      if (request.message && matchData) {
        await supabase
          .from('chat_messages')
          .insert({
            match_id: matchData.id,
            sender_id: request.from_user_id,
            content: request.message
          });
      }

      // Create notification for the sender
      await supabase
        .from('notifications')
        .insert({
          user_id: request.from_user_id,
          type: 'magic_match_accepted',
          title: 'Magic Match αποδεκτό! ✨',
          message: `Η ${request.from_profile?.full_name?.split(' ')[0] || 'μαμά'} αποδέχτηκε το αίτημά σου!`,
          icon: '💕'
        });

      hapticFeedback.medium();
      toast.success('Match! Μπορείτε να μιλήσετε τώρα 💕');
      
      // Navigate to chat
      navigate(`/chat/${matchData.id}`);
    } catch (error) {
      console.error('Error accepting request:', error);
      hapticFeedback.error();
      toast.error('Κάτι πήγε στραβά');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDecline = async (request: MagicMatchRequest) => {
    setProcessingId(request.id);
    try {
      const { error } = await supabase
        .from('magic_match_requests')
        .update({ 
          status: 'declined',
          responded_at: new Date().toISOString()
        })
        .eq('id', request.id);

      if (error) throw error;

      hapticFeedback.light();
      setRequests(requests.filter(r => r.id !== request.id));
      toast.success('Το αίτημα απορρίφθηκε');
    } catch (error) {
      console.error('Error declining request:', error);
      hapticFeedback.error();
      toast.error('Κάτι πήγε στραβά');
    } finally {
      setProcessingId(null);
    }
  };

  const getFirstName = (fullName?: string) => {
    return fullName?.split(' ')[0] || 'Μαμά';
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Τώρα';
    if (diffMins < 60) return `${diffMins} λεπτά πριν`;
    if (diffHours < 24) return `${diffHours} ώρ${diffHours === 1 ? 'α' : 'ες'} πριν`;
    return `${diffDays} μέρ${diffDays === 1 ? 'α' : 'ες'} πριν`;
  };

  if (loading) return null;
  if (requests.length === 0) return null;

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-5 h-5 text-primary" />
        <h2 className="font-semibold text-foreground">Magic Match Αιτήματα</h2>
        <span className="bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full">
          {requests.length}
        </span>
      </div>

      <div className="space-y-2">
        {requests.map((request) => (
          <Card 
            key={request.id} 
            className="p-3 bg-gradient-to-r from-primary/5 to-secondary/10 border-primary/20"
          >
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                {request.from_profile?.profile_photo_url ? (
                  <img
                    src={request.from_profile.profile_photo_url}
                    alt={request.from_profile.full_name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-primary/30"
                  />
                ) : request.from_profile?.avatar_data ? (
                  <AvatarDisplay 
                    config={request.from_profile.avatar_data} 
                    size="md"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-lg">👩</span>
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 bg-primary text-white text-[10px] px-1.5 py-0.5 rounded-full">
                  {request.match_score || 90}%
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground truncate">
                    {getFirstName(request.from_profile?.full_name)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    σου έστειλε γεια 👋
                  </span>
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {request.from_profile?.city}, {request.from_profile?.area}
                </p>
                <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                  {getTimeAgo(request.created_at)}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDecline(request)}
                  disabled={processingId === request.id}
                  className="h-8 w-8 p-0 border-muted-foreground/30"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleAccept(request)}
                  disabled={processingId === request.id}
                  className="h-8 gap-1 bg-primary hover:bg-primary/90"
                >
                  {processingId === request.id ? (
                    <span className="animate-spin">🌸</span>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span className="text-xs">Αποδοχή</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Message preview if exists */}
            {request.message && (
              <div className="mt-2 pt-2 border-t border-primary/10">
                <div className="flex items-start gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5 text-primary mt-0.5" />
                  <p className="text-xs text-muted-foreground italic line-clamp-2">
                    "{request.message}"
                  </p>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
