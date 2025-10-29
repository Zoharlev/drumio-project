import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SongWithTags {
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

export const useSongs = (category?: string) => {
  return useQuery({
    queryKey: ["songs", category],
    queryFn: async (): Promise<SongWithTags[]> => {
      let query = supabase
        .from("songs")
        .select(`
          id,
          title,
          description,
          level,
          background_image_url,
          category,
          song_tags (
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

      return (data || []).map((song) => ({
        ...song,
        tags: song.song_tags?.map((st: any) => st.tags).filter(Boolean) || [],
      }));
    },
  });
};