import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, X, MapPin, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import mascot from "@/assets/mascot.jpg";
import MomsterMascot from "@/components/MomsterMascot";
import { useMascot } from "@/hooks/use-mascot";

export default function Discover() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMatchVideo, setShowMatchVideo] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { mascotConfig, visible, hideMascot, showMatch, showEmptyDiscover } = useMascot();

  const profiles = [
    {
      id: 1,
      name: "Sarah Johnson",
      age: 32,
      location: "Downtown, 2 km away",
      children: "2 kids (3 & 5 years old)",
      interests: ["Playground dates", "Organic food", "Yoga"],
      bio: "Looking for mom friends who love outdoor activities! Always up for a coffee while the kids play.",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400"
    },
    {
      id: 2,
      name: "Maria Papadopoulou",
      age: 29,
      location: "Kolonaki, 1.5 km away",
      children: "1 kid (18 months)",
      interests: ["Baby yoga", "Cooking", "Museums"],
      bio: "New mom looking to connect with other mamas in the area. Love trying new cafes and baby-friendly activities!",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400"
    }
  ];

  const currentProfile = profiles[currentIndex];

  const handleSwipe = async (liked: boolean) => {
    console.log(liked ? "Liked!" : "Passed");
    
    const nextIndex = currentIndex + 1;
    
    if (liked) {
      // Create match in database
      const { data: { user } } = await supabase.auth.getUser();
      if (user && currentProfile) {
        // In a real app, you'd check if other user also liked
        // For demo, we'll simulate mutual match (50% chance)
        const isMutualMatch = Math.random() > 0.5;
        
        if (isMutualMatch) {
          // Create match record
          const { error } = await supabase
            .from("matches")
            .insert([{
              user1_id: user.id,
              user2_id: currentProfile.id.toString()
            }]);

          if (!error) {
            setShowMatchVideo(true);
            setTimeout(() => {
              setShowMatchVideo(false);
              showMatch(() => navigate("/chats"));
            }, 3000);
          }
        }
      }
    }
    
    if (nextIndex >= profiles.length) {
      // Show empty state
      showEmptyDiscover();
      setTimeout(() => {
        setCurrentIndex(0); // Reset to beginning
      }, 3000);
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
    if (profiles.length === 0) {
      showEmptyDiscover();
    }
  }, [profiles.length, showEmptyDiscover]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 p-4 relative">
      <img 
        src={mascot} 
        alt="Momster Mascot" 
        className="fixed top-24 right-4 w-20 h-20 opacity-20 object-contain pointer-events-none animate-[bounce_3s_ease-in-out_infinite]"
      />
      <div className="max-w-md mx-auto pt-20 pb-24">
        <h1 className="text-2xl font-bold text-center mb-6 text-foreground" style={{ fontFamily: "'Pacifico', cursive" }}>
          Ανακάλυψε Μαμάδες
        </h1>

        <Card 
          ref={cardRef}
          className="overflow-hidden shadow-xl select-none"
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
              src={currentProfile.image}
              alt={currentProfile.name}
              className="w-full h-96 object-cover pointer-events-none"
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
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 text-white">
              <h2 className="text-2xl font-bold">{currentProfile.name}, {currentProfile.age}</h2>
              <div className="flex items-center gap-2 mt-1">
                <MapPin className="w-4 h-4" />
                <span className="text-sm font-semibold">{currentProfile.location}</span>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-primary" />
              <span className="font-medium">{currentProfile.children}</span>
            </div>

            <p className="text-sm text-foreground/90 font-medium">{currentProfile.bio}</p>

            <div className="flex flex-wrap gap-2">
              {currentProfile.interests.map((interest) => (
                <Badge key={interest} variant="secondary">
                  {interest}
                </Badge>
              ))}
            </div>
          </div>
        </Card>

        <div className="flex justify-center gap-8 mt-6">
          <Button
            size="lg"
            variant="outline"
            className="rounded-full h-20 px-8 border-4 border-muted hover:border-muted-foreground transition-all hover:scale-105 active:scale-95 bg-background/80 backdrop-blur-sm shadow-lg hover:shadow-xl"
            onClick={() => handleSwipe(false)}
          >
            <div className="flex flex-col items-center gap-1">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-2xl">
                🙅‍♀️
              </div>
              <span className="text-sm font-semibold text-muted-foreground">Not my vibe</span>
            </div>
          </Button>
          <Button
            size="lg"
            className="rounded-full h-20 px-8 bg-gradient-to-br from-pink-300 via-rose-300 to-pink-400 hover:from-pink-400 hover:via-rose-400 hover:to-pink-500 border-4 border-pink-200 transition-all hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl relative overflow-hidden group"
            onClick={() => handleSwipe(true)}
          >
            <div className="flex flex-col items-center gap-1 relative z-10">
              <div className="text-4xl group-hover:animate-bounce">🌸</div>
              <span className="text-sm font-bold text-white drop-shadow-md">Yes</span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-pink-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl opacity-0 group-active:opacity-100 group-active:scale-150 transition-all pointer-events-none">
              ✨
            </div>
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 py-3 px-4 bg-background/80 backdrop-blur-md border-t border-border">
        <div className="max-w-md mx-auto flex items-center justify-center gap-2">
          <img src={mascot} alt="Momster Mascot" className="w-8 h-8 object-contain" />
          <span className="text-sm text-muted-foreground">Together, moms thrive!</span>
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

      {/* Match Celebration Video */}
      {showMatchVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 animate-fade-in">
          <video
            autoPlay
            muted
            playsInline
            className="max-w-full max-h-full"
            onEnded={() => {
              setShowMatchVideo(false);
              showMatch(() => navigate("/chats"));
            }}
          >
            <source src="/videos/match-celebration.mp4" type="video/mp4" />
          </video>
        </div>
      )}
    </div>
  );
}
