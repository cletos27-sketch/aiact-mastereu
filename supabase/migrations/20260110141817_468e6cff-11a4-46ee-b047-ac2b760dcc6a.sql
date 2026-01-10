-- Add is_paid column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN is_paid BOOLEAN NOT NULL DEFAULT false;

-- Add index for faster lookups
CREATE INDEX idx_profiles_is_paid ON public.profiles(is_paid);