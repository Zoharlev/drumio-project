-- Add author column to songs table
ALTER TABLE public.songs 
ADD COLUMN author text;