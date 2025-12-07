import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Check, X, Eye, Clock, AlertTriangle, User, Tag } from "lucide-react";
import { format } from "date-fns";

interface PhotoQueueItem {
  id: string;
  user_id: string;
  photo_url: string;
  photo_type: string;
  ai_status: string;
  manual_status: string | null;
  rejection_reason: string | null;
  detection_tags: string[];
  created_at: string;
  reviewed_at: string | null;
  profiles?: {
    full_name: string;
    username: string;
  };
}

interface RejectionReason {
  code: string;
  message_el: string;
  message_en: string;
}

const DETECTION_TAGS = [
  { value: "ai_face_detected", label: "🤖 AI Face" },
  { value: "male_face_detected", label: "👨 Male Face" },
  { value: "nudity_flag", label: "🔞 Nudity" },
  { value: "blurred_face", label: "😶‍🌫️ Blurred Face" },
  { value: "child_only", label: "👶 Child Only" },
  { value: "stock_image_pattern", label: "📷 Stock Image" },
  { value: "duplicate_photo", label: "🔄 Duplicate" },
];

export default function PhotoModeration() {
  const [photos, setPhotos] = useState<PhotoQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoQueueItem | null>(null);
  const [rejectionReasons, setRejectionReasons] = useState<RejectionReason[]>([]);
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected" | "all">("pending");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadPhotos();
    loadRejectionReasons();
  }, [filter]);

  const loadPhotos = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("photo_moderation_queue")
        .select("*")
        .order("created_at", { ascending: false });

      if (filter === "pending") {
        query = query.is("manual_status", null);
      } else if (filter !== "all") {
        query = query.eq("manual_status", filter);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch user profiles for each photo
      const photosWithProfiles = await Promise.all(
        (data || []).map(async (photo) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, username")
            .eq("id", photo.user_id)
            .single();
          return { ...photo, profiles: profile };
        })
      );

      setPhotos(photosWithProfiles);
    } catch (error) {
      console.error("Error loading photos:", error);
      toast.error("Σφάλμα φόρτωσης φωτογραφιών");
    } finally {
      setLoading(false);
    }
  };

  const loadRejectionReasons = async () => {
    const { data, error } = await supabase
      .from("photo_rejection_reasons")
      .select("*");

    if (!error && data) {
      setRejectionReasons(data);
    }
  };

  const handleApprove = async (photo: PhotoQueueItem) => {
    setProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Update moderation queue
      const { error: queueError } = await supabase
        .from("photo_moderation_queue")
        .update({
          manual_status: "approved",
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          detection_tags: selectedTags
        })
        .eq("id", photo.id);

      if (queueError) throw queueError;

      // Add photo to user's approved photos
      const { data: profile } = await supabase
        .from("profiles")
        .select("profile_photos_urls, profile_photo_url")
        .eq("id", photo.user_id)
        .single();

      const existingPhotos = profile?.profile_photos_urls || [];
      if (!existingPhotos.includes(photo.photo_url)) {
        const updatedPhotos = [...existingPhotos, photo.photo_url];
        
        await supabase
          .from("profiles")
          .update({
            profile_photos_urls: updatedPhotos,
            profile_photo_url: profile?.profile_photo_url || updatedPhotos[0]
          })
          .eq("id", photo.user_id);
      }

      // Create notification for user
      await supabase.from("notifications").insert({
        user_id: photo.user_id,
        type: "photo_approved",
        title: "Φωτογραφία εγκρίθηκε! 💕",
        message: "Τέλεια! Η φωτογραφία σου εγκρίθηκε και είναι πλέον ορατή στο προφίλ σου.",
        icon: "✅"
      });

      toast.success("Η φωτογραφία εγκρίθηκε!");
      setSelectedPhoto(null);
      setSelectedTags([]);
      loadPhotos();
    } catch (error) {
      console.error("Error approving photo:", error);
      toast.error("Σφάλμα κατά την έγκριση");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (photo: PhotoQueueItem) => {
    if (!selectedReason) {
      toast.error("Επίλεξε λόγο απόρριψης");
      return;
    }

    setProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const reason = rejectionReasons.find(r => r.code === selectedReason);

      // Update moderation queue
      const { error: queueError } = await supabase
        .from("photo_moderation_queue")
        .update({
          manual_status: "rejected",
          rejection_reason: reason?.message_el || "Η φωτογραφία δεν πληροί τις προδιαγραφές.",
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          detection_tags: selectedTags
        })
        .eq("id", photo.id);

      if (queueError) throw queueError;

      // Create notification for user
      await supabase.from("notifications").insert({
        user_id: photo.user_id,
        type: "photo_rejected",
        title: "Φωτογραφία δεν εγκρίθηκε 🩷",
        message: reason?.message_el || "Η φωτογραφία σου δεν εγκρίθηκε. Δοκίμασε μία καθαρή, φυσική φωτογραφία.",
        icon: "📷"
      });

      toast.success("Η φωτογραφία απορρίφθηκε");
      setSelectedPhoto(null);
      setSelectedReason("");
      setSelectedTags([]);
      loadPhotos();
    } catch (error) {
      console.error("Error rejecting photo:", error);
      toast.error("Σφάλμα κατά την απόρριψη");
    } finally {
      setProcessing(false);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const pendingCount = photos.filter(p => !p.manual_status).length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Photo Moderation Queue
              {pendingCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {pendingCount} pending
                </Badge>
              )}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <TabsList className="mb-4">
              <TabsTrigger value="pending" className="gap-2">
                <Clock className="w-4 h-4" />
                Pending
              </TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>

            <TabsContent value={filter} className="mt-0">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin text-4xl">🌸</div>
                  <p className="text-muted-foreground mt-2">Loading...</p>
                </div>
              ) : photos.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No photos in this category</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {photos.map((photo) => (
                    <div
                      key={photo.id}
                      className="relative group cursor-pointer"
                      onClick={() => {
                        setSelectedPhoto(photo);
                        setSelectedTags(photo.detection_tags || []);
                      }}
                    >
                      <img
                        src={photo.photo_url}
                        alt="Pending review"
                        className="w-full aspect-square object-cover rounded-lg border-2 border-border hover:border-primary transition-colors"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-2 rounded-b-lg">
                        <p className="truncate">{photo.profiles?.username || photo.profiles?.full_name || "Unknown"}</p>
                        <p className="text-[10px] opacity-70">
                          {format(new Date(photo.created_at), "dd/MM HH:mm")}
                        </p>
                      </div>
                      {photo.manual_status === "approved" && (
                        <Badge className="absolute top-2 right-2 bg-green-500">✓</Badge>
                      )}
                      {photo.manual_status === "rejected" && (
                        <Badge className="absolute top-2 right-2 bg-red-500">✗</Badge>
                      )}
                      {photo.detection_tags && photo.detection_tags.length > 0 && (
                        <Badge className="absolute top-2 left-2 bg-yellow-500 text-black">
                          <AlertTriangle className="w-3 h-3" />
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Photo Review Dialog */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Review Photo - {selectedPhoto?.profiles?.username || selectedPhoto?.profiles?.full_name}
            </DialogTitle>
          </DialogHeader>

          {selectedPhoto && (
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <img
                  src={selectedPhoto.photo_url}
                  alt="Review"
                  className="w-full rounded-lg border-2 border-border"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Submitted: {format(new Date(selectedPhoto.created_at), "dd/MM/yyyy HH:mm")}
                </p>
              </div>

              <div className="space-y-4">
                {/* Detection Tags */}
                <div>
                  <label className="text-sm font-medium flex items-center gap-2 mb-2">
                    <Tag className="w-4 h-4" />
                    Detection Tags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {DETECTION_TAGS.map((tag) => (
                      <Badge
                        key={tag.value}
                        variant={selectedTags.includes(tag.value) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleTag(tag.value)}
                      >
                        {tag.label}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Rejection Reason */}
                {selectedPhoto.manual_status !== "approved" && (
                  <div>
                    <label className="text-sm font-medium block mb-2">
                      Rejection Reason (for reject action)
                    </label>
                    <Select value={selectedReason} onValueChange={setSelectedReason}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select reason..." />
                      </SelectTrigger>
                      <SelectContent>
                        {rejectionReasons.map((reason) => (
                          <SelectItem key={reason.code} value={reason.code}>
                            {reason.code.replace(/_/g, " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedReason && (
                      <p className="text-xs text-muted-foreground mt-2 p-2 bg-secondary/20 rounded">
                        {rejectionReasons.find(r => r.code === selectedReason)?.message_el}
                      </p>
                    )}
                  </div>
                )}

                {/* Current Status */}
                {selectedPhoto.manual_status && (
                  <div className="p-3 rounded-lg bg-secondary/20">
                    <p className="text-sm font-medium">
                      Status: <Badge variant={selectedPhoto.manual_status === "approved" ? "default" : "destructive"}>
                        {selectedPhoto.manual_status}
                      </Badge>
                    </p>
                    {selectedPhoto.rejection_reason && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Reason: {selectedPhoto.rejection_reason}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            {!selectedPhoto?.manual_status && (
              <>
                <Button
                  onClick={() => selectedPhoto && handleApprove(selectedPhoto)}
                  disabled={processing}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Approve
                </Button>
                <Button
                  onClick={() => selectedPhoto && handleReject(selectedPhoto)}
                  disabled={processing || !selectedReason}
                  variant="destructive"
                >
                  <X className="w-4 h-4 mr-2" />
                  Reject
                </Button>
              </>
            )}
            <Button variant="outline" onClick={() => setSelectedPhoto(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}