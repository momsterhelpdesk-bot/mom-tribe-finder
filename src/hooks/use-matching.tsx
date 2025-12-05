import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

interface ChildInfo {
  name: string;
  ageGroup: string;
  gender?: string;
}

export interface ProfileMatch {
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
  matchPercentage?: number;
  commonInterestsCount?: number;
  totalInterests?: number;
  ageMatchScore?: number;
  interestsMatchScore?: number;
}

interface MatchingFilters {
  showLocationFilter: boolean;
  distancePreferenceKm: number;
  matchAgeFilter: boolean;
  ageRangeMonths: number;
  matchInterestsFilter: boolean;
  interestsThreshold: number;
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
    
    const ageGroupMap: { [key: string]: number } = {
      "0-6 months": 3,
      "6-12 months": 9,
      "1-2 years": 18,
      "2-3 years": 30,
      "3-4 years": 42,
      "4-5 years": 54,
      "5+ years": 72,
      "0-6 μηνών": 3,
      "6-12 μηνών": 9,
      "1-2 χρονών": 18,
      "2-3 χρονών": 30,
      "3-4 χρονών": 42,
      "4-5 χρονών": 54,
      "5+ χρονών": 72
    };

    const childArray = children as any[];
    const totalMonths = childArray.reduce((sum, child) => {
      return sum + (ageGroupMap[child.ageGroup] || ageGroupMap[child.age] || 24);
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
      return 9999;
    }
  };

  const loadMatchingProfiles = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log("No user found, skipping profile load");
        setLoading(false);
        return;
      }

      // Get current user's profile with filter preferences
      const { data: currentProfile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;
      
      setCurrentUser(currentProfile);

      // Store filters
      const userFilters: MatchingFilters = {
        showLocationFilter: currentProfile.show_location_filter || false,
        distancePreferenceKm: currentProfile.distance_preference_km || 10,
        matchAgeFilter: currentProfile.match_age_filter || false,
        ageRangeMonths: currentProfile.age_range_months || 6,
        matchInterestsFilter: currentProfile.match_interests_filter || false,
        interestsThreshold: (currentProfile as any).interests_threshold || 40
      };
      setFilters(userFilters);

      // Get ALL profiles with complete profile
      const { data: allProfiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, profile_photo_url, profile_photos_urls, bio, city, area, interests, children, latitude, longitude")
        .neq("id", user.id)
        .eq("profile_completed", true)
        .not("profile_photo_url", "is", null)
        .not("interests", "is", null)
        .not("children", "is", null);

      if (profilesError) throw profilesError;

      let profilesWithScores: ProfileMatch[] = allProfiles || [];

      // Filter out profiles with empty interests or children arrays
      profilesWithScores = profilesWithScores.filter(profile => 
        profile.interests && Array.isArray(profile.interests) && profile.interests.length > 0 &&
        profile.children && Array.isArray(profile.children) && (profile.children as any[]).length > 0
      );

      // Calculate distance for all profiles
      const profilesWithDistance = await Promise.all(
        profilesWithScores.map(async (profile) => {
          let distance = 9999;
          
          if (currentProfile.latitude && currentProfile.longitude && 
              profile.latitude && profile.longitude) {
            distance = await calculateDistance(
              currentProfile.latitude,
              currentProfile.longitude,
              profile.latitude,
              profile.longitude
            );
          } else if (profile.area === currentProfile.area) {
            distance = 1;
          } else if (profile.city === currentProfile.city) {
            distance = 5;
          }
          
          return { ...profile, distance };
        })
      );

      // APPLY LOCATION FILTER
      let filteredProfiles = profilesWithDistance;
      if (userFilters.showLocationFilter) {
        filteredProfiles = filteredProfiles.filter(profile => 
          profile.distance <= userFilters.distancePreferenceKm
        );
      }

      // Calculate kids age match score and APPLY AGE FILTER
      const currentUserAvgAge = getAverageChildAge(currentProfile.children);
      let profilesWithAgeScore = filteredProfiles.map(profile => {
        const profileAvgAge = getAverageChildAge(profile.children);
        const ageDiff = Math.abs(profileAvgAge - currentUserAvgAge);
        const ageMatchScore = Math.max(0, 100 - ageDiff * 2);
        return { ...profile, ageMatchScore, ageDiffMonths: ageDiff };
      });

      // APPLY AGE FILTER
      if (userFilters.matchAgeFilter) {
        profilesWithAgeScore = profilesWithAgeScore.filter(profile => 
          (profile as any).ageDiffMonths <= userFilters.ageRangeMonths
        );
      }

      // Calculate interests match score
      const currentUserInterests = currentProfile.interests || [];
      let profilesWithInterestScore = profilesWithAgeScore.map(profile => {
        const profileInterests = profile.interests || [];
        const commonInterests = profileInterests.filter(interest => 
          currentUserInterests.includes(interest)
        );
        const commonInterestsCount = commonInterests.length;
        const maxInterests = Math.max(currentUserInterests.length, profileInterests.length, 1);
        const interestsMatchScore = (commonInterestsCount / maxInterests) * 100;
        
        return { 
          ...profile, 
          interestsMatchScore,
          commonInterestsCount,
          totalInterests: currentUserInterests.length
        };
      });

      // APPLY INTERESTS FILTER with user-selected threshold
      if (userFilters.matchInterestsFilter) {
        profilesWithInterestScore = profilesWithInterestScore.filter(profile => 
          profile.interestsMatchScore >= userFilters.interestsThreshold
        );
      }

      // Calculate overall match percentage
      // Weights: Location 40%, Kids Age 35%, Interests 25%
      const profilesWithMatchPercentage = profilesWithInterestScore.map(profile => {
        const distanceScore = profile.distance <= 3 ? 100 : 
                              profile.distance <= 5 ? 90 :
                              profile.distance <= 10 ? 70 :
                              profile.distance <= 20 ? 50 : 30;
        
        const locationWeight = 0.40;
        const ageWeight = 0.35;
        const interestsWeight = 0.25;

        const matchPercentage = Math.round(
          (distanceScore * locationWeight) +
          ((profile.ageMatchScore || 0) * ageWeight) +
          ((profile.interestsMatchScore || 0) * interestsWeight)
        );

        return { ...profile, matchPercentage };
      });

      // SORT: 1) Most common interests, 2) Closest distance, 3) Closest kids ages
      profilesWithMatchPercentage.sort((a, b) => {
        // First: common interests (highest first)
        const interestsDiff = (b.commonInterestsCount || 0) - (a.commonInterestsCount || 0);
        if (interestsDiff !== 0) return interestsDiff;
        
        // Second: distance (closest first)
        const distanceDiff = (a.distance || 9999) - (b.distance || 9999);
        if (distanceDiff !== 0) return distanceDiff;
        
        // Third: kids age match score (highest first)
        return (b.ageMatchScore || 0) - (a.ageMatchScore || 0);
      });

      setProfiles(profilesWithMatchPercentage);
    } catch (error) {
      console.error("Error loading matching profiles:", error);
    } finally {
      setLoading(false);
    }
  };

  return { profiles, loading, currentUser, filters, reloadProfiles: loadMatchingProfiles };
}
