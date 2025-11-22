-- Add moderation status to questions and answers
ALTER TABLE public.questions 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS rejection_reason text;

ALTER TABLE public.answers 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS rejection_reason text;

-- Create moderation logs table
CREATE TABLE IF NOT EXISTS public.moderation_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  target_type text NOT NULL,
  target_id uuid NOT NULL,
  details jsonb,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.moderation_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view moderation logs"
ON public.moderation_logs FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert moderation logs"
ON public.moderation_logs FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Create app settings table
CREATE TABLE IF NOT EXISTS public.app_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  updated_at timestamp with time zone DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage app settings"
ON public.app_settings FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Insert default moderation mode setting
INSERT INTO public.app_settings (key, value)
VALUES ('moderation_mode', '"manual"'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Update RLS policies for questions to only show approved ones to non-admins
DROP POLICY IF EXISTS "Anyone can view questions" ON public.questions;

CREATE POLICY "Approved questions are visible to all"
ON public.questions FOR SELECT
USING (
  status = 'approved' 
  OR auth.uid() = user_id 
  OR has_role(auth.uid(), 'admin')
);

-- Update RLS policies for answers to only show approved ones to non-admins
DROP POLICY IF EXISTS "Anyone can view answers" ON public.answers;

CREATE POLICY "Approved answers are visible to all"
ON public.answers FOR SELECT
USING (
  status = 'approved' 
  OR auth.uid() = user_id 
  OR has_role(auth.uid(), 'admin')
);

-- Add trigger for updated_at on app_settings
CREATE OR REPLACE FUNCTION update_app_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS update_app_settings_updated_at ON public.app_settings;
CREATE TRIGGER update_app_settings_updated_at
BEFORE UPDATE ON public.app_settings
FOR EACH ROW EXECUTE FUNCTION update_app_settings_updated_at();