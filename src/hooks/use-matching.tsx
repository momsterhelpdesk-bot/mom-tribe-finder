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

      // Get current user's profile
      const { data: currentProfile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;
      
      setCurrentUser(currentProfile);

      // Get ALL profiles with complete profile (photo + interests + children)
      // Exclude: current user, admin users, incomplete profiles
      const { data: allProfiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, profile_photo_url, profile_photos_urls, bio, city, area, interests, children, latitude, longitude")
        .neq("id", user.id)
        .eq("profile_completed", true)
        .not("profile_photo_url", "is", null)
        .not("interests", "is", null)
        .not("children", "is", null);

      if (profilesError) throw profilesError;

      let profilesWithScores = allProfiles || [];

      // Filter out profiles with empty interests or children arrays
      profilesWithScores = profilesWithScores.filter(profile => 
        profile.interests && Array.isArray(profile.interests) && profile.interests.length > 0 &&
        profile.children && Array.isArray(profile.children) && (profile.children as any[]).length > 0
      );

      // Calculate distance for all profiles
      const profilesWithDistance = await Promise.all(
        profilesWithScores.map(async (profile) => {
          let distance = 9999; // Default large distance
          
          if (currentProfile.latitude && currentProfile.longitude && 
              profile.latitude && profile.longitude) {
            distance = await calculateDistance(
              currentProfile.latitude,
              currentProfile.longitude,
              profile.latitude,
              profile.longitude
            );
          } else if (profile.area === currentProfile.area) {
            distance = 1; // Same area
          } else if (profile.city === currentProfile.city) {
            distance = 5; // Same city
          }
          
          return { ...profile, distance };
        })
      );

      // Calculate kids age match score
      const currentUserAvgAge = getAverageChildAge(currentProfile.children);
      const profilesWithAgeScore = profilesWithDistance.map(profile => {
        const profileAvgAge = getAverageChildAge(profile.children);
        const ageDiff = Math.abs(profileAvgAge - currentUserAvgAge);
        // Lower diff = higher score (inverse relationship)
        const ageMatchScore = Math.max(0, 100 - ageDiff * 2);
        return { ...profile, ageMatchScore };
      });

      // Calculate interests match score
      const profilesWithInterestScore = profilesWithAgeScore.map(profile => {
        if (!currentProfile.interests || !profile.interests) {
          return { ...profile, interestsMatchScore: 0 };
        }
        const commonInterests = profile.interests.filter(interest => 
          currentProfile.interests.includes(interest)
        ).length;
        const interestsMatchScore = (commonInterests / Math.max(currentProfile.interests.length, 1)) * 100;
        return { ...profile, interestsMatchScore };
      });

      // Sort: distance ASC → kidsAgeMatch DESC → interestsMatch DESC
      profilesWithInterestScore.sort((a, b) => {
        // First by distance (ascending)
        if (a.distance !== b.distance) {
          return a.distance - b.distance;
        }
        // Then by age match score (descending)
        if (a.ageMatchScore !== b.ageMatchScore) {
          return b.ageMatchScore - a.ageMatchScore;
        }
        // Finally by interests match score (descending)
        return b.interestsMatchScore - a.interestsMatchScore;
      });

      setProfiles(profilesWithInterestScore);
    } catch (error) {
      console.error("Error loading matching profiles:", error);
    } finally {
      setLoading(false);
    }
  };

  return { profiles, loading, currentUser, filters, reloadProfiles: loadMatchingProfiles };
}
