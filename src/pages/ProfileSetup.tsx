import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, X } from "lucide-react";
import { z } from "zod";

const profileSetupSchema = z.object({
  username: z.string().trim().min(3, { message: "Το username πρέπει να είναι τουλάχιστον 3 χαρακτήρες" }).max(20, { message: "Το username πρέπει να είναι μικρότερο από 20 χαρακτήρες" }).regex(/^[a-zA-Z0-9_]+$/, { message: "Το username μπορεί να περιέχει μόνο γράμματα, αριθμούς και _" }),
  city: z.string().trim().min(1, { message: "Η πόλη είναι υποχρεωτική" }).max(100, { message: "Η πόλη πρέπει να είναι μικρότερη από 100 χαρακτήρες" }),
  area: z.string().trim().min(1, { message: "Η περιοχή είναι υποχρεωτική" }).max(100, { message: "Η περιοχή πρέπει να είναι μικρότερη από 100 χαρακτήρες" }),
  children: z.array(z.object({
    name: z.string().max(50).optional(),
    ageGroup: z.string().min(1, { message: "Η ηλικία είναι υποχρεωτική" })
  })).min(1, { message: "Προσθέστε τουλάχιστον ένα παιδί" }),
  matchPreference: z.string().min(1, { message: "Η προτίμηση είναι υποχρεωτική" }),
  interests: z.array(z.string()).min(1, { message: "Επέλεξε τουλάχιστον ένα ενδιαφέρον" }).max(20, { message: "Μέγιστο 20 ενδιαφέροντα" })
});

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
  
  const [username, setUsername] = useState("");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [children, setChildren] = useState<Array<{ name?: string; ageGroup: string }>>([{ ageGroup: "" }]);
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
        setUsername(profile.username || "");
        setCity(profile.city || "");
        setArea(profile.area || "");
        const childrenData = profile.children as Array<{ name?: string; ageGroup: string }> || [];
        if (Array.isArray(childrenData) && childrenData.length > 0) {
          setChildren(childrenData);
        }
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

    // Validate inputs
    const validation = profileSetupSchema.safeParse({
      username,
      city,
      area,
      children,
      matchPreference,
      interests
    });

    if (!validation.success) {
      const firstError = validation.error.errors[0];
      toast.error(firstError.message);
      return;
    }

    setLoading(true);

    try {
      let photoUrl = profilePhotoPreview;

      // Upload photo if new one selected
      if (profilePhoto) {
        const fileExt = profilePhoto.name.split('.').pop();
        const fileName = `${userId}-${Date.now()}.${fileExt}`;
        const filePath = `${userId}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('profile-photos')
          .upload(filePath, profilePhoto, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('profile-photos')
          .getPublicUrl(filePath);

        photoUrl = publicUrl;
      }

      // Update profile
      const validData = validation.data;
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          username: validData.username,
          city: validData.city,
          area: validData.area,
          children: validData.children,
          child_age_group: validData.children[0]?.ageGroup || '',
          match_preference: validData.matchPreference,
          interests: validData.interests,
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
      <Card className="max-w-2xl mx-auto p-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-center mb-2 animate-scale-in">Συμπληρώστε το Προφίλ σας</h1>
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

          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username">Username *</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="π.χ. maria_mom"
              required
            />
            <p className="text-xs text-muted-foreground">
              3-20 χαρακτήρες, μόνο γράμματα, αριθμοί και _
            </p>
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

          {/* Children */}
          <div className="space-y-2">
            <Label>Παιδιά *</Label>
            <p className="text-sm text-muted-foreground mb-3">
              Προσθέστε τα παιδιά σας (το όνομα είναι προαιρετικό)
            </p>
            {children.map((child, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <Input
                  placeholder="Όνομα (προαιρετικό)"
                  value={child.name || ""}
                  onChange={(e) => {
                    const newChildren = [...children];
                    newChildren[index] = { ...newChildren[index], name: e.target.value };
                    setChildren(newChildren);
                  }}
                  className="flex-1"
                />
                <Select 
                  value={child.ageGroup} 
                  onValueChange={(value) => {
                    const newChildren = [...children];
                    newChildren[index] = { ...newChildren[index], ageGroup: value };
                    setChildren(newChildren);
                  }}
                  required
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Ηλικία" />
                  </SelectTrigger>
                  <SelectContent>
                    {CHILD_AGE_GROUPS.map(age => (
                      <SelectItem key={age} value={age}>{age}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {children.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setChildren(children.filter((_, i) => i !== index))}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setChildren([...children, { ageGroup: "" }])}
              className="w-full"
            >
              + Προσθήκη Παιδιού
            </Button>
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
