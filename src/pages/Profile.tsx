import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, LogOut, Sparkles, ChevronLeft, ChevronRight, MessageCircle, Flag } from "lucide-react";
import mascot from "@/assets/mascot.jpg";
import logo from "@/assets/logo-full.jpg";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { PhotoUploadWithDelete } from "@/components/PhotoUploadWithDelete";
import { ReportProfileModal } from "@/components/ReportProfileModal";
import { PhotoModerationNotification } from "@/components/PhotoModerationNotification";

export default function ProfileNew() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { userId } = useParams();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [hasMatch, setHasMatch] = useState(false);
  const [matchId, setMatchId] = useState<string | null>(null);
  const [hasLikedYou, setHasLikedYou] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      setCurrentUserId(user.id);
      const profileId = userId || user.id;
      const isOwn = !userId || userId === user.id;
      setIsOwnProfile(isOwn);

      // For own profile, use profiles table; for others, use profiles_safe
      let data;
      if (isOwn) {
        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", profileId)
          .maybeSingle();
        
        if (error) throw error;
        data = profileData;
      } else {
        // For other users, first try profiles (if RLS allows), then profiles_safe
        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", profileId)
          .maybeSingle();
        
        if (error || !profileData) {
          // Fallback to profiles_safe
          const { data: safeData, error: safeError } = await supabase
            .from("profiles_safe")
            .select("*")
            .eq("id", profileId)
            .maybeSingle();
          
          if (safeError) throw safeError;
          data = safeData;
        } else {
          data = profileData;
        }

        // Check if there's a mutual match
        const { data: matchData } = await supabase
          .from("matches")
          .select("id")
          .or(`and(user1_id.eq.${user.id},user2_id.eq.${profileId}),and(user1_id.eq.${profileId},user2_id.eq.${user.id})`)
          .maybeSingle();

        if (matchData) {
          setHasMatch(true);
          setMatchId(matchData.id);
        }

        // Check if this user has liked the current user
        const { data: swipeData } = await supabase
          .from("swipes")
          .select("id")
          .eq("from_user_id", profileId)
          .eq("to_user_id", user.id)
          .eq("choice", "yes")
          .maybeSingle();

        if (swipeData) {
          setHasLikedYou(true);
        }
      }

      if (!data) {
        toast.error(language === "el" ? "Το προφίλ δεν βρέθηκε" : "Profile not found");
        navigate(-1);
        return;
      }

      setProfile(data);

      // Check if user is admin
      if (isOwn) {
        const { data: hasAdminRole } = await supabase.rpc("has_role", {
          _user_id: user.id,
          _role: "admin",
        });
        setIsAdmin(!!hasAdminRole);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error(language === "el" ? "Σφάλμα φόρτωσης προφίλ" : "Error loading profile");
      if (isOwnProfile) {
        await supabase.auth.signOut();
        navigate("/auth");
      } else {
        navigate(-1);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success(language === "el" ? "Αποσυνδέθηκες" : "Signed out");
      navigate("/auth");
    } catch (error) {
      toast.error(language === "el" ? "Αποτυχία αποσύνδεσης" : "Sign out failed");
    }
  };

  const handlePhotoUpdate = () => {
    fetchProfile();
  };

  const getAge = () => {
    if (!profile?.date_of_birth) return null;
    const birthDate = new Date(profile.date_of_birth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getChildrenDisplay = () => {
    if (!profile?.children || !Array.isArray(profile.children) || profile.children.length === 0) {
      return null;
    }
    return profile.children.map((child: any, idx: number) => (
      <div key={idx} className="flex items-center gap-2 bg-white/80 px-3 py-1.5 rounded-full">
        <span className="text-lg">{child.gender === 'boy' ? '👦' : child.gender === 'girl' ? '👧' : '👶'}</span>
        <span className="text-sm font-medium">{child.name && `${child.name}, `}{child.ageGroup || child.age}</span>
      </div>
    ));
  };

  const handleOpenChat = () => {
    if (matchId) {
      navigate(`/chat/${matchId}`);
    }
  };

  // Photo carousel
  const profilePhotos = profile?.profile_photos_urls && Array.isArray(profile.profile_photos_urls) 
    ? profile.profile_photos_urls 
    : profile?.profile_photo_url 
      ? [profile.profile_photo_url] 
      : [];

  const nextPhoto = () => {
    if (profilePhotos.length > 1) {
      setCurrentPhotoIndex((prev) => (prev + 1) % profilePhotos.length);
    }
  };

  const prevPhoto = () => {
    if (profilePhotos.length > 1) {
      setCurrentPhotoIndex((prev) => (prev - 1 + profilePhotos.length) % profilePhotos.length);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: 'linear-gradient(135deg, #F8E9EE, #F5E8F0)' }}>
        <div className="animate-spin-flower text-6xl">🌸</div>
        <p className="text-sm text-muted-foreground mt-4 animate-pulse">Φόρτωση προφίλ...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #F8E9EE, #F5E8F0)' }}>
        <Card className="p-8 rounded-[30px]">
          <p>Το προφίλ δεν βρέθηκε</p>
          <Button onClick={() => navigate(-1)} className="mt-4">Πίσω</Button>
        </Card>
      </div>
    );
  }

  const currentPhoto = profilePhotos[currentPhotoIndex] || "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400";

  return (
    <div className="min-h-screen pt-20 pb-48 px-4" style={{ background: 'linear-gradient(135deg, #F8E9EE, #F5E8F0)' }}>
      {/* Back button for viewing other profiles */}
      {!isOwnProfile && (
        <div className="fixed top-20 left-4 right-4 z-10 flex justify-between">
          <Button
            variant="ghost"
            size="icon"
            className="bg-white/80 backdrop-blur-sm rounded-full shadow-md"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="bg-white/80 backdrop-blur-sm rounded-full shadow-md"
            onClick={() => setShowReportModal(true)}
          >
            <Flag className="w-4 h-4 text-muted-foreground" />
          </Button>
        </div>
      )}

      {/* Photo Moderation Notification */}
      {currentUserId && isOwnProfile && (
        <PhotoModerationNotification userId={currentUserId} />
      )}

      {/* Report Modal */}
      {userId && (
        <ReportProfileModal
          open={showReportModal}
          onClose={() => setShowReportModal(false)}
          reportedUserId={userId}
        />
      )}

      <div className="max-w-3xl mx-auto space-y-6 mb-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground" style={{ fontFamily: "'Pacifico', cursive" }}>
            {isOwnProfile ? `Hi ${profile.username || profile.full_name} 🌸` : profile.full_name}
          </h1>
          <div className="mt-2 h-[1px] w-24 mx-auto bg-gradient-to-r from-transparent via-[#F3DCE5] to-transparent opacity-50" />
        </div>

        {/* Admin Panel Button */}
        {isOwnProfile && isAdmin && (
          <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-[28px] shadow-lg">
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                <h3 className="text-lg font-bold text-purple-700">Admin Access</h3>
              </div>
              <Button
                onClick={() => navigate("/admin")}
                className="w-full rounded-[30px] bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-md hover:shadow-xl transition-all"
                size="lg"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Open Admin Dashboard
              </Button>
            </div>
          </Card>
        )}

        {/* Photo Carousel Section */}
        <Card className="p-6 bg-gradient-to-br from-white/80 to-[#FDF7F9] border-2 border-[#F3DCE5] rounded-[35px] shadow-lg hover:shadow-xl transition-all">
          <div className="flex flex-col items-center space-y-4">
            {/* Photo with navigation */}
            <div className="relative w-full max-w-[300px] aspect-square">
              <img
                src={currentPhoto}
                alt={profile.full_name}
                className="w-full h-full object-cover rounded-[25px] border-4 border-[#F3DCE5] shadow-lg"
              />
              
              {/* Photo navigation arrows */}
              {profilePhotos.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full shadow-md hover:bg-white"
                    onClick={prevPhoto}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full shadow-md hover:bg-white"
                    onClick={nextPhoto}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </>
              )}
              
              {/* Photo indicators */}
              {profilePhotos.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {profilePhotos.map((_, idx) => (
                    <button
                      key={idx}
                      className={`w-2 h-2 rounded-full transition-all ${
                        idx === currentPhotoIndex 
                          ? 'bg-primary w-4' 
                          : 'bg-white/60'
                      }`}
                      onClick={() => setCurrentPhotoIndex(idx)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Photo count */}
            {profilePhotos.length > 1 && (
              <p className="text-xs text-muted-foreground">
                {currentPhotoIndex + 1} / {profilePhotos.length} φωτογραφίες
              </p>
            )}

            {isOwnProfile && (
              <PhotoUploadWithDelete 
                photos={profilePhotos}
                onPhotosUpdated={handlePhotoUpdate}
              />
            )}
          </div>
        </Card>

        {/* "She said YES!" Banner - for profiles that liked you */}
        {!isOwnProfile && hasLikedYou && !hasMatch && (
          <Card className="p-4 bg-gradient-to-r from-pink-100 via-rose-100 to-pink-100 border-2 border-pink-300 rounded-[28px] shadow-lg">
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl">🎀</span>
              <div className="text-center">
                <p className="font-bold text-pink-600">Αυτή η μαμά είπε ΝΑΙ για γνωριμία!</p>
                <p className="text-xs text-pink-500 mt-1">Κάνε κι εσύ Like για να ξεκλειδώσεις το Chat!</p>
              </div>
              <span className="text-2xl">🎀</span>
            </div>
          </Card>
        )}

        {/* Basic Info Card */}
        <Card className="p-8 bg-gradient-to-br from-white/90 to-[#FDF7F9] border-2 border-[#F3DCE5] rounded-[32px] shadow-md">
          <div className="space-y-5">
            {/* Name & Age */}
            <div className="flex items-center gap-3 pb-4 border-b border-[#F3DCE5]/40">
              <span className="text-xl">💗</span>
              <div>
                <h2 className="text-2xl font-bold text-foreground">{profile.full_name}</h2>
                {getAge() && (
                  <p className="text-sm text-muted-foreground">{getAge()} χρονών</p>
                )}
              </div>
            </div>

            {/* Location */}
            <div className="flex items-start gap-3 pb-4 border-b border-[#F3DCE5]/40">
              <span className="text-lg">📍</span>
              <div>
                <p className="text-sm font-semibold text-foreground">{profile.area}</p>
                <p className="text-sm text-muted-foreground">{profile.city}</p>
              </div>
            </div>

            {/* Kids - Enhanced display */}
            {profile.children && Array.isArray(profile.children) && profile.children.length > 0 && (
              <div className="pb-4 border-b border-[#F3DCE5]/40">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">🍼</span>
                  <p className="text-sm font-semibold text-foreground">
                    Παιδιά ({profile.children.length}):
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {getChildrenDisplay()}
                </div>
              </div>
            )}

            {/* Bio */}
            {profile.bio && (
              <div className="flex items-start gap-3">
                <span className="text-lg">✨</span>
                <p className="text-sm text-foreground/90 leading-relaxed">{profile.bio}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Interests */}
        {profile.interests && profile.interests.length > 0 && (
          <Card className="p-6 bg-gradient-to-br from-white/90 to-[#FDF7F9] border-2 border-[#F3DCE5] rounded-[28px] shadow-md">
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <span>💬</span> Ενδιαφέροντα
            </h3>
            <div className="flex flex-wrap gap-3">
              {profile.interests.map((interest: string) => (
                <Badge
                  key={interest}
                  className="px-4 py-2 rounded-full bg-gradient-to-br from-[#FDF7F9] to-[#F5E8F0] border-2 border-[#F3DCE5] text-foreground font-medium shadow-sm hover:shadow-md transition-all"
                >
                  {interest}
                </Badge>
              ))}
            </div>
          </Card>
        )}

        {/* Open Chat Button (for other profiles with mutual match) */}
        {!isOwnProfile && hasMatch && (
          <Card className="p-6 bg-gradient-to-br from-pink-50 to-purple-50 border-2 border-primary/30 rounded-[28px] shadow-lg">
            <Button
              onClick={handleOpenChat}
              className="w-full rounded-[30px] bg-gradient-to-r from-primary to-pink-500 hover:from-primary/90 hover:to-pink-500/90 text-white shadow-md hover:shadow-xl transition-all"
              size="lg"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Άνοιξε το Chat
            </Button>
          </Card>
        )}

        {/* Profile Actions Card (own profile only) */}
        {isOwnProfile && (
          <Card className="p-6 bg-gradient-to-br from-white/90 to-[#FCF0F5] border-2 border-[#F3DCE5] rounded-[28px] shadow-lg">
            <div className="space-y-4">
              <Button
                disabled
                className="w-full rounded-[30px] bg-gradient-to-r from-[#F3DCE5] to-[#F5E8F0] text-foreground border-2 border-[#F3DCE5] hover:shadow-lg transition-all opacity-60 cursor-not-allowed"
                size="lg"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Boost My Profile*
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                *Momster Perks — free for now, Premium later.
              </p>

              <div className="h-[1px] bg-[#F3DCE5]/40 my-4" />

              <Button
                onClick={() => navigate("/profile-setup")}
                className="w-full rounded-[30px] bg-gradient-to-r from-[#C8788D] to-[#B86B80] hover:from-[#B86B80] hover:to-[#C8788D] text-white shadow-md hover:shadow-xl transition-all"
                size="lg"
              >
                <Settings className="w-4 h-4 mr-2" />
                Επεξεργασία Προφίλ
              </Button>
              
              {/* Large Logout Button with Mascot */}
              <div className="relative">
                <Button
                  variant="outline"
                  className="w-full rounded-[30px] border-2 border-destructive/50 hover:bg-destructive hover:text-white text-destructive shadow-md hover:shadow-xl transition-all font-bold text-lg py-6 relative overflow-hidden"
                  size="lg"
                  onClick={handleSignOut}
                >
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-14 h-14 opacity-30">
                    <img src={mascot} alt="" className="w-full h-full object-contain" />
                  </div>
                  <div className="flex items-center gap-2 relative z-10">
                    <LogOut className="w-5 h-5" />
                    <span>Αποσύνδεση</span>
                  </div>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-4xl opacity-20">
                    🚪
                  </div>
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 py-6 px-4 bg-[#F8E9EE]/95 backdrop-blur-md border-t border-[#F3DCE5]">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="relative inline-block p-3 rounded-full bg-[#F8E9EE]/25 backdrop-blur-sm">
              <img src={logo} alt="Momster Logo" className="w-16 h-16 object-cover rounded-full" style={{ opacity: 0.95 }} />
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <a href="/privacy-terms" className="hover:text-primary transition-colors">Terms of Use</a>
                <span>•</span>
                <a href="/privacy-terms" className="hover:text-primary transition-colors">Privacy</a>
              </div>
              <p className="text-xs text-muted-foreground italic">
                Momster — made with love for moms
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
