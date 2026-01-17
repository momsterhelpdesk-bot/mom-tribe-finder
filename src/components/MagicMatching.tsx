import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MapPin, Sparkles, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { hapticFeedback } from "@/hooks/use-haptic";

interface MatchedProfile {
  id: string;
  full_name: string;
  profile_photo_url: string | null;
  city: string;
  area: string;
  interests: string[] | null;
  child_age_group?: string;
  child_names?: string;
  latitude?: number;
  longitude?: number;
  matchScore?: number;
  // AI-generated match reasons
  primaryReason?: string;
  secondaryReasons?: string[];
  matchType?: 'same_stage' | 'similar_mood' | 'common_schedule' | 'shared_interests' | 'nearby_vibes';
}

const MagicMatching = () => {
  const [loading, setLoading] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState<MatchedProfile | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showNoMomsDialog, setShowNoMomsDialog] = useState(false);
  const navigate = useNavigate();
  const { language } = useLanguage();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsLoggedIn(!!session);
  };

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Calculate location score (40%)
  const calculateLocationScore = (
    currentArea: string,
    targetArea: string,
    currentLat?: number,
    currentLon?: number,
    targetLat?: number,
    targetLon?: number
  ): number => {
    // Same area = 100%
    if (currentArea === targetArea) return 100;
    
    // If coordinates available, calculate distance
    if (currentLat && currentLon && targetLat && targetLon) {
      const distance = calculateDistance(currentLat, currentLon, targetLat, targetLon);
      if (distance <= 3) return 90;  // Within 3km
      if (distance <= 5) return 70;  // Within 5km
      if (distance <= 10) return 50; // Within 10km
      return 30; // Further away
    }
    
    return 50; // Default if no coordinates
  };

  // Calculate kids age score (35%)
  const calculateKidsAgeScore = (currentAgeGroup: string, targetAgeGroup: string): number => {
    if (currentAgeGroup === targetAgeGroup) return 100;
    
    // Parse age groups to compare similarity
    const ageMapping: Record<string, number> = {
      '0-1': 0,
      '1-2': 1,
      '2-3': 2,
      '3-4': 3,
      '4-5': 4,
      '5-6': 5,
    };
    
    const currentAge = ageMapping[currentAgeGroup] ?? 0;
    const targetAge = ageMapping[targetAgeGroup] ?? 0;
    const diff = Math.abs(currentAge - targetAge);
    
    if (diff === 0) return 100;
    if (diff === 1) return 80;  // 1 year difference
    if (diff === 2) return 60;  // 2 years difference
    return 40; // More than 2 years
  };

  // Calculate interests score (25%)
  const calculateInterestsScore = (currentInterests: string[], targetInterests: string[]): number => {
    if (!currentInterests || !targetInterests) return 0;
    
    const commonInterests = currentInterests.filter(interest => 
      targetInterests.includes(interest)
    );
    
    const count = commonInterests.length;
    if (count >= 5) return 100; // 5+ common = 100% + bonus
    if (count >= 3) return 85;  // 3-4 common
    if (count >= 2) return 70;  // 2 common
    if (count >= 1) return 50;  // 1 common
    return 20; // No common interests
  };

  // Calculate total match score
  const calculateMatchScore = (
    currentProfile: any,
    targetProfile: any
  ): number => {
    const locationScore = calculateLocationScore(
      currentProfile.area,
      targetProfile.area,
      currentProfile.latitude,
      currentProfile.longitude,
      targetProfile.latitude,
      targetProfile.longitude
    );
    
    const kidsAgeScore = calculateKidsAgeScore(
      currentProfile.child_age_group,
      targetProfile.child_age_group
    );
    
    const interestsScore = calculateInterestsScore(
      currentProfile.interests || [],
      targetProfile.interests || []
    );
    
    // Weighted calculation
    const totalScore = (
      (locationScore * 0.40) +
      (kidsAgeScore * 0.35) +
      (interestsScore * 0.25)
    );
    
    return Math.round(totalScore);
  };

  const findMagicMatch = async () => {
    setLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error(language === "el" ? "Πρέπει να συνδεθείς πρώτα" : "Please sign in first");
        navigate("/auth");
        return;
      }

      // Get current user's profile
      const { data: currentProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!currentProfile) {
        toast.error(language === "el" ? "Δεν βρέθηκε το προφίλ σου" : "Profile not found");
        return;
      }

      // Get potential matches from profiles_safe (same city)
      const { data: potentialMatches } = await supabase
        .from("profiles_safe")
        .select("*")
        .eq("city", currentProfile.city)
        .neq("id", user.id);

      if (!potentialMatches || potentialMatches.length === 0) {
        setShowNoMomsDialog(true);
        return;
      }

      // Call AI edge function for smart matching
      const { data: aiResult, error: aiError } = await supabase.functions.invoke('ai-magic-match', {
        body: {
          currentProfile,
          potentialMatches,
          language
        }
      });

      if (aiError) {
        console.error("AI matching error:", aiError);
        // Fallback to first match with generic reason
        const fallbackMatch = potentialMatches[0];
        setMatchedProfile({
          ...fallbackMatch,
          matchScore: 90,
          primaryReason: language === 'el' 
            ? "Είστε κοντά και φαίνεται να ταιριάζετε! 🌸"
            : "You're nearby and seem compatible! 🌸",
          secondaryReasons: [],
          matchType: 'nearby_vibes'
        } as MatchedProfile);
        return;
      }

      if (aiResult?.noProfiles) {
        // Truly no profiles in this city
        setShowNoMomsDialog(true);
        return;
      }

      if (aiResult?.error && !aiResult?.selectedProfile) {
        // AI error but no fallback - shouldn't happen
        setShowNoMomsDialog(true);
        return;
      }

      // Set the AI-selected match with warm reasons (always finds someone!)
      setMatchedProfile({
        ...aiResult.selectedProfile,
        matchScore: aiResult.matchScore || 70,
        primaryReason: aiResult.primaryReason || (language === 'el' 
          ? "Είστε στην ίδια πόλη — αξίζει μια γνωριμία! 🌸"
          : "You're in the same city — worth meeting! 🌸"),
        secondaryReasons: aiResult.secondaryReasons || [],
        matchType: aiResult.matchType || 'nearby_vibes'
      } as MatchedProfile);

    } catch (error) {
      console.error("Error finding match:", error);
      toast.error(language === "el" ? "Σφάλμα κατά την αναζήτηση" : "Error finding match");
    } finally {
      setLoading(false);
    }
  };

  const sendGreeting = async () => {
    if (!matchedProfile) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Create a magic match request instead of direct match
      const { error } = await supabase
        .from("magic_match_requests")
        .insert({
          from_user_id: user.id,
          to_user_id: matchedProfile.id,
          match_score: matchedProfile.matchScore || 90,
          message: language === 'el' 
            ? 'Γεια! Μας πρότεινε το Momster γιατί περνάμε παρόμοια 🤍'
            : 'Hi! Momster suggested us because we have similar experiences 🤍'
        });

      if (error) {
        if (error.code === '23505') {
          // Duplicate - already sent a request
          toast.info(language === 'el' 
            ? 'Έχεις ήδη στείλει αίτημα σε αυτή τη μαμά!' 
            : 'You already sent a request to this mom!');
          return;
        }
        throw error;
      }

      // Create notification for the recipient
      await supabase
        .from('notifications')
        .insert({
          user_id: matchedProfile.id,
          type: 'magic_match_request',
          title: language === 'el' ? 'Νέο Magic Match! ✨' : 'New Magic Match! ✨',
          message: language === 'el' 
            ? `Μια μαμά θέλει να σε γνωρίσει!`
            : `A mom wants to connect with you!`,
          icon: '✨',
          metadata: {
            from_user_id: user.id
          }
        });

      hapticFeedback.medium();
      toast.success(language === 'el' 
        ? `Το "Γεια" σου στάλθηκε! Θα ειδοποιηθείς όταν απαντήσει 💕`
        : `Your greeting was sent! You'll be notified when they respond 💕`);
      
      setMatchedProfile(null);
    } catch (error) {
      console.error("Error sending greeting:", error);
      hapticFeedback.error();
      toast.error(language === "el" ? "Σφάλμα κατά την αποστολή" : "Error sending greeting");
    }
  };

  const handleSkip = () => {
    // Silent skip - no notification to the other user
    setMatchedProfile(null);
    findMagicMatch();
  };

  return (
    <>
      <Card className="bg-gradient-to-br from-purple-100 via-pink-100 to-rose-100 border-2 border-[#F3DCE5] hover:shadow-2xl transition-all hover:scale-[1.02] relative overflow-hidden rounded-[28px]">
        <div className="absolute top-0 right-0 w-32 h-32 bg-pink-300/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-300/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        <CardContent className="p-8 relative z-10">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="w-6 h-6 text-purple-500 animate-pulse" />
            <h3 className="text-xl font-bold text-center mx-2" style={{ fontFamily: "'Pacifico', cursive" }}>
              Magic Matching
            </h3>
            <Sparkles className="w-6 h-6 text-pink-500 animate-pulse" />
          </div>

          {!isLoggedIn ? (
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                {language === "el" ? "Σύνδεση για να βρεις την τέλεια μαμά! 🌸" : "Sign in to find your perfect mom match! 🌸"}
              </p>
              <Button onClick={() => navigate("/auth")} className="rounded-full">
                {language === "el" ? "Σύνδεση" : "Sign In"}
              </Button>
            </div>
          ) : !matchedProfile && !loading ? (
            <Button 
              onClick={findMagicMatch} 
              className="w-full rounded-[25px] h-12 text-base bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500"
            >
              🎀 {language === "el" ? "Βρες την Τέλεια Μαμά" : "Find Your Perfect Match"}
            </Button>
          ) : loading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="text-6xl animate-spin-flower mb-4">🌸</div>
              <p className="text-sm text-muted-foreground animate-pulse">
                {language === "el" ? "Ψάχνουμε την τέλεια μαμά για σένα..." : "Finding your perfect match..."}
              </p>
            </div>
          ) : matchedProfile ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img 
                    src={matchedProfile.profile_photo_url || "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400"}
                    alt={matchedProfile.full_name}
                    className="w-20 h-20 rounded-full object-cover border-4 border-pink-200"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-md">
                    <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-lg">{matchedProfile.full_name}</h4>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span>{matchedProfile.area}, {matchedProfile.city}</span>
                  </div>
                  {matchedProfile.matchScore && (
                    <Badge className={`mt-1 text-white border-none ${
                      matchedProfile.matchScore >= 95 
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
                        : matchedProfile.matchScore >= 85 
                          ? 'bg-gradient-to-r from-purple-400 to-pink-400'
                          : matchedProfile.matchScore >= 75
                            ? 'bg-gradient-to-r from-pink-300 to-rose-300'
                            : 'bg-gradient-to-r from-pink-200 to-rose-200 text-foreground'
                    }`}>
                      {matchedProfile.matchScore >= 95 
                        ? `🔮 ${matchedProfile.matchScore}% Super Match!`
                        : matchedProfile.matchScore >= 85 
                          ? `✨ ${matchedProfile.matchScore}% ${language === 'el' ? 'Πολύ καλό!' : 'Great!'}`
                          : matchedProfile.matchScore >= 75
                            ? `🌸 ${matchedProfile.matchScore}% ${language === 'el' ? 'Καλό ταίριασμα' : 'Good match'}`
                            : `💫 ${matchedProfile.matchScore}% ${language === 'el' ? 'Αξίζει μια δοκιμή!' : 'Worth a try!'}`
                      }
                    </Badge>
                  )}
                </div>
              </div>

              {/* AI-generated match reason - The magic! */}
              {matchedProfile.primaryReason && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 border border-pink-100">
                  <p className="text-sm font-medium text-foreground flex items-start gap-2">
                    <span className="text-lg">💫</span>
                    <span>
                      {language === 'el' ? 'Ταιριάξαμε γιατί...' : 'We matched you because...'}
                    </span>
                  </p>
                  <p className="text-base text-foreground mt-2 font-medium">
                    {matchedProfile.primaryReason}
                  </p>
                  {matchedProfile.secondaryReasons && matchedProfile.secondaryReasons.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {matchedProfile.secondaryReasons.map((reason, idx) => (
                        <p key={idx} className="text-xs text-muted-foreground flex items-center gap-1">
                          <span>•</span> {reason}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {matchedProfile.interests && matchedProfile.interests.length > 0 && (
                <div>
                  <p className="text-xs font-semibold mb-2 flex items-center gap-1">
                    <span>💗</span> {language === "el" ? "Κοινά Ενδιαφέροντα:" : "Common Interests:"}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {matchedProfile.interests.slice(0, 4).map((interest) => (
                      <Badge key={interest} variant="secondary" className="text-xs">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button 
                  onClick={sendGreeting}
                  className="flex-1 rounded-[25px] bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500"
                >
                  👋 {language === "el" ? "Πες γεια" : "Say Hi"}
                </Button>
                <Button 
                  onClick={handleSkip}
                  variant="outline"
                  className="rounded-[25px] text-muted-foreground"
                >
                  {language === "el" ? "Όχι τώρα" : "Not now"}
                </Button>
              </div>
              <p className="text-[10px] text-center text-muted-foreground mt-2">
                💡 {language === "el" ? "Η μαμά θα πρέπει να αποδεχτεί για να ανοίξει chat" : "Mom needs to accept to open chat"}
              </p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* No Moms Inline Message (replaces popup) */}
      {showNoMomsDialog && (
        <Card className="mt-4 p-4 bg-gradient-to-br from-pink-50 via-white to-purple-50/50 border-pink-200/50">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💫</span>
            <div className="flex-1">
              <p className="font-medium text-foreground mb-1" style={{ fontFamily: "'Pacifico', cursive" }}>
                {language === "el" 
                  ? "Δεν βρέθηκε τέλεια μαμά... ακόμα!"
                  : "No perfect match found... yet!"}
              </p>
              <p className="text-sm text-muted-foreground">
                {language === "el" 
                  ? "Προσπάθησε ξανά αργότερα ή δες τις Προτεινόμενες μαμάδες 🌸"
                  : "Try again later or check out the Recommended moms 🌸"}
              </p>
              <Button 
                onClick={() => {
                  setShowNoMomsDialog(false);
                  navigate("/discover");
                }}
                variant="link"
                className="p-0 h-auto text-primary mt-2"
              >
                {language === "el" ? "→ Δες όλες τις μαμάδες" : "→ See all moms"}
              </Button>
            </div>
            <button 
              onClick={() => setShowNoMomsDialog(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </Card>
      )}
    </>
  );
};

export default MagicMatching;
