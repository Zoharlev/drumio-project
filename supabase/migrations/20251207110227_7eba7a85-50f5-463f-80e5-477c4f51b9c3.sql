-- Create table for tracking user practice session progress
CREATE TABLE public.user_practice_progress (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  practice_id uuid NOT NULL REFERENCES public.practices(id) ON DELETE CASCADE,
  song_id uuid NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
  completed_bpm integer NOT NULL,
  target_bpm integer NOT NULL,
  progress_percentage numeric(5,2) GENERATED ALWAYS AS (
    LEAST((completed_bpm::numeric / NULLIF(target_bpm, 0)) * 100, 100)
  ) STORED,
  completed_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create unique constraint to allow only one progress record per user per practice
-- (latest attempt overwrites previous)
CREATE UNIQUE INDEX user_practice_progress_unique ON public.user_practice_progress(user_id, practice_id);

-- Enable RLS
ALTER TABLE public.user_practice_progress ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own practice progress"
ON public.user_practice_progress
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own practice progress"
ON public.user_practice_progress
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own practice progress"
ON public.user_practice_progress
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own practice progress"
ON public.user_practice_progress
FOR DELETE
USING (auth.uid() = user_id);