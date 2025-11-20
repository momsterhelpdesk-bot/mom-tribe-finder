-- Create email_templates table for admin-editable email content
CREATE TABLE IF NOT EXISTS public.email_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_key text NOT NULL UNIQUE,
  subject_el text NOT NULL,
  subject_en text NOT NULL,
  body_el text NOT NULL,
  body_en text NOT NULL,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create user_activity table to track last activity for re-engagement
CREATE TABLE IF NOT EXISTS public.user_activity (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  last_activity_at timestamp with time zone NOT NULL DEFAULT now(),
  email_sent_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;

-- RLS Policies for email_templates
CREATE POLICY "Admins can view all email templates"
  ON public.email_templates
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert email templates"
  ON public.email_templates
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update email templates"
  ON public.email_templates
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete email templates"
  ON public.email_templates
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for user_activity
CREATE POLICY "Users can view their own activity"
  ON public.user_activity
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own activity"
  ON public.user_activity
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert user activity"
  ON public.user_activity
  FOR INSERT
  WITH CHECK (true);

-- Create trigger to update updated_at
CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Insert default email templates
INSERT INTO public.email_templates (template_key, subject_el, subject_en, body_el, body_en, description) VALUES
('welcome', 
 'Καλωσόρισες στο Momster! 🌸 Μαζί, οι μαμάδες ανθίζουν 💫',
 'Welcome to Momster! 🌸 Together, moms thrive 💫',
 'Γεια σου μαμά! 💕

Καλωσόρισες στην πιο ζεστή μαμαδίστικη κοινότητα!

Εδώ στο Momster, σε περιμένουν μαμάδες σαν κι εσένα — αληθινές, τρυφερές, χαμογελαστές — που θέλουν να μοιραστούν στιγμές, να κάνουν φίλες και να νιώσουν ότι δεν είναι ποτέ μόνες.

✨ Τι μπορείς να κάνεις από σήμερα:
• Να γνωρίσεις νέες μανούλες στην περιοχή σου
• Να συμμετέχεις σε συζητήσεις και να πάρεις στήριξη
• Να ανταλλάξεις/πουλήσεις παιδικά είδη στο Marketplace
• Να οργανώσεις playdates με ασφάλεια
• Να γεμίσεις την ημέρα σου με το Daily Boost 🌼

Χαιρόμαστε πάρα πολύ που σε έχουμε μαζί!

Together, moms thrive! 💫🌸

Με αγάπη,
Η ομάδα του Momster',
 'Hey mama! 💕

Welcome to the warmest mom community!

At Momster, you''ll find moms just like you — genuine, caring, smiling — who want to share moments, make friends and feel like they''re never alone.

✨ What you can do from today:
• Meet new moms in your area
• Join discussions and get support
• Exchange/sell kids items in the Marketplace
• Organize safe playdates
• Fill your day with Daily Boost 🌼

We''re so happy to have you with us!

Together, moms thrive! 💫🌸

With love,
The Momster Team',
 'Welcome email sent after user sign-up'),

('verification',
 'Επιβεβαίωσε τον λογαριασμό σου στο Momster 🌸',
 'Verify your Momster account 🌸',
 'Γεια σου μανούλα! 🌷

Πριν ξεκινήσεις, χρειαζόμαστε μια μικρή επιβεβαίωση.

Πάτησε εδώ για να ενεργοποιήσεις τον λογαριασμό σου:
👉 {verification_link}

Αν δεν έκανες εσύ την εγγραφή, απλά αγνόησε αυτό το email.

Με χαρά που είσαι εδώ 💕
Η ομάδα του Momster

Together, moms thrive!',
 'Hey mama! 🌷

Before you start, we need a quick verification.

Click here to activate your account:
👉 {verification_link}

If you didn''t sign up, just ignore this email.

Happy to have you here 💕
The Momster Team

Together, moms thrive!',
 'Email verification sent after sign-up'),

('reengagement',
 'Μας έλειψες στο Momster 💖',
 'We miss you at Momster 💖',
 'Γεια σου μανούλα!

Έχουμε καιρό να σε δούμε και θέλαμε να σιγουρευτούμε ότι είσαι καλά 💕

Στο Momster έχουν προστεθεί νέες μαμάδες και νέες δυνατότητες — θα χαρούμε να σε ξαναδούμε!

Μπες για ένα μικρό hello 🌸

Together, moms thrive!',
 'Hey mama!

We haven''t seen you in a while and wanted to make sure you''re okay 💕

New moms and new features have been added to Momster — we''d love to see you again!

Drop by for a quick hello 🌸

Together, moms thrive!',
 'Re-engagement email sent after 7 days of inactivity'),

('goodbye',
 'Σε ευχαριστούμε που ήσουν μέρος του Momster 🌸',
 'Thank you for being part of Momster 🌸',
 'Γλυκιά μαμά,

Λυπούμαστε που σε βλέπουμε να φεύγεις, αλλά σε ευχαριστούμε που υπήρξες μέρος της κοινότητάς μας. 💕

Αν αποφασίσεις να επιστρέψεις, θα είμαστε πάντα εδώ με ανοιχτή αγκαλιά.

Με αγάπη,
Η ομάδα του Momster

Together, moms thrive!',
 'Sweet mama,

We''re sorry to see you go, but thank you for being part of our community. 💕

If you decide to come back, we''ll always be here with open arms.

With love,
The Momster Team

Together, moms thrive!',
 'Goodbye email sent when user deletes account');