import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, X, AlertCircle } from "lucide-react";
import { z } from "zod";
import { Alert, AlertDescription } from "@/components/ui/alert";

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

const MAX_PHOTOS = 6;

type PhotoItem = {
  file?: File;
  preview: string;
  url?: string;
};

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
  const [photos, setPhotos] = useState<PhotoItem[]>([]);

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
        setChildren((profile.children as Array<{ name?: string; ageGroup: string }>) || [{ ageGroup: "" }]);
        setMatchPreference(profile.match_preference || "");
        setInterests(profile.interests || []);
        
        // Load existing photos
        if (profile.profile_photos_urls && profile.profile_photos_urls.length > 0) {
          setPhotos(profile.profile_photos_urls.map((url: string) => ({
            url,
            preview: url
          })));
        }
      }
    };
    checkAuth();
  }, [navigate]);

  const handlePhotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (photos.length + files.length > MAX_PHOTOS) {
      toast.error(`Μπορείς να ανεβάσεις μέχρι ${MAX_PHOTOS} φωτογραφίες`);
      return;
    }

    const newPhotos: PhotoItem[] = files.map(file => {
      const preview = URL.createObjectURL(file);
      return { file, preview };
    });

    setPhotos(prev => [...prev, ...newPhotos]);
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => {
      const newPhotos = [...prev];
      // Revoke object URL to prevent memory leaks
      if (newPhotos[index].preview.startsWith('blob:')) {
        URL.revokeObjectURL(newPhotos[index].preview);
      }
      newPhotos.splice(index, 1);
      return newPhotos;
    });
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

    if (photos.length === 0) {
      toast.error("Πρέπει να ανεβάσεις τουλάχιστον 1 φωτογραφία");
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
      const photoUrls: string[] = [];

      // Upload new photos
      for (const photo of photos) {
        if (photo.url) {
          // Existing photo, keep the URL
          photoUrls.push(photo.url);
        } else if (photo.file) {
          // New photo, upload it
          const fileExt = photo.file.name.split('.').pop();
          const fileName = `${userId}-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          const filePath = `${userId}/${fileName}`;
          
          const { error: uploadError } = await supabase.storage
            .from('profile-photos')
            .upload(filePath, photo.file, { upsert: true });

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('profile-photos')
            .getPublicUrl(filePath);

          photoUrls.push(publicUrl);
        }
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
          profile_photo_url: photoUrls[0], // Keep first photo as main
          profile_photos_urls: photoUrls,
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
          Ας γνωριστούμε καλύτερα! 💕
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photos Section */}
          <div className="space-y-3">
            <Label>Φωτογραφίες Προφίλ *</Label>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                📸 <strong>Σημαντικό:</strong> Ανέβασε 1-{MAX_PHOTOS} φωτογραφίες όπου φαίνεται το πρόσωπό σου. 
                <br />❌ Όχι τοπία, όχι παιδιά στις φωτογραφίες.
                <br />✅ Μόνο εσύ!
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-3 gap-3">
              {photos.map((photo, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-secondary/20">
                  <img
                    src={photo.preview}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  {index === 0 && (
                    <div className="absolute bottom-1 left-1 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                      Κύρια
                    </div>
                  )}
                </div>
              ))}

              {photos.length < MAX_PHOTOS && (
                <label className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary cursor-pointer flex flex-col items-center justify-center gap-2 transition-colors bg-secondary/10">
                  <Upload className="w-8 h-8 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground text-center px-2">
                    Προσθήκη<br />φωτογραφίας
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotosChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {photos.length === 0 && (
              <p className="text-xs text-muted-foreground">
                * Τουλάχιστον 1 φωτογραφία είναι υποχρεωτική
              </p>
            )}
          </div>

          {/* Username */}
          <div>
            <Label htmlFor="username">Username *</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="π.χ. maria_mom"
              maxLength={20}
            />
          </div>

          {/* City and Area */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">Πόλη *</Label>
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger>
                  <SelectValue placeholder="Επέλεξε πόλη" />
                </SelectTrigger>
                <SelectContent>
                  {GREEK_CITIES.map(cityName => (
                    <SelectItem key={cityName} value={cityName}>
                      {cityName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="area">Περιοχή *</Label>
              <Input
                id="area"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="π.χ. Κολωνάκι"
                maxLength={100}
              />
            </div>
          </div>

          {/* Children */}
          <div className="space-y-3">
            <Label>Παιδιά *</Label>
            {children.map((child, index) => (
              <div key={index} className="flex gap-3">
                <Input
                  placeholder="Όνομα (προαιρετικό)"
                  value={child.name || ""}
                  onChange={(e) => {
                    const newChildren = [...children];
                    newChildren[index].name = e.target.value;
                    setChildren(newChildren);
                  }}
                  maxLength={50}
                />
                <Select
                  value={child.ageGroup}
                  onValueChange={(value) => {
                    const newChildren = [...children];
                    newChildren[index].ageGroup = value;
                    setChildren(newChildren);
                  }}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Ηλικία" />
                  </SelectTrigger>
                  <SelectContent>
                    {CHILD_AGE_GROUPS.map(age => (
                      <SelectItem key={age} value={age}>
                        {age}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {children.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setChildren(children.filter((_, i) => i !== index));
                    }}
                  >
                    <X className="w-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            
            <Button
              type="button"
              variant="outline"
              onClick={() => setChildren([...children, { ageGroup: "" }])}
              className="w-full"
            >
              + Προσθήκη Παιδιού
            </Button>
          </div>

          {/* Match Preference */}
          <div>
            <Label>Προτίμηση Match *</Label>
            <Select value={matchPreference} onValueChange={setMatchPreference}>
              <SelectTrigger>
                <SelectValue placeholder="Επέλεξε προτίμηση" />
              </SelectTrigger>
              <SelectContent>
                {MATCH_PREFERENCES.map(pref => (
                  <SelectItem key={pref} value={pref}>
                    {pref}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Interests */}
          <div className="space-y-3">
            <Label>Ενδιαφέροντα * (επέλεξε τουλάχιστον 1)</Label>
            <div className="flex flex-wrap gap-2">
              {INTERESTS_OPTIONS.map(interest => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={`px-4 py-2 rounded-full text-sm transition-colors ${
                    interests.includes(interest)
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {interest}
                </button>
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
