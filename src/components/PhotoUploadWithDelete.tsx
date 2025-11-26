import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Camera, Trash2, ZoomIn } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PhotoUploadWithDeleteProps {
  photos: string[];
  onPhotosUpdated: () => void;
}

export function PhotoUploadWithDelete({ photos, onPhotosUpdated }: PhotoUploadWithDeleteProps) {
  const [uploading, setUploading] = useState(false);
  const [zoomedPhoto, setZoomedPhoto] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        toast.error("Please select an image file");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be smaller than 5MB");
        return;
      }

      setUploading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(filePath);

      const { data: profile } = await supabase
        .from('profiles')
        .select('profile_photos_urls')
        .eq('id', user.id)
        .single();

      const existingPhotos = profile?.profile_photos_urls || [];
      const updatedPhotos = [...existingPhotos, publicUrl];

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          profile_photos_urls: updatedPhotos,
          profile_photo_url: updatedPhotos[0]
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      toast.success("Photo uploaded! 📸");
      onPhotosUpdated();
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error("Failed to upload photo");
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

      // Try to delete from storage (may fail if file doesn't exist)
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

      toast.success("Photo deleted! 🗑️");
      onPhotosUpdated();
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast.error("Failed to delete photo");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <>
      <Card className="p-6 bg-gradient-to-br from-[#F8E9EE] to-[#F5E8F0] border-[#F3DCE5]">
        <h3 className="text-lg font-bold text-foreground mb-4">📸 Φωτογραφίες</h3>
        
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
          
          {photos.length < 6 && (
            <label className="w-full aspect-square rounded-[25px] border-2 border-dashed border-[#F3DCE5] flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-[#FDF7F9] transition-all">
              <input
                type="file"
                accept="image/*"
                className="hidden"
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
          Πάτα για zoom • {photos.length}/6 φωτογραφίες
        </p>
      </Card>

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
