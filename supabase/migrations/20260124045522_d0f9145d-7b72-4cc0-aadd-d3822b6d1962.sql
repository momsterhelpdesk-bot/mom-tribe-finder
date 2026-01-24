-- Drop the existing profiles_safe view that exposes sensitive data
DROP VIEW IF EXISTS public.profiles_safe;

-- Create a secure profiles_safe view WITHOUT sensitive fields
-- This view is for community features (AskMoms, RecipeReviews, Chat, Matching)
-- It excludes: email, child_names, selfie_photo_url, notification_settings, date_of_birth
CREATE VIEW public.profiles_safe
WITH (security_invoker = on)
AS
SELECT 
    id,
    SPLIT_PART(full_name, ' ', 1) as full_name,  -- First name only for privacy
    city,
    area,
    child_age_group,
    match_preference,
    interests,
    profile_photo_url,
    profile_photos_urls,
    bio,
    mom_badge,
    verified_status,
    profile_completed,
    is_blocked,
    created_at,
    updated_at,
    children,  -- Age info for matching (no names)
    latitude,
    longitude,
    marital_status
FROM public.profiles
WHERE NOT is_blocked;

-- Add comment for documentation
COMMENT ON VIEW public.profiles_safe IS 'Secure view for community features. Excludes email, child_names, selfie_photo_url, and other sensitive PII. Uses first name only.';

-- Grant SELECT to authenticated users only
GRANT SELECT ON public.profiles_safe TO authenticated;
REVOKE ALL ON public.profiles_safe FROM anon;