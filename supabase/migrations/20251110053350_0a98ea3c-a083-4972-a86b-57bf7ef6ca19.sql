-- Add interests column to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS interests text[] DEFAULT '{}';

-- Create reports table for trust & safety
CREATE TABLE IF NOT EXISTS public.profile_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reported_profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  reporter_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  reason text NOT NULL,
  description text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(reported_profile_id, reporter_id)
);

-- Enable RLS on reports
ALTER TABLE public.profile_reports ENABLE ROW LEVEL SECURITY;

-- Users can create reports
CREATE POLICY "Users can create reports"
ON public.profile_reports
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = reporter_id);

-- Users can view their own reports
CREATE POLICY "Users can view their own reports"
ON public.profile_reports
FOR SELECT
TO authenticated
USING (auth.uid() = reporter_id);

-- Admins can view all reports
CREATE POLICY "Admins can view all reports"
ON public.profile_reports
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update reports
CREATE POLICY "Admins can update reports"
ON public.profile_reports
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for reports updated_at
CREATE TRIGGER update_profile_reports_updated_at
BEFORE UPDATE ON public.profile_reports
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create verification requests table
CREATE TABLE IF NOT EXISTS public.verification_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  selfie_photo_url text NOT NULL,
  child_names text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on verification requests
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;

-- Users can create their own verification request
CREATE POLICY "Users can create their own verification request"
ON public.verification_requests
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = profile_id);

-- Users can view their own verification request
CREATE POLICY "Users can view their own verification request"
ON public.verification_requests
FOR SELECT
TO authenticated
USING (auth.uid() = profile_id);

-- Admins can view all verification requests
CREATE POLICY "Admins can view all verification requests"
ON public.verification_requests
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update verification requests
CREATE POLICY "Admins can update verification requests"
ON public.verification_requests
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for verification requests updated_at
CREATE TRIGGER update_verification_requests_updated_at
BEFORE UPDATE ON public.verification_requests
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Add profile_completed flag to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS profile_completed boolean DEFAULT false;

-- Add is_blocked flag to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_blocked boolean DEFAULT false;