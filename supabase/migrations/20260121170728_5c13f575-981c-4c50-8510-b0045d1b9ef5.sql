-- Create the update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create mom_meets table for mom-led meetings
CREATE TABLE public.mom_meets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL,
  area TEXT NOT NULL,
  city TEXT NOT NULL,
  meet_date DATE NOT NULL,
  meet_time TIME NOT NULL,
  meet_type TEXT NOT NULL CHECK (meet_type IN ('playdate', 'stroller_walk', 'coffee', 'playground', 'park_walk')),
  description TEXT CHECK (char_length(description) <= 120),
  max_participants INTEGER NOT NULL DEFAULT 6 CHECK (max_participants >= 3 AND max_participants <= 6),
  exact_location TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'full', 'cancelled', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create mom_meet_participants table
CREATE TABLE public.mom_meet_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mom_meet_id UUID NOT NULL REFERENCES public.mom_meets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled')),
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(mom_meet_id, user_id)
);

-- Create mom_meet_chats table for group chat messages
CREATE TABLE public.mom_meet_chats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mom_meet_id UUID NOT NULL REFERENCES public.mom_meets(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  is_system_message BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.mom_meets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mom_meet_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mom_meet_chats ENABLE ROW LEVEL SECURITY;

-- RLS policies for mom_meets
CREATE POLICY "Anyone can view active mom meets" 
ON public.mom_meets 
FOR SELECT 
USING (status IN ('active', 'full'));

CREATE POLICY "Users can create mom meets" 
ON public.mom_meets 
FOR INSERT 
WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their mom meets" 
ON public.mom_meets 
FOR UPDATE 
USING (auth.uid() = creator_id);

CREATE POLICY "Creators can delete their mom meets" 
ON public.mom_meets 
FOR DELETE 
USING (auth.uid() = creator_id);

-- RLS policies for mom_meet_participants
CREATE POLICY "Participants can view their meetings" 
ON public.mom_meet_participants 
FOR SELECT 
USING (auth.uid() = user_id OR EXISTS (
  SELECT 1 FROM public.mom_meets m WHERE m.id = mom_meet_id AND m.creator_id = auth.uid()
) OR EXISTS (
  SELECT 1 FROM public.mom_meet_participants p WHERE p.mom_meet_id = mom_meet_id AND p.user_id = auth.uid()
));

CREATE POLICY "Users can join mom meets" 
ON public.mom_meet_participants 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their participation" 
ON public.mom_meet_participants 
FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS policies for mom_meet_chats
CREATE POLICY "Participants can view chat messages" 
ON public.mom_meet_chats 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.mom_meet_participants p 
  WHERE p.mom_meet_id = mom_meet_id AND p.user_id = auth.uid() AND p.status = 'confirmed'
) OR EXISTS (
  SELECT 1 FROM public.mom_meets m WHERE m.id = mom_meet_id AND m.creator_id = auth.uid()
));

CREATE POLICY "Participants can send chat messages" 
ON public.mom_meet_chats 
FOR INSERT 
WITH CHECK (
  auth.uid() = sender_id AND (
    EXISTS (
      SELECT 1 FROM public.mom_meet_participants p 
      WHERE p.mom_meet_id = mom_meet_id AND p.user_id = auth.uid() AND p.status = 'confirmed'
    ) OR EXISTS (
      SELECT 1 FROM public.mom_meets m WHERE m.id = mom_meet_id AND m.creator_id = auth.uid()
    )
  )
);

-- Create function to auto-update mom_meets status when full
CREATE OR REPLACE FUNCTION public.update_mom_meet_status()
RETURNS TRIGGER AS $$
DECLARE
  participant_count INTEGER;
  max_parts INTEGER;
BEGIN
  SELECT COUNT(*), m.max_participants INTO participant_count, max_parts
  FROM public.mom_meets m
  LEFT JOIN public.mom_meet_participants p ON p.mom_meet_id = m.id AND p.status = 'confirmed'
  WHERE m.id = NEW.mom_meet_id
  GROUP BY m.id, m.max_participants;
  
  IF participant_count >= max_parts THEN
    UPDATE public.mom_meets SET status = 'full' WHERE id = NEW.mom_meet_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_mom_meet_status_trigger
AFTER INSERT ON public.mom_meet_participants
FOR EACH ROW
EXECUTE FUNCTION public.update_mom_meet_status();

-- Create trigger for updated_at
CREATE TRIGGER update_mom_meets_updated_at
BEFORE UPDATE ON public.mom_meets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.mom_meet_chats;