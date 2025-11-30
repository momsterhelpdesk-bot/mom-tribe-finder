-- Add has_completed_onboarding column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN has_completed_onboarding BOOLEAN DEFAULT false;

-- Update existing users to have completed onboarding (so they skip it)
UPDATE public.profiles 
SET has_completed_onboarding = true 
WHERE profile_completed = true;