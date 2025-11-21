import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload } from "lucide-react";
import { toast } from "sonner";

interface RecipePhoto {
  id: string;
  photo_url: string;
  created_at: string;
}

interface RecipePhotosProps {
  recipeId: string;
}

export function RecipePhotos({ recipeId }: RecipePhotosProps) {
  const [photos, setPhotos] = useState<RecipePhoto[]>([]);
  const [uploading, setUploading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchPhotos();
    getCurrentUser();
  }, [recipeId]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
  };

  const fetchPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from("recipe_photos")
        .select("*")
        .eq("recipe_id", recipeId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPhotos(data || []);
    } catch (error) {
      console.error("Error fetching photos:", error);
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentUserId) {
      toast.error("Πρέπει να συνδεθείτε για να ανεβάσετε φωτογραφία");
      return;
    }

    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Παρακαλώ επιλέξτε μια εικόνα");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Η εικόνα πρέπει να είναι μικρότερη από 5MB");
      return;
    }

    setUploading(true);
    try {
      // Upload to storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${currentUserId}-${Date.now()}.${fileExt}`;
      const filePath = `recipe-photos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("profile-photos")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("profile-photos")
        .getPublicUrl(filePath);

      // Save to database
      const { error: dbError } = await supabase.from("recipe_photos").insert({
        recipe_id: recipeId,
        user_id: currentUserId,
        photo_url: publicUrl,
      });

      if (dbError) throw dbError;

      toast.success("Η φωτογραφία ανέβηκε επιτυχώς!");
      fetchPhotos();
    } catch (error: any) {
      console.error("Error uploading photo:", error);
      toast.error(error.message || "Σφάλμα κατά το ανέβασμα");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg">🖼️ Gallery Μαμάδων</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => document.getElementById("photo-upload")?.click()}
          disabled={uploading}
        >
          <Upload className="h-4 w-4 mr-2" />
          {uploading ? "Ανέβασμα..." : "Ανέβασε Φωτό"}
        </Button>
        <input
          id="photo-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handlePhotoUpload}
        />
      </div>

      {photos.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              Καμία φωτογραφία ακόμα. Ανέβασε την πρώτη!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="aspect-square rounded-lg overflow-hidden bg-muted"
            >
              <img
                src={photo.photo_url}
                alt="Recipe photo"
                className="w-full h-full object-cover hover:scale-110 transition-transform cursor-pointer"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
