import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload } from "lucide-react";

const INTERESTS_OPTIONS = [
  "Ύπνος", "Καφέ", "Βόλτες", "Σινεμά", "Γυμναστική", 
  "Σειρές", "Παιχνίδι με τα παιδιά", "Μαγειρική", 
  "Ζαχαροπλαστική", "Εκδρομές", "Πεζοπορία", "Σκι", 
  "Κολυμβητήριο", "Μπουζούκια", "Ανάγνωση", "DIY Projects"
];

const GREEK_CITIES = [
  "Αθήνα", "Θεσσαλονίκη", "Πάτρα", "Ηράκλειο", "Λάρισα",
  "Βόλος", "Ιωάννινα", "Χανιά", "Ρόδος", "Καβάλα", "Άλλη"
];

const CHILD_AGE_GROUPS = [
  "Είμαι έγκυος 🤰",
  "0-6 μήνες",
  "6-12 μήνες",
  "1-2 χρόνια",
  "2-3 χρόνια",
  "3-5 χρόνια",
  "5+ χρόνια"
];

const MATCH_PREFERENCES = [
  "Μόνο κοντινές μαμάδες",
  "Από όλη την Ελλάδα"
];

export default function ProfileSetup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [childAgeGroup, setChildAgeGroup] = useState("");
  const [matchPreference, setMatchPreference] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string>("");

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUserId(session.user.id);

      // Load existing profile data if any
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profile?.profile_completed) {
        navigate("/discover");
        return;
      }

      if (profile) {
        setCity(profile.city || "");
        setArea(profile.area || "");
        setChildAgeGroup(profile.child_age_group || "");
        setMatchPreference(profile.match_preference || "");
        setInterests(profile.interests || []);
        setProfilePhotoPreview(profile.profile_photo_url || "");
      }
    };
    checkAuth();
  }, [navigate]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleInterest = (interest: string) => {
    setInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) return;

    if (!profilePhoto && !profilePhotoPreview) {
      toast.error("Παρακαλώ προσθέστε φωτογραφία προφίλ");
      return;
    }

    setLoading(true);

    try {
      let photoUrl = profilePhotoPreview;

      // Upload photo if new one selected
      if (profilePhoto) {
        const fileExt = profilePhoto.name.split('.').pop();
        const fileName = `${userId}-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('profile-photos')
          .upload(fileName, profilePhoto, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('profile-photos')
          .getPublicUrl(fileName);

        photoUrl = publicUrl;
      }

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          city,
          area,
          child_age_group: childAgeGroup,
          match_preference: matchPreference,
          interests,
          profile_photo_url: photoUrl,
          profile_completed: true
        })
        .eq('id', userId);

      if (updateError) throw updateError;

      toast.success("Το προφίλ σας ολοκληρώθηκε!");
      navigate("/discover");
    } catch (error: any) {
      toast.error(error.message || "Σφάλμα κατά την ενημέρωση του προφίλ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 p-4 py-12">
      <Card className="max-w-2xl mx-auto p-8">
        <h1 className="text-3xl font-bold text-center mb-2">Συμπληρώστε το Προφίλ σας</h1>
        <p className="text-center text-muted-foreground mb-8">
          Αυτά τα στοιχεία θα μας βοηθήσουν να σας συνδέσουμε με τις κατάλληλες μαμάδες
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Photo */}
          <div className="space-y-2">
            <Label>Φωτογραφία Προφίλ *</Label>
            <div className="flex items-center gap-4">
              {profilePhotoPreview && (
                <img 
                  src={profilePhotoPreview} 
                  alt="Preview" 
                  className="w-24 h-24 rounded-full object-cover"
                />
              )}
              <div className="flex-1">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                  id="photo-upload"
                />
                <Label 
                  htmlFor="photo-upload"
                  className="flex items-center justify-center gap-2 px-4 py-2 border rounded-md cursor-pointer hover:bg-accent"
                >
                  <Upload className="w-4 h-4" />
                  Επιλέξτε Φωτογραφία
                </Label>
              </div>
            </div>
          </div>

          {/* City */}
          <div className="space-y-2">
            <Label htmlFor="city">Πόλη *</Label>
            <Select value={city} onValueChange={setCity} required>
              <SelectTrigger>
                <SelectValue placeholder="Επιλέξτε πόλη" />
              </SelectTrigger>
              <SelectContent>
                {GREEK_CITIES.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Area */}
          <div className="space-y-2">
            <Label htmlFor="area">Περιοχή *</Label>
            <Input
              id="area"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="π.χ. Κολωνάκι, Καλαμαριά"
              required
            />
          </div>

          {/* Child Age Group */}
          <div className="space-y-2">
            <Label htmlFor="child-age">Ηλικία Παιδιών *</Label>
            <Select value={childAgeGroup} onValueChange={setChildAgeGroup} required>
              <SelectTrigger>
                <SelectValue placeholder="Επιλέξτε ηλικιακή ομάδα" />
              </SelectTrigger>
              <SelectContent>
                {CHILD_AGE_GROUPS.map(age => (
                  <SelectItem key={age} value={age}>{age}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Match Preference */}
          <div className="space-y-2">
            <Label htmlFor="match-pref">Προτίμηση Σύνδεσης *</Label>
            <Select value={matchPreference} onValueChange={setMatchPreference} required>
              <SelectTrigger>
                <SelectValue placeholder="Επιλέξτε προτίμηση" />
              </SelectTrigger>
              <SelectContent>
                {MATCH_PREFERENCES.map(pref => (
                  <SelectItem key={pref} value={pref}>{pref}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Interests */}
          <div className="space-y-2">
            <Label>Ενδιαφέροντα</Label>
            <p className="text-sm text-muted-foreground mb-3">
              Επιλέξτε τα ενδιαφέροντά σας για καλύτερα matches
            </p>
            <div className="flex flex-wrap gap-2">
              {INTERESTS_OPTIONS.map(interest => (
                <Button
                  key={interest}
                  type="button"
                  variant={interests.includes(interest) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleInterest(interest)}
                >
                  {interest}
                </Button>
              ))}
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            size="lg"
            disabled={loading}
          >
            {loading ? "Αποθήκευση..." : "Ολοκλήρωση Προφίλ"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
