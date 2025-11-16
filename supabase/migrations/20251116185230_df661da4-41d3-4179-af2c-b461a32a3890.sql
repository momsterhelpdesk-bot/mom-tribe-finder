-- Add category column to questions table
ALTER TABLE public.questions 
ADD COLUMN category text;

-- Add check constraint to ensure valid categories
ALTER TABLE public.questions
ADD CONSTRAINT questions_category_check CHECK (
  category IS NULL OR category IN (
    'breastfeeding',
    'sleep',
    'nutrition',
    'education',
    'routines',
    'mom_body',
    'psychology',
    'play_activities',
    'relationship',
    'work_balance'
  )
);

-- Create index for category filtering
CREATE INDEX idx_questions_category ON public.questions(category);