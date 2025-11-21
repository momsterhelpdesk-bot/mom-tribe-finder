-- Add matching system fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS show_location_filter BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS distance_preference_km INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS match_age_filter BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS age_range_months INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS match_interests_filter BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);