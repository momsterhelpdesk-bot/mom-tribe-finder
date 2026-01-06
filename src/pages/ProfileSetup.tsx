import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, X, AlertCircle, Plus, Trash2 } from "lucide-react";
import { z } from "zod";
import { Alert, AlertDescription } from "@/components/ui/alert";
// Location permission is now only requested in Discover page
import { INTERESTS } from "@/lib/interests";
import { useLanguage } from "@/contexts/LanguageContext";
import ProfileSuccessScreen from "@/components/ProfileSuccessScreen";
import ChildAgeSelector from "@/components/ChildAgeSelector";
import { ALL_AGE_OPTIONS } from "@/lib/childAges";
const profileSetupSchema = z.object({
  username: z.string().trim().min(3, { message: "Το username πρέπει να είναι τουλάχιστον 3 χαρακτήρες" }).max(20, { message: "Το username πρέπει να είναι μικρότερο από 20 χαρακτήρες" }).regex(/^[a-zA-Z0-9_]+$/, { message: "Το username μπορεί να περιέχει μόνο γράμματα, αριθμούς και _" }),
  city: z.string().trim().min(1, { message: "Η πόλη είναι υποχρεωτική" }).max(100, { message: "Η πόλη πρέπει να είναι μικρότερη από 100 χαρακτήρες" }),
  area: z.string().trim().min(1, { message: "Η περιοχή είναι υποχρεωτική" }).max(100, { message: "Η περιοχή πρέπει να είναι μικρότερη από 100 χαρακτήρες" }),
  children: z.array(z.object({
    name: z.string().max(50).optional(),
    ageGroup: z.string().min(1, { message: "Η ηλικία είναι υποχρεωτική" }),
    gender: z.enum(['boy', 'girl', 'baby']).optional()
  })).min(1, { message: "Προσθέστε τουλάχιστον ένα παιδί" }),
  matchPreference: z.string().min(1, { message: "Η προτίμηση είναι υποχρεωτική" }),
  interests: z.array(z.string()).min(1, { message: "Επέλεξε τουλάχιστον ένα ενδιαφέρον" }).max(20, { message: "Μέγιστο 20 ενδιαφέροντα" })
});


const GREEK_CITIES = [
  "Αθήνα", "Θεσσαλονίκη", "Πάτρα", "Ηράκλειο", "Λάρισα",
  "Βόλος", "Ιωάννινα", "Χανιά", "Ρόδος", "Καβάλα", "Άλλη"
];

const ATHENS_AREAS = [
  // Κέντρο & Βόρεια Προάστια
  'Κολωνάκι', 'Παγκράτι', 'Εξάρχεια', 'Κουκάκι', 'Πλάκα',
  'Κηφισιά', 'Χαλάνδρι', 'Μαρούσι', 'Αγία Παρασκευή', 'Βριλήσσια',
  'Ψυχικό', 'Φιλοθέη', 'Πεύκη', 'Μελίσσια', 'Νέα Ερυθραία',
  'Πεντέλη', 'Εκάλη', 'Λυκόβρυση', 'Νέο Ηράκλειο', 'Μεταμόρφωση',
  // Νότια Προάστια
  'Γλυφάδα', 'Βούλα', 'Βουλιαγμένη', 'Βάρη', 'Ηλιούπολη',
  'Αργυρούπολη', 'Άλιμος', 'Παλαιό Φάληρο', 'Νέα Σμύρνη', 'Καλλιθέα',
  // Κέντρο & Δυτικά
  'Αμπελόκηποι', 'Ζωγράφου', 'Γαλάτσι', 'Κυψέλη', 'Πατήσια',
  'Περιστέρι', 'Αιγάλεω', 'Χαϊδάρι', 'Πετρούπολη', 'Ίλιον',
  'Νέα Φιλαδέλφεια', 'Νέα Χαλκηδόνα', 'Νέα Ιωνία', 'Κερατσίνι',
  // Ανατολικά
  'Παιανία', 'Γέρακας', 'Γλυκά Νερά', 'Παλλήνη', 'Σπάτα',
  'Άλλη'
];

const THESSALONIKI_AREAS = [
  // Κέντρο & Ανατολικά
  'Κέντρο', 'Νέα Παραλία', 'Λαδάδικα', 'Άνω Πόλη', 'Ροτόντα',
  'Καλαμαριά', 'Χαριλάου', 'Τούμπα', 'Τριανδρία', 'Ντεπώ',
  'Πυλαία', 'Θέρμη', 'Πανόραμα', 'Φοίνικας', 'Καραμπουρνάκι',
  // Δυτικά
  'Εύοσμος', 'Κορδελιό', 'Αμπελόκηποι', 'Μενεμένη', 'Σταυρούπολη',
  'Πολίχνη', 'Νεάπολη', 'Συκιές', 'Ελευθέριο-Κορδελιό',
  // Ανατολικά / Περίχωρα
  'Καλαμαρία-Αρετσού', 'Κρήνη', 'Νέα Κρήνη', 'Περαία', 'Νέοι Επιβάτες',
  'Μηχανιώνα', 'Ωραιόκαστρο', 'Ευκαρπία', 'Σίνδος', 'Διαβατά',
  // Άλλες
  'Αγία Τριάδα', 'Νέα Μηχανιώνα', 'Επανομή', 'Χαλκηδόνα', 'Άλλη'
];

// CHILD_AGE_GROUPS is now imported from src/lib/childAges.ts

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
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  const [username, setUsername] = useState("");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [availableAreas, setAvailableAreas] = useState<string[]>([]);
  const [children, setChildren] = useState<Array<{ name?: string; ageGroup: string; gender?: 'boy' | 'girl' | 'baby' }>>([{ ageGroup: "", gender: 'baby' }]);
  const [activeChildIndex, setActiveChildIndex] = useState(0);
  const [matchPreference, setMatchPreference] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  // Location coordinates are no longer collected during profile setup
  // They will be requested in Discover page
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUserId(session.user.id);

      // Load existing profile data if any
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Failed to load profile during setup:', profileError);
      }

      if (profile) {
        setUsername(profile.username || "");
        const profileCity = profile.city || "";
        setCity(profileCity);
        setArea(profile.area || "");
        
        // Set available areas based on city
        if (profileCity === "Αθήνα") {
          setAvailableAreas(ATHENS_AREAS);
        } else if (profileCity === "Θεσσαλονίκη") {
          setAvailableAreas(THESSALONIKI_AREAS);
        } else {
          setAvailableAreas([]);
        }
        
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
    
    // Prevent double submission
    if (loading) {
      console.log('Already submitting, ignoring...');
      return;
    }
    
    if (!userId) {
      console.error('No userId found during submit');
      toast.error("Σφάλμα: Δεν βρέθηκε ο χρήστης. Παρακαλώ ξανασυνδέσου.");
      navigate("/auth");
      return;
    }

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
      console.error('Validation error:', validation.error.errors);
      toast.error(firstError.message);
      return;
    }

    console.log('Starting profile submission for user:', userId);
    // Submit profile directly without location - location will be requested in Discover
    await submitProfile(null, null);
  };

  // Location handlers removed - location is now requested only in Discover page

  const submitProfile = async (lat: number | null, lng: number | null) => {
    if (!userId) {
      console.error('No userId in submitProfile');
      toast.error("Σφάλμα: Δεν βρέθηκε ο χρήστης");
      return;
    }

    // Re-validate before submission
    const validation = profileSetupSchema.safeParse({
      username,
      city,
      area,
      children,
      matchPreference,
      interests
    });

    if (!validation.success) {
      console.error('Validation failed in submitProfile:', validation.error);
      toast.error("Σφάλμα επικύρωσης δεδομένων");
      return;
    }

    setLoading(true);
    console.log('Profile submission started, uploading photos...');

    try {
      const photoUrls: string[] = [];

      // Upload new photos
      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];
        if (photo.url) {
          // Existing photo, keep the URL
          console.log(`Photo ${i + 1}: Using existing URL`);
          photoUrls.push(photo.url);
        } else if (photo.file) {
          // New photo, upload it
          console.log(`Photo ${i + 1}: Uploading new file...`);
          const fileExt = photo.file.name.split('.').pop();
          const fileName = `${userId}-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          const filePath = `${userId}/${fileName}`;
          
          const { error: uploadError } = await supabase.storage
            .from('profile-photos')
            .upload(filePath, photo.file, { upsert: true });

          if (uploadError) {
            console.error(`Photo ${i + 1} upload failed:`, uploadError);
            throw new Error(`Αποτυχία ανεβάσματος φωτογραφίας: ${uploadError.message}`);
          }

          const { data: { publicUrl } } = supabase.storage
            .from('profile-photos')
            .getPublicUrl(filePath);

          console.log(`Photo ${i + 1}: Uploaded successfully`);
          photoUrls.push(publicUrl);
        }
      }

      if (photoUrls.length === 0) {
        throw new Error("Δεν ανέβηκε καμία φωτογραφία");
      }

      console.log(`All ${photoUrls.length} photos uploaded, updating profile...`);

      const { data: authUserData, error: authUserError } = await supabase.auth.getUser();
      if (authUserError) {
        console.error('Failed to fetch auth user during profile save:', authUserError);
      }

      const { data: existingProfile, error: existingProfileError } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', userId)
        .maybeSingle();

      if (existingProfileError) {
        console.error('Failed to fetch existing profile during upsert:', existingProfileError);
      }

      // Build profile payload
      const validData = validation.data;
      const profileData = {
        full_name:
          existingProfile?.full_name ??
          authUserData.user?.user_metadata?.full_name ??
          authUserData.user?.user_metadata?.name ??
          '',
        email: existingProfile?.email ?? authUserData.user?.email ?? '',
        username: validData.username,
        city: validData.city,
        area: validData.area,
        children: validData.children,
        child_age_group: validData.children[0]?.ageGroup || '',
        match_preference: validData.matchPreference,
        interests: validData.interests,
        profile_photo_url: photoUrls[0],
        profile_photos_urls: photoUrls,
        profile_completed: true,
        latitude: lat,
        longitude: lng,
      };
      
      console.log('Updating profile with data:', JSON.stringify(profileData, null, 2));
      
      const { data: updatedRow, error: updateError } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', userId)
        .select('id, profile_completed, username, city, area')
        .maybeSingle();

      if (updateError) {
        console.error('Profile update error:', updateError);
        throw new Error(`Αποτυχία αποθήκευσης προφίλ: ${updateError.message}`);
      }

      if (!updatedRow?.profile_completed) {
        console.error('Profile update did not mark as completed:', updatedRow);
        throw new Error("Η αποθήκευση του προφίλ δεν επιβεβαιώθηκε");
      }

      console.log('Profile saved + verified:', updatedRow);

      // Check if onboarding has been completed
      const { data: updatedProfile } = await supabase
        .from('profiles')
        .select('has_completed_onboarding')
        .eq('id', userId)
        .single();

      // Show success screen before navigating
      const destination = !updatedProfile?.has_completed_onboarding ? "/onboarding" : "/discover";
      console.log('Navigation destination:', destination);
      setPendingNavigation(destination);
      setShowSuccessScreen(true);
      toast.success("Το προφίλ αποθηκεύτηκε επιτυχώς! 🎉");
      
    } catch (error: any) {
      console.error('Profile submission error:', error);
      toast.error(error.message || "Σφάλμα κατά την ενημέρωση του προφίλ");
      setLoading(false);
    }
    // Note: Don't setLoading(false) on success - keep it until navigation
  };

  const handleSuccessContinue = () => {
    setShowSuccessScreen(false);
    if (pendingNavigation) {
      navigate(pendingNavigation);
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
              <Select value={city} onValueChange={(value) => {
                setCity(value);
                setArea(""); // Reset area when city changes
                if (value === "Αθήνα") {
                  setAvailableAreas(ATHENS_AREAS);
                } else if (value === "Θεσσαλονίκη") {
                  setAvailableAreas(THESSALONIKI_AREAS);
                } else {
                  setAvailableAreas([]);
                }
              }}>
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
              {availableAreas.length > 0 ? (
                <Select value={area} onValueChange={setArea}>
                  <SelectTrigger>
                    <SelectValue placeholder="Επέλεξε περιοχή" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableAreas.map(areaName => (
                      <SelectItem key={areaName} value={areaName}>
                        {areaName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id="area"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="π.χ. Κέντρο"
                  maxLength={100}
                />
              )}
            </div>
          </div>

          {/* Children Section - Redesigned */}
          <div className="space-y-4">
            <div>
              <Label className="text-lg font-semibold">Πες μας λίγα για το παιδάκι σου 🤍</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Η ηλικία μας βοηθά να σου δείχνουμε μαμάδες που βρίσκονται στο ίδιο στάδιο με εσένα.
              </p>
              <p className="text-xs text-muted-foreground mt-1 italic">
                Κάθε στάδιο είναι διαφορετικό — και καμία μαμά δεν είναι μόνη της.
              </p>
            </div>

            {/* Children tabs */}
            {children.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {children.map((child, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setActiveChildIndex(index)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                      activeChildIndex === index
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    <span>{child.name || `Παιδί ${index + 1}`}</span>
                    {children.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const newChildren = children.filter((_, i) => i !== index);
                          setChildren(newChildren);
                          if (activeChildIndex >= newChildren.length) {
                            setActiveChildIndex(newChildren.length - 1);
                          }
                        }}
                        className="hover:text-destructive"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Active child editor */}
            {children[activeChildIndex] && (
              <div className="space-y-4 p-4 border border-border rounded-xl bg-secondary/10">
                {/* Name input */}
                <div>
                  <Label className="text-sm">Όνομα (προαιρετικό)</Label>
                  <Input
                    placeholder="π.χ. Μαριάννα"
                    value={children[activeChildIndex].name || ""}
                    onChange={(e) => {
                      const newChildren = [...children];
                      newChildren[activeChildIndex].name = e.target.value;
                      setChildren(newChildren);
                    }}
                    maxLength={50}
                    className="mt-1"
                  />
                </div>

                {/* Gender selection */}
                <div>
                  <Label className="text-sm">Φύλο</Label>
                  <div className="flex gap-2 mt-1">
                    <Button
                      type="button"
                      variant={children[activeChildIndex].gender === 'boy' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        const newChildren = [...children];
                        newChildren[activeChildIndex].gender = 'boy';
                        setChildren(newChildren);
                      }}
                    >
                      👦 Αγόρι
                    </Button>
                    <Button
                      type="button"
                      variant={children[activeChildIndex].gender === 'girl' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        const newChildren = [...children];
                        newChildren[activeChildIndex].gender = 'girl';
                        setChildren(newChildren);
                      }}
                    >
                      👧 Κορίτσι
                    </Button>
                    <Button
                      type="button"
                      variant={children[activeChildIndex].gender === 'baby' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        const newChildren = [...children];
                        newChildren[activeChildIndex].gender = 'baby';
                        setChildren(newChildren);
                      }}
                    >
                      👶 Μωρό
                    </Button>
                  </div>
                </div>

                {/* Age selector */}
                <div>
                  <Label className="text-sm">Ηλικία *</Label>
                  <div className="mt-2">
                    <ChildAgeSelector
                      selectedAge={children[activeChildIndex].ageGroup}
                      onSelect={(ageValue) => {
                        const newChildren = [...children];
                        newChildren[activeChildIndex].ageGroup = ageValue;
                        setChildren(newChildren);
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Add child button */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground text-center">
                Μπορείς να διαλέξεις περισσότερες ηλικίες, αν έχεις περισσότερα από ένα παιδάκια 🤍
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setChildren([...children, { ageGroup: "", gender: 'baby' }]);
                  setActiveChildIndex(children.length);
                }}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Προσθήκη Παιδιού
              </Button>
            </div>
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
            <Label>Ενδιαφέροντα / Lifestyle * (επίλεξε τουλάχιστον 1)</Label>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map(interest => {
                const interestId = interest.id;
                const interestLabel = interest.label[language as 'el' | 'en'];
                return (
                  <button
                    key={interestId}
                    type="button"
                    onClick={() => toggleInterest(interestId)}
                    className={`px-4 py-2 rounded-full text-sm transition-colors ${
                      interests.includes(interestId)
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {interestLabel}
                  </button>
                );
              })}
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

      {/* Location permission is now requested in Discover page */}

      {/* Profile Success Screen */}
      <ProfileSuccessScreen 
        visible={showSuccessScreen}
        onContinue={handleSuccessContinue}
      />
    </div>
  );
}
