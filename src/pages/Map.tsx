import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Navigation as NavigationIcon } from "lucide-react";
import mascot from "@/assets/mascot.jpg";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface NearbyMom {
  id: string;
  full_name: string;
  profile_photo_url: string | null;
  child_age_group: string;
  distance: number;
  latitude: number;
  longitude: number;
}

export default function Map() {
  const navigate = useNavigate();
  const [nearbyMoms, setNearbyMoms] = useState<NearbyMom[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    loadNearbyMoms();
  }, []);

  const loadNearbyMoms = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      // Get current user's profile with location
      const { data: profile } = await supabase
        .from('profiles')
        .select('latitude, longitude')
        .eq('id', user.id)
        .single();

      if (!profile?.latitude || !profile?.longitude) {
        setLoading(false);
        return;
      }

      setUserLocation({ lat: profile.latitude, lng: profile.longitude });

      // Get all moms with locations (exclude current user) - use profiles_safe for public display
      const { data: allMoms } = await supabase
        .from('profiles_safe')
        .select('id, full_name, profile_photo_url, child_age_group')
        .neq('id', user.id);
      
      // Get user's own location from profiles table
      const { data: locations } = await supabase
        .from('profiles')
        .select('id, latitude, longitude')
        .in('id', allMoms?.map(m => m.id) || [])
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);
      
      // Merge location data with public profile data
      const allMomsWithLocation = allMoms?.map(mom => {
        const location = locations?.find(l => l.id === mom.id);
        return location ? { ...mom, latitude: location.latitude, longitude: location.longitude } : null;
      }).filter(Boolean) || [];

      if (allMomsWithLocation) {
        // Calculate distances client-side for now
        const momsWithDistance = allMomsWithLocation.map((mom: any) => ({
          ...mom,
          distance: calculateDistance(
            profile.latitude,
            profile.longitude,
            mom.latitude!,
            mom.longitude!
          )
        })).filter((mom: any) => mom.distance <= 50) // Within 50km
        .sort((a: any, b: any) => a.distance - b.distance)
        .slice(0, 20); // Show top 20 closest

        setNearbyMoms(momsWithDistance);
      }
    } catch (error) {
      console.error("Error loading nearby moms:", error);
    } finally {
      setLoading(false);
    }
  };

  // Haversine formula to calculate distance between two points
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 relative">
      <img 
        src={mascot} 
        alt="Momster Mascot" 
        className="fixed top-24 right-4 w-20 h-20 opacity-20 object-contain pointer-events-none"
      />
      <div className="max-w-2xl mx-auto pt-20 pb-24 px-4">
        <h1 className="text-2xl font-bold mb-6 text-foreground" style={{ fontFamily: "'Pacifico', cursive" }}>
          Κοντινές Μαμάδες
        </h1>

        {/* Map Placeholder */}
        <Card className="mb-6 h-64 flex items-center justify-center bg-secondary/20">
          <div className="text-center">
            <MapPin className="w-12 h-12 text-primary mx-auto mb-2" />
            {loading ? (
              <p className="text-muted-foreground">Φόρτωση κοντινών μαμάδων...</p>
            ) : !userLocation ? (
              <>
                <p className="text-muted-foreground">Δεν έχετε ενεργοποιήσει την τοποθεσία</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Ενεργοποιήστε την τοποθεσία στις ρυθμίσεις
                </p>
              </>
            ) : nearbyMoms.length === 0 ? (
              <>
                <p className="text-muted-foreground">Δεν βρέθηκαν κοντινές μαμάδες</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Προσπάθησε ξανά αργότερα
                </p>
              </>
            ) : (
              <>
                <p className="text-muted-foreground">Βρέθηκαν {nearbyMoms.length} κοντινές μαμάδες</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Χάρτης σύντομα διαθέσιμος
                </p>
              </>
            )}
          </div>
        </Card>

        {nearbyMoms.length > 0 && (
          <>
            <h2 className="text-lg font-semibold mb-4 text-foreground">Κοντινές Μαμάδες</h2>
            
            <div className="space-y-3">
              {nearbyMoms.map((mom) => (
                <Card key={mom.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={mom.profile_photo_url || undefined} alt={mom.full_name} />
                      <AvatarFallback>{mom.full_name[0]}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{mom.full_name}</h3>
                      <p className="text-sm text-muted-foreground">{mom.child_age_group}</p>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <NavigationIcon className="w-4 h-4 text-primary" />
                      <span>{mom.distance.toFixed(1)} km</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="fixed bottom-20 left-0 right-0 py-3 px-4 bg-background/80 backdrop-blur-md border-t border-border">
        <div className="max-w-2xl mx-auto flex items-center justify-center gap-2">
          <img src={mascot} alt="Momster Mascot" className="w-8 h-8 object-contain" />
          <span className="text-sm text-muted-foreground">Together, moms thrive!</span>
        </div>
      </footer>
    </div>
  );
}
