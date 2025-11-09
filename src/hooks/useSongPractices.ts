import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SongWithPractices {
  song: {
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

export const useSongPractices = (songId: string) => {
  return useQuery({
    queryKey: ["song-practices", songId],
    queryFn: async (): Promise<SongWithPractices | null> => {
      if (!songId) return null;

      // First fetch the song
      const { data: song, error: songError } = await supabase
        .from("songs")
        .select(`
          id,
          title,
          description,
          level,
          background_image_url,
          category
        `)
        .eq("id", songId)
        .single();

      if (songError) throw songError;
      if (!song) return null;

      // Then fetch the practices for this song, ordered by display_order
      const { data: songPractices, error: practicesError } = await supabase
        .from("song_practices")
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
        .eq("song_id", songId)
        .order("display_order", { ascending: true });

      if (practicesError) throw practicesError;

      const practices = (songPractices || []).map((sp: any) => ({
        ...sp.practices,
        display_order: sp.display_order,
      }));

      return {
        song,
        practices,
      };
    },
    enabled: !!songId,
  });
};