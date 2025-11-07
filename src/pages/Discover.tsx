import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, X, MapPin, User } from "lucide-react";
import mascot from "@/assets/mascot.jpg";

export default function Discover() {
  const [currentIndex, setCurrentIndex] = useState(0);

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

  const handleSwipe = (liked: boolean) => {
    console.log(liked ? "Liked!" : "Passed");
    setCurrentIndex((prev) => (prev + 1) % profiles.length);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 p-4 relative">
      <img 
        src={mascot} 
        alt="Momster Mascot" 
        className="fixed top-24 right-4 w-20 h-20 opacity-20 object-contain pointer-events-none"
      />
      <div className="max-w-md mx-auto pt-20 pb-24">
        <h1 className="text-2xl font-bold text-center mb-6 text-foreground" style={{ fontFamily: "'Pacifico', cursive" }}>
          Ανακάλυψε Μαμάδες
        </h1>

        <Card className="overflow-hidden shadow-xl">
          <div className="relative">
            <img
              src={currentProfile.image}
              alt={currentProfile.name}
              className="w-full h-96 object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 text-white">
              <h2 className="text-2xl font-bold">{currentProfile.name}, {currentProfile.age}</h2>
              <div className="flex items-center gap-2 mt-1">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{currentProfile.location}</span>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-primary" />
              <span className="font-medium">{currentProfile.children}</span>
            </div>

            <p className="text-sm text-muted-foreground">{currentProfile.bio}</p>

            <div className="flex flex-wrap gap-2">
              {currentProfile.interests.map((interest) => (
                <Badge key={interest} variant="secondary">
                  {interest}
                </Badge>
              ))}
            </div>
          </div>
        </Card>

        <div className="flex justify-center gap-6 mt-6">
          <Button
            size="lg"
            variant="outline"
            className="rounded-full w-16 h-16 border-2"
            onClick={() => handleSwipe(false)}
          >
            <X className="w-8 h-8 text-destructive" />
          </Button>
          <Button
            size="lg"
            className="rounded-full w-16 h-16"
            onClick={() => handleSwipe(true)}
          >
            <Heart className="w-8 h-8 fill-white" />
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
    </div>
  );
}
