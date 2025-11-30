import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Camera, Upload } from "lucide-react";
import { z } from "zod";

const verificationSchema = z.object({
  childNames: z.string().trim().min(1, { message: "Τα ονόματα των παιδιών είναι υποχρεωτικά" }).max(200, { message: "Τα ονόματα πρέπει να είναι μικρότερα από 200 χαρακτήρες" })
});

export default function PhotoVerification() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [childNames, setChildNames] = useState("");
  const [selfiePhoto, setSelfiePhoto] = useState<File | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string>("");
  const [existingRequest, setExistingRequest] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUserId(session.user.id);

      // Check for existing verification request
      const { data: request } = await supabase
        .from('verification_requests')
        .select('*')
        .eq('profile_id', session.user.id)
        .single();

      if (request) {
        setExistingRequest(request);
        setChildNames(request.child_names);
        setSelfiePreview(request.selfie_photo_url);
      }
    };
    checkAuth();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [navigate, stream]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      toast.error("Δεν ήταν δυνατή η πρόσβαση στην κάμερα");
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(videoRef.current, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' });
          setSelfiePhoto(file);
          setSelfiePreview(URL.createObjectURL(blob));
          
          // Stop camera
          if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
          }
        }
      }, 'image/jpeg');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelfiePhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelfiePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) return;

    if (!selfiePhoto && !selfiePreview) {
      toast.error("Παρακαλώ προσθέστε selfie φωτογραφία");
      return;
    }

    // Validate inputs
    const validation = verificationSchema.safeParse({ childNames });
    if (!validation.success) {
      const firstError = validation.error.errors[0];
      toast.error(firstError.message);
      return;
    }

    const validData = validation.data;
    setLoading(true);

    try {
      let photoUrl = selfiePreview;

      // Upload photo if new one selected
      if (selfiePhoto) {
        const fileExt = selfiePhoto.name.split('.').pop();
        const fileName = `${userId}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('selfie-photos')
          .upload(fileName, selfiePhoto, { upsert: true });

        if (uploadError) throw uploadError;

        // Use signed URL for private bucket
        const { data: signedData, error: signedError } = await supabase.storage
          .from('selfie-photos')
          .createSignedUrl(fileName, 60 * 60 * 24 * 365); // 1 year expiry

        if (signedError) throw signedError;
        
        photoUrl = signedData.signedUrl;
      }

      // Create or update verification request
      if (existingRequest) {
        const { error: updateError } = await supabase
          .from('verification_requests')
          .update({
            selfie_photo_url: photoUrl,
            child_names: validData.childNames,
            status: 'pending'
          })
          .eq('profile_id', userId);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('verification_requests')
          .insert({
            profile_id: userId,
            selfie_photo_url: photoUrl,
            child_names: validData.childNames,
            status: 'pending'
          });

        if (insertError) throw insertError;
      }

      // Update profile with selfie URL and child names
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          selfie_photo_url: photoUrl,
          child_names: validData.childNames
        })
        .eq('id', userId);

      if (profileError) throw profileError;

      toast.success("Το αίτημά σας για επαλήθευση υποβλήθηκε! Θα ενημερωθείτε σύντομα.");
      navigate("/discover");
    } catch (error: any) {
      toast.error(error.message || "Σφάλμα κατά την υποβολή");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 p-4 py-12">
      <Card className="max-w-2xl mx-auto p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Επαλήθευση Ταυτότητας</h1>
          <p className="text-muted-foreground">
            Βοηθήστε μας να κρατήσουμε την κοινότητα ασφαλή! Η επαλήθευση σάς δίνει το badge "Verified Mom" ✅
          </p>
        </div>

        {existingRequest?.status === 'pending' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800">
              Το αίτημά σας για επαλήθευση εκκρεμεί. Θα σας ενημερώσουμε σύντομα!
            </p>
          </div>
        )}

        {existingRequest?.status === 'approved' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-green-800">
              Συγχαρητήρια! Είστε Verified Mom ✅
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Selfie Photo */}
          <div className="space-y-2">
            <Label>Selfie Φωτογραφία *</Label>
            <p className="text-sm text-muted-foreground">
              Βγάλτε μια selfie για να επαληθεύσουμε την ταυτότητά σας
            </p>
            
            {!selfiePreview && !stream && (
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={startCamera}
                  className="flex-1"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Άνοιγμα Κάμερας
                </Button>
                <div className="flex-1">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="selfie-upload"
                  />
                  <Label 
                    htmlFor="selfie-upload"
                    className="flex items-center justify-center gap-2 px-4 py-2 border rounded-md cursor-pointer hover:bg-accent h-full"
                  >
                    <Upload className="w-4 h-4" />
                    Επιλέξτε Αρχείο
                  </Label>
                </div>
              </div>
            )}

            {stream && (
              <div className="space-y-2">
                <video 
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full rounded-lg"
                />
                <Button
                  type="button"
                  onClick={capturePhoto}
                  className="w-full"
                >
                  Λήψη Φωτογραφίας
                </Button>
              </div>
            )}

            {selfiePreview && (
              <div className="space-y-2">
                <img 
                  src={selfiePreview} 
                  alt="Selfie preview" 
                  className="w-full rounded-lg"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSelfiePreview("");
                    setSelfiePhoto(null);
                  }}
                  className="w-full"
                >
                  Νέα Φωτογραφία
                </Button>
              </div>
            )}
          </div>

          {/* Child Names */}
          <div className="space-y-2">
            <Label htmlFor="child-names">Ονόματα Παιδιών *</Label>
            <Input
              id="child-names"
              value={childNames}
              onChange={(e) => setChildNames(e.target.value)}
              placeholder="π.χ. Μαρία, Γιώργος"
              required
            />
            <p className="text-xs text-muted-foreground">
              Αυτά τα στοιχεία είναι εμπιστευτικά και χρησιμοποιούνται μόνο για επαλήθευση
            </p>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            size="lg"
            disabled={loading || existingRequest?.status === 'approved'}
          >
            {loading ? "Υποβολή..." : "Υποβολή για Επαλήθευση"}
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate("/discover")}
            className="w-full"
          >
            Παράλειψη προς το παρόν
          </Button>
        </form>
      </Card>
    </div>
  );
}
