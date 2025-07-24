-- Function to get practice tags
CREATE OR REPLACE FUNCTION public.get_practice_tags(practice_id UUID)
RETURNS TABLE (
  tag_id UUID,
  tag_name TEXT,
  tag_type TEXT,
  tag_color TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id as tag_id,
    t.name as tag_name,
    t.type as tag_type,
    t.tag_color
  FROM tags t
  INNER JOIN practice_tags pt ON t.id = pt.tag_id
  WHERE pt.practice_id = $1;
END;
$$;