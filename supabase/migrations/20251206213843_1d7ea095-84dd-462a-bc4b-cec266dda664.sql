-- Drop the existing city/area restriction policy and create a new one that allows all profiles to be visible
-- The location filtering will be done in the application code based on user preferences

DROP POLICY IF EXISTS "Users in same city and area can view each other (excluding bloc" ON public.profiles;

-- Create new policy that allows all authenticated users to view all profiles (excluding blocked)
CREATE POLICY "Authenticated users can view all profiles (excluding blocked)"
ON public.profiles
FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND NOT is_user_blocked(auth.uid(), id)
  AND NOT is_blocked
);