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
      ai_timetable_logs: {
        Row: {
          conflicts_count: number | null
          created_at: string
          definition_id: string | null
          feature: string
          generation_time_ms: number | null
          id: string
          optimization_score: number | null
          prompt_sent: Json | null
          response_received: Json | null
          user_id: string | null
          warnings: Json | null
        }
        Insert: {
          conflicts_count?: number | null
          created_at?: string
          definition_id?: string | null
          feature: string
          generation_time_ms?: number | null
          id?: string
          optimization_score?: number | null
          prompt_sent?: Json | null
          response_received?: Json | null
          user_id?: string | null
          warnings?: Json | null
        }
        Update: {
          conflicts_count?: number | null
          created_at?: string
          definition_id?: string | null
          feature?: string
          generation_time_ms?: number | null
          id?: string
          optimization_score?: number | null
          prompt_sent?: Json | null
          response_received?: Json | null
          user_id?: string | null
          warnings?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_timetable_logs_definition_id_fkey"
            columns: ["definition_id"]
            isOneToOne: false
            referencedRelation: "tt_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      tt_conflicts: {
        Row: {
          conflict_type: string
          created_at: string
          definition_id: string
          description: string
          id: string
          resolved: boolean
          resolved_at: string | null
          severity: string
          slot_ids: Json | null
        }
        Insert: {
          conflict_type: string
          created_at?: string
          definition_id: string
          description: string
          id?: string
          resolved?: boolean
          resolved_at?: string | null
          severity?: string
          slot_ids?: Json | null
        }
        Update: {
          conflict_type?: string
          created_at?: string
          definition_id?: string
          description?: string
          id?: string
          resolved?: boolean
          resolved_at?: string | null
          severity?: string
          slot_ids?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "tt_conflicts_definition_id_fkey"
            columns: ["definition_id"]
            isOneToOne: false
            referencedRelation: "tt_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      tt_definitions: {
        Row: {
          academic_year: string | null
          breaks: Json | null
          class_label: string | null
          created_at: string
          created_by: string | null
          day_start_time: string | null
          end_date: string | null
          id: string
          name: string
          period_minutes: number | null
          periods_per_day: number | null
          school_days: number[] | null
          settings: Json | null
          start_date: string | null
          status: string
          term: string | null
          type: string
          updated_at: string
        }
        Insert: {
          academic_year?: string | null
          breaks?: Json | null
          class_label?: string | null
          created_at?: string
          created_by?: string | null
          day_start_time?: string | null
          end_date?: string | null
          id?: string
          name: string
          period_minutes?: number | null
          periods_per_day?: number | null
          school_days?: number[] | null
          settings?: Json | null
          start_date?: string | null
          status?: string
          term?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          academic_year?: string | null
          breaks?: Json | null
          class_label?: string | null
          created_at?: string
          created_by?: string | null
          day_start_time?: string | null
          end_date?: string | null
          id?: string
          name?: string
          period_minutes?: number | null
          periods_per_day?: number | null
          school_days?: number[] | null
          settings?: Json | null
          start_date?: string | null
          status?: string
          term?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      tt_exam_slots: {
        Row: {
          capacity: number | null
          class_label: string | null
          created_at: string
          definition_id: string
          end_time: string | null
          exam_date: string
          id: string
          invigilator_name: string | null
          notes: string | null
          session: string
          start_time: string | null
          subject_name: string | null
          venue: string | null
        }
        Insert: {
          capacity?: number | null
          class_label?: string | null
          created_at?: string
          definition_id: string
          end_time?: string | null
          exam_date: string
          id?: string
          invigilator_name?: string | null
          notes?: string | null
          session: string
          start_time?: string | null
          subject_name?: string | null
          venue?: string | null
        }
        Update: {
          capacity?: number | null
          class_label?: string | null
          created_at?: string
          definition_id?: string
          end_time?: string | null
          exam_date?: string
          id?: string
          invigilator_name?: string | null
          notes?: string | null
          session?: string
          start_time?: string | null
          subject_name?: string | null
          venue?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tt_exam_slots_definition_id_fkey"
            columns: ["definition_id"]
            isOneToOne: false
            referencedRelation: "tt_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      tt_slots: {
        Row: {
          break_label: string | null
          created_at: string
          day_of_week: number
          definition_id: string
          end_time: string
          id: string
          is_break: boolean
          is_manual_override: boolean
          notes: string | null
          period_index: number
          room: string | null
          start_time: string
          subject_color: string | null
          subject_name: string | null
          teacher_name: string | null
        }
        Insert: {
          break_label?: string | null
          created_at?: string
          day_of_week: number
          definition_id: string
          end_time: string
          id?: string
          is_break?: boolean
          is_manual_override?: boolean
          notes?: string | null
          period_index: number
          room?: string | null
          start_time: string
          subject_color?: string | null
          subject_name?: string | null
          teacher_name?: string | null
        }
        Update: {
          break_label?: string | null
          created_at?: string
          day_of_week?: number
          definition_id?: string
          end_time?: string
          id?: string
          is_break?: boolean
          is_manual_override?: boolean
          notes?: string | null
          period_index?: number
          room?: string | null
          start_time?: string
          subject_color?: string | null
          subject_name?: string | null
          teacher_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tt_slots_definition_id_fkey"
            columns: ["definition_id"]
            isOneToOne: false
            referencedRelation: "tt_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
