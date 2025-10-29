export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_profiles: {
        Row: {
          created_at: string
          id: string
          last_login: string | null
          name: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_login?: string | null
          name: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_login?: string | null
          name?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string
          email: string
          id: string
          last_login: string | null
          name: string
          password_hash: string
          role: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          last_login?: string | null
          name: string
          password_hash: string
          role?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          last_login?: string | null
          name?: string
          password_hash?: string
          role?: string
        }
        Relationships: []
      }
      learning_paths: {
        Row: {
          created_at: string
          description: string | null
          drum_set: Database["public"]["Enums"]["drum_set_type"]
          id: number
          level: Database["public"]["Enums"]["learning_path_level"]
          path_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          drum_set: Database["public"]["Enums"]["drum_set_type"]
          id?: number
          level: Database["public"]["Enums"]["learning_path_level"]
          path_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          drum_set?: Database["public"]["Enums"]["drum_set_type"]
          id?: number
          level?: Database["public"]["Enums"]["learning_path_level"]
          path_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      practice_tags: {
        Row: {
          practice_id: string
          tag_id: string
        }
        Insert: {
          practice_id: string
          tag_id: string
        }
        Update: {
          practice_id?: string
          tag_id?: string
        }
        Relationships: []
      }
      practice_tips: {
        Row: {
          created_at: string
          id: string
          language: string | null
          show_date: string | null
          text: string
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          language?: string | null
          show_date?: string | null
          text: string
          type: string
        }
        Update: {
          created_at?: string
          id?: string
          language?: string | null
          show_date?: string | null
          text?: string
          type?: string
        }
        Relationships: []
      }
      practice_type: {
        Row: {
          created_at: string
          id: string
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
        }
        Relationships: []
      }
      practices: {
        Row: {
          chords_file_url: string | null
          created_at: string
          description: string | null
          focus: string | null
          id: string
          pattern: string | null
          practice_note: string | null
          sound_file_url: string | null
          tempo: string | null
          title: string
          type_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          chords_file_url?: string | null
          created_at?: string
          description?: string | null
          focus?: string | null
          id?: string
          pattern?: string | null
          practice_note?: string | null
          sound_file_url?: string | null
          tempo?: string | null
          title: string
          type_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          chords_file_url?: string | null
          created_at?: string
          description?: string | null
          focus?: string | null
          id?: string
          pattern?: string | null
          practice_note?: string | null
          sound_file_url?: string | null
          tempo?: string | null
          title?: string
          type_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "practices_type_id_fkey"
            columns: ["type_id"]
            isOneToOne: false
            referencedRelation: "practice_type"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          bluetooth_enabled: boolean | null
          notifications_enabled: boolean | null
          recording_quality: string | null
          user_id: string
        }
        Insert: {
          bluetooth_enabled?: boolean | null
          notifications_enabled?: boolean | null
          recording_quality?: string | null
          user_id: string
        }
        Update: {
          bluetooth_enabled?: boolean | null
          notifications_enabled?: boolean | null
          recording_quality?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      song_practices: {
        Row: {
          created_at: string
          display_order: number
          id: string
          practice_id: string
          song_id: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          practice_id: string
          song_id: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          practice_id?: string
          song_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_practices_lesson_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_practices_practice_id_fkey"
            columns: ["practice_id"]
            isOneToOne: false
            referencedRelation: "practices"
            referencedColumns: ["id"]
          },
        ]
      }
      song_tags: {
        Row: {
          song_id: string
          tag_id: string
        }
        Insert: {
          song_id: string
          tag_id: string
        }
        Update: {
          song_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_tags_lesson_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      songs: {
        Row: {
          audio_file_url: string | null
          background_image_url: string | null
          bpm: number | null
          category: string | null
          created_at: string
          description: string | null
          id: string
          level: string
          notation_file_url: string | null
          notation_svg_url: string | null
          steps_count: number | null
          title: string
          video_url: string | null
        }
        Insert: {
          audio_file_url?: string | null
          background_image_url?: string | null
          bpm?: number | null
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          level: string
          notation_file_url?: string | null
          notation_svg_url?: string | null
          steps_count?: number | null
          title: string
          video_url?: string | null
        }
        Update: {
          audio_file_url?: string | null
          background_image_url?: string | null
          bpm?: number | null
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          level?: string
          notation_file_url?: string | null
          notation_svg_url?: string | null
          steps_count?: number | null
          title?: string
          video_url?: string | null
        }
        Relationships: []
      }
      tags: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          tag_color: string | null
          type: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          tag_color?: string | null
          type: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          tag_color?: string | null
          type?: string
        }
        Relationships: []
      }
      translations: {
        Row: {
          created_at: string | null
          entity_id: string
          entity_type: string
          field_name: string
          id: string
          language_code: string
          translation: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          entity_id: string
          entity_type: string
          field_name: string
          id?: string
          language_code: string
          translation: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          field_name?: string
          id?: string
          language_code?: string
          translation?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_code: string
          id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_code: string
          id?: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_code?: string
          id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_songs_progress: {
        Row: {
          feedback: Json | null
          id: string
          liked: boolean | null
          score: number | null
          song_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          feedback?: Json | null
          id?: string
          liked?: boolean | null
          score?: number | null
          song_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          feedback?: Json | null
          id?: string
          liked?: boolean | null
          score?: number | null
          song_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_lessons_progress_lesson_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "songs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_lessons_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string
          id: string
          last_login: string | null
          login_method: string | null
          name: string | null
          password_hash: string | null
          preferred_language: string | null
          profile_image_url: string | null
          theme_preference: string | null
          user_drum_setup: string | null
          user_experience: string | null
          user_goal: string | null
          user_how_diduhear: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          last_login?: string | null
          login_method?: string | null
          name?: string | null
          password_hash?: string | null
          preferred_language?: string | null
          profile_image_url?: string | null
          theme_preference?: string | null
          user_drum_setup?: string | null
          user_experience?: string | null
          user_goal?: string | null
          user_how_diduhear?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          last_login?: string | null
          login_method?: string | null
          name?: string | null
          password_hash?: string | null
          preferred_language?: string | null
          profile_image_url?: string | null
          theme_preference?: string | null
          user_drum_setup?: string | null
          user_experience?: string | null
          user_goal?: string | null
          user_how_diduhear?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_entity_translations: {
        Args: {
          p_entity_id: string
          p_entity_type: string
          p_language_code?: string
        }
        Returns: Json
      }
      get_practice_tags: {
        Args: { practice_id: string }
        Returns: {
          tag_color: string
          tag_id: string
          tag_name: string
          tag_type: string
        }[]
      }
      get_translation: {
        Args: {
          p_entity_id: string
          p_entity_type: string
          p_field_name: string
          p_language_code?: string
        }
        Returns: string
      }
    }
    Enums: {
      drum_set_type: "None" | "Practice pad" | "Drum kit"
      learning_path_level: "Beginners" | "Advanced" | "Professionals"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      drum_set_type: ["None", "Practice pad", "Drum kit"],
      learning_path_level: ["Beginners", "Advanced", "Professionals"],
    },
  },
} as const
