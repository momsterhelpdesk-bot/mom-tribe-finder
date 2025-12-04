import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { MapPin, Baby, Heart, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import mascot from "@/assets/mascot.jpg";
import { INTERESTS } from "@/lib/interests";

export default function MatchingFilters() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [showLocationFilter, setShowLocationFilter] = useState(false);
  const [distancePreferenceKm, setDistancePreferenceKm] = useState(5);
  const [matchAgeFilter, setMatchAgeFilter] = useState(false);
  const [ageRangeMonths, setAgeRangeMonths] = useState(3);
  const [matchInterestsFilter, setMatchInterestsFilter] = useState(false);
  const [interestsThreshold, setInterestsThreshold] = useState(40);

  useEffect(() => {
    loadFilters();
  }, []);

  const loadFilters = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("show_location_filter, distance_preference_km, match_age_filter, age_range_months, match_interests_filter, interests_threshold")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      if (data) {
        setShowLocationFilter(data.show_location_filter || false);
        setDistancePreferenceKm(data.distance_preference_km || 5);
        setMatchAgeFilter(data.match_age_filter || false);
        setAgeRangeMonths(data.age_range_months || 3);
        setMatchInterestsFilter(data.match_interests_filter || false);
        setInterestsThreshold((data as any).interests_threshold || 40);
      }
    } catch (error) {
      console.error("Error loading filters:", error);
      toast.error("Σφάλμα κατά τη φόρτωση των φίλτρων");
    } finally {
      setLoading(false);
    }
  };

  const saveFilters = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("profiles")
        .update({
          show_location_filter: showLocationFilter,
          distance_preference_km: distancePreferenceKm,
          match_age_filter: matchAgeFilter,
          age_range_months: ageRangeMonths,
          match_interests_filter: matchInterestsFilter,
          interests_threshold: interestsThreshold
        })
        .eq("id", user.id);

      if (error) throw error;

      toast.success("Οι προτιμήσεις σου αποθηκεύτηκαν!");
      navigate("/discover");
    } catch (error) {
      console.error("Error saving filters:", error);
      toast.error("Σφάλμα κατά την αποθήκευση");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 flex items-center justify-center">
        <div className="animate-spin text-4xl">🌸</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 p-4">
      <img 
        src={mascot} 
        alt="Momster Mascot" 
        className="fixed top-24 right-4 w-20 h-20 opacity-20 object-contain pointer-events-none animate-[bounce_3s_ease-in-out_infinite]"
      />
      
      <div className="max-w-md mx-auto pt-20 pb-24">
        <h1 className="text-2xl font-bold text-center mb-6 text-foreground" style={{ fontFamily: "'Pacifico', cursive" }}>
          Φίλτρα Matching
        </h1>

        <div className="space-y-4">
          {/* Location Filter */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-primary" />
                <div>
                  <Label className="text-base font-semibold">Φίλτρο Απόστασης</Label>
                  <p className="text-sm text-muted-foreground">Βρες μαμάδες κοντά σου</p>
                </div>
              </div>
              <Switch
                checked={showLocationFilter}
                onCheckedChange={setShowLocationFilter}
              />
            </div>

            {showLocationFilter && (
              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Μέγιστη απόσταση:</Label>
                  <span className="text-sm font-semibold text-primary">{distancePreferenceKm} km</span>
                </div>
                <Slider
                  value={[distancePreferenceKm]}
                  onValueChange={([value]) => setDistancePreferenceKm(value)}
                  min={1}
                  max={50}
                  step={1}
                  className="w-full"
                />
              </div>
            )}
          </Card>

          {/* Age Filter */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Baby className="w-5 h-5 text-primary" />
                <div>
                  <Label className="text-base font-semibold">Φίλτρο Ηλικίας Παιδιού</Label>
                  <p className="text-sm text-muted-foreground">Παρόμοιες ηλικίες παιδιών</p>
                </div>
              </div>
              <Switch
                checked={matchAgeFilter}
                onCheckedChange={setMatchAgeFilter}
              />
            </div>

            {matchAgeFilter && (
              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Διαφορά ηλικίας:</Label>
                  <span className="text-sm font-semibold text-primary">±{ageRangeMonths} μήνες</span>
                </div>
                <Slider
                  value={[ageRangeMonths]}
                  onValueChange={([value]) => setAgeRangeMonths(value)}
                  min={3}
                  max={12}
                  step={1}
                  className="w-full"
                />
              </div>
            )}
          </Card>

          {/* Interests Filter */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Heart className="w-5 h-5 text-primary" />
                <div>
                  <Label className="text-base font-semibold">Φίλτρο Ενδιαφερόντων</Label>
                  <p className="text-sm text-muted-foreground">Κοινά ενδιαφέροντα</p>
                </div>
              </div>
              <Switch
                checked={matchInterestsFilter}
                onCheckedChange={setMatchInterestsFilter}
              />
            </div>

            {matchInterestsFilter && (
              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Ελάχιστο ποσοστό κοινών:</Label>
                  <span className="text-sm font-semibold text-primary">{interestsThreshold}%</span>
                </div>
                <Slider
                  value={[interestsThreshold]}
                  onValueChange={([value]) => setInterestsThreshold(value)}
                  min={20}
                  max={80}
                  step={20}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>40%</span>
                  <span>60%</span>
                  <span>80%</span>
                </div>
              </div>
            )}
          </Card>
        </div>

        <Button
          className="w-full mt-6"
          size="lg"
          onClick={saveFilters}
          disabled={saving}
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Αποθήκευση..." : "Αποθήκευση Προτιμήσεων"}
        </Button>
      </div>

      <footer className="fixed bottom-0 left-0 right-0 py-3 px-4 bg-background/80 backdrop-blur-md border-t border-border">
        <div className="max-w-md mx-auto flex items-center justify-center gap-2">
          <img src={mascot} alt="Momster Mascot" className="w-8 h-8 object-contain" />
          <span className="text-sm text-muted-foreground">Together, moms thrive!</span>
        </div>
      </footer>
    </div>
  );
}
