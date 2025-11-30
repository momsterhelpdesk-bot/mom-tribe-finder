import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Settings, LogOut, Sparkles } from "lucide-react";
import mascot from "@/assets/mascot.jpg";
import logo from "@/assets/logo-full.jpg";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { PhotoUploadWithDelete } from "@/components/PhotoUploadWithDelete";

export default function ProfileNew() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { userId } = useParams();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const profileId = userId || user.id;
      const isOwn = !userId || userId === user.id;
      setIsOwnProfile(isOwn);

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", profileId)
        .single();

      if (error) throw error;
      setProfile(data);

      // Check if user is admin
      if (isOwn) {
        const { data: hasAdminRole, error: roleError } = await supabase.rpc("has_role", {
          _user_id: user.id,
          _role: "admin",
        });

        if (roleError) {
          console.error("Error checking admin role:", roleError);
        }

        setIsAdmin(!!hasAdminRole);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error(language === "el" ? "Σφάλμα φόρτωσης προφίλ" : "Error loading profile");
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

  const getChildrenText = () => {
    if (!profile?.children || !Array.isArray(profile.children) || profile.children.length === 0) {
      return "Χωρίς πληροφορίες παιδιών";
    }
    const childArray = profile.children as any[];
    return childArray.map((child: any, idx: number) => (
      <div key={idx} className="flex items-center gap-2">
        <span>{child.gender === 'boy' ? '👦' : child.gender === 'girl' ? '👧' : '👶'}</span>
        <span>{child.age || child.ageGroup}</span>
      </div>
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #F8E9EE, #F5E8F0)' }}>
        <div className="animate-spin text-4xl">🌸</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #F8E9EE, #F5E8F0)' }}>
        <Card className="p-8 rounded-[30px]">
          <p>Profile not found</p>
        </Card>
      </div>
    );
  }

  const profilePhotos = profile.profile_photos_urls || [];
  const primaryPhoto = profilePhotos[0] || profile.profile_photo_url;

  return (
    <div className="min-h-screen pt-24 pb-32 px-4" style={{ background: 'linear-gradient(135deg, #F8E9EE, #F5E8F0)' }}>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Welcome Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground" style={{ fontFamily: "'Pacifico', cursive" }}>
            Hi {profile.username || profile.full_name} 🌸
          </h1>
          <div className="mt-2 h-[1px] w-24 mx-auto bg-gradient-to-r from-transparent via-[#F3DCE5] to-transparent opacity-50" />
        </div>

        {/* Admin Panel Button - Prominent Position */}
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

        {/* Profile Photo Section - Cute & Elegant */}
        <Card className="p-8 bg-gradient-to-br from-white/80 to-[#FDF7F9] border-2 border-[#F3DCE5] rounded-[35px] shadow-lg hover:shadow-xl transition-all">
          <div className="flex flex-col items-center space-y-6">
            {/* Large Profile Photo */}
            <div className="relative">
              <div className="w-48 h-48 rounded-full border-4 border-[#F3DCE5] p-2 bg-gradient-to-br from-white to-[#FDF7F9] shadow-[0_8px_16px_rgba(243,220,229,0.3)]">
                <img
                  src={primaryPhoto || "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400"}
                  alt={profile.full_name}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
            </div>

            {isOwnProfile && (
              <PhotoUploadWithDelete 
                photos={profilePhotos}
                onPhotosUpdated={handlePhotoUpdate}
              />
            )}
          </div>
        </Card>

        {/* Basic Info Card - Powder Pink */}
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

            {/* Kids */}
            {profile.children && Array.isArray(profile.children) && profile.children.length > 0 && (
              <div className="flex items-start gap-3 pb-4 border-b border-[#F3DCE5]/40">
                <span className="text-lg">🍼</span>
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-foreground">Παιδιά:</p>
                  {getChildrenText()}
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

        {/* Interests & Tags - Soft Bubbles */}
        {profile.interests && profile.interests.length > 0 && (
          <Card className="p-6 bg-gradient-to-br from-white/90 to-[#FDF7F9] border-2 border-[#F3DCE5] rounded-[28px] shadow-md">
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <span>💬</span> Interests
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

        {/* Premium Perk Section - Elegant & Subtle */}
        {isOwnProfile && (
          <Card className="p-6 bg-gradient-to-br from-white/90 to-[#FCF0F5] border-2 border-[#F3DCE5] rounded-[28px] shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#F3DCE5]/20 rounded-full blur-3xl" />
            <div className="relative flex flex-col items-center text-center space-y-3">
              <Button
                disabled
                className="rounded-[30px] bg-gradient-to-r from-[#F3DCE5] to-[#F5E8F0] text-foreground border-2 border-[#F3DCE5] hover:shadow-lg transition-all opacity-60 cursor-not-allowed"
                size="lg"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Boost My Profile*
              </Button>
              <p className="text-xs text-muted-foreground">
                *Momster Perks — free for now, Premium later.
              </p>
            </div>
          </Card>
        )}

        {/* Settings / Edit Buttons - Capsule Style */}
        {isOwnProfile && (
          <div className="space-y-3">
            <div className="flex gap-3">
              <Button
                onClick={() => navigate("/profile-setup")}
                className="flex-1 rounded-[30px] bg-gradient-to-r from-[#C8788D] to-[#B86B80] hover:from-[#B86B80] hover:to-[#C8788D] text-white shadow-md hover:shadow-lg transition-all"
                size="lg"
              >
                <Settings className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
              <Button
                variant="outline"
                className="rounded-[30px] border-2 border-[#F3DCE5] hover:bg-[#FDF7F9] shadow-sm hover:shadow-md transition-all"
                size="lg"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Footer - Minimal & Elegant */}
      <footer className="fixed bottom-0 left-0 right-0 py-6 px-4 bg-[#F8E9EE]/95 backdrop-blur-md border-t border-[#F3DCE5]">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col items-center gap-3 text-center">
            {/* Logo in soft powder pink circular frame */}
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
