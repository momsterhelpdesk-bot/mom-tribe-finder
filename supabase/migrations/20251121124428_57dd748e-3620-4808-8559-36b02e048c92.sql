-- Create recipes table
CREATE TABLE public.recipes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  prep_time_minutes INTEGER NOT NULL,
  cook_time_minutes INTEGER,
  base_servings INTEGER NOT NULL DEFAULT 2,
  ingredients JSONB NOT NULL DEFAULT '[]',
  instructions TEXT[] NOT NULL DEFAULT '{}',
  storage_fridge_days INTEGER,
  storage_freezer_months INTEGER,
  reheating_instructions TEXT,
  mom_tip TEXT,
  photo_url TEXT,
  created_by UUID NOT NULL,
  average_rating NUMERIC(2,1) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create recipe reviews table
CREATE TABLE public.recipe_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create recipe photos table (user submitted)
CREATE TABLE public.recipe_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  photo_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_photos ENABLE ROW LEVEL SECURITY;

-- RLS Policies for recipes
CREATE POLICY "Anyone can view recipes"
  ON public.recipes FOR SELECT
  USING (true);

CREATE POLICY "Users can create recipes"
  ON public.recipes FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own recipes"
  ON public.recipes FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own recipes"
  ON public.recipes FOR DELETE
  USING (auth.uid() = created_by);

-- RLS Policies for recipe_reviews
CREATE POLICY "Anyone can view reviews"
  ON public.recipe_reviews FOR SELECT
  USING (true);

CREATE POLICY "Users can create reviews"
  ON public.recipe_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
  ON public.recipe_reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
  ON public.recipe_reviews FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for recipe_photos
CREATE POLICY "Anyone can view recipe photos"
  ON public.recipe_photos FOR SELECT
  USING (true);

CREATE POLICY "Users can upload photos"
  ON public.recipe_photos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own photos"
  ON public.recipe_photos FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger to update average rating
CREATE OR REPLACE FUNCTION update_recipe_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.recipes
  SET 
    average_rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM public.recipe_reviews
      WHERE recipe_id = COALESCE(NEW.recipe_id, OLD.recipe_id)
    ),
    reviews_count = (
      SELECT COUNT(*)
      FROM public.recipe_reviews
      WHERE recipe_id = COALESCE(NEW.recipe_id, OLD.recipe_id)
    )
  WHERE id = COALESCE(NEW.recipe_id, OLD.recipe_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_recipe_rating_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.recipe_reviews
FOR EACH ROW
EXECUTE FUNCTION update_recipe_rating();

-- Trigger for updated_at
CREATE TRIGGER update_recipes_updated_at
BEFORE UPDATE ON public.recipes
FOR EACH ROW
EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_recipe_reviews_updated_at
BEFORE UPDATE ON public.recipe_reviews
FOR EACH ROW
EXECUTE FUNCTION handle_updated_at();