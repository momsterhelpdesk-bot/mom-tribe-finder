import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Camera, Trash2, ZoomIn, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PhotoRulesPopup } from "./PhotoRulesPopup";

interface PhotoUploadWithDeleteProps {
  photos: string[];
  onPhotosUpdated: () => void;
}

// Compress image using canvas
const compressImage = async (file: File, maxWidth: number = 1080): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;

      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Compression failed'));
            return;
          }
          resolve(blob);
        },
        'image/jpeg',
        0.85
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

export function PhotoUploadWithDelete({ photos, onPhotosUpdated }: PhotoUploadWithDeleteProps) {
  const [uploading, setUploading] = useState(false);
  const [zoomedPhoto, setZoomedPhoto] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showRulesPopup, setShowRulesPopup] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [photoRulesSeen, setPhotoRulesSeen] = useState(false);
  const [pendingPhotos, setPendingPhotos] = useState<string[]>([]);

  useEffect(() => {
    checkPhotoRulesSeen();
    loadPendingPhotos();
  }, []);

  const checkPhotoRulesSeen = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('photo_rules_seen')
        .eq('id', user.id)
        .single();
      
      setPhotoRulesSeen(profile?.photo_rules_seen || false);
    }
  };

  const loadPendingPhotos = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: pending } = await supabase
        .from('photo_moderation_queue')
        .select('photo_url')
        .eq('user_id', user.id)
        .is('manual_status', null);
      
      if (pending) {
        setPendingPhotos(pending.map(p => p.photo_url));
      }
    }
  };

  const handleFileInputClick = async (e: React.MouseEvent<HTMLInputElement>) => {
    if (!photoRulesSeen) {
      e.preventDefault();
      setShowRulesPopup(true);
    }
  };

  const handleRulesAccept = async () => {
    setShowRulesPopup(false);
    setPhotoRulesSeen(true);
    
    // Update profile
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('profiles')
        .update({ photo_rules_seen: true })
        .eq('id', user.id);
    }
    
    // Trigger file input
    const input = document.getElementById('photo-upload-input') as HTMLInputElement;
    if (input) {
      input.click();
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        toast.error("Επέλεξε αρχείο εικόνας");
        return;
      }

      // 3MB limit
      if (file.size > 3 * 1024 * 1024) {
        toast.error("Η εικόνα πρέπει να είναι μικρότερη από 3MB");
        return;
      }

      setUploading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Compress image to 1080px max width
      let fileToUpload: Blob = file;
      try {
        fileToUpload = await compressImage(file, 1080);
        console.log(`Compressed from ${file.size} to ${fileToUpload.size}`);
      } catch (compressError) {
        console.warn('Compression failed, using original:', compressError);
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(filePath, fileToUpload);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(filePath);

      // Add to moderation queue (NOT to profile yet)
      const { error: queueError } = await supabase
        .from('photo_moderation_queue')
        .insert({
          user_id: user.id,
          photo_url: publicUrl,
          photo_type: 'profile',
          ai_status: 'pending',
          manual_status: null
        });

      if (queueError) throw queueError;

      toast.success("Η φωτογραφία ανέβηκε! 📸 Θα ελεγχθεί σύντομα.", {
        description: "Οι φωτογραφίες ελέγχονται αυτόματα για να κρατήσουμε την κοινότητά μας ασφαλή."
      });
      
      setPendingPhotos(prev => [...prev, publicUrl]);
      event.target.value = '';
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error("Αποτυχία μεταφόρτωσης");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (photoUrl: string) => {
    try {
      setDeleting(photoUrl);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: profile } = await supabase
        .from('profiles')
        .select('profile_photos_urls')
        .eq('id', user.id)
        .single();

      const existingPhotos = profile?.profile_photos_urls || [];
      const updatedPhotos = existingPhotos.filter((url: string) => url !== photoUrl);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          profile_photos_urls: updatedPhotos,
          profile_photo_url: updatedPhotos[0] || null
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Try to delete from storage
      try {
        const fileName = photoUrl.split('/').pop();
        if (fileName) {
          await supabase.storage
            .from('profile-photos')
            .remove([fileName]);
        }
      } catch (storageError) {
        console.log('Storage delete error (may be expected):', storageError);
      }

      toast.success("Η φωτογραφία διαγράφηκε! 🗑️");
      onPhotosUpdated();
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast.error("Αποτυχία διαγραφής");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <>
      <Card className="p-6 bg-gradient-to-br from-[#F8E9EE] to-[#F5E8F0] border-[#F3DCE5]">
        <h3 className="text-lg font-bold text-foreground mb-4">📸 Φωτογραφίες</h3>
        
        {/* Pending photos notice */}
        {pendingPhotos.length > 0 && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-sm">
            <div className="flex items-center gap-2 text-yellow-700">
              <Clock className="w-4 h-4" />
              <span>{pendingPhotos.length} φωτογραφ{pendingPhotos.length === 1 ? 'ία' : 'ίες'} σε αναμονή έγκρισης</span>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-3 gap-4 mb-4">
          {photos.map((photo, index) => (
            <div key={index} className="relative group">
              <img
                src={photo}
                alt={`Photo ${index + 1}`}
                className="w-full aspect-square object-cover rounded-[25px] cursor-pointer border-2 border-[#F3DCE5] shadow-sm transition-all hover:shadow-md"
                onClick={() => setZoomedPhoto(photo)}
              />
              <Button
                size="sm"
                variant="destructive"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-full w-8 h-8 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(photo);
                }}
                disabled={deleting === photo}
              >
                {deleting === photo ? "..." : <Trash2 className="w-4 h-4" />}
              </Button>
              <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-white/90 rounded-full p-1.5">
                  <ZoomIn className="w-4 h-4 text-primary" />
                </div>
              </div>
            </div>
          ))}
          
          {/* Pending photos preview (grayed out) */}
          {pendingPhotos.map((photo, index) => (
            <div key={`pending-${index}`} className="relative">
              <img
                src={photo}
                alt={`Pending ${index + 1}`}
                className="w-full aspect-square object-cover rounded-[25px] border-2 border-dashed border-yellow-300 opacity-60 grayscale"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-[25px]">
                <div className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Pending
                </div>
              </div>
            </div>
          ))}
          
          {photos.length + pendingPhotos.length < 6 && (
            <label className="w-full aspect-square rounded-[25px] border-2 border-dashed border-[#F3DCE5] flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-[#FDF7F9] transition-all">
              <input
                id="photo-upload-input"
                type="file"
                accept="image/*"
                className="hidden"
                onClick={handleFileInputClick}
                onChange={handleFileSelect}
                disabled={uploading}
              />
              {uploading ? (
                <div className="text-center">
                  <div className="animate-spin text-2xl mb-1">🌸</div>
                  <span className="text-xs text-muted-foreground">Uploading...</span>
                </div>
              ) : (
                <>
                  <Camera className="w-8 h-8 text-primary mb-2" />
                  <span className="text-xs text-muted-foreground">Add Photo</span>
                </>
              )}
            </label>
          )}
        </div>
        
        <p className="text-xs text-muted-foreground text-center">
          Πάτα για zoom • {photos.length}/6 εγκεκριμένες φωτογραφίες
        </p>
        <p className="text-[10px] text-muted-foreground text-center mt-1">
          Οι φωτογραφίες ελέγχονται αυτόματα για να κρατήσουμε την κοινότητά μας ασφαλή.
        </p>
      </Card>

      {/* Photo Rules Popup */}
      <PhotoRulesPopup
        open={showRulesPopup}
        onAccept={handleRulesAccept}
        onClose={() => setShowRulesPopup(false)}
      />

      {/* Zoom Dialog */}
      <Dialog open={!!zoomedPhoto} onOpenChange={() => setZoomedPhoto(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Φωτογραφία</DialogTitle>
          </DialogHeader>
          {zoomedPhoto && (
            <img
              src={zoomedPhoto}
              alt="Zoomed"
              className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
