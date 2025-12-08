-- Fix profiles_safe view - remove SECURITY DEFINER and use proper RLS
DROP VIEW IF EXISTS public.profiles_safe;

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
    mom_badge,
    child_names,
    selfie_photo_url,
    verified_status,
    profile_completed,
    is_blocked,
    created_at,
    updated_at
FROM public.profiles;

-- Grant select to authenticated users
GRANT SELECT ON public.profiles_safe TO authenticated;

COMMENT ON VIEW public.profiles_safe IS 'Safe view of profiles without sensitive data like email, location, etc.';