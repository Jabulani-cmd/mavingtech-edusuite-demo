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
      access_grants: {
        Row: {
          access_end: string | null
          access_start: string
          created_at: string
          grant_type: Database["public"]["Enums"]["grant_type"]
          granted_by: string | null
          id: string
          is_active: boolean
          parent_id: string
          reason: string | null
          student_id: string
          subscription_id: string | null
          updated_at: string
        }
        Insert: {
          access_end?: string | null
          access_start?: string
          created_at?: string
          grant_type?: Database["public"]["Enums"]["grant_type"]
          granted_by?: string | null
          id?: string
          is_active?: boolean
          parent_id: string
          reason?: string | null
          student_id: string
          subscription_id?: string | null
          updated_at?: string
        }
        Update: {
          access_end?: string | null
          access_start?: string
          created_at?: string
          grant_type?: Database["public"]["Enums"]["grant_type"]
          granted_by?: string | null
          id?: string
          is_active?: boolean
          parent_id?: string
          reason?: string | null
          student_id?: string
          subscription_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "access_grants_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
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
      exchange_rates: {
        Row: {
          created_at: string
          fetched_at: string
          id: string
          is_active: boolean
          set_by_admin: string | null
          source: string
          usd_to_zwg: number
        }
        Insert: {
          created_at?: string
          fetched_at?: string
          id?: string
          is_active?: boolean
          set_by_admin?: string | null
          source?: string
          usd_to_zwg: number
        }
        Update: {
          created_at?: string
          fetched_at?: string
          id?: string
          is_active?: boolean
          set_by_admin?: string | null
          source?: string
          usd_to_zwg?: number
        }
        Relationships: []
      }
      payment_reminders: {
        Row: {
          ai_generated_message: string | null
          created_at: string
          created_by: string | null
          delivery_method: string
          id: string
          parent_id: string
          reminder_type: string
          sent_at: string
          status: string
          student_id: string | null
        }
        Insert: {
          ai_generated_message?: string | null
          created_at?: string
          created_by?: string | null
          delivery_method?: string
          id?: string
          parent_id: string
          reminder_type: string
          sent_at?: string
          status?: string
          student_id?: string | null
        }
        Update: {
          ai_generated_message?: string | null
          created_at?: string
          created_by?: string | null
          delivery_method?: string
          id?: string
          parent_id?: string
          reminder_type?: string
          sent_at?: string
          status?: string
          student_id?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          ip_address: string | null
          mobile_number: string | null
          notes: string | null
          parent_id: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_status: Database["public"]["Enums"]["payment_status"]
          paynow_poll_url: string | null
          paynow_reference: string | null
          proof_of_payment_url: string | null
          receipt_number: string | null
          receipt_url: string | null
          rejection_reason: string | null
          subscription_id: string | null
          transaction_id: string | null
          updated_at: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          ip_address?: string | null
          mobile_number?: string | null
          notes?: string | null
          parent_id: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_status?: Database["public"]["Enums"]["payment_status"]
          paynow_poll_url?: string | null
          paynow_reference?: string | null
          proof_of_payment_url?: string | null
          receipt_number?: string | null
          receipt_url?: string | null
          rejection_reason?: string | null
          subscription_id?: string | null
          transaction_id?: string | null
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          ip_address?: string | null
          mobile_number?: string | null
          notes?: string | null
          parent_id?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          payment_status?: Database["public"]["Enums"]["payment_status"]
          paynow_poll_url?: string | null
          paynow_reference?: string | null
          proof_of_payment_url?: string | null
          receipt_number?: string | null
          receipt_url?: string | null
          rejection_reason?: string | null
          subscription_id?: string | null
          transaction_id?: string | null
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      school_bank_details: {
        Row: {
          account_name: string
          account_number: string
          bank_name: string
          branch: string | null
          created_at: string
          id: string
          is_active: boolean
          paynow_integration_id: string | null
          paynow_integration_key_secret_ref: string | null
          swift_code: string | null
          updated_at: string
        }
        Insert: {
          account_name: string
          account_number: string
          bank_name: string
          branch?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          paynow_integration_id?: string | null
          paynow_integration_key_secret_ref?: string | null
          swift_code?: string | null
          updated_at?: string
        }
        Update: {
          account_name?: string
          account_number?: string
          bank_name?: string
          branch?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          paynow_integration_id?: string | null
          paynow_integration_key_secret_ref?: string | null
          swift_code?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          amount_usd: number
          created_at: string
          description: string | null
          duration_days: number
          features: Json
          id: string
          is_active: boolean
          is_recommended: boolean
          name: string
          plan_type: Database["public"]["Enums"]["subscription_plan_type"]
          sibling_discount_2: number
          sibling_discount_3_plus: number
          updated_at: string
        }
        Insert: {
          amount_usd: number
          created_at?: string
          description?: string | null
          duration_days: number
          features?: Json
          id?: string
          is_active?: boolean
          is_recommended?: boolean
          name: string
          plan_type: Database["public"]["Enums"]["subscription_plan_type"]
          sibling_discount_2?: number
          sibling_discount_3_plus?: number
          updated_at?: string
        }
        Update: {
          amount_usd?: number
          created_at?: string
          description?: string | null
          duration_days?: number
          features?: Json
          id?: string
          is_active?: boolean
          is_recommended?: boolean
          name?: string
          plan_type?: Database["public"]["Enums"]["subscription_plan_type"]
          sibling_discount_2?: number
          sibling_discount_3_plus?: number
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          academic_year: string | null
          access_end: string | null
          access_start: string | null
          amount_usd: number
          amount_zwg: number | null
          auto_renew: boolean
          created_at: string
          currency_paid: string
          id: string
          parent_id: string
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          paynow_reference: string | null
          plan_id: string | null
          plan_type: Database["public"]["Enums"]["subscription_plan_type"]
          status: Database["public"]["Enums"]["subscription_status"]
          student_id: string
          term: string | null
          transaction_id: string | null
          updated_at: string
        }
        Insert: {
          academic_year?: string | null
          access_end?: string | null
          access_start?: string | null
          amount_usd: number
          amount_zwg?: number | null
          auto_renew?: boolean
          created_at?: string
          currency_paid?: string
          id?: string
          parent_id: string
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          paynow_reference?: string | null
          plan_id?: string | null
          plan_type: Database["public"]["Enums"]["subscription_plan_type"]
          status?: Database["public"]["Enums"]["subscription_status"]
          student_id: string
          term?: string | null
          transaction_id?: string | null
          updated_at?: string
        }
        Update: {
          academic_year?: string | null
          access_end?: string | null
          access_start?: string | null
          amount_usd?: number
          amount_zwg?: number | null
          auto_renew?: boolean
          created_at?: string
          currency_paid?: string
          id?: string
          parent_id?: string
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          paynow_reference?: string | null
          plan_id?: string | null
          plan_type?: Database["public"]["Enums"]["subscription_plan_type"]
          status?: Database["public"]["Enums"]["subscription_status"]
          student_id?: string
          term?: string | null
          transaction_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_finance_admin: { Args: { _uid: string }; Returns: boolean }
    }
    Enums: {
      app_role:
        | "admin"
        | "teacher"
        | "student"
        | "parent"
        | "staff"
        | "hod"
        | "registration"
        | "supervisor"
      grant_type: "paid" | "complimentary" | "trial" | "suspended"
      payment_method:
        | "ecocash"
        | "onemoney"
        | "telecash"
        | "paynow_web"
        | "bank_transfer"
        | "visa_mastercard"
        | "manual"
      payment_status:
        | "pending"
        | "paid"
        | "failed"
        | "cancelled"
        | "refunded"
        | "awaiting_verification"
        | "rejected"
      subscription_plan_type: "monthly" | "term" | "custom"
      subscription_status:
        | "active"
        | "expired"
        | "pending"
        | "suspended"
        | "complimentary"
        | "trial"
        | "cancelled"
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
      app_role: [
        "admin",
        "teacher",
        "student",
        "parent",
        "staff",
        "hod",
        "registration",
        "supervisor",
      ],
      grant_type: ["paid", "complimentary", "trial", "suspended"],
      payment_method: [
        "ecocash",
        "onemoney",
        "telecash",
        "paynow_web",
        "bank_transfer",
        "visa_mastercard",
        "manual",
      ],
      payment_status: [
        "pending",
        "paid",
        "failed",
        "cancelled",
        "refunded",
        "awaiting_verification",
        "rejected",
      ],
      subscription_plan_type: ["monthly", "term", "custom"],
      subscription_status: [
        "active",
        "expired",
        "pending",
        "suspended",
        "complimentary",
        "trial",
        "cancelled",
      ],
    },
  },
} as const
