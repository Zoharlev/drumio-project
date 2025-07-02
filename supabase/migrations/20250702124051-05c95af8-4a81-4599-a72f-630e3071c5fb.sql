-- Create Drumio database schema for drum learning app

-- Create users table
CREATE TABLE public.users (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT,
    name TEXT,
    profile_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    last_login TIMESTAMP WITH TIME ZONE,
    preferred_language TEXT DEFAULT 'en',
    theme_preference TEXT DEFAULT 'light' CHECK (theme_preference IN ('light', 'dark')),
    login_method TEXT DEFAULT 'email' CHECK (login_method IN ('email', 'google', 'apple'))
);

-- Create lessons table
CREATE TABLE public.lessons (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    level TEXT NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
    steps_count INTEGER DEFAULT 0,
    notation_svg_url TEXT,
    video_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tags table
CREATE TABLE public.tags (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL CHECK (type IN ('rhythm', 'technique', 'structure', 'difficulty', 'instrument')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lesson_tags junction table
CREATE TABLE public.lesson_tags (
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
    PRIMARY KEY (lesson_id, tag_id)
);

-- Create user_lessons_progress table
CREATE TABLE public.user_lessons_progress (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'completed')),
    liked BOOLEAN DEFAULT false,
    score INTEGER,
    feedback JSONB,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, lesson_id)
);

-- Create recordings table
CREATE TABLE public.recordings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    score INTEGER,
    analysis JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create practice_tips table
CREATE TABLE public.practice_tips (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    text TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('motivation', 'technical')),
    language TEXT DEFAULT 'en',
    show_date DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_achievements table
CREATE TABLE public.user_achievements (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    achievement_code TEXT NOT NULL,
    unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, achievement_code)
);

-- Create settings table
CREATE TABLE public.settings (
    user_id UUID NOT NULL PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    recording_quality TEXT DEFAULT 'normal' CHECK (recording_quality IN ('high', 'normal', 'low')),
    bluetooth_enabled BOOLEAN DEFAULT false,
    notifications_enabled BOOLEAN DEFAULT true
);

-- Enable Row Level Security on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_lessons_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile" 
ON public.users FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.users FOR UPDATE 
USING (auth.uid() = id);

-- RLS Policies for lessons (public read access)
CREATE POLICY "Anyone can view lessons" 
ON public.lessons FOR SELECT 
USING (true);

-- RLS Policies for tags (public read access)
CREATE POLICY "Anyone can view tags" 
ON public.tags FOR SELECT 
USING (true);

-- RLS Policies for lesson_tags (public read access)
CREATE POLICY "Anyone can view lesson tags" 
ON public.lesson_tags FOR SELECT 
USING (true);

-- RLS Policies for user_lessons_progress
CREATE POLICY "Users can view their own progress" 
ON public.user_lessons_progress FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress" 
ON public.user_lessons_progress FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" 
ON public.user_lessons_progress FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own progress" 
ON public.user_lessons_progress FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for recordings
CREATE POLICY "Users can view their own recordings" 
ON public.recordings FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recordings" 
ON public.recordings FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recordings" 
ON public.recordings FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recordings" 
ON public.recordings FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for practice_tips (public read access)
CREATE POLICY "Anyone can view practice tips" 
ON public.practice_tips FOR SELECT 
USING (true);

-- RLS Policies for user_achievements
CREATE POLICY "Users can view their own achievements" 
ON public.user_achievements FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements" 
ON public.user_achievements FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for settings
CREATE POLICY "Users can view their own settings" 
ON public.settings FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings" 
ON public.settings FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" 
ON public.settings FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own settings" 
ON public.settings FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for user_lessons_progress updated_at
CREATE TRIGGER update_user_lessons_progress_updated_at
    BEFORE UPDATE ON public.user_lessons_progress
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_user_lessons_progress_user_id ON public.user_lessons_progress(user_id);
CREATE INDEX idx_user_lessons_progress_lesson_id ON public.user_lessons_progress(lesson_id);
CREATE INDEX idx_user_lessons_progress_status ON public.user_lessons_progress(status);

CREATE INDEX idx_recordings_user_id ON public.recordings(user_id);
CREATE INDEX idx_recordings_lesson_id ON public.recordings(lesson_id);

CREATE INDEX idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX idx_user_achievements_achievement_code ON public.user_achievements(achievement_code);

CREATE INDEX idx_lesson_tags_lesson_id ON public.lesson_tags(lesson_id);
CREATE INDEX idx_lesson_tags_tag_id ON public.lesson_tags(tag_id);

CREATE INDEX idx_lessons_level ON public.lessons(level);
CREATE INDEX idx_lessons_category ON public.lessons(category);

CREATE INDEX idx_tags_type ON public.tags(type);
CREATE INDEX idx_tags_name ON public.tags(name);

CREATE INDEX idx_practice_tips_type ON public.practice_tips(type);
CREATE INDEX idx_practice_tips_language ON public.practice_tips(language);
CREATE INDEX idx_practice_tips_show_date ON public.practice_tips(show_date);