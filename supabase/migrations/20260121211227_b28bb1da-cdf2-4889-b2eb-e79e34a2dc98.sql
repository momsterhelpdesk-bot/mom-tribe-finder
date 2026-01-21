-- Add DELETE policy for mom_meet_participants so users can cancel their participation
CREATE POLICY "Users can cancel their participation"
ON public.mom_meet_participants
FOR DELETE
USING (auth.uid() = user_id);