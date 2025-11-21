import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sparkles, MessageCircle } from "lucide-react";
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
  children: any[];
}

export default function MagicMatching() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState<MatchedProfile | null>(null);

  const findMagicMatch = async () => {
    setLoading(true);
    setMatchedProfile(null);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error(language === "el" ? "Συνδεθείτε πρώτα" : "Please sign in first");
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

      // Find potential matches with similar criteria
      const { data: potentialMatches, error: matchError } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id)
        .eq('city', currentProfile.city);

      if (matchError) throw matchError;

      if (!potentialMatches || potentialMatches.length === 0) {
        toast.error(language === "el" ? "Δεν βρέθηκαν matches στην περιοχή σας" : "No matches found in your area");
        setLoading(false);
        return;
      }

      // Filter by child ages and interests
      const currentChildren = Array.isArray(currentProfile.children) ? currentProfile.children : [];
      const currentInterests = Array.isArray(currentProfile.interests) ? currentProfile.interests : [];

      const scoredMatches = potentialMatches.map(profile => {
        let score = 0;
        const profileChildren = Array.isArray(profile.children) ? profile.children : [];
        const profileInterests = Array.isArray(profile.interests) ? profile.interests : [];

        // Same area bonus
        if (profile.area === currentProfile.area) score += 3;

        // Similar child ages (simplified scoring)
        if (profileChildren.length > 0 && currentChildren.length > 0) {
          score += 2;
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
          children: Array.isArray(bestMatch.children) ? bestMatch.children : [],
          interests: Array.isArray(bestMatch.interests) ? bestMatch.interests : []
        });
      } else {
        // If no good matches, just pick a random one
        const randomMatch = potentialMatches[Math.floor(Math.random() * potentialMatches.length)];
        setMatchedProfile({
          ...randomMatch,
          children: Array.isArray(randomMatch.children) ? randomMatch.children : [],
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
            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
            Μαγικό Matching
            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
          </h3>

          {!matchedProfile && !loading && (
            <Button
              onClick={findMagicMatch}
              size="lg"
              className="w-full rounded-full bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white font-semibold py-6 transition-all hover:scale-105"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Βρες το Match σου ✨
            </Button>
          )}

          {loading && (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="relative">
                <Sparkles className="w-16 h-16 text-primary animate-spin" />
                <Sparkles className="w-8 h-8 text-pink-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
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
                  <Sparkles className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
