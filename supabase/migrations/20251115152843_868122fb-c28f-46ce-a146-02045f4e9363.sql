-- Create questions table
CREATE TABLE public.questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  display_mode TEXT NOT NULL DEFAULT 'name' CHECK (display_mode IN ('name', 'pseudonym', 'anonymous')),
  likes_count INTEGER NOT NULL DEFAULT 0,
  answers_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create answers table
CREATE TABLE public.answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create question likes table
CREATE TABLE public.question_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(question_id, user_id)
);

-- Create answer likes table
CREATE TABLE public.answer_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  answer_id UUID NOT NULL REFERENCES public.answers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(answer_id, user_id)
);

-- Enable RLS
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answer_likes ENABLE ROW LEVEL SECURITY;

-- Questions policies
CREATE POLICY "Anyone can view questions"
  ON public.questions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create questions"
  ON public.questions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own questions"
  ON public.questions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own questions"
  ON public.questions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Answers policies
CREATE POLICY "Anyone can view answers"
  ON public.answers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create answers"
  ON public.answers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own answers"
  ON public.answers FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own answers"
  ON public.answers FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Question likes policies
CREATE POLICY "Anyone can view question likes"
  ON public.question_likes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can add question likes"
  ON public.question_likes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own question likes"
  ON public.question_likes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Answer likes policies
CREATE POLICY "Anyone can view answer likes"
  ON public.answer_likes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can add answer likes"
  ON public.answer_likes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own answer likes"
  ON public.answer_likes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to update question likes count
CREATE OR REPLACE FUNCTION public.update_question_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.questions
    SET likes_count = likes_count + 1
    WHERE id = NEW.question_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.questions
    SET likes_count = likes_count - 1
    WHERE id = OLD.question_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to update answer likes count
CREATE OR REPLACE FUNCTION public.update_answer_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.answers
    SET likes_count = likes_count + 1
    WHERE id = NEW.answer_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.answers
    SET likes_count = likes_count - 1
    WHERE id = OLD.answer_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to update answers count
CREATE OR REPLACE FUNCTION public.update_answers_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.questions
    SET answers_count = answers_count + 1
    WHERE id = NEW.question_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.questions
    SET answers_count = answers_count - 1
    WHERE id = OLD.question_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Triggers for question likes
CREATE TRIGGER on_question_like_added
  AFTER INSERT ON public.question_likes
  FOR EACH ROW EXECUTE FUNCTION public.update_question_likes_count();

CREATE TRIGGER on_question_like_removed
  AFTER DELETE ON public.question_likes
  FOR EACH ROW EXECUTE FUNCTION public.update_question_likes_count();

-- Triggers for answer likes
CREATE TRIGGER on_answer_like_added
  AFTER INSERT ON public.answer_likes
  FOR EACH ROW EXECUTE FUNCTION public.update_answer_likes_count();

CREATE TRIGGER on_answer_like_removed
  AFTER DELETE ON public.answer_likes
  FOR EACH ROW EXECUTE FUNCTION public.update_answer_likes_count();

-- Triggers for answers count
CREATE TRIGGER on_answer_added
  AFTER INSERT ON public.answers
  FOR EACH ROW EXECUTE FUNCTION public.update_answers_count();

CREATE TRIGGER on_answer_removed
  AFTER DELETE ON public.answers
  FOR EACH ROW EXECUTE FUNCTION public.update_answers_count();

-- Trigger for updated_at on questions
CREATE TRIGGER update_questions_updated_at
  BEFORE UPDATE ON public.questions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Trigger for updated_at on answers
CREATE TRIGGER update_answers_updated_at
  BEFORE UPDATE ON public.answers
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();