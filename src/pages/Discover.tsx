import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, X, MapPin, User, Settings, Percent } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import mascot from "@/assets/mascot.jpg";
import MomsterMascot from "@/components/MomsterMascot";
import MomsterPopup from "@/components/MomsterPopup";
import ConfettiEffect from "@/components/ConfettiEffect";
import { useMascot } from "@/hooks/use-mascot";
import { useMatching, ProfileMatch } from "@/hooks/use-matching";
import { LocationPermissionDialog } from "@/components/LocationPermissionDialog";
import { ProfilePhotoCarousel } from "@/components/ProfilePhotoCarousel";
import { useLanguage } from "@/contexts/LanguageContext";

// Demo profile for testing UI
const demoProfile: ProfileMatch = {
  id: 'demo-123',
  full_name: 'Maria Papadopoulou',
  profile_photo_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
  profile_photos_urls: ['https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400'],
  city: 'Αθήνα',
  area: 'Κολωνάκι',
  bio: 'Μαμά ενός υπέροχου αγοριού 2 ετών! Λατρεύω τις βόλτες στο πάρκο και τις playdates. Ψάχνω για άλλες μαμάδες να μοιραστούμε εμπειρίες! 🌸',
  interests: ['Παιδική Ψυχολογία', 'Μαγείρεμα', 'Yoga', 'Ανάγνωση'],
  children: [{ name: 'Νίκος', ageGroup: '2-3 χρονών', gender: 'boy' }],
  distance: 3.5,
  latitude: null,
  longitude: null,
  matchPercentage: 85,
  commonInterestsCount: 3,
  totalInterests: 5
};

export default function Discover() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMatchVideo, setShowMatchVideo] = useState(false);
  const [showMatchConfetti, setShowMatchConfetti] = useState(false);
  const [isFirstMatch, setIsFirstMatch] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showNoMomsPopup, setShowNoMomsPopup] = useState(false);
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const [showDailyMascot, setShowDailyMascot] = useState(false);
  const [locationDenied, setLocationDenied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { mascotConfig, visible, hideMascot, showMatch, showEmptyDiscover } = useMascot();
  const { profiles, loading, currentUser } = useMatching();
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [isUserAdmin, setIsUserAdmin] = useState(false);

  // Check if current user is admin and request location
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

          // Check if we need to request location
          const { data: profile } = await supabase
            .from("profiles")
            .select("latitude, longitude")
            .eq("id", user.id)
            .maybeSingle();

          // Show location dialog if no location is set
          if (profile && !profile.latitude && !profile.longitude) {
            // Always show dialog if no location - user must accept to see matches
            setShowLocationDialog(true);
          }
        }
      } catch (error) {
        console.error("Error in checkAdminAndLocation:", error);
      }
    };
    checkAdminAndLocation();
  }, []);

  // Handle location permission
  const handleAllowLocation = async () => {
    localStorage.setItem('location_dialog_shown', 'true');
    setShowLocationDialog(false);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await supabase
              .from("profiles")
              .update({ latitude, longitude })
              .eq("id", user.id);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  };

  const handleDenyLocation = () => {
    // Don't save to localStorage - dialog will show again next visit
    setShowLocationDialog(false);
    setLocationDenied(true);
  };

  // Check if tutorial has been shown before
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('discover_tutorial_shown');
    if (!hasSeenTutorial && !loading) {
      setShowTutorial(true);
    }
  }, [loading]);

  // Show daily mascot popup (once per day)
  useEffect(() => {
    if (!loading) {
      const lastShown = localStorage.getItem('daily_mascot_shown');
      const today = new Date().toDateString();
      
      if (lastShown !== today) {
        // Delay popup so it doesn't overlap with other dialogs
        setTimeout(() => {
          if (!showLocationDialog && !showTutorial) {
            setShowDailyMascot(true);
          }
        }, 1500);
      }
    }
  }, [loading, showLocationDialog, showTutorial]);

  // Filter out current user and add demo profile
  const filteredProfiles = profiles.filter(profile => profile.id !== currentUserId);
  
  const allProfiles = [demoProfile, ...filteredProfiles];
  const currentProfile = allProfiles[currentIndex];

  const handleSwipe = async (liked: boolean) => {
    console.log(liked ? "Liked!" : "Passed");
    
    const nextIndex = currentIndex + 1;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (user && currentProfile && currentProfile.id !== 'demo-123') {
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
        } else if (data?.mutualMatch) {
          // Check if this is the first match ever
          const firstMatchShown = localStorage.getItem('first_match_confetti_shown');
          if (!firstMatchShown) {
            setIsFirstMatch(true);
            setShowMatchConfetti(true);
            localStorage.setItem('first_match_confetti_shown', 'true');
          }
          
          setShowMatchVideo(true);
          setTimeout(() => {
            setShowMatchVideo(false);
            setShowMatchConfetti(false);
            setIsFirstMatch(false);
            showMatch(() => navigate("/chats"));
          }, 3000);
        }
      } catch (error) {
        console.error('Error in handleSwipe:', error);
      }
    }
    
    if (nextIndex >= allProfiles.length) {
      setShowNoMomsPopup(true);
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
    if (!loading && allProfiles.length === 1) {
      showEmptyDiscover();
    }
  }, [allProfiles.length, loading, showEmptyDiscover]);

  // Debug logging
  // console.log("Discover render - loading:", loading, "profiles:", profiles.length, "allProfiles:", allProfiles.length, "currentIndex:", currentIndex, "currentProfile:", currentProfile?.full_name);

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

  if (!currentProfile) {
    console.log("No currentProfile - showing empty state");
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 p-4 relative flex items-center justify-center">
        <div className="max-w-md w-full text-center">
          <h1 className="text-2xl font-bold mb-6 text-foreground" style={{ fontFamily: "'Pacifico', cursive" }}>
            Ανακάλυψε Μαμάδες
          </h1>
          <Card className="p-6 bg-gradient-to-br from-primary/10 via-background to-secondary/20 border-2 border-primary/30">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full max-w-[200px] mx-auto mb-4 rounded-lg"
            >
              <source src="/videos/mascot-empty-state.mp4" type="video/mp4" />
            </video>
            <h2 className="text-xl font-semibold mb-2 text-foreground">Δεν υπάρχουν άλλες μαμάδες</h2>
            <p className="text-muted-foreground mb-4">Δοκίμασε να προσαρμόσεις τα φίλτρα σου</p>
            <Button onClick={() => navigate("/matching-filters")} size="lg" className="w-full">
              <Settings className="w-4 h-4 mr-2" />
              Ρυθμίσεις Φίλτρων
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const getLocationText = () => {
    if (currentProfile.distance && currentProfile.distance < 9999) {
      return `${currentProfile.area}, ${currentProfile.city} - ${currentProfile.distance.toFixed(1)} km`;
    }
    return `${currentProfile.area}, ${currentProfile.city}`;
  };

  const getChildrenText = () => {
    if (!currentProfile.children || !Array.isArray(currentProfile.children) || currentProfile.children.length === 0) {
      return "Χωρίς πληροφορίες παιδιών";
    }
    const childArray = currentProfile.children as any[];
    const count = childArray.length;
    const ages = childArray.map(c => c.ageGroup || c.age).join(", ");
    return `${count} ${count === 1 ? 'παιδί' : 'παιδιά'} (${ages})`;
  };

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
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 p-4 relative">
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

      <div className="max-w-md mx-auto pt-32 pb-32 space-y-6">
      <h1 className="text-2xl font-bold text-center mb-2 text-foreground" style={{ fontFamily: "'Pacifico', cursive" }}>
          Ανακάλυψε Μαμάδες
        </h1>

        {/* Likes You Counter - Shows how many moms liked you */}
        {!locationDenied && (() => {
          const likesCount = filteredProfiles.filter(p => p.hasLikedYou).length;
          return likesCount > 0 ? (
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-r from-pink-400 to-rose-400 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-pulse">
                <span className="text-lg">❤️</span>
                <span className="font-bold">{likesCount} {likesCount === 1 ? 'μαμά σε θέλει' : 'μαμάδες σε θέλουν'}!</span>
              </div>
            </div>
          ) : null;
        })()}

        {/* Location Denied - Show message and hide matches */}
        {locationDenied && (
          <Card className="p-6 bg-gradient-to-br from-primary/10 via-background to-secondary/20 border-2 border-primary/30 text-center">
            <MapPin className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2 text-foreground">
              {language === "el" 
                ? "Χρειαζόμαστε την τοποθεσία σου"
                : "We need your location"
              }
            </h2>
            <p className="text-muted-foreground mb-4">
              {language === "el"
                ? "Χωρίς πρόσβαση στην τοποθεσία δεν μπορούμε να σου δείξουμε κοντινές μαμάδες."
                : "Without location access we cannot show you nearby moms."
              }
            </p>
            <Button 
              onClick={() => {
                setLocationDenied(false);
                setShowLocationDialog(true);
              }}
              className="w-full"
            >
              <MapPin className="w-4 h-4 mr-2" />
              {language === "el" ? "Ενεργοποίηση τοποθεσίας" : "Enable location"}
            </Button>
          </Card>
        )}

        {/* Only show profile cards if location is allowed */}
        {!locationDenied && (
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
              
              {/* "Likes You" Badge - Animated badge with hearts */}
              {currentProfile.hasLikedYou && (
                <div className="absolute top-3 left-3 z-10">
                  <div className="bg-gradient-to-r from-pink-500 via-rose-400 to-pink-500 text-white rounded-full px-4 py-2 shadow-xl flex items-center gap-2 border-2 border-white/60 animate-bounce">
                    <span className="text-base animate-pulse">💕</span>
                    <span className="font-bold text-sm drop-shadow-sm">Likes you!</span>
                  </div>
                  {/* Floating hearts animation */}
                  <div className="absolute -top-2 -right-1 animate-ping">
                    <span className="text-xs">💗</span>
                  </div>
                  <div className="absolute -top-1 left-0 animate-ping delay-150">
                    <span className="text-xs">💕</span>
                  </div>
                </div>
              )}
              
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
                <h2 className="text-xl font-bold">{currentProfile.full_name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm font-semibold">{getLocationText()}</span>
                </div>
              </div>
            </div>

            <div className="p-4 space-y-3">
              {/* "She said YES!" Banner - Show before bio if this mom liked you */}
              {currentProfile.hasLikedYou && (
                <div className="bg-gradient-to-r from-pink-100 via-rose-100 to-pink-100 border-2 border-pink-300 rounded-xl p-3 text-center shadow-md">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-xl">🎀</span>
                    <span className="font-bold text-pink-600 text-sm">Αυτή η μαμά είπε ΝΑΙ για γνωριμία!</span>
                    <span className="text-xl">🎀</span>
                  </div>
                  <p className="text-xs text-pink-500 mt-1">Κάνε κι εσύ Like για να ανοίξει το Chat!</p>
                </div>
              )}

              {/* Match Stats */}
              {(currentProfile.commonInterestsCount !== undefined) && (
                <div className="flex items-center justify-between bg-gradient-to-r from-pink-50 to-purple-50 p-2 rounded-lg border border-pink-200">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-primary" />
                    <span className="text-xs font-medium text-foreground">Κοινά ενδιαφέροντα:</span>
                  </div>
                  <Badge variant="secondary" className="bg-primary/20 text-primary font-bold">
                    {currentProfile.commonInterestsCount}/{currentProfile.totalInterests || currentProfile.interests?.length || 0}
                  </Badge>
                </div>
              )}

              {/* Children Info with Icons */}
              {currentProfile.children && Array.isArray(currentProfile.children) && currentProfile.children.length > 0 && (
                <div className="bg-gradient-to-br from-pink-50 to-purple-50 p-2 rounded-lg border border-pink-200">
                  <div className="flex items-center gap-2 text-xs mb-1">
                    <User className="w-3 h-3 text-primary" />
                    <span className="font-bold text-foreground">Παιδιά:</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {currentProfile.children.map((child: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-1 bg-white/80 px-2 py-0.5 rounded-full text-xs">
                        <span>{child.gender === 'boy' ? '👦' : child.gender === 'girl' ? '👧' : '👶'}</span>
                        <span className="font-medium">{child.ageGroup || child.age}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {currentProfile.bio && (
                <p className="text-xs text-foreground/90 font-medium line-clamp-2">{currentProfile.bio}</p>
              )}

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

      {/* Tutorial Overlay */}
      {showTutorial && (
        <div 
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={() => {
            setShowTutorial(false);
            localStorage.setItem('discover_tutorial_shown', 'true');
          }}
        >
          <div className="bg-white rounded-[25px] p-6 max-w-sm text-center space-y-4">
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
            <Button className="w-full mt-4" onClick={() => {
              setShowTutorial(false);
              localStorage.setItem('discover_tutorial_shown', 'true');
            }}>
              Κατάλαβα! Ας ξεκινήσουμε 🌸
            </Button>
          </div>
        </div>
      )}

      {/* Confetti Effect for First Match */}
      <ConfettiEffect trigger={showMatchConfetti && isFirstMatch} />

      {/* Match Celebration Video */}
      {showMatchVideo && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
          {isFirstMatch && (
            <div className="absolute top-20 left-1/2 -translate-x-1/2 text-center z-10">
              <div className="bg-gradient-to-r from-pink-400 to-purple-400 text-white px-6 py-3 rounded-full shadow-lg animate-bounce">
                <span className="text-xl font-bold">🎉 Πρώτο Match! 🎉</span>
              </div>
            </div>
          )}
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

      {/* No More Moms Popup */}
      <MomsterPopup
        visible={showNoMomsPopup}
        title="Τέλος για την ώρα! ✨"
        subtitle="Έλεγξες όλες τις διαθέσιμες μαμάδες. Έλα ξανά σε λίγο ή δοκίμασε να αλλάξεις τα φίλτρα σου."
        buttonText="Ρύθμιση Φίλτρων"
        onButtonClick={() => {
          setShowNoMomsPopup(false);
          navigate("/matching-filters");
        }}
      />

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
    </div>
  );
}
