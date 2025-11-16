-- Create matches table
CREATE TABLE public.matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id UUID NOT NULL,
  user2_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_message_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user1_id, user2_id)
);

-- Enable RLS
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- Users can view their own matches
CREATE POLICY "Users can view their matches"
ON public.matches
FOR SELECT
USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Users can create matches (when they like each other)
CREATE POLICY "Users can create matches"
ON public.matches
FOR INSERT
WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Create chat_messages table
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Users can view messages from their matches
CREATE POLICY "Users can view messages from their matches"
ON public.chat_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.matches
    WHERE matches.id = chat_messages.match_id
    AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
  )
);

-- Users can send messages to their matches
CREATE POLICY "Users can send messages to their matches"
ON public.chat_messages
FOR INSERT
WITH CHECK (
  auth.uid() = sender_id
  AND EXISTS (
    SELECT 1 FROM public.matches
    WHERE matches.id = chat_messages.match_id
    AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
  )
);

-- Users can update their own messages (for read receipts)
CREATE POLICY "Users can update message read status"
ON public.chat_messages
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.matches
    WHERE matches.id = chat_messages.match_id
    AND (matches.user1_id = auth.uid() OR matches.user2_id = auth.uid())
  )
);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

-- Function to update last_message_at on matches
CREATE OR REPLACE FUNCTION update_match_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.matches
  SET last_message_at = NEW.created_at
  WHERE id = NEW.match_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update last_message_at
CREATE TRIGGER on_new_message
AFTER INSERT ON public.chat_messages
FOR EACH ROW
EXECUTE FUNCTION update_match_last_message();