-- Add required_interests column for specific interest filtering
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS required_interests text[] DEFAULT NULL;