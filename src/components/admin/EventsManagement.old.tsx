import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Trash2, Edit, Calendar } from "lucide-react";

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  max_attendees: number;
  is_premium: boolean;
  created_at: string;
}

export default function EventsManagement() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Partial<Event>>({});

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    // Note: events table doesn't exist yet, this is placeholder
    // You'll need to create the table first
    toast.info("Events feature coming soon!");
  };

  const handleSave = async () => {
    toast.info("Events feature will be available after database setup");
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Διαχείριση Events
            </CardTitle>
            <Button onClick={() => setIsEditing(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Νέο Event
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Coming Soon - Premium Feature</p>
            <p className="text-sm">Η διαχείριση events θα είναι διαθέσιμη σύντομα</p>
          </div>
        </CardContent>
      </Card>

      {isEditing && (
        <Card>
          <CardHeader>
            <CardTitle>Νέο Event</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Τίτλος</Label>
              <Input placeholder="π.χ. Μαμά & Bebé Yoga" />
            </div>
            <div>
              <Label>Περιγραφή</Label>
              <Textarea placeholder="Περιγραφή του event..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Ημερομηνία</Label>
                <Input type="date" />
              </div>
              <div>
                <Label>Τοποθεσία</Label>
                <Input placeholder="π.χ. Κολωνάκι, Αθήνα" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave}>Αποθήκευση</Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>Ακύρωση</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
