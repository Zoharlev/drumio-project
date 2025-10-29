-- Add notation_file_url column to songs table
ALTER TABLE public.songs 
ADD COLUMN notation_file_url text;