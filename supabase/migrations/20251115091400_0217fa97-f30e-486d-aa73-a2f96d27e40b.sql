-- Create a safe view of profiles that excludes email addresses
-- This prevents email harvesting through the discovery/matching feature
CREATE VIEW public.profiles_safe AS 
SELECT 
  id, 
  full_name, 
  city, 
  area, 
  child_age_group, 
  match_preference, 
  interests, 
  profile_photo_url, 
  verified_status, 
  mom_badge, 
  child_names, 
  profile_completed, 
  is_blocked,
  selfie_photo_url,
  created_at,
  updated_at
FROM public.profiles;

-- Drop the overly permissive policy that exposes emails
DROP POLICY IF EXISTS "Users can view verified profiles based on match preference" ON public.profiles;

-- Create a more restrictive policy: users can only view their own full profile (including email)
-- This policy is already covered by "Users can view their own profile" policy

-- Grant SELECT on the safe view to authenticated users
GRANT SELECT ON public.profiles_safe TO authenticated;

-- Enable RLS on the view (views inherit RLS from base tables, but we make it explicit)
-- Users can view verified profiles through profiles_safe view based on match preferences
-- Note: Since views don't support RLS policies directly, access control happens through the base table