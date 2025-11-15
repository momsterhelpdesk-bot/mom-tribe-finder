-- Add username column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username text UNIQUE;

-- Add check constraint for username format (alphanumeric and underscore, 3-20 chars)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'username_format_check'
  ) THEN
    ALTER TABLE public.profiles 
    ADD CONSTRAINT username_format_check 
    CHECK (username IS NULL OR username ~ '^[a-zA-Z0-9_]{3,20}$');
  END IF;
END $$;

-- Add children array column to support multiple children
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS children jsonb DEFAULT '[]'::jsonb;

-- Add comment to explain children structure
COMMENT ON COLUMN public.profiles.children IS 'Array of children with format: [{"name": "optional", "ageGroup": "0-6 μήνες"}]';

-- Migrate existing child_age_group data to children array
UPDATE public.profiles 
SET children = jsonb_build_array(
  jsonb_build_object('ageGroup', child_age_group)
)
WHERE child_age_group IS NOT NULL AND child_age_group != '' AND (children IS NULL OR children = '[]'::jsonb);