-- Create app_microcopy table for editable labels/texts
CREATE TABLE public.app_microcopy (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  label text NOT NULL,
  text_el text NOT NULL DEFAULT '',
  text_en text NOT NULL DEFAULT '',
  description text,
  category text NOT NULL DEFAULT 'general',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.app_microcopy ENABLE ROW LEVEL SECURITY;

-- Anyone can read microcopy (needed for app to fetch texts)
CREATE POLICY "Anyone can read microcopy"
ON public.app_microcopy
FOR SELECT
USING (true);

-- Only admins can modify
CREATE POLICY "Admins can insert microcopy"
ON public.app_microcopy
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update microcopy"
ON public.app_microcopy
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete microcopy"
ON public.app_microcopy
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_microcopy_updated_at
BEFORE UPDATE ON public.app_microcopy
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Insert some initial entries
INSERT INTO public.app_microcopy (key, label, text_el, text_en, category, description) VALUES
('welcome_title', 'Welcome Title', 'Καλώς ήρθες στο Momster! 🤍', 'Welcome to Momster! 🤍', 'onboarding', 'Main welcome screen title'),
('welcome_subtitle', 'Welcome Subtitle', 'Η κοινότητα για μαμάδες που θέλουν να γνωρίσουν άλλες μαμάδες', 'The community for moms who want to meet other moms', 'onboarding', 'Welcome screen subtitle'),
('discover_empty', 'Discover Empty State', 'Δεν υπάρχουν άλλες μαμάδες προς το παρόν', 'No more moms available right now', 'discover', 'When no profiles to show'),
('match_celebration', 'Match Celebration', 'Ταίριασμα! 🎉', 'It''s a Match! 🎉', 'matching', 'Text shown when users match'),
('profile_bio_placeholder', 'Bio Placeholder', 'Πες μας λίγα λόγια για σένα...', 'Tell us a bit about yourself...', 'profile', 'Placeholder for bio field'),
('age_migration_title', 'Age Migration Title', 'Μικρή ενημέρωση 🤍', 'Quick update 🤍', 'popups', 'Age migration popup title'),
('age_migration_body', 'Age Migration Body', 'Ανανεώσαμε τις ηλικίες των παιδιών για πιο ταιριαστές γνωριμίες.', 'We updated child ages for better matching.', 'popups', 'Age migration popup body text');