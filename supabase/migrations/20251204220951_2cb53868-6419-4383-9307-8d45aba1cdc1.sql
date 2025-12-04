-- Add interests_threshold column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS interests_threshold integer DEFAULT 40;