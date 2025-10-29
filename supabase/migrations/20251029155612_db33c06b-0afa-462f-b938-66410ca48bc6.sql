-- Add BPM column to songs table
ALTER TABLE public.songs 
ADD COLUMN bpm integer;