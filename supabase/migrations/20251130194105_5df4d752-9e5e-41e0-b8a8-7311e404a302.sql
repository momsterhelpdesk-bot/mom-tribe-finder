-- Create swipes table
CREATE TABLE IF NOT EXISTS public.swipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  to_user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  choice text NOT NULL CHECK (choice IN ('yes', 'no')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(from_user_id, to_user_id)
);

-- Enable RLS
ALTER TABLE public.swipes ENABLE ROW LEVEL SECURITY;

-- Users can insert their own swipes
CREATE POLICY "Users can create their own swipes"
ON public.swipes
FOR INSERT
WITH CHECK (auth.uid() = from_user_id);

-- Users can view swipes involving them
CREATE POLICY "Users can view swipes involving them"
ON public.swipes
FOR SELECT
USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

-- Users can update their own swipes
CREATE POLICY "Users can update their own swipes"
ON public.swipes
FOR UPDATE
USING (auth.uid() = from_user_id);

-- Create indexes for performance
CREATE INDEX idx_swipes_from_user ON public.swipes(from_user_id);
CREATE INDEX idx_swipes_to_user ON public.swipes(to_user_id);
CREATE INDEX idx_swipes_mutual ON public.swipes(from_user_id, to_user_id);