-- Add new fields to profiles table for enhanced profile functionality
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS date_of_birth date,
ADD COLUMN IF NOT EXISTS marital_status text CHECK (marital_status IN ('married', 'single_parent', 'other')),
ADD COLUMN IF NOT EXISTS notification_settings jsonb DEFAULT '{"email": true, "push": true, "matches": true, "messages": true}'::jsonb,
ADD COLUMN IF NOT EXISTS privacy_settings jsonb DEFAULT '{"discovery_visible": true, "show_last_active": true}'::jsonb;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_marital_status ON public.profiles(marital_status);

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.bio IS 'Short bio or description about the user';
COMMENT ON COLUMN public.profiles.date_of_birth IS 'User date of birth';
COMMENT ON COLUMN public.profiles.marital_status IS 'Marital status: married, single_parent, or other';
COMMENT ON COLUMN public.profiles.notification_settings IS 'JSON object storing notification preferences';
COMMENT ON COLUMN public.profiles.privacy_settings IS 'JSON object storing privacy preferences';