import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

interface ChildInfo {
  name: string;
  ageGroup: string;
  gender?: string;
}

interface ProfileMatch {
  id: string;
  full_name: string;
  profile_photo_url: string | null;
  profile_photos_urls: string[] | null;
  bio: string | null;
  city: string;
  area: string;
  interests: string[] | null;
  children: Json | null;
  latitude: number | null;
  longitude: number | null;
  distance?: number;
}

interface MatchingFilters {
  showLocationFilter: boolean;
  distancePreferenceKm: number;
  matchAgeFilter: boolean;
  ageRangeMonths: number;
  matchInterestsFilter: boolean;
}

export function useMatching() {
  const [profiles, setProfiles] = useState<ProfileMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [filters, setFilters] = useState<MatchingFilters | null>(null);

  useEffect(() => {
    loadMatchingProfiles();
  }, []);

  const calculateChildAgeMonths = (birthdate: string): number => {
    const birth = new Date(birthdate);
    const now = new Date();
    return (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  };

  const getAverageChildAge = (children: Json): number => {
    if (!children || !Array.isArray(children) || children.length === 0) return 0;
    
    // Map age groups to months (approximate)
    const ageGroupMap: { [key: string]: number } = {
      "0-6 months": 3,
      "6-12 months": 9,
      "1-2 years": 18,
      "2-3 years": 30,
      "3-4 years": 42,
      "4-5 years": 54,
      "5+ years": 72
    };

    const childArray = children as any[];
    const totalMonths = childArray.reduce((sum, child) => {
      return sum + (ageGroupMap[child.ageGroup] || 24);
    }, 0);

    return Math.round(totalMonths / childArray.length);
  };

  const calculateDistance = async (lat1: number, lon1: number, lat2: number, lon2: number): Promise<number> => {
    try {
      const { data, error } = await supabase.functions.invoke('calculate-distance', {
        body: { lat1, lon1, lat2, lon2 }
      });

      if (error) throw error;
      return data.km;
    } catch (error) {
      console.error('Error calculating distance:', error);
      return 9999; // Return large number on error
    }
  };

  const loadMatchingProfiles = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get current user's profile with filters
      const { data: currentProfile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;
      
      setCurrentUser(currentProfile);
      setFilters({
        showLocationFilter: currentProfile.show_location_filter || false,
        distancePreferenceKm: currentProfile.distance_preference_km || 5,
        matchAgeFilter: currentProfile.match_age_filter || false,
        ageRangeMonths: currentProfile.age_range_months || 3,
        matchInterestsFilter: currentProfile.match_interests_filter || false
      });

      // Get all profiles except current user
      let query = supabase
        .from("profiles")
        .select("id, full_name, profile_photo_url, profile_photos_urls, bio, city, area, interests, children, latitude, longitude")
        .neq("id", user.id)
        .eq("profile_completed", true)
        .not("profile_photo_url", "is", null);

      const { data: allProfiles, error: profilesError } = await query;

      if (profilesError) throw profilesError;

      // Apply filters
      let filteredProfiles = allProfiles || [];

      // Location filter
      if (currentProfile.show_location_filter && currentProfile.latitude && currentProfile.longitude) {
        const profilesWithDistance = await Promise.all(
          filteredProfiles.map(async (profile) => {
            if (!profile.latitude || !profile.longitude) return null;
            
            const distance = await calculateDistance(
              currentProfile.latitude,
              currentProfile.longitude,
              profile.latitude,
              profile.longitude
            );

            if (distance <= currentProfile.distance_preference_km) {
              return { ...profile, distance };
            }
            return null;
          })
        );
        filteredProfiles = profilesWithDistance.filter(p => p !== null) as ProfileMatch[];
      }

      // Age filter
      if (currentProfile.match_age_filter && currentProfile.children) {
        const currentUserAvgAge = getAverageChildAge(currentProfile.children);
        filteredProfiles = filteredProfiles.filter(profile => {
          if (!profile.children) return false;
          const profileAvgAge = getAverageChildAge(profile.children);
          return Math.abs(profileAvgAge - currentUserAvgAge) <= currentProfile.age_range_months;
        });
      }

      // Interests filter
      if (currentProfile.match_interests_filter && currentProfile.interests && currentProfile.interests.length > 0) {
        filteredProfiles = filteredProfiles.filter(profile => {
          if (!profile.interests || profile.interests.length === 0) return false;
          return profile.interests.some(interest => currentProfile.interests.includes(interest));
        });
      }

      setProfiles(filteredProfiles);
    } catch (error) {
      console.error("Error loading matching profiles:", error);
    } finally {
      setLoading(false);
    }
  };

  return { profiles, loading, currentUser, filters, reloadProfiles: loadMatchingProfiles };
}
