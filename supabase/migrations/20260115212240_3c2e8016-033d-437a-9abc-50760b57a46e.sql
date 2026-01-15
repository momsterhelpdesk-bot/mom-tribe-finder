-- Add haptic feedback preference to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS haptic_enabled boolean DEFAULT true;

-- Add table for magic matching greeting requests
CREATE TABLE IF NOT EXISTS public.magic_match_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, accepted, declined
  match_score INTEGER,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  responded_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(from_user_id, to_user_id)
);

-- Enable RLS
ALTER TABLE public.magic_match_requests ENABLE ROW LEVEL SECURITY;

-- Policies for magic match requests
CREATE POLICY "Users can view their own requests" 
ON public.magic_match_requests 
FOR SELECT 
USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "Users can create requests" 
ON public.magic_match_requests 
FOR INSERT 
WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Receivers can update request status" 
ON public.magic_match_requests 
FOR UPDATE 
USING (auth.uid() = to_user_id);

-- Enable realtime for magic match requests
ALTER PUBLICATION supabase_realtime ADD TABLE public.magic_match_requests;