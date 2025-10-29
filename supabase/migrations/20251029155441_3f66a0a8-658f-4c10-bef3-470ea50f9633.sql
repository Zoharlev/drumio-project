-- Add audio_file_url column to songs table
ALTER TABLE public.songs 
ADD COLUMN audio_file_url text;