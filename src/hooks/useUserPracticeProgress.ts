import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface UserPracticeProgress {
  id: string;
  user_id: string;
  practice_id: string;
  song_id: string;
  completed_bpm: number;
  target_bpm: number;
  progress_percentage: number;
  completed_at: string;
}

export const useUserPracticeProgress = (songId?: string) => {
  return useQuery({
    queryKey: ["user-practice-progress", songId],
    queryFn: async (): Promise<UserPracticeProgress[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !songId) return [];

      const { data, error } = await supabase
        .from("user_practice_progress")
        .select("*")
        .eq("user_id", user.id)
        .eq("song_id", songId);

      if (error) throw error;
      return data || [];
    },
    enabled: !!songId,
  });
};

export const useSavePracticeProgress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      practiceId,
      songId,
      completedBpm,
      targetBpm,
    }: {
      practiceId: string;
      songId: string;
      completedBpm: number;
      targetBpm: number;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("user_practice_progress")
        .upsert(
          {
            user_id: user.id,
            practice_id: practiceId,
            song_id: songId,
            completed_bpm: completedBpm,
            target_bpm: targetBpm,
            completed_at: new Date().toISOString(),
          },
          {
            onConflict: "user_id,practice_id",
          }
        )
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["user-practice-progress", variables.songId],
      });
    },
  });
};
