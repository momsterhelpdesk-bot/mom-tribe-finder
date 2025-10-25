import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Navigation as NavigationIcon } from "lucide-react";

export default function Map() {
  const nearbyMoms = [
    {
      id: 1,
      name: "Sarah Johnson",
      distance: "0.5 km",
      children: "2 kids",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100"
    },
    {
      id: 2,
      name: "Maria Papadopoulou",
      distance: "1.2 km",
      children: "1 kid",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100"
    },
    {
      id: 3,
      name: "Emma Wilson",
      distance: "2.3 km",
      children: "3 kids",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30">
      <div className="max-w-2xl mx-auto pt-20 pb-24 px-4">
        <h1 className="text-2xl font-bold mb-6 text-foreground">Moms Near You</h1>

        {/* Map Placeholder */}
        <Card className="mb-6 h-64 flex items-center justify-center bg-secondary/20">
          <div className="text-center">
            <MapPin className="w-12 h-12 text-primary mx-auto mb-2" />
            <p className="text-muted-foreground">Interactive map coming soon</p>
            <p className="text-sm text-muted-foreground mt-1">
              View moms and events on a map
            </p>
          </div>
        </Card>

        <h2 className="text-lg font-semibold mb-4 text-foreground">Nearby Moms</h2>
        
        <div className="space-y-3">
          {nearbyMoms.map((mom) => (
            <Card key={mom.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={mom.avatar} alt={mom.name} />
                  <AvatarFallback>{mom.name[0]}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{mom.name}</h3>
                  <p className="text-sm text-muted-foreground">{mom.children}</p>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <NavigationIcon className="w-4 h-4 text-primary" />
                  <span>{mom.distance}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
