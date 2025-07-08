-- Add new user profile columns to users table
ALTER TABLE public.users 
ADD COLUMN user_experience TEXT,
ADD COLUMN user_drum_setup TEXT,
ADD COLUMN user_goal TEXT,
ADD COLUMN user_how_diduhear TEXT;