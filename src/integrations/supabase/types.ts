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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      answer_likes: {
        Row: {
          answer_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          answer_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          answer_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "answer_likes_answer_id_fkey"
            columns: ["answer_id"]
            isOneToOne: false
            referencedRelation: "answers"
            referencedColumns: ["id"]
          },
        ]
      }
      answers: {
        Row: {
          content: string
          created_at: string
          id: string
          likes_count: number
          pseudonym: string | null
          question_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          likes_count?: number
          pseudonym?: string | null
          question_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          likes_count?: number
          pseudonym?: string | null
          question_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          match_id: string
          read_at: string | null
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          match_id: string
          read_at?: string | null
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          match_id?: string
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          body_el: string
          body_en: string
          created_at: string
          description: string | null
          id: string
          subject_el: string
          subject_en: string
          template_key: string
          updated_at: string
        }
        Insert: {
          body_el: string
          body_en: string
          created_at?: string
          description?: string | null
          id?: string
          subject_el: string
          subject_en: string
          template_key: string
          updated_at?: string
        }
        Update: {
          body_el?: string
          body_en?: string
          created_at?: string
          description?: string | null
          id?: string
          subject_el?: string
          subject_en?: string
          template_key?: string
          updated_at?: string
        }
        Relationships: []
      }
      matches: {
        Row: {
          created_at: string
          id: string
          last_message_at: string | null
          user1_id: string
          user2_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          user1_id: string
          user2_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          user1_id?: string
          user2_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          message: string
          metadata: Json | null
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          message: string
          metadata?: Json | null
          read?: boolean
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profile_reports: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          reason: string
          reported_profile_id: string
          reporter_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          reason: string
          reported_profile_id: string
          reporter_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          reason?: string
          reported_profile_id?: string
          reporter_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_reports_reported_profile_id_fkey"
            columns: ["reported_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_reports_reported_profile_id_fkey"
            columns: ["reported_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          age_range_months: number | null
          area: string
          avatar_data: Json | null
          bio: string | null
          child_age_group: string
          child_names: string | null
          children: Json | null
          city: string
          cookies_accepted: boolean | null
          created_at: string | null
          date_of_birth: string | null
          distance_preference_km: number | null
          email: string
          full_name: string
          id: string
          interests: string[] | null
          is_blocked: boolean | null
          latitude: number | null
          longitude: number | null
          marital_status: string | null
          match_age_filter: boolean | null
          match_interests_filter: boolean | null
          match_preference: string
          mom_badge: string | null
          notification_settings: Json | null
          privacy_settings: Json | null
          profile_completed: boolean | null
          profile_photo_url: string | null
          profile_photos_urls: string[] | null
          selfie_photo_url: string | null
          show_location_filter: boolean | null
          updated_at: string | null
          username: string | null
          verified_status: boolean | null
        }
        Insert: {
          age_range_months?: number | null
          area: string
          avatar_data?: Json | null
          bio?: string | null
          child_age_group: string
          child_names?: string | null
          children?: Json | null
          city: string
          cookies_accepted?: boolean | null
          created_at?: string | null
          date_of_birth?: string | null
          distance_preference_km?: number | null
          email: string
          full_name: string
          id: string
          interests?: string[] | null
          is_blocked?: boolean | null
          latitude?: number | null
          longitude?: number | null
          marital_status?: string | null
          match_age_filter?: boolean | null
          match_interests_filter?: boolean | null
          match_preference: string
          mom_badge?: string | null
          notification_settings?: Json | null
          privacy_settings?: Json | null
          profile_completed?: boolean | null
          profile_photo_url?: string | null
          profile_photos_urls?: string[] | null
          selfie_photo_url?: string | null
          show_location_filter?: boolean | null
          updated_at?: string | null
          username?: string | null
          verified_status?: boolean | null
        }
        Update: {
          age_range_months?: number | null
          area?: string
          avatar_data?: Json | null
          bio?: string | null
          child_age_group?: string
          child_names?: string | null
          children?: Json | null
          city?: string
          cookies_accepted?: boolean | null
          created_at?: string | null
          date_of_birth?: string | null
          distance_preference_km?: number | null
          email?: string
          full_name?: string
          id?: string
          interests?: string[] | null
          is_blocked?: boolean | null
          latitude?: number | null
          longitude?: number | null
          marital_status?: string | null
          match_age_filter?: boolean | null
          match_interests_filter?: boolean | null
          match_preference?: string
          mom_badge?: string | null
          notification_settings?: Json | null
          privacy_settings?: Json | null
          profile_completed?: boolean | null
          profile_photo_url?: string | null
          profile_photos_urls?: string[] | null
          selfie_photo_url?: string | null
          show_location_filter?: boolean | null
          updated_at?: string | null
          username?: string | null
          verified_status?: boolean | null
        }
        Relationships: []
      }
      question_likes: {
        Row: {
          created_at: string
          id: string
          question_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          question_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          question_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_likes_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          answers_count: number
          category: string | null
          content: string
          created_at: string
          display_mode: string
          id: string
          likes_count: number
          pseudonym: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          answers_count?: number
          category?: string | null
          content: string
          created_at?: string
          display_mode?: string
          id?: string
          likes_count?: number
          pseudonym?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          answers_count?: number
          category?: string | null
          content?: string
          created_at?: string
          display_mode?: string
          id?: string
          likes_count?: number
          pseudonym?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_activity: {
        Row: {
          created_at: string
          email_sent_at: string | null
          id: string
          last_activity_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_sent_at?: string | null
          id?: string
          last_activity_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_sent_at?: string | null
          id?: string
          last_activity_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      verification_requests: {
        Row: {
          admin_notes: string | null
          child_names: string
          created_at: string | null
          id: string
          profile_id: string
          selfie_photo_url: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          admin_notes?: string | null
          child_names: string
          created_at?: string | null
          id?: string
          profile_id: string
          selfie_photo_url: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          admin_notes?: string | null
          child_names?: string
          created_at?: string | null
          id?: string
          profile_id?: string
          selfie_photo_url?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "verification_requests_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_requests_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles_safe"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      profiles_safe: {
        Row: {
          area: string | null
          child_age_group: string | null
          child_names: string | null
          city: string | null
          created_at: string | null
          full_name: string | null
          id: string | null
          interests: string[] | null
          is_blocked: boolean | null
          match_preference: string | null
          mom_badge: string | null
          profile_completed: boolean | null
          profile_photo_url: string | null
          selfie_photo_url: string | null
          updated_at: string | null
          verified_status: boolean | null
        }
        Insert: {
          area?: string | null
          child_age_group?: string | null
          child_names?: string | null
          city?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string | null
          interests?: string[] | null
          is_blocked?: boolean | null
          match_preference?: string | null
          mom_badge?: string | null
          profile_completed?: boolean | null
          profile_photo_url?: string | null
          selfie_photo_url?: string | null
          updated_at?: string | null
          verified_status?: boolean | null
        }
        Update: {
          area?: string | null
          child_age_group?: string | null
          child_names?: string | null
          city?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string | null
          interests?: string[] | null
          is_blocked?: boolean | null
          match_preference?: string | null
          mom_badge?: string | null
          profile_completed?: boolean | null
          profile_photo_url?: string | null
          selfie_photo_url?: string | null
          updated_at?: string | null
          verified_status?: boolean | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_user_area: { Args: { _user_id: string }; Returns: string }
      get_user_city: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
