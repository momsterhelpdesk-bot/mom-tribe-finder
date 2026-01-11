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
          rejection_reason: string | null
          status: string | null
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
          rejection_reason?: string | null
          status?: string | null
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
          rejection_reason?: string | null
          status?: string | null
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
      app_microcopy: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          key: string
          label: string
          text_el: string
          text_en: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          key: string
          label: string
          text_el?: string
          text_en?: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          label?: string
          text_el?: string
          text_en?: string
          updated_at?: string
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          id: string
          key: string
          updated_at: string | null
          updated_by: string | null
          value: Json
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value: Json
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      blocked_users: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string
          id: string
          reason: string | null
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string
          id?: string
          reason?: string | null
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string
          id?: string
          reason?: string | null
        }
        Relationships: []
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
      marketplace_notifications: {
        Row: {
          created_at: string
          email: string
          id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          user_id?: string | null
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
      moderation_logs: {
        Row: {
          action: string
          admin_id: string | null
          created_at: string | null
          details: Json | null
          id: string
          target_id: string
          target_type: string
        }
        Insert: {
          action: string
          admin_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          target_id: string
          target_type: string
        }
        Update: {
          action?: string
          admin_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          target_id?: string
          target_type?: string
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
      photo_moderation_queue: {
        Row: {
          ai_confidence: number | null
          ai_flags: Json | null
          ai_status: string
          created_at: string
          detection_tags: string[] | null
          id: string
          manual_status: string | null
          photo_type: string
          photo_url: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_confidence?: number | null
          ai_flags?: Json | null
          ai_status?: string
          created_at?: string
          detection_tags?: string[] | null
          id?: string
          manual_status?: string | null
          photo_type: string
          photo_url: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_confidence?: number | null
          ai_flags?: Json | null
          ai_status?: string
          created_at?: string
          detection_tags?: string[] | null
          id?: string
          manual_status?: string | null
          photo_type?: string
          photo_url?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      photo_rejection_reasons: {
        Row: {
          code: string
          created_at: string | null
          id: string
          message_el: string
          message_en: string
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          message_el: string
          message_en: string
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          message_el?: string
          message_en?: string
        }
        Relationships: []
      }
      poll_votes: {
        Row: {
          choice: string
          created_at: string
          id: string
          poll_id: string
          user_id: string
        }
        Insert: {
          choice: string
          created_at?: string
          id?: string
          poll_id: string
          user_id: string
        }
        Update: {
          choice?: string
          created_at?: string
          id?: string
          poll_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "poll_votes_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
        ]
      }
      polls: {
        Row: {
          category: string
          created_at: string
          emoji_a: string
          emoji_b: string
          id: string
          question_a: string
          question_b: string
        }
        Insert: {
          category?: string
          created_at?: string
          emoji_a?: string
          emoji_b?: string
          id?: string
          question_a: string
          question_b: string
        }
        Update: {
          category?: string
          created_at?: string
          emoji_a?: string
          emoji_b?: string
          id?: string
          question_a?: string
          question_b?: string
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
          age_migration_done: boolean | null
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
          first_login_date: string | null
          full_name: string
          has_completed_onboarding: boolean | null
          id: string
          interests: string[] | null
          interests_threshold: number | null
          is_blocked: boolean | null
          latitude: number | null
          location_popup_shown: boolean | null
          longitude: number | null
          marital_status: string | null
          match_age_filter: boolean | null
          match_interests_filter: boolean | null
          match_preference: string
          mom_badge: string | null
          notification_settings: Json | null
          photo_rules_seen: boolean | null
          prioritize_lifestyle: boolean | null
          privacy_settings: Json | null
          profile_completed: boolean | null
          profile_photo_url: string | null
          profile_photos_urls: string[] | null
          required_interests: string[] | null
          selfie_photo_url: string | null
          show_location_filter: boolean | null
          updated_at: string | null
          username: string | null
          verified_status: boolean | null
          welcome_popup_shown: boolean | null
        }
        Insert: {
          age_migration_done?: boolean | null
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
          first_login_date?: string | null
          full_name: string
          has_completed_onboarding?: boolean | null
          id: string
          interests?: string[] | null
          interests_threshold?: number | null
          is_blocked?: boolean | null
          latitude?: number | null
          location_popup_shown?: boolean | null
          longitude?: number | null
          marital_status?: string | null
          match_age_filter?: boolean | null
          match_interests_filter?: boolean | null
          match_preference: string
          mom_badge?: string | null
          notification_settings?: Json | null
          photo_rules_seen?: boolean | null
          prioritize_lifestyle?: boolean | null
          privacy_settings?: Json | null
          profile_completed?: boolean | null
          profile_photo_url?: string | null
          profile_photos_urls?: string[] | null
          required_interests?: string[] | null
          selfie_photo_url?: string | null
          show_location_filter?: boolean | null
          updated_at?: string | null
          username?: string | null
          verified_status?: boolean | null
          welcome_popup_shown?: boolean | null
        }
        Update: {
          age_migration_done?: boolean | null
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
          first_login_date?: string | null
          full_name?: string
          has_completed_onboarding?: boolean | null
          id?: string
          interests?: string[] | null
          interests_threshold?: number | null
          is_blocked?: boolean | null
          latitude?: number | null
          location_popup_shown?: boolean | null
          longitude?: number | null
          marital_status?: string | null
          match_age_filter?: boolean | null
          match_interests_filter?: boolean | null
          match_preference?: string
          mom_badge?: string | null
          notification_settings?: Json | null
          photo_rules_seen?: boolean | null
          prioritize_lifestyle?: boolean | null
          privacy_settings?: Json | null
          profile_completed?: boolean | null
          profile_photo_url?: string | null
          profile_photos_urls?: string[] | null
          required_interests?: string[] | null
          selfie_photo_url?: string | null
          show_location_filter?: boolean | null
          updated_at?: string | null
          username?: string | null
          verified_status?: boolean | null
          welcome_popup_shown?: boolean | null
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
          rejection_reason: string | null
          status: string | null
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
          rejection_reason?: string | null
          status?: string | null
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
          rejection_reason?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      recipe_photos: {
        Row: {
          created_at: string
          id: string
          photo_url: string
          recipe_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          photo_url: string
          recipe_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          photo_url?: string
          recipe_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_photos_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          rating: number
          recipe_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          recipe_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          recipe_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_reviews_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          average_rating: number | null
          base_servings: number
          cook_time_minutes: number | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          ingredients: Json
          instructions: string[]
          mom_tip: string | null
          photo_url: string | null
          prep_time_minutes: number
          reheating_instructions: string | null
          reviews_count: number | null
          storage_freezer_months: number | null
          storage_fridge_days: number | null
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          average_rating?: number | null
          base_servings?: number
          cook_time_minutes?: number | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          ingredients?: Json
          instructions?: string[]
          mom_tip?: string | null
          photo_url?: string | null
          prep_time_minutes: number
          reheating_instructions?: string | null
          reviews_count?: number | null
          storage_freezer_months?: number | null
          storage_fridge_days?: number | null
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          average_rating?: number | null
          base_servings?: number
          cook_time_minutes?: number | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          ingredients?: Json
          instructions?: string[]
          mom_tip?: string | null
          photo_url?: string | null
          prep_time_minutes?: number
          reheating_instructions?: string | null
          reviews_count?: number | null
          storage_freezer_months?: number | null
          storage_fridge_days?: number | null
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      swipes: {
        Row: {
          choice: string
          created_at: string
          from_user_id: string
          id: string
          to_user_id: string
        }
        Insert: {
          choice: string
          created_at?: string
          from_user_id: string
          id?: string
          to_user_id: string
        }
        Update: {
          choice?: string
          created_at?: string
          from_user_id?: string
          id?: string
          to_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "swipes_from_user_id_fkey"
            columns: ["from_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "swipes_from_user_id_fkey"
            columns: ["from_user_id"]
            isOneToOne: false
            referencedRelation: "profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "swipes_to_user_id_fkey"
            columns: ["to_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "swipes_to_user_id_fkey"
            columns: ["to_user_id"]
            isOneToOne: false
            referencedRelation: "profiles_safe"
            referencedColumns: ["id"]
          },
        ]
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
      is_user_blocked: {
        Args: { _from_user_id: string; _to_user_id: string }
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
