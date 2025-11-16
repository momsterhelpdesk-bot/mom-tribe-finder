import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Settings, MapPin, User, Heart, Calendar, ShoppingBag, LogOut } from "lucide-react";
import mascot from "@/assets/mascot.jpg";
import MomsterMascot from "@/components/MomsterMascot";
import { useMascot } from "@/hooks/use-mascot";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function Profile() {
  const { mascotConfig, visible, hideMascot, showReportThanks } = useMascot();
  const navigate = useNavigate();
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Αποσυνδέθηκες");
      navigate("/auth");
    } catch (error) {
      toast.error("Αποτυχία αποσύνδεσης");
    }
  };
  
  const profile = {
    name: "Your Name",
    age: 32,
    location: "Athens, Greece",
    children: "2 kids (3 & 5 years old)",
    interests: ["Playground dates", "Organic food", "Yoga", "Reading"],
    bio: "Mom of two looking to connect with other mamas in the area!",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200",
    stats: {
      connections: 24,
      eventsAttended: 12,
      itemsShared: 5
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 relative">
      <img 
        src={mascot} 
        alt="Momster Mascot" 
        className="fixed top-24 right-4 w-20 h-20 opacity-20 object-contain pointer-events-none"
      />
      <div className="max-w-2xl mx-auto pt-20 pb-24 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Pacifico', cursive" }}>
            Προφίλ
          </h1>
          <Button variant="outline" size="icon">
            <Settings className="w-5 h-5" />
          </Button>
        </div>

        <Card className="p-6 mb-6">
          <div className="flex flex-col items-center text-center mb-6">
            <Avatar className="w-24 h-24 mb-4">
              <AvatarImage src={profile.avatar} alt={profile.name} />
              <AvatarFallback>{profile.name[0]}</AvatarFallback>
            </Avatar>
            <h2 className="text-2xl font-bold text-foreground">{profile.name}, {profile.age}</h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <MapPin className="w-4 h-4" />
              <span>{profile.location}</span>
            </div>
          </div>

          <div className="flex justify-around py-4 border-y border-border mb-6">
            <div className="text-center">
              <div className="font-bold text-xl text-primary">{profile.stats.connections}</div>
              <div className="text-xs text-muted-foreground">Connections</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-xl text-primary">{profile.stats.eventsAttended}</div>
              <div className="text-xs text-muted-foreground">Events</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-xl text-primary">{profile.stats.itemsShared}</div>
              <div className="text-xs text-muted-foreground">Items Shared</div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-primary" />
                <span className="font-semibold text-sm">Children</span>
              </div>
              <p className="text-sm text-muted-foreground">{profile.children}</p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-4 h-4 text-primary" />
                <span className="font-semibold text-sm">About</span>
              </div>
              <p className="text-sm text-muted-foreground">{profile.bio}</p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="font-semibold text-sm">Interests</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest) => (
                  <Badge key={interest} variant="secondary">
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <Button className="w-full mt-6">Edit Profile</Button>
        </Card>

        <div className="space-y-3">
          <Button variant="outline" className="w-full justify-start" size="lg">
            <Heart className="w-5 h-5 mr-3" />
            My Favorites
          </Button>
          <Button variant="outline" className="w-full justify-start" size="lg">
            <ShoppingBag className="w-5 h-5 mr-3" />
            My Listings
          </Button>
          <Button variant="outline" className="w-full justify-start" size="lg">
            <Settings className="w-5 h-5 mr-3" />
            Settings
          </Button>
          <Button variant="destructive" className="w-full justify-start" size="lg" onClick={handleSignOut}>
            <LogOut className="w-5 h-5 mr-3" />
            Αποσύνδεση
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="fixed bottom-20 left-0 right-0 py-3 px-4 bg-background/80 backdrop-blur-md border-t border-border">
        <div className="max-w-2xl mx-auto flex items-center justify-center gap-2">
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
    </div>
  );
}
