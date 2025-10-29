-- Rename the main lessons table to songs
ALTER TABLE public.lessons RENAME TO songs;

-- Rename junction tables for consistency
ALTER TABLE public.lesson_tags RENAME TO song_tags;
ALTER TABLE public.lesson_practices RENAME TO song_practices;

-- Rename the user progress table
ALTER TABLE public.user_lessons_progress RENAME TO user_songs_progress;

-- Rename columns that reference lesson_id to song_id for consistency
ALTER TABLE public.song_tags RENAME COLUMN lesson_id TO song_id;
ALTER TABLE public.song_practices RENAME COLUMN lesson_id TO song_id;
ALTER TABLE public.user_songs_progress RENAME COLUMN lesson_id TO song_id;