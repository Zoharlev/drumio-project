import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SongProgress {
  songId: string;
  completedPractices: number;
  totalPractices: number;
  percentage: number;
}

export const useAllSongsProgress = (songIds: string[]) => {
  return useQuery({
    queryKey: ["all-songs-progress", songIds],
    queryFn: async (): Promise<Map<string, SongProgress>> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || songIds.length === 0) return new Map();

      // Fetch practice counts per song
      const { data: songPractices } = await supabase
        .from("song_practices")
        .select("song_id, practice_id")
        .in("song_id", songIds);

      // Fetch user progress
      const { data: progressData } = await supabase
        .from("user_practice_progress")
        .select("song_id, practice_id, progress_percentage")
        .eq("user_id", user.id)
        .in("song_id", songIds);

      // Count practices per song
      const practiceCountMap = new Map<string, number>();
      songPractices?.forEach((sp) => {
        practiceCountMap.set(sp.song_id, (practiceCountMap.get(sp.song_id) || 0) + 1);
      });

      // Calculate progress per song
      const result = new Map<string, SongProgress>();
      songIds.forEach((songId) => {
        const totalPractices = practiceCountMap.get(songId) || 0;
        const songProgress = progressData?.filter((p) => p.song_id === songId) || [];
        const avgProgress = totalPractices > 0
          ? songProgress.reduce((sum, p) => sum + (p.progress_percentage || 0), 0) / totalPractices
          : 0;

        result.set(songId, {
          songId,
          completedPractices: songProgress.length,
          totalPractices,
          percentage: Math.round(avgProgress),
        });
      });

      return result;
    },
    enabled: songIds.length > 0,
  });
};
