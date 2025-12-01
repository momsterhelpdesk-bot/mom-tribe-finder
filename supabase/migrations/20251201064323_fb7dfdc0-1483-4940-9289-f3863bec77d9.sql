-- Create blocked_users table for user blocking functionality
CREATE TABLE IF NOT EXISTS public.blocked_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(blocker_id, blocked_id)
);

-- Enable RLS on blocked_users
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;

-- Users can view their own blocks
CREATE POLICY "Users can view their own blocks"
ON public.blocked_users
FOR SELECT
USING (auth.uid() = blocker_id);

-- Users can create blocks
CREATE POLICY "Users can create blocks"
ON public.blocked_users
FOR INSERT
WITH CHECK (auth.uid() = blocker_id);

-- Users can delete their own blocks (unblock)
CREATE POLICY "Users can delete their own blocks"
ON public.blocked_users
FOR DELETE
USING (auth.uid() = blocker_id);

-- Admins can view all blocks
CREATE POLICY "Admins can view all blocks"
ON public.blocked_users
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create photo_moderation_queue table for AI and manual photo review
CREATE TABLE IF NOT EXISTS public.photo_moderation_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  photo_url text NOT NULL,
  photo_type text NOT NULL CHECK (photo_type IN ('profile', 'selfie', 'recipe', 'forum')),
  ai_status text NOT NULL DEFAULT 'pending' CHECK (ai_status IN ('pending', 'approved', 'flagged', 'rejected')),
  ai_confidence numeric,
  ai_flags jsonb DEFAULT '[]'::jsonb,
  manual_status text CHECK (manual_status IN ('pending', 'approved', 'rejected')),
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  rejection_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on photo_moderation_queue
ALTER TABLE public.photo_moderation_queue ENABLE ROW LEVEL SECURITY;

-- Users can view their own submissions
CREATE POLICY "Users can view their own photo submissions"
ON public.photo_moderation_queue
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own photos
CREATE POLICY "Users can submit photos for moderation"
ON public.photo_moderation_queue
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can view all submissions
CREATE POLICY "Admins can view all photo submissions"
ON public.photo_moderation_queue
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update moderation status
CREATE POLICY "Admins can moderate photos"
ON public.photo_moderation_queue
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create function to check if user is blocked
CREATE OR REPLACE FUNCTION public.is_user_blocked(_from_user_id uuid, _to_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.blocked_users
    WHERE (blocker_id = _from_user_id AND blocked_id = _to_user_id)
       OR (blocker_id = _to_user_id AND blocked_id = _from_user_id)
  )
$$;

-- Update profiles RLS to exclude blocked users from discovery
DROP POLICY IF EXISTS "Users in same city and area can view each other" ON public.profiles;

CREATE POLICY "Users in same city and area can view each other (excluding blocked)"
ON public.profiles
FOR SELECT
USING (
  (get_user_city(auth.uid()) = city AND get_user_area(auth.uid()) = area)
  AND NOT is_user_blocked(auth.uid(), id)
  AND NOT is_blocked
);

-- Update swipes RLS to prevent swiping on blocked users
DROP POLICY IF EXISTS "Users can create their own swipes" ON public.swipes;

CREATE POLICY "Users can create their own swipes (excluding blocked)"
ON public.swipes
FOR INSERT
WITH CHECK (
  auth.uid() = from_user_id
  AND NOT is_user_blocked(from_user_id, to_user_id)
);

-- Update matches to exclude blocked users
DROP POLICY IF EXISTS "Users can view their matches" ON public.matches;

CREATE POLICY "Users can view their matches (excluding blocked)"
ON public.matches
FOR SELECT
USING (
  (auth.uid() = user1_id OR auth.uid() = user2_id)
  AND NOT is_user_blocked(user1_id, user2_id)
);

-- Create trigger to update photo_moderation_queue updated_at
CREATE OR REPLACE FUNCTION public.update_photo_moderation_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_photo_moderation_queue_updated_at
BEFORE UPDATE ON public.photo_moderation_queue
FOR EACH ROW
EXECUTE FUNCTION public.update_photo_moderation_updated_at();