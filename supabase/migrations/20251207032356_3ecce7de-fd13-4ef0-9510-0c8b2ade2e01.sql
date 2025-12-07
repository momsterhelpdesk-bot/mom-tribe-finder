-- Add photo_rules_seen to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS photo_rules_seen boolean DEFAULT false;

-- Add rejection_reasons enum-like table for predefined messages
CREATE TABLE IF NOT EXISTS public.photo_rejection_reasons (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code text NOT NULL UNIQUE,
  message_el text NOT NULL,
  message_en text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Insert predefined rejection reasons
INSERT INTO public.photo_rejection_reasons (code, message_el, message_en) VALUES
('no_face', 'Η φωτογραφία σου δεν έγινε δεκτή γιατί δεν φαίνεται καθαρά το πρόσωπό σου 💕 Δοκίμασε μια selfie ή φωτογραφία όπου φαίνεσαι εσύ.', 'Your photo was not accepted because your face is not clearly visible 💕 Try a selfie or a photo where you can be seen.'),
('heavy_filters', 'Η φωτογραφία έχει πολύ δυνατό φίλτρο και δεν μπορούμε να δούμε τα χαρακτηριστικά σου. Ένα πιο φυσικό look θα είναι τέλειο! ✨', 'The photo has too strong a filter and we cannot see your features. A more natural look would be perfect! ✨'),
('child_only', 'Χρειάζεται να φαίνεται ενήλικας στη φωτογραφία 🩷 Φόρτωσε μια εικόνα όπου είσαι εσύ μέσα.', 'An adult needs to be visible in the photo 🩷 Upload an image where you are in it.'),
('male_detected', 'Η φωτογραφία σου περιέχει άτομο διαφορετικού φύλου. Το Momster αφορά αποκλειστικά μαμάδες και caregivers — ανέβασε μια προσωπική φωτογραφία σου 😊.', 'Your photo contains a person of a different gender. Momster is exclusively for moms and caregivers — upload a personal photo of yourself 😊.'),
('ai_stock', 'Φαίνεται πως η φωτογραφία δημιουργήθηκε με AI ή προέρχεται από internet. Χρησιμοποίησε μια πραγματική φωτογραφία σου για την ασφάλεια όλων 💕.', 'It seems like the photo was created with AI or comes from the internet. Use a real photo of yourself for everyone''s safety 💕.'),
('inappropriate', 'Αυτή η φωτογραφία δεν ακολουθεί τις οδηγίες ασφάλειας του Momster. Διάλεξε κάτι πιο απλό και καθημερινό — θέλουμε ένα ασφαλές και ζεστό περιβάλλον 💖.', 'This photo does not follow Momster''s safety guidelines. Choose something simpler and everyday — we want a safe and warm environment 💖.'),
('personal_docs', 'Η φωτογραφία περιέχει προσωπικά στοιχεία (έγγραφα/πινακίδες). Για την προστασία σου, ανέβασε κάτι πιο ουδέτερο 🫶.', 'The photo contains personal information (documents/plates). For your protection, upload something more neutral 🫶.'),
('generic', 'Η φωτογραφία σου δεν εγκρίθηκε 🩷 Δοκίμασε μία καθαρή, φυσική φωτογραφία σου όπου φαίνεται το πρόσωπό σου.', 'Your photo was not approved 🩷 Try a clear, natural photo of yourself where your face is visible.')
ON CONFLICT (code) DO NOTHING;

-- Add detection_tags to photo_moderation_queue for admin labels
ALTER TABLE public.photo_moderation_queue ADD COLUMN IF NOT EXISTS detection_tags text[] DEFAULT '{}';

-- Enable RLS on photo_rejection_reasons
ALTER TABLE public.photo_rejection_reasons ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read rejection reasons
CREATE POLICY "Anyone can view rejection reasons"
ON public.photo_rejection_reasons FOR SELECT
USING (true);

-- Add admin policies for marketplace_notifications (for admin to view all)
CREATE POLICY "Admins can view all marketplace notifications"
ON public.marketplace_notifications FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));