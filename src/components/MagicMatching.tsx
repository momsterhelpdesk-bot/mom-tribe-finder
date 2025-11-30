import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MessageCircle, Heart, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

interface MatchedProfile {
  id: string;
  full_name: string;
  profile_photo_url: string | null;
  city: string;
  area: string;
  interests: string[];
  child_age_group?: string;
  child_names?: string;
}

export default function MagicMatching() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState<MatchedProfile | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showNoMomsDialog, setShowNoMomsDialog] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setIsLoggedIn(!!user);
  };

  const findMagicMatch = async () => {
    setLoading(true);
    setMatchedProfile(null);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error(language === "el" ? "Συνδεθείτε πρώτα" : "Please sign in first");
        navigate("/auth");
        setLoading(false);
        return;
      }

      // Get current user's profile
      const { data: currentProfile, error: currentError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (currentError) throw currentError;

      // Find potential matches with similar criteria - use profiles_safe for public matching
      const { data: potentialMatches, error: matchError } = await supabase
        .from('profiles_safe')
        .select('*')
        .neq('id', user.id)
        .eq('city', currentProfile.city);

      if (matchError) throw matchError;

      if (!potentialMatches || potentialMatches.length === 0) {
        setShowNoMomsDialog(true);
        setLoading(false);
        return;
      }

      // Filter by child ages and interests
      const currentChildren = Array.isArray(currentProfile.children) ? currentProfile.children : [];
      const currentInterests = Array.isArray(currentProfile.interests) ? currentProfile.interests : [];

      const scoredMatches = potentialMatches.map(profile => {
        let score = 0;
        // profiles_safe doesn't have children field, use child_age_group for scoring
        const profileInterests = Array.isArray(profile.interests) ? profile.interests : [];

        // Same area bonus
        if (profile.area === currentProfile.area) score += 3;

        // Similar child ages (simplified scoring using child_age_group)
        if (profile.child_age_group && currentProfile.child_age_group) {
          if (profile.child_age_group === currentProfile.child_age_group) {
            score += 2;
          }
        }

        // Shared interests
        const sharedInterests = profileInterests.filter((interest: string) => 
          currentInterests.includes(interest)
        );
        score += sharedInterests.length;

        return { profile, score };
      });

      // Sort by score and get the best match
      scoredMatches.sort((a, b) => b.score - a.score);
      
      if (scoredMatches.length > 0 && scoredMatches[0].score > 0) {
        const bestMatch = scoredMatches[0].profile;
        setMatchedProfile({
          ...bestMatch,
          interests: Array.isArray(bestMatch.interests) ? bestMatch.interests : []
        });
      } else {
        // If no good matches, just pick a random one
        const randomMatch = potentialMatches[Math.floor(Math.random() * potentialMatches.length)];
        setMatchedProfile({
          ...randomMatch,
          interests: Array.isArray(randomMatch.interests) ? randomMatch.interests : []
        });
      }
    } catch (error) {
      console.error('Error finding match:', error);
      toast.error(language === "el" ? "Σφάλμα αναζήτησης" : "Error finding match");
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!matchedProfile) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if match already exists
      const { data: existingMatch } = await supabase
        .from('matches')
        .select('id')
        .or(`and(user1_id.eq.${user.id},user2_id.eq.${matchedProfile.id}),and(user1_id.eq.${matchedProfile.id},user2_id.eq.${user.id})`)
        .maybeSingle();

      let matchId;
      if (existingMatch) {
        matchId = existingMatch.id;
      } else {
        // Create new match
        const { data: newMatch, error } = await supabase
          .from('matches')
          .insert({
            user1_id: user.id,
            user2_id: matchedProfile.id
          })
          .select()
          .single();

        if (error) throw error;
        matchId = newMatch.id;
      }

      navigate(`/chat/${matchId}`);
    } catch (error) {
      console.error('Error creating match:', error);
      toast.error(language === "el" ? "Σφάλμα δημιουργίας συνομιλίας" : "Error creating chat");
    }
  };

  return (
    <Card className="bg-gradient-to-br from-pink-100/80 to-purple-100/80 border-none hover:shadow-xl transition-all">
      <CardContent className="p-6">
        <div className="text-center">
          <h3 className="text-xl font-bold text-foreground mb-4 flex items-center justify-center gap-2" style={{ fontFamily: "'Pacifico', cursive" }}>
            💕 Μαγικό Matching* 💕
          </h3>

          {!isLoggedIn ? (
            <div className="space-y-4 py-4">
              <p className="text-muted-foreground text-sm">
                {language === "el" 
                  ? "Βρες το τέλειο match με μία μόνο κίνηση! ✨" 
                  : "Find your perfect match with one click! ✨"}
              </p>
              <Button
                onClick={() => navigate('/auth')}
                size="lg"
                className="w-full rounded-full bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white font-semibold py-6"
              >
                <span className="text-xl mr-2">🌸</span>
                {language === "el" ? "Δημιούργησε Προφίλ" : "Create Profile"}
                <span className="text-xl ml-2">✨</span>
              </Button>
            </div>
          ) : (
            <>
              {!matchedProfile && !loading && (
                <Button
                  onClick={findMagicMatch}
                  size="lg"
                  className="w-full rounded-full bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white font-semibold py-6 transition-all hover:scale-105"
                >
                  <span className="text-xl mr-2">🌸</span>
                  Βρες το Match σου
                  <span className="text-xl ml-2">✨</span>
                </Button>
              )}

              {loading && (
                <div className="flex flex-col items-center gap-4 py-8">
                  <div className="relative animate-bounce">
                    <span className="text-5xl">💕</span>
                    <span className="text-2xl absolute top-0 right-0 animate-ping">✨</span>
                  </div>
                  <p className="text-muted-foreground animate-pulse">
                    {language === "el" ? "Μαγεύουμε το matching..." : "Finding your match..."}
                  </p>
                </div>
              )}

              {matchedProfile && (
                <div className="space-y-4 animate-scale-in">
                  <div className="flex flex-col items-center gap-3">
                    <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                      <AvatarImage src={matchedProfile.profile_photo_url || undefined} />
                      <AvatarFallback className="text-2xl">{matchedProfile.full_name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-bold text-lg text-foreground">{matchedProfile.full_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {matchedProfile.city}{matchedProfile.area ? `, ${matchedProfile.area}` : ''}
                      </p>
                    </div>
                  </div>

                  {matchedProfile.interests && matchedProfile.interests.length > 0 && (
                    <div className="flex flex-wrap gap-2 justify-center">
                      {matchedProfile.interests.slice(0, 3).map((interest, i) => (
                        <span key={i} className="text-xs bg-white/60 px-2 py-1 rounded-full">
                          {interest}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      onClick={sendMessage}
                      className="flex-1 rounded-full bg-primary hover:bg-primary/90"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      {language === "el" ? "Στείλε Μήνυμα" : "Send Message"}
                    </Button>
                    <Button
                      onClick={findMagicMatch}
                      variant="outline"
                      className="rounded-full"
                    >
                      <span className="text-lg">🌸</span>
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* No Moms Available Dialog */}
        <Dialog open={showNoMomsDialog} onOpenChange={setShowNoMomsDialog}>
          <DialogContent className="max-w-md bg-gradient-to-br from-[#FDF7F9] to-[#F5E8F0] border-2 border-[#F3DCE5] rounded-[32px]">
            <button 
              onClick={() => setShowNoMomsDialog(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
            
            <DialogHeader>
              <DialogTitle className="text-2xl text-center pt-4" style={{ fontFamily: "'Pacifico', cursive" }}>
                Δεν υπάρχουν νέες μαμάδες εδώ γύρω… ακόμα! 🌸
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 text-center py-6">
              <p className="text-base text-foreground/90 leading-relaxed">
                Η γειτονιά είναι λίγο ήσυχη αυτή τη στιγμή,<br />
                αλλά οι μαμάδες εμφανίζονται συνέχεια! ✨
              </p>
              
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Μείνε συντονισμένη — νέες μαμάδες μπαίνουν κάθε μέρα 💕</p>
                <p>• Δοκίμασε πάλι σε λίγο!</p>
                <p>• Στο μεταξύ, μπορείς να φτιάξεις το προφίλ σου ακόμη πιο όμορφο ✨</p>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => navigate('/profile-setup')}
                  className="flex-1 rounded-[30px] bg-gradient-to-r from-[#C8788D] to-[#B86B80]"
                >
                  ✨ Επεξεργασία Προφίλ
                </Button>
                <Button
                  onClick={() => setShowNoMomsDialog(false)}
                  variant="outline"
                  className="rounded-[30px] border-2 border-[#F3DCE5]"
                >
                  OK
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
