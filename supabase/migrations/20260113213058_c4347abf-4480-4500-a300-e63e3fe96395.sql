-- Create table to log admin emails sent to users
CREATE TABLE public.admin_email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    recipient_user_id UUID NOT NULL,
    recipient_email TEXT NOT NULL,
    reason TEXT NOT NULL,
    template_key TEXT,
    custom_subject TEXT,
    custom_body TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.admin_email_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view/insert email logs
CREATE POLICY "Admins can view all email logs"
ON public.admin_email_logs
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert email logs"
ON public.admin_email_logs
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Add new email templates for admin communication
INSERT INTO public.email_templates (template_key, subject_el, subject_en, body_el, body_en, description)
VALUES 
  ('incomplete_profile', 'Λίγο ακόμα και είσαι μέσα 🤍', 'You are almost there 🤍', 
   'Γεια σου {user_name}! ✨

Το προφίλ σου στο Momster είναι σχεδόν έτοιμο!

Με λίγα ακόμα στοιχεία θα μπορείς να βρίσκεις μαμάδες που σου ταιριάζουν και να συμμετέχεις πιο εύκολα στην παρέα μας 🫂

Όποτε νιώσεις έτοιμη, σε περιμένουμε 🤍

Together, moms thrive! 💫
Η ομάδα του Momster', 
   'Hello {user_name}! ✨

Your Momster profile is almost ready!

With a few more details, you will be able to find moms who match you and participate more easily in our community 🫂

Whenever you feel ready, we are waiting for you 🤍

Together, moms thrive! 💫
The Momster Team', 
   'Sent to users with incomplete profiles'),
   
  ('inactive_user', 'Μας έλειψες 🤍', 'We missed you 🤍', 
   'Γεια σου {user_name}! 🫶

Ξέρουμε πόσο γεμάτη είναι η καθημερινότητα μιας μαμάς.

Όταν έχεις λίγο χρόνο, το Momster είναι εδώ — με κουβέντες, στήριξη και μικρές αγκαλιές 🫂✨

Σε περιμένουμε 🤍

Together, moms thrive! 💫
Η ομάδα του Momster', 
   'Hello {user_name}! 🫶

We know how busy a mom''s daily life can be.

When you have a little time, Momster is here — with conversations, support and little hugs 🫂✨

We are waiting for you 🤍

Together, moms thrive! 💫
The Momster Team', 
   'Sent to inactive users'),
   
  ('welcome_resend', 'Καλωσήρθες στο Momster 🤍', 'Welcome to Momster 🤍', 
   'Γεια σου {user_name}! ✨

Χαιρόμαστε πολύ που είσαι εδώ!

Το Momster φτιάχτηκε για να μη νιώθει καμία μαμά μόνη της.
Είμαστε όλες μαζί σε αυτό 🫶🫂

Ανυπομονούμε να σε γνωρίσουμε!

Together, moms thrive! 💫
Η ομάδα του Momster', 
   'Hello {user_name}! ✨

We are so happy you are here!

Momster was made so that no mom feels alone.
We are all in this together 🫶🫂

We can''t wait to meet you!

Together, moms thrive! 💫
The Momster Team', 
   'Welcome email for new users / resend')
ON CONFLICT (template_key) DO NOTHING;