import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MapPin, Sparkles, X, Check, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { useHaptic } from "@/hooks/use-haptic";

interface MagicMatchRequest {
  id: string;
  from_user_id: string;
  to_user_id: string;
  status: string;
  match_score: number;
  message: string;
  created_at: string;
  from_profile?: {
    full_name: string;
    profile_photo_url: string | null;
    city: string;
    area: string;
    interests: string[] | null;
  };
}

interface MagicMatchCardProps {
  request: MagicMatchRequest;
  isIncoming: boolean;
  onAction: () => void;
}

export function MagicMatchCard({ request, isIncoming, onAction }: MagicMatchCardProps) {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { triggerHaptic } = useHaptic();
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Update request status
      await supabase
        .from('magic_match_requests')
        .update({ status: 'accepted', responded_at: new Date().toISOString() })
        .eq('id', request.id);

      // Create the match
      const { data: newMatch, error: matchError } = await supabase
        .from('matches')
        .insert([{
          user1_id: request.from_user_id,
          user2_id: request.to_user_id
        }])
        .select()
        .single();

      if (matchError) throw matchError;

      // Send notification to the original sender
      await supabase.from('notifications').insert({
        user_id: request.from_user_id,
        type: 'magic_match_accepted',
        title: 'Το αίτημα σου έγινε αποδεκτό! 🎀',
        message: `Η μαμά αποδέχτηκε το Magic Match σου! Ξεκίνα να μιλάς 💬`,
        icon: '🎀',
        metadata: { match_id: newMatch.id }
      });

      triggerHaptic('medium');
      toast.success(language === 'el' ? 'Match επιτυχές! 💕' : 'Match successful! 💕');
      navigate(`/chat/${newMatch.id}`);
      onAction();
    } catch (error) {
      console.error('Error accepting match:', error);
      triggerHaptic('error');
      toast.error(language === 'el' ? 'Σφάλμα' : 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async () => {
    setLoading(true);
    try {
      await supabase
        .from('magic_match_requests')
        .update({ status: 'declined', responded_at: new Date().toISOString() })
        .eq('id', request.id);

      // No notification sent - silent decline
      triggerHaptic('light');
      toast.success(language === 'el' ? 'Απορρίφθηκε διακριτικά' : 'Declined quietly');
      onAction();
    } catch (error) {
      console.error('Error declining match:', error);
      triggerHaptic('error');
    } finally {
      setLoading(false);
    }
  };

  if (!request.from_profile) return null;

  return (
    <Card className="bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 border-2 border-pink-200/50 shadow-lg overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-purple-500" />
          <span className="text-xs font-medium text-purple-600">Magic Match Request</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <img 
              src={request.from_profile.profile_photo_url || "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400"}
              alt={request.from_profile.full_name}
              className="w-16 h-16 rounded-full object-cover border-3 border-pink-200"
            />
            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow">
              <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-lg truncate">{request.from_profile.full_name}</h4>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{request.from_profile.area}, {request.from_profile.city}</span>
            </div>
            {request.match_score && (
              <Badge className="mt-1 bg-gradient-to-r from-purple-400 to-pink-400 text-white border-none text-xs">
                ✨ {request.match_score}% match
              </Badge>
            )}
          </div>
        </div>

        {request.message && (
          <div className="mt-3 p-3 bg-white/60 rounded-xl">
            <p className="text-sm text-muted-foreground italic">"{request.message}"</p>
          </div>
        )}

        {isIncoming && request.status === 'pending' && (
          <div className="flex gap-2 mt-4">
            <Button
              onClick={handleAccept}
              disabled={loading}
              className="flex-1 rounded-full bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500"
              size="sm"
            >
              <Check className="w-4 h-4 mr-1" />
              Αποδοχή
            </Button>
            <Button
              onClick={handleDecline}
              disabled={loading}
              variant="outline"
              className="rounded-full border-pink-200"
              size="sm"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        {request.status === 'accepted' && (
          <Button
            onClick={() => navigate(`/chats`)}
            className="w-full mt-4 rounded-full"
            size="sm"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Άνοιξε Chat
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default MagicMatchCard;
