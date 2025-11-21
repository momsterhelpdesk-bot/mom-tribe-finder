-- Create polls table for This or That feature
CREATE TABLE IF NOT EXISTS public.polls (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question_a text NOT NULL,
  question_b text NOT NULL,
  emoji_a text NOT NULL DEFAULT '👶',
  emoji_b text NOT NULL DEFAULT '🍼',
  category text NOT NULL DEFAULT 'general',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create poll votes table
CREATE TABLE IF NOT EXISTS public.poll_votes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id uuid NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  choice text NOT NULL CHECK (choice IN ('a', 'b')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(poll_id, user_id)
);

-- Enable RLS
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;

-- Polls policies
CREATE POLICY "Anyone can view polls" ON public.polls FOR SELECT USING (true);
CREATE POLICY "Admins can create polls" ON public.polls FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update polls" ON public.polls FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete polls" ON public.polls FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Poll votes policies
CREATE POLICY "Users can view all poll votes" ON public.poll_votes FOR SELECT USING (true);
CREATE POLICY "Users can create their own votes" ON public.poll_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own votes" ON public.poll_votes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own votes" ON public.poll_votes FOR DELETE USING (auth.uid() = user_id);

-- Insert sample polls
INSERT INTO public.polls (question_a, question_b, emoji_a, emoji_b, category) VALUES
  ('Baby-led weaning', 'Πουρές', '🍎', '🥄', 'feeding'),
  ('Sling', 'Καρότσι', '👶', '🚼', 'mobility'),
  ('Storytime', 'Playtime', '📖', '🎨', 'activities'),
  ('Co-sleeping', 'Κούνια', '🛏️', '🛡️', 'sleep'),
  ('Homemade', 'Store-bought', '🍳', '🛒', 'food');