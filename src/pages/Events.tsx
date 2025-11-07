import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Clock } from "lucide-react";
import mascot from "@/assets/mascot.jpg";

export default function Events() {
  const events = [
    {
      id: 1,
      title: "Morning Playdate at Central Park",
      date: "Tomorrow, 10:00 AM",
      location: "Central Park Playground",
      attendees: 8,
      type: "Playdate",
      organizer: "Sarah Johnson",
      description: "Bring your little ones for a fun morning at the park! We'll have snacks and coffee."
    },
    {
      id: 2,
      title: "Baby Yoga Workshop",
      date: "Friday, 2:00 PM",
      location: "Wellness Studio, Downtown",
      attendees: 12,
      type: "Workshop",
      organizer: "Maria Papadopoulou",
      description: "Certified instructor will guide us through gentle baby yoga poses."
    },
    {
      id: 3,
      title: "Mom's Coffee Meetup",
      date: "Next Monday, 11:00 AM",
      location: "Cafe Blossom",
      attendees: 6,
      type: "Meetup",
      organizer: "Emma Wilson",
      description: "Let's chat over coffee while the kids play in the cafe's play area!"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 relative">
      <img 
        src={mascot} 
        alt="Momster Mascot" 
        className="fixed top-24 right-4 w-20 h-20 opacity-20 object-contain pointer-events-none"
      />
      <div className="max-w-2xl mx-auto pt-20 pb-24 px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Pacifico', cursive" }}>
            Εκδηλώσεις
          </h1>
          <Button>Νέα Εκδήλωση</Button>
        </div>

        <div className="space-y-4">
          {events.map((event) => (
            <Card key={event.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-foreground mb-2">{event.title}</h3>
                  <Badge variant="secondary">{event.type}</Badge>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-4">{event.description}</p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>{event.date}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-primary" />
                  <span>{event.attendees} attending</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Organized by {event.organizer}
                </span>
                <Button variant="outline" size="sm">Join Event</Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="fixed bottom-20 left-0 right-0 py-3 px-4 bg-background/80 backdrop-blur-md border-t border-border">
        <div className="max-w-2xl mx-auto flex items-center justify-center gap-2">
          <img src={mascot} alt="Momster Mascot" className="w-8 h-8 object-contain" />
          <span className="text-sm text-muted-foreground">Together, moms thrive!</span>
        </div>
      </footer>
    </div>
  );
}
