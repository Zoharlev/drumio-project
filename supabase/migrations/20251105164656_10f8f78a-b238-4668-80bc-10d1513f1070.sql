-- Make practice-chords bucket public so CSV files can be accessed
UPDATE storage.buckets 
SET public = true 
WHERE id = 'practice-chords';

-- Create policy to allow public access to practice chord files
CREATE POLICY "Public access to practice chords"
ON storage.objects
FOR SELECT
USING (bucket_id = 'practice-chords');