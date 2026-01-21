import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
import { el } from "date-fns/locale";
import { Calendar, MapPin, Users, Trash2, Eye } from "lucide-react";

interface MomMeet {
  id: string;
  creator_id: string;
  area: string;
  city: string;
  meet_date: string;
  meet_time: string;
  meet_type: string;
  description: string | null;
  max_participants: number;
  status: string;
  created_at: string;
  participant_count?: number;
  creator_name?: string;
}

const MEET_TYPES: Record<string, string> = {
  playdate: '🧸 Playdate',
  stroller_walk: '🚶‍♀️ Stroller walk',
  coffee: '☕ Καφές με καρότσι',
  playground: '🛝 Παιδότοπος',
  park_walk: '🌳 Βόλτα στο πάρκο',
};

export default function MomMeetsManagement() {
  const [meets, setMeets] = useState<MomMeet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMeets();
  }, []);

  const loadMeets = async () => {
    try {
      const { data, error } = await supabase
        .from("mom_meets")
        .select("*")
        .order("meet_date", { ascending: false });

      if (error) throw error;

      // Get participant counts and creator names
      const meetsWithDetails = await Promise.all((data || []).map(async (meet) => {
        const { count } = await supabase
          .from("mom_meet_participants")
          .select("*", { count: "exact", head: true })
          .eq("mom_meet_id", meet.id)
          .eq("status", "confirmed");

        const { data: creator } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", meet.creator_id)
          .single();

        return {
          ...meet,
          participant_count: (count || 0) + 1,
          creator_name: creator?.full_name || "Unknown",
        };
      }));

      setMeets(meetsWithDetails);
    } catch (error) {
      console.error("Error loading mom meets:", error);
      toast.error("Σφάλμα φόρτωσης");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (meetId: string) => {
    if (!confirm("Σίγουρα θέλεις να διαγράψεις αυτό το Mom Meet;")) return;

    try {
      const { error } = await supabase
        .from("mom_meets")
        .delete()
        .eq("id", meetId);

      if (error) throw error;
      toast.success("Διαγράφηκε");
      loadMeets();
    } catch (error) {
      console.error("Error deleting meet:", error);
      toast.error("Σφάλμα διαγραφής");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-700">Ενεργό</Badge>;
      case 'full':
        return <Badge className="bg-amber-100 text-amber-700">Πλήρες</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-700">Ακυρώθηκε</Badge>;
      case 'completed':
        return <Badge className="bg-gray-100 text-gray-700">Ολοκληρώθηκε</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Διαχείριση Mom Meets
            </CardTitle>
            <Badge variant="secondary">{meets.length} συναντήσεις</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Φόρτωση...
            </div>
          ) : meets.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Δεν υπάρχουν Mom Meets ακόμα
            </div>
          ) : (
            <div className="space-y-3">
              {meets.map((meet) => (
                <Card key={meet.id} className="bg-secondary/20">
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {MEET_TYPES[meet.meet_type] || meet.meet_type}
                          </span>
                          {getStatusBadge(meet.status)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {meet.area}, {meet.city}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(meet.meet_date), "d MMM yyyy", { locale: el })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {meet.participant_count}/{meet.max_participants}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Οργανώνει: {meet.creator_name}
                        </p>
                        {meet.description && (
                          <p className="text-sm italic">"{meet.description}"</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(meet.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
