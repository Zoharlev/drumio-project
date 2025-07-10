import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface LessonWithPractices {
  lesson: {
    id: string;
    title: string;
    description: string | null;
    level: string;
    background_image_url: string | null;
    category: string | null;
  };
  practices: Array<{
    id: string;
    title: string;
    description: string | null;
    display_order: number;
    practice_type: {
      id: string;
      title: string;
    } | null;
  }>;
}

export const useLessonPractices = (lessonId: string) => {
  return useQuery({
    queryKey: ["lesson-practices", lessonId],
    queryFn: async (): Promise<LessonWithPractices | null> => {
      if (!lessonId) return null;

      // First fetch the lesson
      const { data: lesson, error: lessonError } = await supabase
        .from("lessons")
        .select(`
          id,
          title,
          description,
          level,
          background_image_url,
          category
        `)
        .eq("id", lessonId)
        .single();

      if (lessonError) throw lessonError;
      if (!lesson) return null;

      // Then fetch the practices for this lesson, ordered by display_order
      const { data: lessonPractices, error: practicesError } = await supabase
        .from("lesson_practices")
        .select(`
          display_order,
          practices (
            id,
            title,
            description,
            practice_type (
              id,
              title
            )
          )
        `)
        .eq("lesson_id", lessonId)
        .order("display_order", { ascending: true });

      if (practicesError) throw practicesError;

      const practices = (lessonPractices || []).map((lp: any) => ({
        ...lp.practices,
        display_order: lp.display_order,
      }));

      return {
        lesson,
        practices,
      };
    },
    enabled: !!lessonId,
  });
};