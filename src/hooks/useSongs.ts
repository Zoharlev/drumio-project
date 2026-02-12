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

export const useSongs = (category?: string, language?: string) => {
  return useQuery({
    queryKey: ["songs", category, language],
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

      query = query.eq("is_hidden", false);

      if (category && category !== "lessons") {
        query = query.eq("category", category);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;

      const songs = (data || []).map((song) => ({
        ...song,
        tags: song.song_tags?.map((st: any) => st.tags).filter(Boolean) || [],
      }));

      // Fetch translations if language is not English
      if (language && language !== "en" && songs.length > 0) {
        const songIds = songs.map(s => s.id);
        const { data: translations } = await supabase
          .from("translations")
          .select("entity_id, field_name, translation")
          .eq("entity_type", "lesson")
          .eq("language_code", language)
          .in("entity_id", songIds);

        if (translations && translations.length > 0) {
          const translationMap = new Map<string, Record<string, string>>();
          for (const t of translations) {
            if (!translationMap.has(t.entity_id)) {
              translationMap.set(t.entity_id, {});
            }
            translationMap.get(t.entity_id)![t.field_name] = t.translation;
          }

          return songs.map(song => {
            const tr = translationMap.get(song.id);
            return {
              ...song,
              title: tr?.title || song.title,
              description: tr?.description || song.description,
            };
          });
        }
      }

      return songs;
    },
  });
};