-- Create practice_type table
CREATE TABLE public.practice_type (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create practices table
CREATE TABLE public.practices (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    title TEXT NOT NULL,
    type_id UUID NOT NULL REFERENCES public.practice_type(id) ON DELETE RESTRICT,
    description TEXT,
    chords_file_url TEXT,
    sound_file_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.practice_type ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practices ENABLE ROW LEVEL SECURITY;

-- RLS Policies for practice_type (public read access)
CREATE POLICY "Anyone can view practice types" 
ON public.practice_type FOR SELECT 
USING (true);

-- RLS Policies for practices
CREATE POLICY "Users can view their own practices" 
ON public.practices FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own practices" 
ON public.practices FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own practices" 
ON public.practices FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own practices" 
ON public.practices FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_practices_updated_at
BEFORE UPDATE ON public.practices
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_practices_user_id ON public.practices(user_id);
CREATE INDEX idx_practices_type_id ON public.practices(type_id);
CREATE INDEX idx_practices_created_at ON public.practices(created_at);

-- Create storage buckets for file uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('practice-chords', 'practice-chords', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('practice-sounds', 'practice-sounds', false);

-- Create storage policies for practice files
CREATE POLICY "Users can view their own chord files" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'practice-chords' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own chord files" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'practice-chords' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own chord files" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'practice-chords' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own chord files" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'practice-chords' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own sound files" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'practice-sounds' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own sound files" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'practice-sounds' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own sound files" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'practice-sounds' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own sound files" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'practice-sounds' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Insert some default practice types
INSERT INTO public.practice_type (title) VALUES 
('Technical Exercise'),
('Song Practice'),
('Rhythm Training'),
('Improvisation'),
('Theory Study');