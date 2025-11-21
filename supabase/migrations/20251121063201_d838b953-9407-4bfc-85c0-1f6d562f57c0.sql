-- Add cookies_accepted column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN cookies_accepted BOOLEAN DEFAULT NULL;