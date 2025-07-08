import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface LessonWithTags {
  id: string;
  title: string;
  description: string | null;
  level: string;
  background_image_url: string | null;
  category: string | null;
  tags: Array<{
    id: string;
    name: string;
    type: string;
    tag_color: string | null;
  }>;
}

export const useLessons = (category?: string) => {
  return useQuery({
    queryKey: ["lessons", category],
    queryFn: async (): Promise<LessonWithTags[]> => {
      let query = supabase
        .from("lessons")
        .select(`
          id,
          title,
          description,
          level,
          background_image_url,
          category,
          lesson_tags (
            tags (
              id,
              name,
              type,
              tag_color
            )
          )
        `);

      if (category && category !== "lessons") {
        query = query.eq("category", category);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;

      return (data || []).map((lesson) => ({
        ...lesson,
        tags: lesson.lesson_tags?.map((lt: any) => lt.tags).filter(Boolean) || [],
      }));
    },
  });
};