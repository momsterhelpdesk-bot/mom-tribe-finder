import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, Camera, X, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PhotoUploadProps {
  onPhotoUploaded: (url: string) => void;
  currentPhotoUrl?: string;
}

const MAX_FILE_SIZE_MB = 3;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

// Compress image using canvas
const compressImage = async (file: File, maxSizeKB: number = 800): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;

      // Max dimensions
      const MAX_WIDTH = 1200;
      const MAX_HEIGHT = 1200;

      if (width > MAX_WIDTH) {
        height = (height * MAX_WIDTH) / width;
        width = MAX_WIDTH;
      }
      if (height > MAX_HEIGHT) {
        width = (width * MAX_HEIGHT) / height;
        height = MAX_HEIGHT;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Start with quality 0.8 and reduce if needed
      let quality = 0.8;
      const tryCompress = () => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Compression failed'));
              return;
            }

            if (blob.size > maxSizeKB * 1024 && quality > 0.3) {
              quality -= 0.1;
              tryCompress();
            } else {
              resolve(blob);
            }
          },
          'image/jpeg',
          quality
        );
      };

      tryCompress();
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

export const PhotoUpload = ({ onPhotoUploaded, currentPhotoUrl }: PhotoUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentPhotoUrl || null);
  const [showWarning, setShowWarning] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    // Validate files
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        toast.error("Παρακαλώ επίλεξε μόνο εικόνες");
        return;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast.error(`Κάθε αρχείο πρέπει να είναι μικρότερο από ${MAX_FILE_SIZE_MB}MB`);
        return;
      }
    }

    // Show warning dialog before upload
    setPendingFile(files[0]);
    setShowWarning(true);
    event.currentTarget.value = '';
  };

  const proceedWithUpload = async () => {
    if (!pendingFile) return;
    
    setShowWarning(false);
    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Fetch existing photos to append
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('profile_photos_urls, profile_photo_url')
        .eq('id', user.id)
        .single();
      if (profileError) throw profileError;

      // Compress image
      let fileToUpload: Blob = pendingFile;
      if (pendingFile.size > 500 * 1024) { // Compress if > 500KB
        try {
          fileToUpload = await compressImage(pendingFile);
        } catch (compressError) {
          // Compression failed, using original
        }
      }

      const fileExt = pendingFile.name.split('.').pop() || 'jpg';
      const fileName = `${user.id}-${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(filePath, fileToUpload, { upsert: true, contentType: 'image/jpeg' });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(filePath);

      // Update profile photos array and primary photo
      const existingList: string[] = Array.isArray(profileData?.profile_photos_urls)
        ? (profileData!.profile_photos_urls as any)
        : [];
      const newList = [...existingList, publicUrl];

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_photos_urls: newList, profile_photo_url: publicUrl })
        .eq('id', user.id);
      if (updateError) throw updateError;

      setPreview(publicUrl);
      onPhotoUploaded(publicUrl);
      toast.success("Η φωτογραφία ανέβηκε!");
    } catch (error) {
      console.error("Error uploading photo:", error);
      toast.error("Αποτυχία ανεβάσματος φωτογραφίας");
      setPreview(currentPhotoUrl || null);
    } finally {
      setUploading(false);
      setPendingFile(null);
    }
  };

  const handleRemove = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from('profiles')
        .update({ profile_photo_url: null })
        .eq('id', user.id);

      if (error) throw error;

      setPreview(null);
      onPhotoUploaded("");
      toast.success("Η φωτογραφία αφαιρέθηκε");
    } catch (error) {
      console.error("Error removing photo:", error);
      toast.error("Αποτυχία αφαίρεσης φωτογραφίας");
    }
  };

  return (
    <>
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Φωτογραφία Προφίλ</h3>
            {preview && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                className="text-destructive hover:text-destructive"
              >
                <X className="w-4 h-4 mr-1" />
                Αφαίρεση
              </Button>
            )}
          </div>

          {preview ? (
            <div className="relative w-48 h-48 mx-auto">
              <img
                src={preview}
                alt="Profile preview"
                className="w-full h-full object-cover rounded-full border-4 border-primary shadow-lg"
              />
            </div>
          ) : (
            <div className="w-48 h-48 mx-auto rounded-full border-4 border-dashed border-border bg-secondary/20 flex items-center justify-center">
              <Camera className="w-12 h-12 text-muted-foreground" />
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label htmlFor="photo-upload">
              <Button
                variant="outline"
                disabled={uploading}
                className="w-full"
                asChild
              >
                <span className="cursor-pointer">
                  <Upload className="w-4 h-4 mr-2" />
                  {uploading ? "Ανέβασμα..." : preview ? "Αλλαγή Φωτογραφίας" : "Ανέβασμα Φωτογραφίας"}
                </span>
              </Button>
            </label>
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              capture="user"
              className="hidden"
              onChange={handleFileSelect}
              disabled={uploading}
            />
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Μέγιστο μέγεθος: {MAX_FILE_SIZE_MB}MB. Υποστηριζόμενοι τύποι: JPG, PNG, WebP
          </p>
        </div>
      </Card>

      {/* Photo Warning Dialog */}
      <Dialog open={showWarning} onOpenChange={setShowWarning}>
        <DialogContent className="sm:max-w-md rounded-3xl border-2 border-primary/30 bg-gradient-to-br from-background via-primary/5 to-accent/10">
          <DialogHeader className="space-y-4">
            <div className="mx-auto rounded-full bg-yellow-100 p-4 w-fit">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
            <DialogTitle className="text-center text-xl font-bold text-foreground">
              Σημαντική Υπενθύμιση 🌸
            </DialogTitle>
            <DialogDescription className="text-center text-base leading-relaxed text-foreground">
              Η φωτογραφία προφίλ πρέπει να είναι:
              <br /><br />
              <strong className="text-primary">✓ Μόνο δική σου φωτογραφία</strong>
              <br />
              <strong className="text-primary">✓ Χωρίς παιδιά ή τρίτους</strong>
              <br />
              <strong className="text-primary">✓ Χωρίς ακατάλληλο περιεχόμενο</strong>
              <br /><br />
              <span className="text-sm text-muted-foreground">
                Φωτογραφίες με παιδιά, quotes, τοπία ή ακατάλληλο περιεχόμενο θα απορρίπτονται.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-col gap-3 mt-4">
            <Button
              onClick={proceedWithUpload}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-full py-6 text-lg font-semibold shadow-lg"
            >
              Κατάλαβα, συνέχεια
            </Button>
            <Button
              onClick={() => {
                setShowWarning(false);
                setPendingFile(null);
              }}
              variant="outline"
              className="w-full rounded-full py-6 text-lg border-2 border-primary/30"
            >
              Ακύρωση
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
