import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { MapPin, Baby, Heart, Save, ArrowLeft, X, Users, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import mascot from "@/assets/mascot.jpg";
import { INTERESTS } from "@/lib/interests";
import { useMicrocopy } from "@/hooks/use-microcopy";

export default function MatchingFilters() {
  const navigate = useNavigate();
  const { getText } = useMicrocopy();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [showLocationFilter, setShowLocationFilter] = useState(false);
  const [distancePreferenceKm, setDistancePreferenceKm] = useState(5);
  const [matchAgeFilter, setMatchAgeFilter] = useState(false);
  const [ageRangeMonths, setAgeRangeMonths] = useState(3);
  const [matchInterestsFilter, setMatchInterestsFilter] = useState(false);
  const [interestsThreshold, setInterestsThreshold] = useState(40);
  const [prioritizeLifestyle, setPrioritizeLifestyle] = useState(false);
  const [requiredInterests, setRequiredInterests] = useState<string[]>([]);

  useEffect(() => {
    loadFilters();
  }, []);

  const handleGoBack = () => {
    navigate("/discover");
  };

  const loadFilters = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Instead of redirecting to auth, just go back to discover
        // The AuthGuard will handle authentication if needed
        navigate("/discover");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
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
        setPrioritizeLifestyle((data as any).prioritize_lifestyle || false);
        setRequiredInterests((data as any).required_interests || []);
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
          interests_threshold: interestsThreshold,
          prioritize_lifestyle: prioritizeLifestyle,
          required_interests: requiredInterests
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
      {/* Header with Back and Close buttons */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={handleGoBack}
            className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
            aria-label="Πίσω"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Πίσω</span>
          </button>
          <h1 className="text-lg font-bold text-foreground" style={{ fontFamily: "'Pacifico', cursive" }}>
            Φίλτρα
          </h1>
          <button
            onClick={handleGoBack}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-muted hover:bg-muted/80 transition-colors"
            aria-label="Κλείσιμο"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      <img 
        src={mascot} 
        alt="Momster Mascot" 
        className="fixed top-24 right-4 w-20 h-20 opacity-20 object-contain pointer-events-none animate-[bounce_3s_ease-in-out_infinite]"
      />
      
      <div className="max-w-md mx-auto pt-20 pb-24">
        {/* Intro helper text */}
        <div className="mb-4 p-3 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border border-pink-200">
          <p className="text-sm text-muted-foreground text-center">
            {getText("filters_helper", "Τα φίλτρα βοηθούν να βρίσκεις πιο ταιριαστές μαμάδες — όχι να αποκλείεις 🤍")}
          </p>
        </div>

        <div className="space-y-4">
          {/* Location Filter - NO GPS */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-primary" />
                <div>
                  <Label className="text-base font-semibold">{getText("filter_location_title", "Μόνο κοντά μου 🤍")}</Label>
                  <p className="text-sm text-muted-foreground">{getText("filter_location_desc", "Για να βρίσκεις μαμάδες κοντά σου — χωρίς GPS 🤍")}</p>
                </div>
              </div>
              <Switch
                checked={showLocationFilter}
                onCheckedChange={setShowLocationFilter}
              />
            </div>

            {showLocationFilter && (
              <div className="space-y-3 pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  📍 {getText("filter_location_info", "Ίδια πόλη = Κοντά σου · Ίδια περιοχή = Πολύ κοντά!")}
                </p>
                <div className="flex gap-2 flex-wrap">
                  <button
                    type="button"
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      distancePreferenceKm === 10 ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                    }`}
                    onClick={() => setDistancePreferenceKm(10)}
                  >
                    Ίδια περιοχή
                  </button>
                  <button
                    type="button"
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      distancePreferenceKm === 100 ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                    }`}
                    onClick={() => setDistancePreferenceKm(100)}
                  >
                    Ίδια πόλη
                  </button>
                  <button
                    type="button"
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      distancePreferenceKm === 500 ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                    }`}
                    onClick={() => setDistancePreferenceKm(500)}
                  >
                    Όλη η Ελλάδα
                  </button>
                </div>
              </div>
            )}
          </Card>

          {/* Age Filter */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Baby className="w-5 h-5 text-primary" />
                <div>
                  <Label className="text-base font-semibold">{getText("filter_age_title", "Ίδιο στάδιο με εμένα 👶")}</Label>
                  <p className="text-sm text-muted-foreground">{getText("filter_age_desc", "Κάθε στάδιο έχει τις δικές του ανάγκες.")}</p>
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
                  <Label className="text-sm">{getText("filter_age_deviation", "Απόκλιση ηλικίας (±):")}</Label>
                  <span className="text-sm font-semibold text-primary">
                    {ageRangeMonths <= 12 ? `${ageRangeMonths} μήνες` : `${Math.round(ageRangeMonths / 12)} έτος/η`}
                  </span>
                </div>
                <Slider
                  value={[ageRangeMonths]}
                  onValueChange={([value]) => setAgeRangeMonths(value)}
                  min={3}
                  max={24}
                  step={3}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  ✨ {getText("filter_age_hint", "Μαμά με παιδί ίδιας ηλικίας → Ίδιες μικρές προκλήσεις, ίδιες χαρές")}
                </p>
              </div>
            )}
          </Card>

          {/* Lifestyle Priority - Soft filter, not exclusion */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-primary" />
                <div>
                  <Label className="text-base font-semibold">{getText("filter_lifestyle_title", "Παρόμοια καθημερινότητα 🤍")}</Label>
                  <p className="text-sm text-muted-foreground">{getText("filter_lifestyle_desc", "Διάλεξε ό,τι σε εκφράζει — μόνο για καλύτερο ταίριασμα 🤍")}</p>
                </div>
              </div>
              <Switch
                checked={prioritizeLifestyle}
                onCheckedChange={setPrioritizeLifestyle}
              />
            </div>
            {prioritizeLifestyle && (
              <div className="pt-3 border-t">
                <p className="text-xs text-muted-foreground mb-2">
                  👩‍👧 {getText("filter_lifestyle_examples", "Single Mom, WFH, Stay-at-Home, Χωρίς υποστήριξη κ.ά. θα εμφανίζονται πρώτες!")}
                </p>
                <p className="text-[10px] text-muted-foreground/70">
                  {getText("filter_lifestyle_note", "Δεν αποκλείει κανέναν — απλά βάζει τα σημαντικά πρώτα 🌸")}
                </p>
              </div>
            )}
          </Card>

          {/* Interests Filter */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Heart className="w-5 h-5 text-primary" />
                <div>
                  <Label className="text-base font-semibold">{getText("filter_interests_title", "Κοινά ενδιαφέροντα ✨")}</Label>
                  <p className="text-sm text-muted-foreground">{getText("filter_interests_desc", "Ταιριάζετε σε πολλά")}</p>
                </div>
              </div>
              <Switch
                checked={matchInterestsFilter}
                onCheckedChange={setMatchInterestsFilter}
              />
            </div>

            {matchInterestsFilter && (
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">{getText("filter_interests_min", "Ελάχιστο ποσοστό κοινών:")}</Label>
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
                
                {/* Specific interests selection */}
                <div className="pt-3 border-t">
                  <Label className="text-sm font-medium mb-2 block">
                    🎯 Θέλω να γνωρίσω μαμάδες με:
                  </Label>
                  <p className="text-xs text-muted-foreground mb-3">
                    Επίλεξε συγκεκριμένα ενδιαφέροντα που πρέπει να έχει η άλλη μαμά
                  </p>
                  <div className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto p-1">
                    {INTERESTS.map((interest) => {
                      const isSelected = requiredInterests.includes(interest.id);
                      return (
                        <button
                          key={interest.id}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setRequiredInterests(requiredInterests.filter(i => i !== interest.id));
                            } else {
                              setRequiredInterests([...requiredInterests, interest.id]);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                            isSelected 
                              ? 'bg-primary text-primary-foreground shadow-md scale-105' 
                              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                          }`}
                        >
                          {interest.label.el}
                        </button>
                      );
                    })}
                  </div>
                  {requiredInterests.length > 0 && (
                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-xs text-primary font-medium">
                        ✨ {requiredInterests.length} επιλεγμένα
                      </p>
                      <button
                        type="button"
                        onClick={() => setRequiredInterests([])}
                        className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                      >
                        Καθαρισμός
                      </button>
                    </div>
                  )}
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
          {saving ? getText("saving_button", "Αποθήκευση...") : getText("save_filters_button", "Αποθήκευση Προτιμήσεων")}
        </Button>
      </div>

      <footer className="fixed bottom-0 left-0 right-0 py-3 px-4 bg-background/80 backdrop-blur-md border-t border-border">
        <div className="max-w-md mx-auto flex items-center justify-center gap-2">
          <img src={mascot} alt="Momster Mascot" className="w-8 h-8 object-contain" />
          <span className="text-sm text-muted-foreground">{getText("footer_tagline", "Together, moms thrive!")}</span>
        </div>
      </footer>
    </div>
  );
}
