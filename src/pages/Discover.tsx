import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, X, MapPin, User, Settings, Percent, Navigation, RefreshCw } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import mascot from "@/assets/mascot.jpg";
import MomsterMascot from "@/components/MomsterMascot";
import MomsterPopup from "@/components/MomsterPopup";
import ConfettiEffect from "@/components/ConfettiEffect";
import { useMascot } from "@/hooks/use-mascot";
import { useMatching, ProfileMatch, SortOption } from "@/hooks/use-matching";
import { LocationPermissionDialog } from "@/components/LocationPermissionDialog";
import { ProfilePhotoCarousel } from "@/components/ProfilePhotoCarousel";
import { useLanguage } from "@/contexts/LanguageContext";
import AgeMigrationPopup from "@/components/AgeMigrationPopup";
import { needsAgeMigration } from "@/lib/childAges";
import { toast } from "sonner";
import { useMicrocopy } from "@/hooks/use-microcopy";
import { MomCardInfo, MomCardMicroText, MomCardBio } from "@/components/MomCard";
import DiscoverEmptyState from "@/components/DiscoverEmptyState";
import AIMatchReason from "@/components/AIMatchReason";

// Demo/test profile IDs to exclude from the feed
const TEST_PROFILE_IDS = ["demo-123", "test-", "review-"];

const PULL_TO_REFRESH_THRESHOLD_PX = 72;
const MAX_PULL_PX = 96;

export default function Discover() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMatchVideo, setShowMatchVideo] = useState(false);
  const [showMatchConfetti, setShowMatchConfetti] = useState(false);
  const [isFirstMatch, setIsFirstMatch] = useState(false);
  const [showNopeEmoji, setShowNopeEmoji] = useState(false);
  const [showHeartEmoji, setShowHeartEmoji] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [reachedEndOfProfiles, setReachedEndOfProfiles] = useState(false);
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const [showDailyMascot, setShowDailyMascot] = useState(false);
  const [locationDenied, setLocationDenied] = useState(false);
  const [geolocationFailed, setGeolocationFailed] = useState(false);
  const [showManualDistance, setShowManualDistance] = useState(false);
  const [selectedManualDistance, setSelectedManualDistance] = useState<string>("");
  const [likesYouCount, setLikesYouCount] = useState(0);
  const [showAgeMigration, setShowAgeMigration] = useState(false);
  const [currentChildren, setCurrentChildren] = useState<
    Array<{ name?: string; ageGroup: string; gender?: "boy" | "girl" | "baby" }>
  >([]);

  // Pull-to-refresh gesture state
  const [pullDistance, _setPullDistance] = useState(0);
  const pullDistanceRef = useRef(0);
  const setPullDistance = (next: number) => {
    pullDistanceRef.current = next;
    _setPullDistance(next);
  };
  const pullStartRef = useRef<{ x: number; y: number } | null>(null);
  const pullingRef = useRef(false);
  const refreshingRef = useRef(false);
  const swipedThisSessionRef = useRef<Set<string>>(new Set());

  const cardRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { getText } = useMicrocopy();
  const { mascotConfig, visible, hideMascot, showMatch, showEmptyDiscover } = useMascot();
  const { profiles, loading, currentUser, sortBy, setSortBy, reloadProfiles } = useMatching();
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [isUserAdmin, setIsUserAdmin] = useState(false);

  // Check if current user is admin and request location + load likes count + check age migration
  useEffect(() => {
    const checkAdminAndLocation = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setCurrentUserId(user.id);
          const { data: hasAdminRole } = await supabase.rpc("has_role", {
            _user_id: user.id,
            _role: "admin",
          });
          setIsUserAdmin(!!hasAdminRole);

          // Load count of users who liked you (independent query)
          const { count, error: likesError } = await supabase
            .from("swipes")
            .select("*", { count: 'exact', head: true })
            .eq("to_user_id", user.id)
            .eq("choice", "yes");
          
          if (!likesError && count !== null) {
            setLikesYouCount(count);
          }

          // Check if location dialog has been shown before (tied to user account)
          const { data: profileData } = await supabase
            .from("profiles")
            .select("location_popup_shown, children, welcome_popup_shown")
            .eq("id", user.id)
            .single();
          
          // Type assertion for new column that may not be in generated types yet
          const profileDataAny = profileData as any;
          
          if (profileDataAny && profileDataAny.location_popup_shown === false) {
            // First time - show location dialog (only if explicitly false, not null/undefined)
            setShowLocationDialog(true);
          }

          // Check if swipe tutorial has been shown (first login only - user-based)
          if (profileDataAny && profileDataAny.welcome_popup_shown === false) {
            setShowTutorial(true);
          }

          // Check if age migration is needed
          if (profileDataAny) {
            const children = profileDataAny.children as Array<{ name?: string; ageGroup: string; gender?: 'boy' | 'girl' | 'baby' }> | null;
            if (children && Array.isArray(children) && children.length > 0) {
              // Check if any child has old age format
              const needsMigration = children.some(child => needsAgeMigration(child.ageGroup));
              if (needsMigration) {
                // Check if migration already done (use separate query to avoid type issues)
                const { data: migrationStatus } = await supabase
                  .from("profiles")
                  .select("age_migration_done")
                  .eq("id", user.id)
                  .single() as { data: { age_migration_done?: boolean } | null };
                
                if (!migrationStatus?.age_migration_done) {
                  setCurrentChildren(children);
                  setShowAgeMigration(true);
                }
              }
            }
          }
        }
      } catch (error) {
        console.error("Error in checkAdminAndLocation:", error);
      }
    };
    checkAdminAndLocation();
  }, []);

  // Handle location permission - using profile area only (no GPS)
  const handleAllowLocation = async () => {
    // Mark as shown in database FIRST (tied to user account)
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase
        .from("profiles")
        .update({ location_popup_shown: true })
        .eq("id", user.id);
      
      if (error) {
        console.error("Failed to update location_popup_shown:", error);
      }
    }
    setShowLocationDialog(false);
    // No GPS - just use profile area for matching
  };

  const handleDenyLocation = async () => {
    // Mark as shown in database FIRST (tied to user account)
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase
        .from("profiles")
        .update({ location_popup_shown: true })
        .eq("id", user.id);
      
      if (error) {
        console.error("Failed to update location_popup_shown:", error);
      }
    }
    setShowLocationDialog(false);
    setLocationDenied(true);
  };

  // Handle age migration save
  const handleSaveAgeMigration = async (children: Array<{ name?: string; ageGroup: string; gender?: 'boy' | 'girl' | 'baby' }>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("profiles")
        .update({
          children: children,
          child_age_group: children[0]?.ageGroup || '',
          age_migration_done: true
        })
        .eq("id", user.id);

      if (error) throw error;

      toast.success("Ευχαριστούμε! Οι ηλικίες αποθηκεύτηκαν 🤍");
      reloadProfiles(); // Refresh matching with new ages
    } catch (error) {
      console.error("Error saving age migration:", error);
      toast.error("Σφάλμα κατά την αποθήκευση");
    }
  };

  // Dismiss tutorial and mark as shown in database (user-based, not localStorage)
  const dismissTutorial = async () => {
    setShowTutorial(false);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("profiles")
          .update({ welcome_popup_shown: true })
          .eq("id", user.id);
      }
    } catch (error) {
      console.error("Error marking tutorial as shown:", error);
    }
  };

  // Filter out current user, test/demo profiles, AND profiles swiped this session
  const filteredProfiles = profiles.filter(profile => {
    // Exclude current user
    if (profile.id === currentUserId) return false;
    // Exclude test/demo profiles by ID pattern
    if (TEST_PROFILE_IDS.some(testId => profile.id.toLowerCase().includes(testId))) return false;
    // Exclude profiles with test/demo/review in their name (case insensitive)
    const lowerName = (profile.full_name || '').toLowerCase();
    if (lowerName.includes('test') || lowerName.includes('demo') || lowerName.includes('review')) return false;
    // Fallback: exclude profiles swiped in this session (even if DB query missed them)
    if (swipedThisSessionRef.current.has(profile.id)) return false;
    return true;
  });
  
  // Debug log to track filtering
  console.log("Discover profiles:", {
    totalFromHook: profiles.length,
    afterFiltering: filteredProfiles.length,
    currentUserId: currentUserId || "not set yet",
  });

  const currentProfile = filteredProfiles[currentIndex];

  // If new profiles arrive while we're "past the end" (common after refresh/new users), reset index.
  useEffect(() => {
    if (filteredProfiles.length > 0 && (reachedEndOfProfiles || currentIndex >= filteredProfiles.length)) {
      setReachedEndOfProfiles(false);
      setCurrentIndex(0);
    }
  }, [filteredProfiles.length, reachedEndOfProfiles, currentIndex]);

  // Pull to refresh handler
  const handlePullToRefresh = async () => {
    if (refreshingRef.current) return;
    refreshingRef.current = true;

    console.log("Pull to refresh triggered");
    setCurrentIndex(0);
    setReachedEndOfProfiles(false);

    try {
      await reloadProfiles();
      toast.success("Η λίστα ανανεώθηκε! 🌸");
    } finally {
      refreshingRef.current = false;
      setPullDistance(0);
      pullingRef.current = false;
      pullStartRef.current = null;
    }
  };

  const handleSwipe = async (liked: boolean) => {
    console.log(liked ? "Liked!" : "Passed");
    
    // Show quick emoji feedback
    if (!liked) {
      setShowNopeEmoji(true);
      setTimeout(() => setShowNopeEmoji(false), 400);
    }
    
    const nextIndex = currentIndex + 1;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (user && currentProfile && currentProfile.id !== 'demo-123') {
      // Add to local session tracking immediately (prevents re-show even if DB fails)
      swipedThisSessionRef.current.add(currentProfile.id);
      
      try {
        const { data, error } = await supabase.functions.invoke('check-mutual-match', {
          body: {
            fromUserId: user.id,
            toUserId: currentProfile.id,
            choice: liked ? 'yes' : 'no'
          }
        });

        if (error) {
          console.error('Error checking mutual match:', error);
          // Still show confirmation that action was recorded locally
          toast.success(liked ? "Αποθηκεύτηκε! 💕" : "Πέρασε! 🌸", { duration: 1500 });
        } else {
          // Show swipe confirmation toast
          if (!data?.mutualMatch) {
            toast.success(liked ? "Αποθηκεύτηκε! 💕" : "Πέρασε! 🌸", { duration: 1500 });
          }
          
          if (data?.mutualMatch) {
            // Check if this is the first match ever - show confetti only for first match
            const firstMatchShown = localStorage.getItem('first_match_confetti_shown');
            if (!firstMatchShown) {
              setIsFirstMatch(true);
              setShowMatchConfetti(true);
              localStorage.setItem('first_match_confetti_shown', 'true');
              setShowMatchVideo(true);
              setTimeout(() => {
                setShowMatchVideo(false);
                setShowMatchConfetti(false);
                setIsFirstMatch(false);
                showMatch(() => navigate("/chats"));
              }, 2000);
            } else {
              // Subsequent matches - just show a quick heart animation
              setShowHeartEmoji(true);
              setTimeout(() => {
                setShowHeartEmoji(false);
                showMatch(() => navigate("/chats"));
              }, 800);
            }
          }
        }
      } catch (error) {
        console.error('Error in handleSwipe:', error);
        toast.success(liked ? "Αποθηκεύτηκε! 💕" : "Πέρασε! 🌸", { duration: 1500 });
      }
    }
    
    if (nextIndex >= filteredProfiles.length) {
      setReachedEndOfProfiles(true);
    } else {
      setCurrentIndex(nextIndex);
    }
  };

  const handleDragStart = (clientX: number, clientY: number) => {
    setIsDragging(true);
    setDragStart({ x: clientX, y: clientY });
  };

  const handleDragMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    
    const deltaX = clientX - dragStart.x;
    const deltaY = clientY - dragStart.y;
    setDragOffset({ x: deltaX, y: deltaY });
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    
    const swipeThreshold = 100;
    
    if (Math.abs(dragOffset.x) > swipeThreshold) {
      handleSwipe(dragOffset.x > 0);
    }
    
    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });
  };

  const onMouseDown = (e: React.MouseEvent) => {
    handleDragStart(e.clientX, e.clientY);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    handleDragMove(e.clientX, e.clientY);
  };

  const onMouseUp = () => {
    handleDragEnd();
  };

  const onTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleDragStart(touch.clientX, touch.clientY);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleDragMove(touch.clientX, touch.clientY);
  };

  const onTouchEnd = () => {
    handleDragEnd();
  };

  // Pull-to-refresh gesture (capture phase so it can coexist with card swipe)
  const onPullTouchStartCapture = (e: React.TouchEvent) => {
    if (refreshingRef.current) return;
    if (window.scrollY > 0) return;

    const touch = e.touches[0];
    pullStartRef.current = { x: touch.clientX, y: touch.clientY };
    pullingRef.current = true;
    setPullDistance(0);
  };

  const onPullTouchMoveCapture = (e: React.TouchEvent) => {
    if (!pullingRef.current || !pullStartRef.current) return;
    if (refreshingRef.current) return;

    const touch = e.touches[0];
    const dx = touch.clientX - pullStartRef.current.x;
    const dy = touch.clientY - pullStartRef.current.y;

    // Only treat as pull-to-refresh when the intention is vertical.
    if (Math.abs(dx) > Math.abs(dy)) return;
    if (dy <= 0) {
      setPullDistance(0);
      return;
    }

    const next = Math.min(MAX_PULL_PX, dy);
    setPullDistance(next);

    // Prevent browser overscroll bounce while pulling.
    e.preventDefault();
  };

  const onPullTouchEndCapture = async () => {
    if (!pullingRef.current) return;

    const shouldRefresh = pullDistanceRef.current >= PULL_TO_REFRESH_THRESHOLD_PX;
    pullingRef.current = false;
    pullStartRef.current = null;

    if (shouldRefresh) {
      await handlePullToRefresh();
      return;
    }

    setPullDistance(0);
  };

  const getCardStyle = () => {
    const rotation = dragOffset.x * 0.1;
    const opacity = 1 - Math.abs(dragOffset.x) / 300;
    
    return {
      transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${rotation}deg)`,
      opacity: Math.max(0.5, opacity),
      transition: isDragging ? 'none' : 'transform 0.3s ease, opacity 0.3s ease',
      cursor: isDragging ? 'grabbing' : 'grab'
    };
  };

  useEffect(() => {
    if (!loading && filteredProfiles.length === 0) {
      showEmptyDiscover();
    }
  }, [filteredProfiles.length, loading, showEmptyDiscover]);

  // Debug logging
  // console.log("Discover render - loading:", loading, "profiles:", profiles.length, "filteredProfiles:", filteredProfiles.length, "currentIndex:", currentIndex, "currentProfile:", currentProfile?.full_name);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center relative" style={{ background: 'linear-gradient(135deg, #F8E9EE, #F5E8F0)' }}>
        <div className="absolute inset-0 bg-pink-200/20 backdrop-blur-sm"></div>
        <div className="relative z-10 flex flex-col items-center">
          <div className="animate-spin-flower text-8xl mb-6">🌸</div>
          <p className="text-base text-muted-foreground animate-pulse font-medium">Φόρτωση προφίλ...</p>
        </div>
      </div>
    );
  }

  // Show empty state inline when no profiles available OR when user swiped through all
  if (!currentProfile || reachedEndOfProfiles) {
    console.log("No currentProfile - showing empty state inline");
    return <DiscoverEmptyState />;
  }

  // Get location text - profile based, no GPS tracking
  const getLocationText = () => {
    if (currentProfile.area) {
      return `${currentProfile.area}, ${currentProfile.city}`;
    }
    return currentProfile.city;
  };

  // Get location badge based on profile-based matching
  const getLocationBadge = () => {
    if (currentProfile.isSameArea) {
      return { text: getText("badge_same_area", "📍 Στην ίδια περιοχή"), boost: 2 };
    }
    if (currentProfile.isSameCity) {
      return { text: getText("badge_same_city", "📍 Κοντά σου"), boost: 1 };
    }
    return null;
  };

  const locationBadge = getLocationBadge();

  const getChildrenText = () => {
    if (!currentProfile.children || !Array.isArray(currentProfile.children) || currentProfile.children.length === 0) {
      return "Χωρίς πληροφορίες παιδιών";
    }
    const childArray = currentProfile.children as any[];
    const count = childArray.length;
    const ages = childArray.map(c => c.ageGroup || c.age).join(", ");
    return `${count} ${count === 1 ? 'παιδί' : 'παιδιά'} (${ages})`;
  };

  // Check if current profile has similar age children to current user
  const hasSimilarAgeChildren = () => {
    if (!currentUser?.children || !currentProfile?.children) return false;
    
    const getAgeMonths = (ageGroup: string): number => {
      // Map age groups to approximate months
      const ageMap: { [key: string]: number } = {
        'pregnant': 0, '0-3m': 2, '3-6m': 5, '6-9m': 8, '9-12m': 11,
        '1y': 12, '2y': 24, '3y': 36, '4y': 48, '5y': 60, '6y': 72,
        '7y': 84, '8y': 96, '9y': 108, '10y': 120, '11y': 132, '12y': 144,
        '13y': 156, '14y': 168, '15y': 180, '16y': 192, '17y': 204
      };
      return ageMap[ageGroup] || 24;
    };

    const userChildren = currentUser.children as any[];
    const profileChildren = currentProfile.children as any[];
    
    for (const userChild of userChildren) {
      const userAge = getAgeMonths(userChild.ageGroup || userChild.age);
      for (const profileChild of profileChildren) {
        const profileAge = getAgeMonths(profileChild.ageGroup || profileChild.age);
        // Within 12 months = similar age
        if (Math.abs(userAge - profileAge) <= 12) {
          return true;
        }
      }
    }
    return false;
  };

  // Check if current profile has similar lifestyle interests
  const lifestyleInterestIds = [
    'single_mom', 'working_mom', 'wfh_mom', 'stay_at_home', 'maternity_leave',
    'with_support', 'without_support', 'relaxed_mom', 'anxious_mom', 'sleep_deprived',
    'mom_studying', 'side_hustle', 'difficult_experience', 'special_needs', 'twin_mom',
    'want_understanding', 'want_connection', 'want_coffee_company'
  ];

  const getSimilarLifestyleInterests = () => {
    if (!currentUser?.interests || !currentProfile?.interests) return [];
    
    // Find common lifestyle interests
    const userLifestyle = currentUser.interests.filter(i => 
      lifestyleInterestIds.some(id => i.toLowerCase().includes(id.replace('_', ' ').toLowerCase()) || i.toLowerCase().includes(id.replace('_', '-').toLowerCase()))
    );
    const profileLifestyle = currentProfile.interests.filter(i => 
      lifestyleInterestIds.some(id => i.toLowerCase().includes(id.replace('_', ' ').toLowerCase()) || i.toLowerCase().includes(id.replace('_', '-').toLowerCase()))
    );

    // Find common ones
    return userLifestyle.filter(ui => 
      profileLifestyle.some(pi => 
        ui.toLowerCase() === pi.toLowerCase() || 
        ui.replace(/[^\w\s]/g, '').toLowerCase() === pi.replace(/[^\w\s]/g, '').toLowerCase()
      )
    );
  };

  const similarLifestyle = getSimilarLifestyleInterests();

  // Collect all profile photos
  const profilePhotos = (() => {
    const photos: string[] = [];
    if (currentProfile.profile_photos_urls && currentProfile.profile_photos_urls.length > 0) {
      photos.push(...currentProfile.profile_photos_urls);
    } else if (currentProfile.profile_photo_url) {
      photos.push(currentProfile.profile_photo_url);
    }
    if (photos.length === 0) {
      photos.push(`https://i.pravatar.cc/400?u=${currentProfile.id}`);
    }
    return photos;
  })();

  // Get match percentage color
  const getMatchColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-500";
    if (percentage >= 70) return "text-primary";
    if (percentage >= 50) return "text-yellow-500";
    return "text-muted-foreground";
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-background to-secondary/30 p-4 relative"
      onTouchStartCapture={onPullTouchStartCapture}
      onTouchMoveCapture={onPullTouchMoveCapture}
      onTouchEndCapture={onPullTouchEndCapture}
    >
      {/* Pull-to-refresh indicator */}
      <div
        className="fixed top-0 left-0 right-0 z-20 flex justify-center pointer-events-none"
        style={{ transform: `translateY(${Math.min(48, pullDistance)}px)` }}
        aria-hidden="true"
      >
        <div className="mt-2 rounded-full bg-background/90 border border-border shadow-sm px-3 py-1.5 flex items-center gap-2">
          <RefreshCw
            className={`w-4 h-4 text-muted-foreground ${
              pullDistance >= PULL_TO_REFRESH_THRESHOLD_PX ? "animate-spin" : ""
            }`}
          />
          <span className="text-xs text-muted-foreground">
            {pullDistance >= PULL_TO_REFRESH_THRESHOLD_PX
              ? "Άφησε για ανανέωση"
              : "Τράβηξε προς τα κάτω"}
          </span>
        </div>
      </div>

      {/* Location Permission Dialog */}
      <LocationPermissionDialog
        open={showLocationDialog}
        onAllow={handleAllowLocation}
        onDeny={handleDenyLocation}
      />

      <img 
        src={mascot} 
        alt="Momster Mascot" 
        className="fixed top-24 right-4 w-20 h-20 opacity-20 object-contain pointer-events-none animate-[bounce_3s_ease-in-out_infinite]"
      />
      
      <Button
        variant="outline"
        size="icon"
        className="fixed top-20 left-4 z-10"
        onClick={() => navigate("/matching-filters")}
      >
        <Settings className="w-4 h-4" />
      </Button>
      
      {/* Pull to Refresh Button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed top-20 left-16 z-10"
        onClick={handlePullToRefresh}
        title="Ανανέωση λίστας"
      >
        <RefreshCw className="w-4 h-4" />
      </Button>

      <div className="max-w-md mx-auto pt-32 pb-32 space-y-4">
      <h1 className="text-2xl font-bold text-center mb-2 text-foreground" style={{ fontFamily: "'Pacifico', cursive" }}>
          {getText("discover_title", "Ανακάλυψε Μαμάδες")}
        </h1>

        {/* Sorting Dropdown with active indication */}
        <div className="flex flex-col items-center gap-1">
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
            <SelectTrigger className="w-[240px] bg-background border-2 border-primary/30 shadow-sm">
              <SelectValue>
                {sortBy === 'recommended' && <span className="flex items-center gap-2">✨ Προτεινόμενες για εσένα</span>}
                {sortBy === 'nearby' && <span className="flex items-center gap-2">📍 Πιο κοντά μου</span>}
                {sortBy === 'lifestyle' && <span className="flex items-center gap-2">🤍 Παρόμοιο lifestyle</span>}
                {sortBy === 'same_stage' && <span className="flex items-center gap-2">👶 Ίδιο στάδιο</span>}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-background border-2 border-primary/20 shadow-xl z-50">
              <SelectItem value="recommended" className="cursor-pointer">
                <span className="flex items-center gap-2">
                  ✨ Προτεινόμενες για εσένα
                  {sortBy === 'recommended' && <span className="ml-auto text-primary">✓</span>}
                </span>
              </SelectItem>
              <SelectItem value="nearby" className="cursor-pointer">
                <span className="flex items-center gap-2">
                  📍 Πιο κοντά μου
                  {sortBy === 'nearby' && <span className="ml-auto text-primary">✓</span>}
                </span>
              </SelectItem>
              <SelectItem value="lifestyle" className="cursor-pointer">
                <span className="flex items-center gap-2">
                  🤍 Παρόμοιο lifestyle
                  {sortBy === 'lifestyle' && <span className="ml-auto text-primary">✓</span>}
                </span>
              </SelectItem>
              <SelectItem value="same_stage" className="cursor-pointer">
                <span className="flex items-center gap-2">
                  👶 Ίδιο στάδιο
                  {sortBy === 'same_stage' && <span className="ml-auto text-primary">✓</span>}
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {getText("sorting_hint", "Η σειρά αλλάζει — η ζεστασιά μένει 🤍")}
          </p>
        </div>

        {/* Privacy-first info banner */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            {getText("discover_matching_info", "Τα matches βασίζονται σε ό,τι έχεις επιλέξει στο προφίλ σου 🌸")}
          </p>
        </div>

        {/* Likes You Counter - Bubble style */}
        {!locationDenied && likesYouCount > 0 && (
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="bg-gradient-to-r from-pink-200 via-pink-100 to-purple-100 text-pink-700 px-5 py-2.5 rounded-full flex items-center gap-2 shadow-lg border-2 border-pink-300/50 backdrop-blur-sm animate-pulse-slow">
                <span className="text-lg">🫧</span>
                <span className="text-sm font-semibold">{likesYouCount} {getText("likes_you_message", "μαμάδες θα ήθελαν να σε γνωρίσουν!")}</span>
                <span className="text-lg">💕</span>
              </div>
              {/* Decorative bubbles */}
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-pink-200 rounded-full opacity-60 animate-bounce" style={{ animationDelay: '0.1s' }} />
              <div className="absolute -bottom-1 -left-2 w-2 h-2 bg-purple-200 rounded-full opacity-50 animate-bounce" style={{ animationDelay: '0.3s' }} />
            </div>
          </div>
        )}

        {/* Location Info Message - shown when needed */}
        {locationDenied && (
          <Card className="p-4 bg-gradient-to-br from-pink-50 to-rose-50 border-2 border-primary/30 rounded-2xl shadow-sm mb-4">
            <p className="text-sm text-muted-foreground text-center">
              {getText("location_denied_message", "Η περιοχή που έχεις δηλώσει στο προφίλ σου θα χρησιμοποιηθεί για να βρίσκεις μαμάδες κοντά σου.")}
            </p>
          </Card>
        )}

        {/* Profile cards - always show based on profile area */}
        {(
          <Card 
            ref={cardRef}
            className="overflow-hidden shadow-xl select-none rounded-[25px] border-2 border-[#F3DCE5]"
            style={getCardStyle()}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <div className="relative">
              <ProfilePhotoCarousel
                photos={profilePhotos}
                profileName={currentProfile.full_name}
                onImageClick={() => navigate(`/profile/${currentProfile.id}`)}
              />
              
              
              {/* Match Percentage Badge */}
              {currentProfile.matchPercentage && (
                <div className={`absolute top-3 ${currentProfile.hasLikedYou ? 'right-3' : 'right-3'} bg-white/95 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-lg flex items-center gap-1.5 border border-primary/20`}>
                  <Percent className={`w-4 h-4 ${getMatchColor(currentProfile.matchPercentage)}`} />
                  <span className={`font-bold text-sm ${getMatchColor(currentProfile.matchPercentage)}`}>
                    {currentProfile.matchPercentage}%
                  </span>
                </div>
              )}
              
              {/* Swipe indicators */}
              {isDragging && (
                <>
                  <div 
                    className="absolute top-1/2 left-8 -translate-y-1/2 transition-opacity"
                    style={{ opacity: Math.max(0, -dragOffset.x / 100) }}
                  >
                    <div className="bg-destructive text-destructive-foreground px-6 py-3 rounded-lg text-2xl font-bold rotate-[-20deg] border-4 border-destructive">
                      NOPE
                    </div>
                  </div>
                  <div 
                    className="absolute top-1/2 right-8 -translate-y-1/2 transition-opacity"
                    style={{ opacity: Math.max(0, dragOffset.x / 100) }}
                  >
                    <div className="bg-primary text-primary-foreground px-6 py-3 rounded-lg text-2xl font-bold rotate-[20deg] border-4 border-primary">
                      LIKE
                    </div>
                  </div>
                </>
              )}
              
              {/* Mascot pushing effect */}
              {isDragging && dragOffset.x < -50 && (
                <div 
                  className="fixed top-1/2 -translate-y-1/2 transition-all duration-200 z-50"
                  style={{ 
                    right: `${Math.min(80, Math.abs(dragOffset.x) / 2)}px`,
                    opacity: Math.min(1, Math.abs(dragOffset.x) / 100)
                  }}
                >
                  <img 
                    src={mascot} 
                    alt="Pushing left" 
                    className="w-24 h-24 object-contain animate-[bounce_0.5s_ease-in-out_infinite] -scale-x-100"
                  />
                </div>
              )}
              
              {isDragging && dragOffset.x > 50 && (
                <div 
                  className="fixed top-1/2 -translate-y-1/2 transition-all duration-200 z-50"
                  style={{ 
                    left: `${Math.min(80, dragOffset.x / 2)}px`,
                    opacity: Math.min(1, dragOffset.x / 100)
                  }}
                >
                  <img 
                    src={mascot} 
                    alt="Pushing right" 
                    className="w-24 h-24 object-contain animate-[bounce_0.5s_ease-in-out_infinite]"
                  />
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white">
                <h2 
                  className="text-xl font-bold cursor-pointer hover:underline"
                  onClick={() => navigate(`/profile/${currentProfile.id}`)}
                >
                  {currentProfile.full_name}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm font-semibold">{getLocationText()}</span>
                </div>
              </div>
            </div>

            <div className="p-4 space-y-3">
              {/* Mom Card Info - Standardized structure */}
              <MomCardInfo profile={currentProfile} currentUser={currentUser} />

              {/* Boost Badges (max 2) */}
              <div className="flex flex-wrap gap-2">
                {/* Location Badge - profile-based, no GPS */}
                {locationBadge && (
                  <Badge className={`${
                    locationBadge.boost >= 2 
                      ? 'bg-gradient-to-r from-orange-100 to-amber-100 border-orange-200 text-orange-700' 
                      : 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200 text-blue-700'
                  } text-xs`}>
                    {locationBadge.text} {locationBadge.boost >= 2 ? '🔥🔥' : '🔥'}
                  </Badge>
                )}

                {/* Similar Age Badge */}
                {hasSimilarAgeChildren() && (
                  <Badge className="bg-gradient-to-r from-purple-100 to-pink-100 border-purple-200 text-purple-700 text-xs">
                    {getText("badge_same_stage", "Στο ίδιο στάδιο ✨")}
                  </Badge>
                )}
              </div>

              {/* Bio preview with truncation */}
              <MomCardBio 
                bio={currentProfile.bio} 
                profileId={currentProfile.id} 
                maxLength={120} 
              />

              {/* Interests chips (max 4) */}
              {currentProfile.interests && currentProfile.interests.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {currentProfile.interests.slice(0, 4).map((interest) => (
                    <Badge key={interest} variant="secondary" className="text-xs px-2 py-0.5">
                      {interest}
                    </Badge>
                  ))}
                  {currentProfile.interests.length > 4 && (
                    <Badge variant="outline" className="text-xs px-2 py-0.5">
                      +{currentProfile.interests.length - 4}
                    </Badge>
                  )}
                </div>
              )}

              {/* AI-Generated Match Reason */}
              <AIMatchReason profile={currentProfile} currentUser={currentUser} />

              {/* Micro-text under card */}
              <MomCardMicroText profile={currentProfile} currentUser={currentUser} />
            </div>
          </Card>
        )}

        {/* Only show actions if location is allowed */}
        {!locationDenied && (
          <>
            {/* Premium Actions */}
            <div className="flex justify-center gap-4 mt-4">
            <Button
                disabled
                size="sm"
                variant="outline"
                className="rounded-full border-2 border-[#F3DCE5] opacity-50 cursor-not-allowed"
              >
                <Heart className="w-4 h-4 mr-1" />
                Super Mom Like*
              </Button>
              <Button
                disabled
                size="sm"
                variant="outline"
                className="rounded-full border-2 border-[#F3DCE5] opacity-50 cursor-not-allowed"
              >
                🔄 Second Chance*
              </Button>
            </div>

            {/* Daily Swipes Slider with Mascot */}
            <div className="mt-4 bg-gradient-to-br from-[#F8E9EE] to-[#F5E8F0] p-4 rounded-[20px] border border-[#F3DCE5] relative overflow-visible">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-foreground">Daily Swipes:</span>
                <span className="text-sm font-bold text-primary">∞/15</span>
              </div>
              <div className="w-full bg-white rounded-full h-3 relative">
                <div className="bg-gradient-to-r from-[#C8788D] to-[#B86B80] h-3 rounded-full w-full"></div>
                <div className="absolute -right-2 top-1/2 -translate-y-1/2 animate-bounce">
                  <img src={mascot} alt="Mascot" className="w-8 h-8 object-contain" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-2">Unlimited για αρχή!</p>
            </div>

            <div className="flex justify-center gap-6 mt-6 mb-6">
              <Button
                size="lg"
                variant="outline"
                className="rounded-full h-16 px-6 border-4 border-muted hover:border-muted-foreground transition-all hover:scale-105 active:scale-95 bg-background/80 backdrop-blur-sm shadow-lg hover:shadow-xl"
                onClick={() => handleSwipe(false)}
              >
                <div className="flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-xl">
                    🙅‍♀️
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground">Not my vibe</span>
                </div>
              </Button>
              <Button
                size="lg"
                className="rounded-full h-16 px-6 bg-gradient-to-br from-pink-300 via-rose-300 to-pink-400 hover:from-pink-400 hover:via-rose-400 hover:to-pink-500 border-4 border-pink-200 transition-all hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl relative overflow-hidden group"
                onClick={() => handleSwipe(true)}
              >
                <div className="flex flex-col items-center gap-1 relative z-10">
                  <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                    💕
                  </div>
                  <span className="text-xs font-semibold text-white drop-shadow-sm">Yes!</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="fixed bottom-16 left-0 right-0 py-3 px-4 bg-background/80 backdrop-blur-md border-t border-border">
        <div className="max-w-md mx-auto flex items-center justify-center gap-2">
          <img src={mascot} alt="Momster Mascot" className="w-8 h-8 object-contain" />
          <span className="text-sm text-muted-foreground">Together, moms thrive!</span>
        </div>
      </footer>

      {/* Mascot */}
      {mascotConfig && (
        <MomsterMascot
          message={mascotConfig.message}
          state="happy"
          visible={visible}
          onHide={hideMascot}
        />
      )}

      {/* Tutorial Overlay - First login only (user-based, stored in database) */}
      {showTutorial && (
        <div 
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={dismissTutorial}
        >
          <div className="bg-white rounded-[25px] p-6 max-w-sm text-center space-y-4 animate-scale-in">
            <h2 className="text-2xl font-bold text-primary" style={{ fontFamily: "'Pacifico', cursive" }}>
              Πώς λειτουργεί 💕
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-2xl">
                  👈
                </div>
                <p className="text-left text-sm">Σύρε αριστερά για <strong>"Not my vibe"</strong></p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center text-2xl">
                  👉
                </div>
                <p className="text-left text-sm">Σύρε δεξιά για <strong>"Yes!"</strong></p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-2xl">
                  💕
                </div>
                <p className="text-left text-sm">Αν σας αρέσετε αμοιβαία, είναι <strong>Match!</strong></p>
              </div>
            </div>
            <Button className="w-full mt-4" onClick={dismissTutorial}>
              Κατάλαβα! Ας ξεκινήσουμε 🌸
            </Button>
          </div>
        </div>
      )}

      {/* Confetti Effect for First Match */}
      <ConfettiEffect trigger={showMatchConfetti && isFirstMatch} />

      {/* Quick Nope Emoji */}
      {showNopeEmoji && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="text-6xl animate-scale-in opacity-80">🚫</div>
        </div>
      )}

      {/* Quick Heart Emoji for subsequent matches */}
      {showHeartEmoji && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none bg-black/20">
          <div className="text-8xl animate-scale-in">💕</div>
        </div>
      )}

      {/* Match Celebration Video - Only for first match */}
      {showMatchVideo && isFirstMatch && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 text-center z-10">
            <div className="bg-gradient-to-r from-pink-400 to-purple-400 text-white px-6 py-3 rounded-full shadow-lg animate-bounce">
              <span className="text-xl font-bold">🎉 Πρώτο Match! 🎉</span>
            </div>
          </div>
          <video
            autoPlay
            muted
            playsInline
            className="max-w-sm w-full rounded-lg"
          >
            <source src="/videos/match-celebration.mp4" type="video/mp4" />
          </video>
        </div>
      )}

      {/* Note: No More Moms state is now handled by DiscoverEmptyState component */}

      {/* Daily Mascot Greeting - Once per day */}
      <MomsterPopup
        visible={showDailyMascot}
        title="Καλημέρα μαμά!"
        subtitle="Είσαι έτοιμη να γνωρίσεις νέες μαμάδες σήμερα; Σύρε για να βρεις το επόμενο match σου! 💕"
        buttonText="Πάμε! 🌸"
        onButtonClick={() => {
          setShowDailyMascot(false);
          localStorage.setItem('daily_mascot_shown', new Date().toDateString());
        }}
      />

      {/* Age Migration Popup */}
      <AgeMigrationPopup
        open={showAgeMigration}
        onClose={() => setShowAgeMigration(false)}
        currentChildren={currentChildren}
        onSave={handleSaveAgeMigration}
      />
    </div>
  );
}
