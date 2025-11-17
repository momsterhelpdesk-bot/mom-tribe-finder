import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Settings, MapPin, Calendar, MessageCircle, LogOut, Edit, Mail, Heart, ChevronLeft, ChevronRight } from "lucide-react";
import mascot from "@/assets/mascot.jpg";
import MomsterMascot from "@/components/MomsterMascot";
import { useMascot } from "@/hooks/use-mascot";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

const INTERESTS = [
  { id: "cooking", label: { el: "🍳 Μαγειρική / Ζαχαροπλαστική", en: "🍳 Cooking / Baking" } },
  { id: "healthy_eating", label: { el: "🥗 Υγιεινή Διατροφή / Vegan / Organic", en: "🥗 Healthy Eating / Vegan / Organic" } },
  { id: "yoga", label: { el: "🧘 Yoga / Pilates / Fitness", en: "🧘 Yoga / Pilates / Fitness" } },
  { id: "books", label: { el: "📖 Βιβλία / Ανάγνωση", en: "📖 Books / Reading" } },
  { id: "movies", label: { el: "🎬 Ταινίες / Σειρές", en: "🎬 Movies / Series" } },
  { id: "coffee", label: { el: "☕ Καφέ / Brunch", en: "☕ Coffee / Brunch" } },
  { id: "diy", label: { el: "✂️ DIY / Χειροτεχνίες", en: "✂️ DIY / Crafts" } },
  { id: "photography", label: { el: "📸 Φωτογραφία", en: "📸 Photography" } },
  { id: "eco", label: { el: "🌱 Οικολογία / Sustainability", en: "🌱 Eco / Sustainability" } },
  { id: "travel", label: { el: "🏞️ Εκδρομές / Ταξίδια", en: "🏞️ Travel / Trips" } },
  { id: "wine", label: { el: "🍷 Wine Lover", en: "🍷 Wine Lover" } },
  { id: "music", label: { el: "🎶 Μουσική", en: "🎶 Music" } },
  { id: "couch", label: { el: "😅 Coach Potato", en: "😅 Coach Potato" } },
  { id: "party", label: { el: "🎉 Party Animal", en: "🎉 Party Animal" } },
  { id: "social", label: { el: "🦋 Social Butterfly", en: "🦋 Social Butterfly" } },
];

export default function Profile() {
  const { mascotConfig, visible, hideMascot } = useMascot();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  
  // Edit form states
  const [editForm, setEditForm] = useState({
    full_name: "",
    bio: "",
    date_of_birth: "",
    marital_status: "",
    city: "",
    area: "",
  });

  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    push: true,
    matches: true,
    messages: true,
  });
  const [privacySettings, setPrivacySettings] = useState({
    discovery_visible: true,
    show_last_active: true,
  });
  const [childrenInput, setChildrenInput] = useState("");

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

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      setProfile(data);
      setEditForm({
        full_name: data.full_name || "",
        bio: data.bio || "",
        date_of_birth: data.date_of_birth || "",
        marital_status: data.marital_status || "",
        city: data.city || "",
        area: data.area || "",
      });
      setSelectedInterests(data.interests || []);
      
      const notifSettings = typeof data.notification_settings === 'object' && data.notification_settings !== null
        ? data.notification_settings as any
        : { email: true, push: true, matches: true, messages: true };
      setNotificationSettings(notifSettings);
      
      const privSettings = typeof data.privacy_settings === 'object' && data.privacy_settings !== null
        ? data.privacy_settings as any
        : { discovery_visible: true, show_last_active: true };
      setPrivacySettings(privSettings);

      const childrenInit = Array.isArray(data.children) ? data.children : [];
      setChildrenInput(childrenInit.map((c: any) => String(c.age)).join(", "));

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

  // Helpers
  const toISODate = (input: string): string | null => {
    if (!input) return null;
    const s = input.trim();
    // Normalize separators
    const norm = s.replace(/[.]/g, '/').replace(/\s+/g, '/');
    // Patterns: DD/MM/YYYY or DD-MM-YYYY or YYYY-MM-DD
    const ddmmyyyy = /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/;
    const yyyymmdd = /^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/;
    let y = 0, m = 0, d = 0;
    if (ddmmyyyy.test(norm)) {
      const [, dd, mm, yyyy] = norm.match(ddmmyyyy)!;
      d = parseInt(dd, 10); m = parseInt(mm, 10); y = parseInt(yyyy, 10);
    } else if (yyyymmdd.test(norm)) {
      const [, yyyy, mm, dd] = norm.match(yyyymmdd)!;
      y = parseInt(yyyy, 10); m = parseInt(mm, 10); d = parseInt(dd, 10);
    } else {
      return null;
    }
    // Basic validation
    if (y < 1900 || y > 2100 || m < 1 || m > 12 || d < 1 || d > 31) return null;
    const iso = `${y.toString().padStart(4,'0')}-${m.toString().padStart(2,'0')}-${d.toString().padStart(2,'0')}`;
    return iso;
  };

  const parseChildrenAges = (text: string) => {
    if (!text) return [] as any[];
    const parts = text.split(/[;,·]/).map(t => t.trim()).filter(Boolean).slice(0, 10);
    return parts.map((token) => {
      const cleaned = token.replace(/[<>]/g, '').slice(0, 20);
      const lower = cleaned.toLowerCase();
      const numMatch = lower.match(/\d{1,3}/);
      if (lower.includes('μην')) {
        // months in Greek
        return { age: `${numMatch ? parseInt(numMatch[0], 10) : cleaned} μηνών` };
      }
      if (/\b(m|mo|month|months)\b/.test(lower)) {
        return { age: `${numMatch ? parseInt(numMatch[0], 10) : cleaned} months` };
      }
      // years (number only or text)
      return { age: numMatch ? parseInt(numMatch[0], 10) : cleaned };
    });
  };

  const handleSaveProfile = async () => {
    try {
      const dobISO = editForm.date_of_birth ? toISODate(editForm.date_of_birth) : null;
      if (editForm.date_of_birth && !dobISO) {
        toast.error(language === "el" ? "Μη έγκυρη ημερομηνία. Παράδειγμα: 23/05/1987" : "Invalid date. Example: 1987-05-23");
        return;
      }

      const childrenParsed = parseChildrenAges(childrenInput);

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: editForm.full_name,
          bio: editForm.bio,
          date_of_birth: dobISO,
          marital_status: editForm.marital_status || null,
          city: editForm.city,
          area: editForm.area,
          interests: selectedInterests,
          children: childrenParsed,
        })
        .eq("id", profile.id);

      if (error) throw error;

      toast.success(language === "el" ? "Το προφίλ ενημερώθηκε" : "Profile updated");
      setEditDialogOpen(false);
      fetchProfile();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(language === "el" ? "Σφάλμα ενημέρωσης προφίλ" : "Error updating profile");
    }
  };

  const handleSaveSettings = async () => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          notification_settings: notificationSettings,
          privacy_settings: privacySettings,
        })
        .eq("id", profile.id);

      if (error) throw error;

      toast.success(language === "el" ? "Οι ρυθμίσεις αποθηκεύτηκαν" : "Settings saved");
      setSettingsDialogOpen(false);
      fetchProfile();
    } catch (error) {
      console.error("Error updating settings:", error);
      toast.error(language === "el" ? "Σφάλμα αποθήκευσης ρυθμίσεων" : "Error saving settings");
    }
  };

  const toggleInterest = (interestId: string) => {
    setSelectedInterests(prev =>
      prev.includes(interestId)
        ? prev.filter(id => id !== interestId)
        : [...prev, interestId]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">{language === "el" ? "Φόρτωση..." : "Loading..."}</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">{language === "el" ? "Δεν βρέθηκε προφίλ" : "Profile not found"}</div>
      </div>
    );
  }

  const profilePhotos = profile.profile_photos_urls && profile.profile_photos_urls.length > 0
    ? profile.profile_photos_urls
    : profile.profile_photo_url
    ? [profile.profile_photo_url]
    : [];

  const childrenArray = Array.isArray(profile.children) ? profile.children : [];
  const childAges = childrenArray.map((child: any) => child.age).join(", ");

  const maritalStatusText = {
    married: language === "el" ? "Παντρεμένη" : "Married",
    single_parent: language === "el" ? "Μονογονέας" : "Single Parent",
    other: language === "el" ? "Άλλο" : "Other",
  };

  const maritalStatus = profile.marital_status
    ? maritalStatusText[profile.marital_status as keyof typeof maritalStatusText]
    : "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 relative">
      <img 
        src={mascot} 
        alt="Momster Mascot" 
        className="fixed top-24 right-4 w-20 h-20 opacity-30 object-contain pointer-events-none animate-bounce"
      />
      
      <div className="max-w-2xl mx-auto pt-20 pb-24 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Pacifico', cursive" }}>
            {language === "el" ? "Προφίλ" : "Profile"}
          </h1>
        </div>

        {/* Profile Header Card */}
        <Card className="p-6 mb-6">
          {/* Photo Carousel with Floral Frame */}
          <div className="flex flex-col items-center mb-6">
            {profilePhotos.length > 1 ? (
              <Carousel className="w-full max-w-xs mb-4">
                <CarouselContent>
                  {profilePhotos.map((photo: string, index: number) => (
                    <CarouselItem key={index}>
                      <div className="flex justify-center">
                        <div className="relative">
                          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-pink-300/40 via-purple-300/40 to-pink-300/40 blur-xl animate-pulse" />
                          <Avatar className="w-32 h-32 border-4 border-primary/30 shadow-lg relative z-10" style={{
                            boxShadow: '0 0 0 3px white, 0 0 0 6px rgba(219, 39, 119, 0.2), 0 0 20px rgba(219, 39, 119, 0.3)'
                          }}>
                            <AvatarImage src={photo} alt={`${profile.full_name} ${index + 1}`} />
                            <AvatarFallback>{profile.full_name?.[0]}</AvatarFallback>
                          </Avatar>
                          <div className="absolute -top-2 -right-2 text-3xl animate-bounce">🌸</div>
                          <div className="absolute -bottom-2 -left-2 text-2xl animate-pulse">🌺</div>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
              </Carousel>
            ) : (
              <div className="relative mb-4">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-pink-300/40 via-purple-300/40 to-pink-300/40 blur-xl animate-pulse" />
                <Avatar className="w-32 h-32 border-4 border-primary/30 shadow-lg relative z-10" style={{
                  boxShadow: '0 0 0 3px white, 0 0 0 6px rgba(219, 39, 119, 0.2), 0 0 20px rgba(219, 39, 119, 0.3)'
                }}>
                  <AvatarImage src={profilePhotos[0]} alt={profile.full_name} />
                  <AvatarFallback>{profile.full_name?.[0]}</AvatarFallback>
                </Avatar>
                <div className="absolute -top-2 -right-2 text-3xl animate-bounce">🌸</div>
                <div className="absolute -bottom-2 -left-2 text-2xl animate-pulse">🌺</div>
              </div>
            )}

            <h2 className="text-2xl font-bold text-foreground text-center">
              {profile.full_name}
            </h2>
            
            {childAges && (
              <p className="text-muted-foreground text-sm mt-1">
                {language === "el" ? "Παιδιά: " : "Kids: "}{childAges}
              </p>
            )}
            
            {maritalStatus && (
              <Badge variant="secondary" className="mt-2">
                {maritalStatus}
              </Badge>
            )}

            {/* Badges Section */}
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              <Badge variant="default" className="bg-gradient-to-r from-pink-500 to-purple-500 text-white border-0 shadow-md">
                ✨ Newbie
              </Badge>
            </div>

            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="mt-4" size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  {language === "el" ? "Επεξεργασία Προφίλ" : "Edit Profile"}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{language === "el" ? "Επεξεργασία Προφίλ" : "Edit Profile"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">{language === "el" ? "Όνομα" : "Name"}</Label>
                    <Input
                      id="full_name"
                      value={editForm.full_name}
                      onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">{language === "el" ? "Βιογραφικό" : "Bio"}</Label>
                    <Textarea
                      id="bio"
                      value={editForm.bio}
                      onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                      placeholder={language === "el" ? "Πες μας λίγα λόγια για εσένα..." : "Tell us a bit about yourself..."}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date_of_birth">{language === "el" ? "Ημερομηνία Γέννησης" : "Date of Birth"}</Label>
                    <Input
                      id="date_of_birth"
                      type="text"
                      placeholder={language === "el" ? "π.χ. 23/05/1987 ή 1987-05-23" : "e.g. 23/05/1987 or 1987-05-23"}
                      value={editForm.date_of_birth}
                      onChange={(e) => setEditForm({ ...editForm, date_of_birth: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">
                      {language === "el" ? "Μπορείς να γράψεις την ημερομηνία ελεύθερα (DD/MM/YYYY)." : "You can type the date freely (DD/MM/YYYY)."}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="marital_status">{language === "el" ? "Οικογενειακή Κατάσταση" : "Marital Status"}</Label>
                    <Select
                      value={editForm.marital_status}
                      onValueChange={(value) => setEditForm({ ...editForm, marital_status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={language === "el" ? "Επιλέξτε..." : "Select..."} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="married">{language === "el" ? "Παντρεμένη" : "Married"}</SelectItem>
                        <SelectItem value="single_parent">{language === "el" ? "Μονογονέας" : "Single Parent"}</SelectItem>
                        <SelectItem value="other">{language === "el" ? "Άλλο" : "Other"}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">{language === "el" ? "Πόλη" : "City"}</Label>
                    <Input
                      id="city"
                      value={editForm.city}
                      onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="area">{language === "el" ? "Περιοχή" : "Area"}</Label>
                    <Input
                      id="area"
                      value={editForm.area}
                      onChange={(e) => setEditForm({ ...editForm, area: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="children_ages">{language === "el" ? "Ηλικίες Παιδιών" : "Children's Ages"}</Label>
                    <Input
                      id="children_ages"
                      placeholder={language === "el" ? "π.χ. 6 μηνών, 3, 8" : "e.g. 6 months, 3, 8"}
                      value={childrenInput}
                      onChange={(e) => setChildrenInput(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      {language === "el" ? "Χώρισε με κόμματα. Δεκτό και 'μηνών' (π.χ. 6 μηνών)." : "Separate with commas. 'months' also accepted (e.g. 6 months)."}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Label>{language === "el" ? "Ενδιαφέροντα" : "Interests"}</Label>
                    <div className="grid grid-cols-1 gap-3">
                      {INTERESTS.map((interest) => (
                        <div key={interest.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={interest.id}
                            checked={selectedInterests.includes(interest.id)}
                            onCheckedChange={() => toggleInterest(interest.id)}
                          />
                          <Label htmlFor={interest.id} className="cursor-pointer">
                            {interest.label[language as 'el' | 'en']}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button onClick={handleSaveProfile} className="w-full">
                    {language === "el" ? "Αποθήκευση" : "Save"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Basic Info */}
          <div className="space-y-3 border-t border-border pt-4">
            {(profile.city || profile.area) && (
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">
                  {[profile.city, profile.area].filter(Boolean).join(", ")}
                </span>
              </div>
            )}

            {profile.date_of_birth && (
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">
                  {new Date(profile.date_of_birth).toLocaleDateString(language === "el" ? "el-GR" : "en-US")}
                </span>
              </div>
            )}

            {profile.bio && (
              <div className="pt-2">
                <p className="text-sm text-muted-foreground italic">"{profile.bio}"</p>
              </div>
            )}
          </div>
        </Card>

        {/* Interests Card */}
        {profile.interests && profile.interests.length > 0 && (
          <Card className="p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">
                {language === "el" ? "Ενδιαφέροντα" : "Interests"}
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((interestId: string) => {
                const interest = INTERESTS.find(i => i.id === interestId);
                return interest ? (
                  <Badge key={interestId} variant="secondary">
                    {interest.label[language as 'el' | 'en']}
                  </Badge>
                ) : null;
              })}
            </div>
          </Card>
        )}

        {/* Settings Card */}
        <Card className="p-6 mb-6">
          <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full justify-start" size="lg">
                <Settings className="w-5 h-5 mr-3" />
                {language === "el" ? "Ρυθμίσεις" : "Settings"}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{language === "el" ? "Ρυθμίσεις" : "Settings"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-4">
                {/* Notifications */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm">
                    {language === "el" ? "Ειδοποιήσεις" : "Notifications"}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="notif-email" className="text-sm">
                        {language === "el" ? "Email" : "Email"}
                      </Label>
                      <Switch
                        id="notif-email"
                        checked={notificationSettings.email}
                        onCheckedChange={(checked) =>
                          setNotificationSettings({ ...notificationSettings, email: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="notif-push" className="text-sm">
                        {language === "el" ? "Push Notifications" : "Push Notifications"}
                      </Label>
                      <Switch
                        id="notif-push"
                        checked={notificationSettings.push}
                        onCheckedChange={(checked) =>
                          setNotificationSettings({ ...notificationSettings, push: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="notif-matches" className="text-sm">
                        {language === "el" ? "Νέα Matches" : "New Matches"}
                      </Label>
                      <Switch
                        id="notif-matches"
                        checked={notificationSettings.matches}
                        onCheckedChange={(checked) =>
                          setNotificationSettings({ ...notificationSettings, matches: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="notif-messages" className="text-sm">
                        {language === "el" ? "Μηνύματα" : "Messages"}
                      </Label>
                      <Switch
                        id="notif-messages"
                        checked={notificationSettings.messages}
                        onCheckedChange={(checked) =>
                          setNotificationSettings({ ...notificationSettings, messages: checked })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Privacy */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm">
                    {language === "el" ? "Απόρρητο" : "Privacy"}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="privacy-discovery" className="text-sm">
                        {language === "el" ? "Ορατότητα στο Discovery" : "Visible in Discovery"}
                      </Label>
                      <Switch
                        id="privacy-discovery"
                        checked={privacySettings.discovery_visible}
                        onCheckedChange={(checked) =>
                          setPrivacySettings({ ...privacySettings, discovery_visible: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="privacy-active" className="text-sm">
                        {language === "el" ? "Εμφάνιση Τελευταίας Δραστηριότητας" : "Show Last Active"}
                      </Label>
                      <Switch
                        id="privacy-active"
                        checked={privacySettings.show_last_active}
                        onCheckedChange={(checked) =>
                          setPrivacySettings({ ...privacySettings, show_last_active: checked })
                        }
                      />
                    </div>
                  </div>
                </div>

                <Button onClick={handleSaveSettings} className="w-full">
                  {language === "el" ? "Αποθήκευση Ρυθμίσεων" : "Save Settings"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </Card>

        {/* Logout */}
        <Button variant="destructive" className="w-full" size="lg" onClick={handleSignOut}>
          <LogOut className="w-5 h-5 mr-3" />
          {language === "el" ? "Αποσύνδεση" : "Sign Out"}
        </Button>
      </div>

      {/* Footer with quick actions */}
      <footer className="fixed bottom-20 left-0 right-0 py-3 px-4 bg-background/80 backdrop-blur-md border-t border-border">
        <div className="max-w-2xl mx-auto flex items-center justify-center gap-2">
          <img src={mascot} alt="Momster Mascot" className="w-8 h-8 object-contain animate-bounce" />
          <span className="text-sm text-muted-foreground">
            {language === "el" ? "Μαζί, οι μαμάδες ανθίζουν!" : "Together, moms thrive!"}
          </span>
        </div>
      </footer>

      {mascotConfig && (
        <MomsterMascot
          state={mascotConfig.state}
          message={mascotConfig.message}
          visible={visible}
          showButton={mascotConfig.showButton}
          buttonText={mascotConfig.buttonText}
          onButtonClick={mascotConfig.onButtonClick}
          duration={mascotConfig.duration}
          onHide={hideMascot}
        />
      )}
    </div>
  );
}
