import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { getMonthsFromAgeValue, ALL_AGE_OPTIONS } from "@/lib/childAges";

interface ChildInfo {
  name: string;
  ageGroup: string;
  gender?: string;
}

// Merged ProfileMatch interface (single definition)

interface MatchingFilters {
  showLocationFilter: boolean;
  distancePreferenceKm: number;
  matchAgeFilter: boolean;
  ageRangeMonths: number;
  matchInterestsFilter: boolean;
  interestsThreshold: number;
  prioritizeLifestyle: boolean;
  requiredInterests: string[];
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
  hasLikedYou?: boolean;
  lifestyleMatchCount?: number;
  // Location boost indicators (profile-based, no GPS)
  isSameCity?: boolean;
  isSameArea?: boolean;
  locationBoost?: number; // 1 = same city, 2 = same area, 3 = same area + lifestyle
  // Age matching indicator
  ageDiffMonths?: number;
}

export type SortOption = 'recommended' | 'nearby' | 'lifestyle' | 'same_stage';

export function useMatching() {
  const [profiles, setProfiles] = useState<ProfileMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [filters, setFilters] = useState<MatchingFilters | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('recommended');

  useEffect(() => {
    loadMatchingProfiles();
  }, []);

  const calculateChildAgeMonths = (birthdate: string): number => {
    const birth = new Date(birthdate);
    const now = new Date();
    return (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  };

  // Enhanced age calculation supporting new age format
  // Returns null when age can't be determined (so we don't accidentally treat "unknown" as "same stage").
  const getAverageChildAge = (children: Json): number | null => {
    if (!children || !Array.isArray(children) || children.length === 0) return null;

    // Legacy age group mappings for backward compatibility
    const legacyAgeGroupMap: { [key: string]: number } = {
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
      "5+ χρονών": 72,
      "Είμαι έγκυος 🤰": 0,
      "0-6 μήνες": 3,
      "6-12 μήνες": 9,
      "1-2 χρόνια": 18,
      "2-3 χρόνια": 30,
      "3-5 χρόνια": 48,
      "5+ χρόνια": 72,
    };

    const childArray = children as any[];
    const totalMonths = childArray.reduce((sum, child) => {
      const ageGroup = child.ageGroup || child.age;

      // First try new format
      const newFormatMonths = getMonthsFromAgeValue(ageGroup);
      if (newFormatMonths !== 24 || ALL_AGE_OPTIONS.some((opt) => opt.value === ageGroup)) {
        return sum + newFormatMonths;
      }

      // Fall back to legacy mapping
      return sum + (legacyAgeGroupMap[ageGroup] || 24);
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
        setLoading(false);
        return;
      }

      // Get current user's profile with filter preferences
      const { data: currentProfile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        console.error("Error loading user profile:", profileError);
        setLoading(false);
        return;
      }

      if (!currentProfile) {
        setLoading(false);
        return;
      }
      
      setCurrentUser(currentProfile);

      // Store filters
      const userFilters: MatchingFilters = {
        showLocationFilter: currentProfile.show_location_filter || false,
        distancePreferenceKm: currentProfile.distance_preference_km || 10,
        matchAgeFilter: currentProfile.match_age_filter || false,
        ageRangeMonths: currentProfile.age_range_months || 6,
        matchInterestsFilter: currentProfile.match_interests_filter || false,
        interestsThreshold: (currentProfile as any).interests_threshold || 40,
        prioritizeLifestyle: (currentProfile as any).prioritize_lifestyle || false,
        requiredInterests: (currentProfile as any).required_interests || []
      };
      setFilters(userFilters);

      // Get profiles - exclude current user AND admin profiles AND test profiles
      // Admin profile ID to always exclude
      const ADMIN_PROFILE_ID = 'fb6eac18-8940-4f14-9cc7-8d828c21179a';
      
      let profilesQuery = supabase
        .from("profiles")
        .select("id, full_name, email, profile_photo_url, profile_photos_urls, bio, city, area, interests, children, latitude, longitude")
        .neq("id", user.id)
        .neq("id", ADMIN_PROFILE_ID) // Never show admin/Momster profile
        .eq("profile_completed", true);

      // Note: RLS policy filters by city/area, but when location filter is OFF
      // we want to show ALL profiles from Greece - we'll handle this by not filtering
      const { data: allProfiles, error: profilesError } = await profilesQuery;

      if (profilesError) throw profilesError;
      
      // Filter out test/demo/review profiles
      const filteredFromTestProfiles = (allProfiles || []).filter(profile => {
        const lowerName = (profile.full_name || '').toLowerCase();
        const lowerEmail = ((profile as any).email || '').toLowerCase();
        
        // Exclude by name pattern
        if (lowerName.includes('test') || lowerName.includes('demo') || lowerName.includes('review')) {
          return false;
        }
        
        // Exclude by email pattern
        if (lowerEmail.includes('test') || lowerEmail.includes('demo') || lowerEmail.includes('reviewer')) {
          return false;
        }
        
        return true;
      });
      
      // Get users who have already swiped "yes" on current user (they liked you!)
      const { data: usersWhoLikedYou, error: likesError } = await supabase
        .from("swipes")
        .select("from_user_id")
        .eq("to_user_id", user.id)
        .eq("choice", "yes");

      if (likesError) {
        console.error("Error fetching users who liked you:", likesError);
      }

      const likedYouUserIds = new Set((usersWhoLikedYou || []).map(s => s.from_user_id));

      // Get users that the current user has already swiped on (to exclude them)
      const { data: alreadySwipedOn, error: swipesError } = await supabase
        .from("swipes")
        .select("to_user_id")
        .eq("from_user_id", user.id);

      if (swipesError) {
        console.error("Error fetching already swiped profiles:", swipesError);
      }

      const alreadySwipedIds = new Set((alreadySwipedOn || []).map(s => s.to_user_id));

      // Get existing matches to avoid duplicate chats
      const { data: existingMatches, error: matchesError } = await supabase
        .from("matches")
        .select("user1_id, user2_id")
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

      if (matchesError) {
        console.error("Error fetching existing matches:", matchesError);
      }

      const matchedUserIds = new Set(
        (existingMatches || []).flatMap(m => 
          m.user1_id === user.id ? [m.user2_id] : [m.user1_id]
        )
      );
      // Filter out already swiped and already matched users
      let profilesWithScores: ProfileMatch[] = filteredFromTestProfiles
        .filter(profile => !alreadySwipedIds.has(profile.id) && !matchedUserIds.has(profile.id))
        .map(profile => ({
          ...profile,
          hasLikedYou: likedYouUserIds.has(profile.id)
        }));

      // Filter out profiles with empty interests or children arrays (but keep if they have photo)
      const beforeBasicFilter = profilesWithScores.length;
      profilesWithScores = profilesWithScores.filter(profile => {
        const hasInterests = profile.interests && Array.isArray(profile.interests) && profile.interests.length > 0;
        const hasChildren = profile.children && Array.isArray(profile.children) && (profile.children as any[]).length > 0;
        const hasPhoto = profile.profile_photo_url || (profile.profile_photos_urls && profile.profile_photos_urls.length > 0);
        // Must have photo and at least one of interests/children
        const passes = hasPhoto && (hasInterests || hasChildren);
        return passes;
      });
      // PROFILE-BASED LOCATION MATCHING (NO GPS!)
      // Calculate location boost based on declared city/area only
      const manualDistancePref = userFilters.distancePreferenceKm;
      
      const profilesWithLocation = profilesWithScores.map(profile => {
        const isSameArea = profile.area && currentProfile.area && 
                           profile.area.toLowerCase() === currentProfile.area.toLowerCase();
        const isSameCity = profile.city && currentProfile.city && 
                           profile.city.toLowerCase() === currentProfile.city.toLowerCase();
        
        // Distance estimation based on profile data only (no GPS)
        let distance = 9999;
        if (isSameArea) {
          distance = 1; // Same area = 🔥🔥 very close
        } else if (isSameCity) {
          distance = 10; // Same city = 🔥 close
        } else {
          // Different city - show based on distance preference
          distance = manualDistancePref >= 500 ? 100 : 200;
        }
        
        return { 
          ...profile, 
          distance,
          isSameCity: !!isSameCity,
          isSameArea: !!isSameArea,
          locationBoost: isSameArea ? 2 : (isSameCity ? 1 : 0)
        };
      });

      // APPLY LOCATION FILTER (profile-based)
      let filteredProfiles = profilesWithLocation;
      if (userFilters.showLocationFilter) {
        if (manualDistancePref >= 500) {
          // Show all profiles from Greece - no filtering
          filteredProfiles = profilesWithLocation;
        } else if (manualDistancePref >= 100) {
          // Show profiles from same city only
          filteredProfiles = profilesWithLocation.filter(profile => profile.isSameCity);
        } else if (manualDistancePref >= 20) {
          // Same city preferred
          filteredProfiles = profilesWithLocation.filter(profile => profile.isSameCity);
        } else {
          // Same area only (strict local)
          filteredProfiles = profilesWithLocation.filter(profile => profile.isSameArea);
        }
      }

      // Calculate kids age match score and APPLY AGE FILTER
      const currentUserAvgAge = getAverageChildAge(currentProfile.children);
      let profilesWithAgeScore = filteredProfiles.map(profile => {
        const profileAvgAge = getAverageChildAge(profile.children);

        // If we can't determine age for either profile, don't claim "same stage"
        if (currentUserAvgAge == null || profileAvgAge == null) {
          return { ...profile, ageMatchScore: undefined, ageDiffMonths: undefined } as any;
        }

        const ageDiff = Math.abs(profileAvgAge - currentUserAvgAge);
        const ageMatchScore = Math.max(0, 100 - ageDiff * 2);
        return { ...profile, ageMatchScore, ageDiffMonths: ageDiff };
      });

      // APPLY AGE FILTER
      if (userFilters.matchAgeFilter) {
        profilesWithAgeScore = profilesWithAgeScore.filter(profile =>
          (profile as any).ageDiffMonths != null && (profile as any).ageDiffMonths <= userFilters.ageRangeMonths
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

      // APPLY REQUIRED INTERESTS FILTER
      // If user has selected specific interests, only show profiles that have ALL of them
      if (userFilters.requiredInterests && userFilters.requiredInterests.length > 0) {
        profilesWithInterestScore = profilesWithInterestScore.filter(profile => {
          const profileInterests = profile.interests || [];
          // Check if profile has all required interests
          return userFilters.requiredInterests.every(requiredId => 
            profileInterests.some(profileInterest => 
              profileInterest.toLowerCase().includes(requiredId.replace('_', ' ').toLowerCase()) ||
              profileInterest.toLowerCase().includes(requiredId.replace('_', '-').toLowerCase()) ||
              profileInterest.toLowerCase().includes(requiredId.toLowerCase())
            )
          );
        });
      }

      // Lifestyle interest IDs for matching
      const lifestyleInterestIds = [
        'single_mom', 'working_mom', 'wfh_mom', 'stay_at_home', 'maternity_leave',
        'with_support', 'without_support', 'relaxed_mom', 'anxious_mom', 'sleep_deprived',
        'mom_studying', 'side_hustle', 'difficult_experience', 'special_needs', 'twin_mom',
        'want_understanding', 'want_connection', 'want_coffee_company'
      ];

      // Calculate lifestyle match count for each profile
      const profilesWithLifestyle = profilesWithInterestScore.map(profile => {
        const userLifestyle = currentUserInterests.filter(i => 
          lifestyleInterestIds.some(id => i.toLowerCase().includes(id.replace('_', ' ').toLowerCase()) || i.toLowerCase().includes(id.replace('_', '-').toLowerCase()))
        );
        const profileLifestyle = (profile.interests || []).filter(i => 
          lifestyleInterestIds.some(id => i.toLowerCase().includes(id.replace('_', ' ').toLowerCase()) || i.toLowerCase().includes(id.replace('_', '-').toLowerCase()))
        );
        const lifestyleMatchCount = userLifestyle.filter(ui => 
          profileLifestyle.some(pi => 
            ui.toLowerCase() === pi.toLowerCase() || 
            ui.replace(/[^\w\s]/g, '').toLowerCase() === pi.replace(/[^\w\s]/g, '').toLowerCase()
          )
        ).length;
        
        // Calculate location boost with lifestyle: same area + lifestyle = 🔥🔥🔥
        const locationBoost = profile.isSameArea && lifestyleMatchCount > 0 ? 3 :
                              profile.isSameArea ? 2 :
                              profile.isSameCity ? 1 : 0;
        
        return { ...profile, lifestyleMatchCount, locationBoost };
      });

      // Calculate overall match percentage
      // Weights: Location 40%, Kids Age 35%, Interests 25%
      // Location score based on profile data (no GPS)
      const profilesWithMatchPercentage = profilesWithLifestyle.map(profile => {
        // Location score: same area = 100, same city = 70, different = 30
        const locationScore = profile.isSameArea ? 100 : 
                              profile.isSameCity ? 70 : 30;
        
        const locationWeight = 0.40;
        const ageWeight = 0.35;
        const interestsWeight = 0.25;

        const matchPercentage = Math.round(
          (locationScore * locationWeight) +
          ((profile.ageMatchScore || 0) * ageWeight) +
          ((profile.interestsMatchScore || 0) * interestsWeight)
        );

        return { ...profile, matchPercentage };
      });

      // Default sort (recommended) - returns profiles as-is from scoring
      setProfiles(profilesWithMatchPercentage);
    } catch (error) {
      console.error("Error loading matching profiles:", error);
    } finally {
      setLoading(false);
    }
  };

  // Sort profiles based on selected sort option
  const sortedProfiles = [...profiles].sort((a, b) => {
    // ALWAYS: Users who liked you appear at the top!
    if (a.hasLikedYou && !b.hasLikedYou) return -1;
    if (!a.hasLikedYou && b.hasLikedYou) return 1;

    switch (sortBy) {
      case 'nearby':
        // Sort by location boost (profile-based, no GPS)
        const locationDiff = (b.locationBoost || 0) - (a.locationBoost || 0);
        if (locationDiff !== 0) return locationDiff;
        return (b.matchPercentage || 0) - (a.matchPercentage || 0);

      case 'lifestyle':
        // Sort by lifestyle match count
        const lifestyleDiff = (b.lifestyleMatchCount || 0) - (a.lifestyleMatchCount || 0);
        if (lifestyleDiff !== 0) return lifestyleDiff;
        return (b.matchPercentage || 0) - (a.matchPercentage || 0);

      case 'same_stage':
        // Sort by child age match score
        const ageDiff = (b.ageMatchScore || 0) - (a.ageMatchScore || 0);
        if (ageDiff !== 0) return ageDiff;
        return (b.matchPercentage || 0) - (a.matchPercentage || 0);

      case 'recommended':
      default:
        // Default sorting: location > lifestyle > age > interests
        const locDiff = (b.locationBoost || 0) - (a.locationBoost || 0);
        if (locDiff !== 0) return locDiff;
        
        const styleDiff = (b.lifestyleMatchCount || 0) - (a.lifestyleMatchCount || 0);
        if (styleDiff !== 0) return styleDiff;
        
        const aCloseAge = (a as any).ageDiffMonths <= 12;
        const bCloseAge = (b as any).ageDiffMonths <= 12;
        if (aCloseAge && !bCloseAge) return -1;
        if (!aCloseAge && bCloseAge) return 1;
        
        return (b.matchPercentage || 0) - (a.matchPercentage || 0);
    }
  });

  return { 
    profiles: sortedProfiles, 
    loading, 
    currentUser, 
    filters, 
    sortBy,
    setSortBy,
    reloadProfiles: loadMatchingProfiles 
  };
}
