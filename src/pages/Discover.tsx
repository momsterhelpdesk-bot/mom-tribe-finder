import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, X, MapPin, User, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import mascot from "@/assets/mascot.jpg";
import MomsterMascot from "@/components/MomsterMascot";
import MomsterPopup from "@/components/MomsterPopup";
import { useMascot } from "@/hooks/use-mascot";
import { useMatching } from "@/hooks/use-matching";

// Demo profile for testing UI
const demoProfile = {
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
};

export default function Discover() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMatchVideo, setShowMatchVideo] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showNoMomsPopup, setShowNoMomsPopup] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { mascotConfig, visible, hideMascot, showMatch, showEmptyDiscover } = useMascot();
  const { profiles, loading } = useMatching();
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [isUserAdmin, setIsUserAdmin] = useState(false);

  // Check if current user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        const { data: hasAdminRole } = await supabase.rpc("has_role", {
          _user_id: user.id,
          _role: "admin",
        });
        setIsUserAdmin(!!hasAdminRole);
      }
    };
    checkAdminStatus();
  }, []);

  // Check if tutorial has been shown before
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('discover_tutorial_shown');
    if (!hasSeenTutorial && !loading) {
      setShowTutorial(true);
    }
  }, [loading]);

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
        // Call edge function to check for mutual match
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
          // Show match celebration
          setShowMatchVideo(true);
          setTimeout(() => {
            setShowMatchVideo(false);
            showMatch(() => navigate("/chats"));
          }, 3000);
        }
      } catch (error) {
        console.error('Error in handleSwipe:', error);
      }
    }
    
    if (nextIndex >= allProfiles.length) {
      // Show empty state
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
      // Swipe detected
      handleSwipe(dragOffset.x > 0);
    }
    
    // Reset drag state
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
    if (!loading && allProfiles.length === 1) { // Only demo profile
      showEmptyDiscover();
    }
  }, [allProfiles.length, loading, showEmptyDiscover]);

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
    if (currentProfile.distance) {
      return `${currentProfile.area}, ${currentProfile.city} - ${currentProfile.distance} km`;
    }
    return `${currentProfile.area}, ${currentProfile.city}`;
  };

  const getChildrenText = () => {
    if (!currentProfile.children || !Array.isArray(currentProfile.children) || currentProfile.children.length === 0) {
      return "Χωρίς πληροφορίες παιδιών";
    }
    const childArray = currentProfile.children as any[];
    const count = childArray.length;
    const ages = childArray.map(c => c.ageGroup).join(", ");
    return `${count} ${count === 1 ? 'παιδί' : 'παιδιά'} (${ages})`;
  };

  const profileImage = currentProfile.profile_photos_urls && currentProfile.profile_photos_urls.length > 0
    ? currentProfile.profile_photos_urls[0]
    : currentProfile.profile_photo_url || `https://i.pravatar.cc/400?u=${currentProfile.id}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 p-4 relative">
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
            <img
              src={profileImage}
              alt={currentProfile.full_name}
              className="w-full h-56 object-cover cursor-pointer"
              onClick={() => {
                navigate(`/profile/${currentProfile.id}`);
              }}
            />
            
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
                {currentProfile.interests.slice(0, 3).map((interest) => (
                  <Badge key={interest} variant="secondary" className="text-xs px-2 py-0.5">
                    {interest}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Premium Actions */}
        <div className="flex justify-center gap-4 mt-4">
          <Button
            disabled
            size="sm"
            variant="outline"
            className="rounded-full border-2 border-[#F3DCE5] opacity-50 cursor-not-allowed"
          >
            <Heart className="w-4 h-4 mr-1" />
            Super Yes*
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
            {/* Mascot pushing the slider */}
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
              <div className="text-3xl group-hover:animate-bounce">🌸</div>
              <span className="text-xs font-bold text-white drop-shadow-md">Yes</span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-pink-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl opacity-0 group-active:opacity-100 group-active:scale-150 transition-all pointer-events-none">
              ✨
            </div>
          </Button>
        </div>
      </div>

      {/* Footer with Premium Message */}
      <footer className="fixed bottom-0 left-0 right-0 py-4 px-4 bg-[#F8E9EE]/95 backdrop-blur-md border-t border-[#F3DCE5]">
        <div className="max-w-md mx-auto text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <img src={mascot} alt="Momster Mascot" className="w-8 h-8 object-contain" />
            <span className="text-sm font-medium text-foreground">Together, moms thrive!</span>
          </div>
          <p className="text-xs text-muted-foreground">
            *Momster Perks — free for now, Premium later.
          </p>
        </div>
      </footer>

      {mascotConfig && (
        <MomsterMascot
          state={mascotConfig.state}
          message={mascotConfig.message}
          visible={visible}
          showButton={mascotConfig.showButton}
          buttonText={mascotConfig.buttonText}
          onButtonClick={mascotConfig.onButtonClick}
          duration={mascotConfig.duration}
          onHide={hideMascot}
        />
      )}

      {/* Swipe Tutorial Overlay */}
      {showTutorial && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center animate-fade-in">
          <div className="relative max-w-md w-full mx-4">
            {/* Animated arrows */}
            <div className="absolute left-8 top-1/2 -translate-y-1/2 animate-[pulse_1.5s_ease-in-out_infinite]">
              <div className="flex flex-col items-center gap-2">
                <span className="text-6xl animate-[bounce_1s_ease-in-out_infinite]">←</span>
                <span className="text-white text-sm font-bold bg-destructive/90 px-3 py-1 rounded-full shadow-lg">
                  Swipe Left
                </span>
                <span className="text-white text-xs">Not my vibe</span>
              </div>
            </div>
            
            <div className="absolute right-8 top-1/2 -translate-y-1/2 animate-[pulse_1.5s_ease-in-out_infinite] delay-75">
              <div className="flex flex-col items-center gap-2">
                <span className="text-6xl animate-[bounce_1s_ease-in-out_infinite]" style={{ animationDelay: '0.3s' }}>→</span>
                <span className="text-white text-sm font-bold bg-pink-500/90 px-3 py-1 rounded-full shadow-lg">
                  Swipe Right
                </span>
                <span className="text-white text-xs">Yes! 💕</span>
              </div>
            </div>

            {/* Central instruction */}
            <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 shadow-2xl text-center">
              <div className="mb-4">
                <span className="text-5xl">👆</span>
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2" style={{ fontFamily: "'Pacifico', cursive" }}>
                Πώς λειτουργεί;
              </h2>
              <p className="text-muted-foreground mb-6 text-sm">
                Σύρε την κάρτα αριστερά ή δεξιά<br />
                για να επιλέξεις!
              </p>
              <Button
                onClick={() => {
                  setShowTutorial(false);
                  localStorage.setItem('discover_tutorial_shown', 'true');
                }}
                className="w-full bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500 text-white font-bold rounded-full"
                size="lg"
              >
                Κατάλαβα! 🌸
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Match Celebration Video */}
      {showMatchVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 animate-fade-in">
          <video
            autoPlay
            muted
            playsInline
            className="max-w-xs max-h-[300px] rounded-lg"
            onEnded={() => {
              setShowMatchVideo(false);
              showMatch(() => navigate("/chats"));
            }}
          >
            <source src="/videos/match-celebration.mp4" type="video/mp4" />
          </video>
        </div>
      )}

      {mascotConfig && (
        <MomsterMascot
          state={mascotConfig.state}
          message={mascotConfig.message}
          visible={visible}
          showButton={mascotConfig.showButton}
          buttonText={mascotConfig.buttonText}
          onButtonClick={mascotConfig.onButtonClick}
          duration={mascotConfig.duration}
          onHide={hideMascot}
        />
      )}

      <MomsterPopup
        title="Δεν υπάρχουν νέες μαμάδες εδώ γύρω… ακόμα! 🌸"
        subtitle="Η γειτονιά είναι λίγο ήσυχη αυτή τη στιγμή, αλλά οι μαμάδες εμφανίζονται συνέχεια! ✨"
        bullets={[
          "• Μείνε συντονισμένη — νέες μαμάδες μπαίνουν κάθε μέρα 💕",
          "• Δοκίμασε ξανά σε λίγο!",
          "• Φτιάξε το προφίλ σου ακόμη πιο όμορφο ✨"
        ]}
        buttonText="Μάλιστα! 💗"
        onButtonClick={() => {
          setShowNoMomsPopup(false);
          setCurrentIndex(0);
        }}
        visible={showNoMomsPopup}
      />
    </div>
  );
}
