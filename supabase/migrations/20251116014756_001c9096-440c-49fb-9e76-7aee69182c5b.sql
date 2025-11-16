-- Add profile_photos_urls column to store multiple photo URLs
ALTER TABLE public.profiles 
ADD COLUMN profile_photos_urls TEXT[] DEFAULT '{}';

-- Update existing profiles to include their current photo if exists
UPDATE public.profiles 
SET profile_photos_urls = ARRAY[profile_photo_url]
WHERE profile_photo_url IS NOT NULL AND profile_photo_url != '';