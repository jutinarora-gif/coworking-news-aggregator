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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      answers: {
        Row: {
          body: string
          created_at: string
          id: string
          is_founder_reply: boolean
          is_hidden: boolean
          profile_id: string
          question_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          is_founder_reply?: boolean
          is_hidden?: boolean
          profile_id: string
          question_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          is_founder_reply?: boolean
          is_hidden?: boolean
          profile_id?: string
          question_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "answers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      cities: {
        Row: {
          country: string
          created_at: string
          id: string
          lat: number | null
          lng: number | null
          name: string
          region: Database["public"]["Enums"]["region_kind"]
          slug: string
          tier: number | null
        }
        Insert: {
          country: string
          created_at?: string
          id?: string
          lat?: number | null
          lng?: number | null
          name: string
          region: Database["public"]["Enums"]["region_kind"]
          slug: string
          tier?: number | null
        }
        Update: {
          country?: string
          created_at?: string
          id?: string
          lat?: number | null
          lng?: number | null
          name?: string
          region?: Database["public"]["Enums"]["region_kind"]
          slug?: string
          tier?: number | null
        }
        Relationships: []
      }
      dispatches: {
        Row: {
          author_profile_id: string | null
          body_md: string | null
          city_id: string | null
          cover_url: string | null
          created_at: string
          excerpt: string | null
          feed_id: string | null
          guid: string | null
          id: string
          ingested_at: string
          is_featured: boolean
          is_hidden: boolean
          linked_space_id: string | null
          published_at: string
          region: Database["public"]["Enums"]["region_kind"]
          slug: string
          source_name: string | null
          source_type: Database["public"]["Enums"]["dispatch_source"]
          source_url: string | null
          tags: string[]
          title: string
        }
        Insert: {
          author_profile_id?: string | null
          body_md?: string | null
          city_id?: string | null
          cover_url?: string | null
          created_at?: string
          excerpt?: string | null
          feed_id?: string | null
          guid?: string | null
          id?: string
          ingested_at?: string
          is_featured?: boolean
          is_hidden?: boolean
          linked_space_id?: string | null
          published_at?: string
          region: Database["public"]["Enums"]["region_kind"]
          slug: string
          source_name?: string | null
          source_type?: Database["public"]["Enums"]["dispatch_source"]
          source_url?: string | null
          tags?: string[]
          title: string
        }
        Update: {
          author_profile_id?: string | null
          body_md?: string | null
          city_id?: string | null
          cover_url?: string | null
          created_at?: string
          excerpt?: string | null
          feed_id?: string | null
          guid?: string | null
          id?: string
          ingested_at?: string
          is_featured?: boolean
          is_hidden?: boolean
          linked_space_id?: string | null
          published_at?: string
          region?: Database["public"]["Enums"]["region_kind"]
          slug?: string
          source_name?: string | null
          source_type?: Database["public"]["Enums"]["dispatch_source"]
          source_url?: string | null
          tags?: string[]
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "dispatches_author_profile_id_fkey"
            columns: ["author_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dispatches_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dispatches_feed_id_fkey"
            columns: ["feed_id"]
            isOneToOne: false
            referencedRelation: "feeds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dispatches_linked_space_id_fkey"
            columns: ["linked_space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      feeds: {
        Row: {
          added_by: string | null
          approved: boolean
          category: string
          created_at: string
          id: string
          is_active: boolean
          last_polled_at: string | null
          last_status: string | null
          name: string
          region: Database["public"]["Enums"]["region_kind"]
          source_site: string
          url: string
        }
        Insert: {
          added_by?: string | null
          approved?: boolean
          category?: string
          created_at?: string
          id?: string
          is_active?: boolean
          last_polled_at?: string | null
          last_status?: string | null
          name: string
          region: Database["public"]["Enums"]["region_kind"]
          source_site: string
          url: string
        }
        Update: {
          added_by?: string | null
          approved?: boolean
          category?: string
          created_at?: string
          id?: string
          is_active?: boolean
          last_polled_at?: string | null
          last_status?: string | null
          name?: string
          region?: Database["public"]["Enums"]["region_kind"]
          source_site?: string
          url?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          source: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          source?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          source?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          auth_user_id: string | null
          avatar_url: string | null
          bio: string | null
          city: string | null
          created_at: string
          display_name: string
          id: string
          is_founder: boolean
          is_verified_coworker: boolean
          updated_at: string
        }
        Insert: {
          auth_user_id?: string | null
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string
          display_name: string
          id?: string
          is_founder?: boolean
          is_verified_coworker?: boolean
          updated_at?: string
        }
        Update: {
          auth_user_id?: string | null
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string
          display_name?: string
          id?: string
          is_founder?: boolean
          is_verified_coworker?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      questions: {
        Row: {
          body: string | null
          created_at: string
          id: string
          is_ama: boolean
          is_hidden: boolean
          profile_id: string
          space_id: string | null
          title: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          is_ama?: boolean
          is_hidden?: boolean
          profile_id: string
          space_id?: string | null
          title: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          is_ama?: boolean
          is_hidden?: boolean
          profile_id?: string
          space_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questions_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          body: string
          cons: string | null
          created_at: string
          id: string
          is_hidden: boolean
          photos: Json
          profile_id: string
          pros: string | null
          rating_coffee: number | null
          rating_community: number | null
          rating_overall: number
          rating_quiet: number | null
          rating_value: number | null
          rating_wifi: number | null
          space_id: string
          title: string | null
        }
        Insert: {
          body: string
          cons?: string | null
          created_at?: string
          id?: string
          is_hidden?: boolean
          photos?: Json
          profile_id: string
          pros?: string | null
          rating_coffee?: number | null
          rating_community?: number | null
          rating_overall: number
          rating_quiet?: number | null
          rating_value?: number | null
          rating_wifi?: number | null
          space_id: string
          title?: string | null
        }
        Update: {
          body?: string
          cons?: string | null
          created_at?: string
          id?: string
          is_hidden?: boolean
          photos?: Json
          profile_id?: string
          pros?: string | null
          rating_coffee?: number | null
          rating_community?: number | null
          rating_overall?: number
          rating_quiet?: number | null
          rating_value?: number | null
          rating_wifi?: number | null
          space_id?: string
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_questions: {
        Row: {
          approved: boolean
          category: string | null
          created_at: string
          id: string
          is_global: boolean
          space_id: string | null
          suggested_by: string | null
          text: string
          upvotes_denorm: number
        }
        Insert: {
          approved?: boolean
          category?: string | null
          created_at?: string
          id?: string
          is_global?: boolean
          space_id?: string | null
          suggested_by?: string | null
          text: string
          upvotes_denorm?: number
        }
        Update: {
          approved?: boolean
          category?: string | null
          created_at?: string
          id?: string
          is_global?: boolean
          space_id?: string | null
          suggested_by?: string | null
          text?: string
          upvotes_denorm?: number
        }
        Relationships: [
          {
            foreignKeyName: "sales_questions_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_questions_suggested_by_fkey"
            columns: ["suggested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      saves: {
        Row: {
          collection_name: string
          created_at: string
          id: string
          profile_id: string
          target_id: string
          target_type: Database["public"]["Enums"]["save_target"]
        }
        Insert: {
          collection_name?: string
          created_at?: string
          id?: string
          profile_id: string
          target_id: string
          target_type: Database["public"]["Enums"]["save_target"]
        }
        Update: {
          collection_name?: string
          created_at?: string
          id?: string
          profile_id?: string
          target_id?: string
          target_type?: Database["public"]["Enums"]["save_target"]
        }
        Relationships: [
          {
            foreignKeyName: "saves_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      space_of_week: {
        Row: {
          created_at: string
          editorial_note: string | null
          id: string
          space_id: string
          week_start: string
        }
        Insert: {
          created_at?: string
          editorial_note?: string | null
          id?: string
          space_id: string
          week_start: string
        }
        Update: {
          created_at?: string
          editorial_note?: string | null
          id?: string
          space_id?: string
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "space_of_week_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      spaces: {
        Row: {
          address: string | null
          aliases: string[]
          amenities: Json
          city_id: string | null
          cover_url: string | null
          created_at: string
          currency: string
          description: string | null
          founder_profile_id: string | null
          id: string
          is_published: boolean
          lat: number | null
          lng: number | null
          name: string
          price_from: number | null
          slug: string
          updated_at: string
          vibe_tags: string[]
          website_url: string | null
        }
        Insert: {
          address?: string | null
          aliases?: string[]
          amenities?: Json
          city_id?: string | null
          cover_url?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          founder_profile_id?: string | null
          id?: string
          is_published?: boolean
          lat?: number | null
          lng?: number | null
          name: string
          price_from?: number | null
          slug: string
          updated_at?: string
          vibe_tags?: string[]
          website_url?: string | null
        }
        Update: {
          address?: string | null
          aliases?: string[]
          amenities?: Json
          city_id?: string | null
          cover_url?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          founder_profile_id?: string | null
          id?: string
          is_published?: boolean
          lat?: number | null
          lng?: number | null
          name?: string
          price_from?: number | null
          slug?: string
          updated_at?: string
          vibe_tags?: string[]
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "spaces_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spaces_founder_profile_id_fkey"
            columns: ["founder_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      votes: {
        Row: {
          created_at: string
          id: string
          profile_id: string
          target_id: string
          target_type: Database["public"]["Enums"]["vote_target"]
          value: number
        }
        Insert: {
          created_at?: string
          id?: string
          profile_id: string
          target_id: string
          target_type: Database["public"]["Enums"]["vote_target"]
          value: number
        }
        Update: {
          created_at?: string
          id?: string
          profile_id?: string
          target_id?: string
          target_type?: Database["public"]["Enums"]["vote_target"]
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "votes_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_winners: {
        Row: {
          created_at: string
          id: string
          rank: number
          score: number
          space_id: string
          week_start: string
        }
        Insert: {
          created_at?: string
          id?: string
          rank: number
          score: number
          space_id: string
          week_start: string
        }
        Update: {
          created_at?: string
          id?: string
          rank?: number
          score?: number
          space_id?: string
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_winners_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
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
      dispatch_source: "rss" | "editorial"
      region_kind: "india" | "global"
      save_target: "space" | "dispatch"
      vote_target:
        | "dispatch"
        | "review"
        | "question"
        | "answer"
        | "sales_question"
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
      dispatch_source: ["rss", "editorial"],
      region_kind: ["india", "global"],
      save_target: ["space", "dispatch"],
      vote_target: [
        "dispatch",
        "review",
        "question",
        "answer",
        "sales_question",
      ],
    },
  },
} as const
