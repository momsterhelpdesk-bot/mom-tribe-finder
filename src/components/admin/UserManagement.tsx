import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  Ban, Search, MapPin, Calendar, Heart, AlertTriangle, ExternalLink, 
  Eye, Edit, Trash2, Save, X, User, Mail, Phone, Baby
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Profile {
  id: string;
  full_name: string;
  email: string;
  username: string | null;
  city: string;
  area: string;
  child_age_group: string;
  interests: string[];
  is_blocked: boolean;
  verified_status: boolean;
  profile_completed: boolean;
  created_at: string;
  updated_at: string | null;
  bio: string | null;
  marital_status: string | null;
  children: any;
  profile_photo_url: string | null;
  profile_photos_urls: string[] | null;
  match_preference: string | null;
  mom_badge: string | null;
}

export default function UserManagement() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [viewingProfile, setViewingProfile] = useState<Profile | null>(null);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [deleteProfile, setDeleteProfile] = useState<Profile | null>(null);
  const [saving, setSaving] = useState(false);
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
        profile.full_name?.toLowerCase().includes(term) ||
        profile.email?.toLowerCase().includes(term) ||
        profile.city?.toLowerCase().includes(term) ||
        profile.area?.toLowerCase().includes(term) ||
        profile.username?.toLowerCase().includes(term)
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
      setViewingProfile(null);
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

  const handleSaveProfile = async () => {
    if (!editingProfile) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: editingProfile.full_name,
          email: editingProfile.email,
          username: editingProfile.username,
          city: editingProfile.city,
          area: editingProfile.area,
          bio: editingProfile.bio,
          marital_status: editingProfile.marital_status,
          child_age_group: editingProfile.child_age_group,
          match_preference: editingProfile.match_preference,
          verified_status: editingProfile.verified_status,
          is_blocked: editingProfile.is_blocked,
          mom_badge: editingProfile.mom_badge,
        })
        .eq("id", editingProfile.id);

      if (error) throw error;

      await supabase.from("moderation_logs").insert({
        action: "edit_profile",
        target_type: "profile",
        target_id: editingProfile.id,
        details: { edited_fields: ["full_name", "email", "city", "area", "bio", "verified_status", "is_blocked"] }
      });

      toast({
        title: "Επιτυχία",
        description: "Το προφίλ ενημερώθηκε",
      });

      setEditingProfile(null);
      fetchProfiles();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Σφάλμα",
        description: "Αποτυχία ενημέρωσης προφίλ",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProfile = async () => {
    if (!deleteProfile) return;

    try {
      // First delete related data
      await supabase.from("swipes").delete().or(`from_user_id.eq.${deleteProfile.id},to_user_id.eq.${deleteProfile.id}`);
      await supabase.from("matches").delete().or(`user1_id.eq.${deleteProfile.id},user2_id.eq.${deleteProfile.id}`);
      await supabase.from("user_roles").delete().eq("user_id", deleteProfile.id);
      
      // Delete profile
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", deleteProfile.id);

      if (error) throw error;

      await supabase.from("moderation_logs").insert({
        action: "delete_profile",
        target_type: "profile",
        target_id: deleteProfile.id,
        details: { deleted_email: deleteProfile.email, deleted_name: deleteProfile.full_name }
      });

      toast({
        title: "Επιτυχία",
        description: "Το προφίλ διαγράφηκε",
      });

      setDeleteProfile(null);
      fetchProfiles();
    } catch (error) {
      console.error("Error deleting profile:", error);
      toast({
        title: "Σφάλμα",
        description: "Αποτυχία διαγραφής προφίλ",
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
            placeholder="Αναζήτηση με όνομα, email, username, περιοχή..."
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
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-secondary flex items-center justify-center">
                    {profile.profile_photo_url ? (
                      <img 
                        src={profile.profile_photo_url} 
                        alt={profile.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-lg">{profile.full_name}</CardTitle>
                      {profile.username && (
                        <span className="text-sm text-muted-foreground">@{profile.username}</span>
                      )}
                      {profile.verified_status && (
                        <Badge variant="default" className="bg-blue-500">✓ Verified</Badge>
                      )}
                      {profile.is_blocked && (
                        <Badge variant="destructive">
                          <Ban className="w-3 h-3 mr-1" />
                          Blocked
                        </Badge>
                      )}
                      {!profile.profile_completed && (
                        <Badge variant="secondary">Ημιτελές</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {profile.email}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {profile.city || "—"}, {profile.area || "—"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setViewingProfile(profile)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingProfile({ ...profile })}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setDeleteProfile(profile)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Baby className="w-4 h-4 text-muted-foreground" />
                  <span>{profile.child_age_group || "—"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-muted-foreground" />
                  <span>{profile.match_preference || "—"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>{new Date(profile.created_at).toLocaleDateString("el-GR")}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">ID: </span>
                  <span className="font-mono text-xs">{profile.id.slice(0, 8)}...</span>
                </div>
              </div>

              {profile.interests && profile.interests.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {profile.interests.slice(0, 5).map((interest, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {interest}
                    </Badge>
                  ))}
                  {profile.interests.length > 5 && (
                    <Badge variant="outline" className="text-xs">
                      +{profile.interests.length - 5} more
                    </Badge>
                  )}
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
                    Ban
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* View Profile Dialog */}
      <Dialog open={!!viewingProfile} onOpenChange={() => setViewingProfile(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Προφίλ: {viewingProfile?.full_name}
              {viewingProfile?.verified_status && (
                <Badge className="bg-blue-500">Verified</Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {viewingProfile && (
            <div className="space-y-6">
              {/* Photos */}
              <div className="flex gap-4 flex-wrap">
                {viewingProfile.profile_photos_urls?.map((url, idx) => (
                  <img 
                    key={idx}
                    src={url} 
                    alt={`Photo ${idx + 1}`}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                )) || (
                  viewingProfile.profile_photo_url && (
                    <img 
                      src={viewingProfile.profile_photo_url} 
                      alt="Profile"
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  )
                )}
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">ID</Label>
                  <p className="font-mono text-xs break-all">{viewingProfile.id}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Username</Label>
                  <p>{viewingProfile.username || "—"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p>{viewingProfile.email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Πόλη / Περιοχή</Label>
                  <p>{viewingProfile.city}, {viewingProfile.area}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Ηλικία Παιδιών</Label>
                  <p>{viewingProfile.child_age_group || "—"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Match Preference</Label>
                  <p>{viewingProfile.match_preference || "—"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Οικογενειακή Κατάσταση</Label>
                  <p>{viewingProfile.marital_status || "—"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Mom Badge</Label>
                  <p>{viewingProfile.mom_badge || "—"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Εγγραφή</Label>
                  <p>{new Date(viewingProfile.created_at).toLocaleString("el-GR")}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Τελευταία Ενημέρωση</Label>
                  <p>{viewingProfile.updated_at ? new Date(viewingProfile.updated_at).toLocaleString("el-GR") : "—"}</p>
                </div>
              </div>

              {/* Bio */}
              {viewingProfile.bio && (
                <div>
                  <Label className="text-muted-foreground">Bio</Label>
                  <p className="mt-1 p-3 bg-secondary/30 rounded-lg">{viewingProfile.bio}</p>
                </div>
              )}

              {/* Interests */}
              {viewingProfile.interests && viewingProfile.interests.length > 0 && (
                <div>
                  <Label className="text-muted-foreground">Ενδιαφέροντα</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {viewingProfile.interests.map((interest, idx) => (
                      <Badge key={idx} variant="secondary">{interest}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Children */}
              {viewingProfile.children && Array.isArray(viewingProfile.children) && viewingProfile.children.length > 0 && (
                <div>
                  <Label className="text-muted-foreground">Παιδιά</Label>
                  <div className="mt-2 space-y-2">
                    {viewingProfile.children.map((child: any, idx: number) => (
                      <div key={idx} className="p-2 bg-secondary/30 rounded-lg text-sm">
                        {child.name} - {child.age} - {child.gender}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Status Badges */}
              <div className="flex gap-2 flex-wrap">
                <Badge variant={viewingProfile.profile_completed ? "default" : "secondary"}>
                  {viewingProfile.profile_completed ? "Ολοκληρωμένο" : "Ημιτελές"}
                </Badge>
                <Badge variant={viewingProfile.is_blocked ? "destructive" : "outline"}>
                  {viewingProfile.is_blocked ? "Blocked" : "Active"}
                </Badge>
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setViewingProfile(null)}>
              Κλείσιμο
            </Button>
            <Button onClick={() => {
              setEditingProfile({ ...viewingProfile! });
              setViewingProfile(null);
            }}>
              <Edit className="w-4 h-4 mr-2" />
              Επεξεργασία
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Profile Dialog */}
      <Dialog open={!!editingProfile} onOpenChange={() => setEditingProfile(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Επεξεργασία Προφίλ</DialogTitle>
            <DialogDescription>
              Αλλάξτε τα στοιχεία του χρήστη
            </DialogDescription>
          </DialogHeader>
          
          {editingProfile && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Ονοματεπώνυμο</Label>
                  <Input
                    value={editingProfile.full_name}
                    onChange={(e) => setEditingProfile({ ...editingProfile, full_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input
                    value={editingProfile.username || ""}
                    onChange={(e) => setEditingProfile({ ...editingProfile, username: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    value={editingProfile.email}
                    onChange={(e) => setEditingProfile({ ...editingProfile, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Πόλη</Label>
                  <Input
                    value={editingProfile.city}
                    onChange={(e) => setEditingProfile({ ...editingProfile, city: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Περιοχή</Label>
                  <Input
                    value={editingProfile.area}
                    onChange={(e) => setEditingProfile({ ...editingProfile, area: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ηλικία Παιδιών</Label>
                  <Input
                    value={editingProfile.child_age_group}
                    onChange={(e) => setEditingProfile({ ...editingProfile, child_age_group: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Match Preference</Label>
                  <Input
                    value={editingProfile.match_preference || ""}
                    onChange={(e) => setEditingProfile({ ...editingProfile, match_preference: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Mom Badge</Label>
                  <Select
                    value={editingProfile.mom_badge || "none"}
                    onValueChange={(value) => setEditingProfile({ ...editingProfile, mom_badge: value === "none" ? null : value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Κανένα</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                      <SelectItem value="mompreneur">Mompreneur</SelectItem>
                      <SelectItem value="supermom">Super Mom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Bio</Label>
                <Textarea
                  value={editingProfile.bio || ""}
                  onChange={(e) => setEditingProfile({ ...editingProfile, bio: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={editingProfile.verified_status}
                    onCheckedChange={(checked) => setEditingProfile({ ...editingProfile, verified_status: checked })}
                  />
                  <Label>Verified</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={editingProfile.is_blocked}
                    onCheckedChange={(checked) => setEditingProfile({ ...editingProfile, is_blocked: checked })}
                  />
                  <Label>Blocked</Label>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingProfile(null)}>
              <X className="w-4 h-4 mr-2" />
              Ακύρωση
            </Button>
            <Button onClick={handleSaveProfile} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Αποθήκευση..." : "Αποθήκευση"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Block User Confirmation */}
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
            <AlertDialogCancel>Ακύρωση</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedProfile && handleBlockUser(selectedProfile.id, true)}
              className="bg-red-500 hover:bg-red-600"
            >
              Μπλοκάρισμα
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete User Confirmation */}
      <AlertDialog open={!!deleteProfile} onOpenChange={() => setDeleteProfile(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">⚠️ Διαγραφή Χρήστη</AlertDialogTitle>
            <AlertDialogDescription>
              Είστε σίγουροι ότι θέλετε να διαγράψετε οριστικά τον χρήστη <strong>{deleteProfile?.full_name}</strong> ({deleteProfile?.email});
              <br /><br />
              Αυτή η ενέργεια θα διαγράψει:
              <ul className="list-disc ml-6 mt-2">
                <li>Το προφίλ του χρήστη</li>
                <li>Όλα τα matches</li>
                <li>Όλα τα swipes</li>
                <li>Τους ρόλους του</li>
              </ul>
              <br />
              <strong className="text-destructive">Η ενέργεια δεν μπορεί να αναιρεθεί!</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Ακύρωση</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProfile}
              className="bg-red-500 hover:bg-red-600"
            >
              Διαγραφή Οριστικά
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
