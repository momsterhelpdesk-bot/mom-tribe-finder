-- Drop and recreate the view with correct column order
DROP VIEW IF EXISTS public.profiles_safe;

CREATE VIEW public.profiles_safe
WITH (security_invoker = on) AS
SELECT 
  id,
  -- Mask full_name to first name only for privacy
  CASE 
    WHEN full_name IS NOT NULL AND full_name != '' 
    THEN split_part(full_name, ' ', 1)
    ELSE NULL 
  END as full_name,
  city,
  area,
  child_age_group,
  match_preference,
  interests,
  profile_photo_url,
  profile_photos_urls,
  bio,
  mom_badge,
  marital_status,
  children,
  latitude,
  longitude,
  verified_status,
  profile_completed,
  is_blocked,
  created_at,
  updated_at
FROM public.profiles
WHERE is_blocked = false OR is_blocked IS NULL;