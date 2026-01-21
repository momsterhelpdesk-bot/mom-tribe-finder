-- Drop the problematic policy with infinite recursion
DROP POLICY IF EXISTS "Participants can view their meetings" ON public.mom_meet_participants;

-- Create a fixed SELECT policy without recursion
CREATE POLICY "Participants can view their meetings"
ON public.mom_meet_participants
FOR SELECT
USING (
  auth.uid() = user_id 
  OR EXISTS (
    SELECT 1 FROM mom_meets m 
    WHERE m.id = mom_meet_participants.mom_meet_id 
    AND m.creator_id = auth.uid()
  )
);