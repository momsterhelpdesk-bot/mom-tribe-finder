import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Ban, Search, MapPin, Calendar, Heart, AlertTriangle, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Profile {
  id: string;
  full_name: string;
  email: string;
  city: string;
  area: string;
  child_age_group: string;
  interests: string[];
  is_blocked: boolean;
  verified_status: boolean;
  profile_completed: boolean;
  created_at: string;
}

export default function UserManagement() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchProfiles();
  }, []);

  useEffect(() => {
    filterProfiles();
  }, [searchTerm, profiles]);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error("Error fetching profiles:", error);
      toast({
        title: "Σφάλμα",
        description: "Αποτυχία φόρτωσης χρηστών",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterProfiles = () => {
    if (!searchTerm.trim()) {
      setFilteredProfiles(profiles);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = profiles.filter(
      (profile) =>
        profile.full_name.toLowerCase().includes(term) ||
        profile.email.toLowerCase().includes(term) ||
        profile.city.toLowerCase().includes(term) ||
        profile.area.toLowerCase().includes(term)
    );
    setFilteredProfiles(filtered);
  };

  const handleBlockUser = async (profileId: string, block: boolean) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_blocked: block })
        .eq("id", profileId);

      if (error) throw error;

      // Log the action
      await supabase.from("moderation_logs").insert({
        action: block ? "block_user" : "unblock_user",
        target_type: "profile",
        target_id: profileId,
      });

      toast({
        title: "Επιτυχία",
        description: block ? "Ο χρήστης μπλοκαρίστηκε" : "Ο χρήστης ξεμπλοκαρίστηκε",
      });

      setSelectedProfile(null);
      fetchProfiles();
    } catch (error) {
      console.error("Error blocking user:", error);
      toast({
        title: "Σφάλμα",
        description: "Αποτυχία ενέργειας",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="text-center py-8">Φόρτωση...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Αναζήτηση με όνομα, email, περιοχή..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Badge variant="outline" className="text-sm">
          {filteredProfiles.length} χρήστες
        </Badge>
      </div>

      <div className="grid gap-4">
        {filteredProfiles.map((profile) => (
          <Card key={profile.id} className={profile.is_blocked ? "border-red-500/50 bg-red-500/5" : ""}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Link 
                      to={`/profile/${profile.id}`} 
                      className="flex items-center gap-1.5 hover:text-primary transition-colors"
                      target="_blank"
                    >
                      <CardTitle className="text-lg hover:underline">{profile.full_name}</CardTitle>
                      <ExternalLink className="w-4 h-4 opacity-50" />
                    </Link>
                    {profile.verified_status && (
                      <Badge variant="default" className="bg-blue-500">Verified</Badge>
                    )}
                    {profile.is_blocked && (
                      <Badge variant="destructive">
                        <Ban className="w-3 h-3 mr-1" />
                        Blocked
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{profile.email}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{profile.city}, {profile.area}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>{new Date(profile.created_at).toLocaleDateString("el-GR")}</span>
                </div>
              </div>

              {profile.interests && profile.interests.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {interest}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                {profile.is_blocked ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBlockUser(profile.id, false)}
                    className="border-green-500 text-green-500 hover:bg-green-500/10"
                  >
                    Unban
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setSelectedProfile(profile)}
                  >
                    <Ban className="w-4 h-4 mr-2" />
                    Ban User
                  </Button>
                )}
                <Button size="sm" variant="outline">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Warn
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={!!selectedProfile} onOpenChange={() => setSelectedProfile(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Μπλοκάρισμα Χρήστη</AlertDialogTitle>
            <AlertDialogDescription>
              Είστε σίγουροι ότι θέλετε να μπλοκάρετε τον χρήστη {selectedProfile?.full_name}; 
              Ο χρήστης δεν θα μπορεί πλέον να συνδεθεί στην εφαρμογή.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedProfile(null)}>
              Ακύρωση
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedProfile && handleBlockUser(selectedProfile.id, true)}
              className="bg-red-500 hover:bg-red-600"
            >
              Μπλοκάρισμα
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}