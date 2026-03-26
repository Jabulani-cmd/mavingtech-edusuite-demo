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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          author_id: string | null
          content: string | null
          created_at: string
          expires_at: string | null
          expiry_date: string | null
          file_attachments: string[] | null
          id: string
          is_public: boolean | null
          target_audience: string | null
          target_ids: string[] | null
          target_type: string | null
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          content?: string | null
          created_at?: string
          expires_at?: string | null
          expiry_date?: string | null
          file_attachments?: string[] | null
          id?: string
          is_public?: boolean | null
          target_audience?: string | null
          target_ids?: string[] | null
          target_type?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          content?: string | null
          created_at?: string
          expires_at?: string | null
          expiry_date?: string | null
          file_attachments?: string[] | null
          id?: string
          is_public?: boolean | null
          target_audience?: string | null
          target_ids?: string[] | null
          target_type?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      assessment_results: {
        Row: {
          assessment_id: string
          created_at: string
          grade: string | null
          graded_by: string | null
          graded_date: string | null
          id: string
          is_published: boolean | null
          marks_obtained: number | null
          percentage: number | null
          student_id: string
          teacher_feedback: string | null
        }
        Insert: {
          assessment_id: string
          created_at?: string
          grade?: string | null
          graded_by?: string | null
          graded_date?: string | null
          id?: string
          is_published?: boolean | null
          marks_obtained?: number | null
          percentage?: number | null
          student_id: string
          teacher_feedback?: string | null
        }
        Update: {
          assessment_id?: string
          created_at?: string
          grade?: string | null
          graded_by?: string | null
          graded_date?: string | null
          id?: string
          is_published?: boolean | null
          marks_obtained?: number | null
          percentage?: number | null
          student_id?: string
          teacher_feedback?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assessment_results_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_submissions: {
        Row: {
          assessment_id: string
          comments: string | null
          created_at: string
          file_url: string | null
          id: string
          student_id: string
          submitted_at: string
        }
        Insert: {
          assessment_id: string
          comments?: string | null
          created_at?: string
          file_url?: string | null
          id?: string
          student_id: string
          submitted_at?: string
        }
        Update: {
          assessment_id?: string
          comments?: string | null
          created_at?: string
          file_url?: string | null
          id?: string
          student_id?: string
          submitted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessment_submissions_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      assessments: {
        Row: {
          assessment_type: string | null
          class_id: string | null
          created_at: string
          due_date: string | null
          file_url: string | null
          id: string
          instructions: string | null
          is_published: boolean | null
          link_url: string | null
          max_marks: number | null
          subject_id: string | null
          teacher_id: string
          title: string
          updated_at: string
        }
        Insert: {
          assessment_type?: string | null
          class_id?: string | null
          created_at?: string
          due_date?: string | null
          file_url?: string | null
          id?: string
          instructions?: string | null
          is_published?: boolean | null
          link_url?: string | null
          max_marks?: number | null
          subject_id?: string | null
          teacher_id: string
          title: string
          updated_at?: string
        }
        Update: {
          assessment_type?: string | null
          class_id?: string | null
          created_at?: string
          due_date?: string | null
          file_url?: string | null
          id?: string
          instructions?: string | null
          is_published?: boolean | null
          link_url?: string | null
          max_marks?: number | null
          subject_id?: string | null
          teacher_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessments_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance: {
        Row: {
          attendance_date: string
          class_id: string | null
          created_at: string
          id: string
          marked_by: string | null
          notes: string | null
          status: string
          student_id: string
        }
        Insert: {
          attendance_date: string
          class_id?: string | null
          created_at?: string
          id?: string
          marked_by?: string | null
          notes?: string | null
          status?: string
          student_id: string
        }
        Update: {
          attendance_date?: string
          class_id?: string | null
          created_at?: string
          id?: string
          marked_by?: string | null
          notes?: string | null
          status?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: string | null
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          table_name: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      award_photos: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          image_url: string
          is_active: boolean | null
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          image_url: string
          is_active?: boolean | null
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          image_url?: string
          is_active?: boolean | null
        }
        Relationships: []
      }
      awards: {
        Row: {
          award_name: string
          created_at: string
          id: string
          student_name: string
          year_issued: number
        }
        Insert: {
          award_name: string
          created_at?: string
          id?: string
          student_name: string
          year_issued?: number
        }
        Update: {
          award_name?: string
          created_at?: string
          id?: string
          student_name?: string
          year_issued?: number
        }
        Relationships: []
      }
      bank_transactions: {
        Row: {
          balance: number | null
          created_at: string
          credit: number | null
          debit: number | null
          description: string | null
          id: string
          imported_at: string | null
          is_reconciled: boolean | null
          matched_expense_id: string | null
          matched_payment_id: string | null
          reference: string | null
          transaction_date: string
        }
        Insert: {
          balance?: number | null
          created_at?: string
          credit?: number | null
          debit?: number | null
          description?: string | null
          id?: string
          imported_at?: string | null
          is_reconciled?: boolean | null
          matched_expense_id?: string | null
          matched_payment_id?: string | null
          reference?: string | null
          transaction_date: string
        }
        Update: {
          balance?: number | null
          created_at?: string
          credit?: number | null
          debit?: number | null
          description?: string | null
          id?: string
          imported_at?: string | null
          is_reconciled?: boolean | null
          matched_expense_id?: string | null
          matched_payment_id?: string | null
          reference?: string | null
          transaction_date?: string
        }
        Relationships: []
      }
      bed_allocations: {
        Row: {
          allocation_end_date: string | null
          allocation_start_date: string | null
          bed_number: string | null
          created_at: string
          id: string
          room_id: string
          status: string | null
          student_id: string
        }
        Insert: {
          allocation_end_date?: string | null
          allocation_start_date?: string | null
          bed_number?: string | null
          created_at?: string
          id?: string
          room_id: string
          status?: string | null
          student_id: string
        }
        Update: {
          allocation_end_date?: string | null
          allocation_start_date?: string | null
          bed_number?: string | null
          created_at?: string
          id?: string
          room_id?: string
          status?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bed_allocations_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      carousel_images: {
        Row: {
          caption: string | null
          created_at: string
          display_order: number | null
          id: string
          image_url: string
          is_active: boolean | null
        }
        Insert: {
          caption?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          image_url: string
          is_active?: boolean | null
        }
        Update: {
          caption?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          image_url?: string
          is_active?: boolean | null
        }
        Relationships: []
      }
      class_subjects: {
        Row: {
          class_id: string
          created_at: string
          id: string
          subject_id: string
          teacher_id: string | null
        }
        Insert: {
          class_id: string
          created_at?: string
          id?: string
          subject_id: string
          teacher_id?: string | null
        }
        Update: {
          class_id?: string
          created_at?: string
          id?: string
          subject_id?: string
          teacher_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "class_subjects_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_subjects_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_subjects_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          capacity: number | null
          class_teacher_id: string | null
          created_at: string
          form_level: string
          id: string
          name: string
          room: string | null
          stream: string | null
          updated_at: string
        }
        Insert: {
          capacity?: number | null
          class_teacher_id?: string | null
          created_at?: string
          form_level?: string
          id?: string
          name: string
          room?: string | null
          stream?: string | null
          updated_at?: string
        }
        Update: {
          capacity?: number | null
          class_teacher_id?: string | null
          created_at?: string
          form_level?: string
          id?: string
          name?: string
          room?: string | null
          stream?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "classes_class_teacher_id_fkey"
            columns: ["class_teacher_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_logs: {
        Row: {
          channel: string | null
          created_at: string
          error_message: string | null
          id: string
          message: string
          recipient_count: number | null
          recipient_ids: string[] | null
          recipient_type: string | null
          reference: string | null
          scheduled_at: string | null
          sent_at: string | null
          sent_by: string | null
          status: string | null
          subject: string | null
          template_id: string | null
        }
        Insert: {
          channel?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          message: string
          recipient_count?: number | null
          recipient_ids?: string[] | null
          recipient_type?: string | null
          reference?: string | null
          scheduled_at?: string | null
          sent_at?: string | null
          sent_by?: string | null
          status?: string | null
          subject?: string | null
          template_id?: string | null
        }
        Update: {
          channel?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          message?: string
          recipient_count?: number | null
          recipient_ids?: string[] | null
          recipient_type?: string | null
          reference?: string | null
          scheduled_at?: string | null
          sent_at?: string | null
          sent_by?: string | null
          status?: string | null
          subject?: string | null
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "communication_logs_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "communication_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_templates: {
        Row: {
          category: string | null
          created_at: string
          id: string
          name: string
          template_text: string
          variables: string[] | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          name: string
          template_text: string
          variables?: string[] | null
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          name?: string
          template_text?: string
          variables?: string[] | null
        }
        Relationships: []
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          created_at: string
          id: string
          last_read_at: string | null
          user_id: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          id?: string
          last_read_at?: string | null
          user_id: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          id?: string
          last_read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_conversation"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      downloads: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          download_count: number | null
          file_size: string | null
          file_type: string | null
          file_url: string
          id: string
          is_active: boolean | null
          title: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          download_count?: number | null
          file_size?: string | null
          file_type?: string | null
          file_url: string
          id?: string
          is_active?: boolean | null
          title: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          download_count?: number | null
          file_size?: string | null
          file_type?: string | null
          file_url?: string
          id?: string
          is_active?: boolean | null
          title?: string
        }
        Relationships: []
      }
      exam_results: {
        Row: {
          created_at: string
          exam_id: string
          grade: string | null
          id: string
          mark: number | null
          student_id: string
          subject_id: string
          teacher_comment: string | null
        }
        Insert: {
          created_at?: string
          exam_id: string
          grade?: string | null
          id?: string
          mark?: number | null
          student_id: string
          subject_id: string
          teacher_comment?: string | null
        }
        Update: {
          created_at?: string
          exam_id?: string
          grade?: string | null
          id?: string
          mark?: number | null
          student_id?: string
          subject_id?: string
          teacher_comment?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exam_results_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_results_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_timetable_entries: {
        Row: {
          academic_year: string | null
          created_at: string
          end_time: string | null
          exam_date: string
          exam_id: string | null
          form_level: string | null
          id: string
          start_time: string | null
          subject_id: string | null
          term: string | null
          venue: string | null
        }
        Insert: {
          academic_year?: string | null
          created_at?: string
          end_time?: string | null
          exam_date: string
          exam_id?: string | null
          form_level?: string | null
          id?: string
          start_time?: string | null
          subject_id?: string | null
          term?: string | null
          venue?: string | null
        }
        Update: {
          academic_year?: string | null
          created_at?: string
          end_time?: string | null
          exam_date?: string
          exam_id?: string | null
          form_level?: string | null
          id?: string
          start_time?: string | null
          subject_id?: string | null
          term?: string | null
          venue?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exam_timetable_entries_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_timetable_entries_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      exams: {
        Row: {
          academic_year: string | null
          created_at: string
          created_by: string | null
          end_date: string | null
          exam_type: string | null
          form_level: string | null
          id: string
          is_published: boolean | null
          name: string
          start_date: string | null
          term: string | null
          updated_at: string
        }
        Insert: {
          academic_year?: string | null
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          exam_type?: string | null
          form_level?: string | null
          id?: string
          is_published?: boolean | null
          name: string
          start_date?: string | null
          term?: string | null
          updated_at?: string
        }
        Update: {
          academic_year?: string | null
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          exam_type?: string | null
          form_level?: string | null
          id?: string
          is_published?: boolean | null
          name?: string
          start_date?: string | null
          term?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount_usd: number | null
          amount_zig: number | null
          category: string | null
          created_at: string
          description: string | null
          expense_date: string | null
          id: string
          payment_method: string | null
          receipt_url: string | null
          recorded_by: string | null
          reference_number: string | null
        }
        Insert: {
          amount_usd?: number | null
          amount_zig?: number | null
          category?: string | null
          created_at?: string
          description?: string | null
          expense_date?: string | null
          id?: string
          payment_method?: string | null
          receipt_url?: string | null
          recorded_by?: string | null
          reference_number?: string | null
        }
        Update: {
          amount_usd?: number | null
          amount_zig?: number | null
          category?: string | null
          created_at?: string
          description?: string | null
          expense_date?: string | null
          id?: string
          payment_method?: string | null
          receipt_url?: string | null
          recorded_by?: string | null
          reference_number?: string | null
        }
        Relationships: []
      }
      facility_images: {
        Row: {
          caption: string | null
          created_at: string
          facility_type: string | null
          id: string
          image_url: string
          is_active: boolean | null
        }
        Insert: {
          caption?: string | null
          created_at?: string
          facility_type?: string | null
          id?: string
          image_url: string
          is_active?: boolean | null
        }
        Update: {
          caption?: string | null
          created_at?: string
          facility_type?: string | null
          id?: string
          image_url?: string
          is_active?: boolean | null
        }
        Relationships: []
      }
      fee_structures: {
        Row: {
          academic_year: string
          amount_usd: number | null
          amount_zig: number | null
          boarding_status: string | null
          created_at: string
          description: string | null
          form: string
          id: string
          term: string
          updated_at: string
        }
        Insert: {
          academic_year?: string
          amount_usd?: number | null
          amount_zig?: number | null
          boarding_status?: string | null
          created_at?: string
          description?: string | null
          form?: string
          id?: string
          term?: string
          updated_at?: string
        }
        Update: {
          academic_year?: string
          amount_usd?: number | null
          amount_zig?: number | null
          boarding_status?: string | null
          created_at?: string
          description?: string | null
          form?: string
          id?: string
          term?: string
          updated_at?: string
        }
        Relationships: []
      }
      finance_approval_requests: {
        Row: {
          action_type: string
          approved_by: string | null
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          requested_by: string | null
          status: string | null
          target_id: string | null
          target_table: string | null
          updated_at: string
        }
        Insert: {
          action_type: string
          approved_by?: string | null
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          requested_by?: string | null
          status?: string | null
          target_id?: string | null
          target_table?: string | null
          updated_at?: string
        }
        Update: {
          action_type?: string
          approved_by?: string | null
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          requested_by?: string | null
          status?: string | null
          target_id?: string | null
          target_table?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      gallery_images: {
        Row: {
          caption: string | null
          category: string | null
          created_at: string
          id: string
          image_url: string
          is_active: boolean | null
        }
        Insert: {
          caption?: string | null
          category?: string | null
          created_at?: string
          id?: string
          image_url: string
          is_active?: boolean | null
        }
        Update: {
          caption?: string | null
          category?: string | null
          created_at?: string
          id?: string
          image_url?: string
          is_active?: boolean | null
        }
        Relationships: []
      }
      health_visits: {
        Row: {
          created_at: string
          diagnosis: string | null
          follow_up_date: string | null
          id: string
          medication_given: string | null
          notes: string | null
          parent_notified: boolean | null
          student_id: string
          symptoms: string | null
          treatment: string | null
          visit_date: string | null
          visited_by: string | null
        }
        Insert: {
          created_at?: string
          diagnosis?: string | null
          follow_up_date?: string | null
          id?: string
          medication_given?: string | null
          notes?: string | null
          parent_notified?: boolean | null
          student_id: string
          symptoms?: string | null
          treatment?: string | null
          visit_date?: string | null
          visited_by?: string | null
        }
        Update: {
          created_at?: string
          diagnosis?: string | null
          follow_up_date?: string | null
          id?: string
          medication_given?: string | null
          notes?: string | null
          parent_notified?: boolean | null
          student_id?: string
          symptoms?: string | null
          treatment?: string | null
          visit_date?: string | null
          visited_by?: string | null
        }
        Relationships: []
      }
      hostels: {
        Row: {
          assistant_housemaster_id: string | null
          created_at: string
          current_occupancy: number | null
          description: string | null
          housemaster_id: string | null
          id: string
          is_active: boolean | null
          location: string | null
          name: string
          phone: string | null
          total_capacity: number | null
        }
        Insert: {
          assistant_housemaster_id?: string | null
          created_at?: string
          current_occupancy?: number | null
          description?: string | null
          housemaster_id?: string | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          name: string
          phone?: string | null
          total_capacity?: number | null
        }
        Update: {
          assistant_housemaster_id?: string | null
          created_at?: string
          current_occupancy?: number | null
          description?: string | null
          housemaster_id?: string | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          name?: string
          phone?: string | null
          total_capacity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "hostels_assistant_housemaster_id_fkey"
            columns: ["assistant_housemaster_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hostels_housemaster_id_fkey"
            columns: ["housemaster_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      inventory_items: {
        Row: {
          barcode: string | null
          category_id: string | null
          created_at: string
          description: string | null
          id: string
          item_code: string
          location: string | null
          name: string
          purchase_price_usd: number | null
          purchase_price_zig: number | null
          quantity: number | null
          reorder_level: number | null
          supplier: string | null
          supplier_contact: string | null
          unit: string | null
          updated_at: string
        }
        Insert: {
          barcode?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          item_code: string
          location?: string | null
          name: string
          purchase_price_usd?: number | null
          purchase_price_zig?: number | null
          quantity?: number | null
          reorder_level?: number | null
          supplier?: string | null
          supplier_contact?: string | null
          unit?: string | null
          updated_at?: string
        }
        Update: {
          barcode?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          item_code?: string
          location?: string | null
          name?: string
          purchase_price_usd?: number | null
          purchase_price_zig?: number | null
          quantity?: number | null
          reorder_level?: number | null
          supplier?: string | null
          supplier_contact?: string | null
          unit?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "inventory_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_transactions: {
        Row: {
          created_at: string
          id: string
          item_id: string
          notes: string | null
          quantity: number
          reference: string | null
          transaction_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          notes?: string | null
          quantity: number
          reference?: string | null
          transaction_type: string
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          notes?: string | null
          quantity?: number
          reference?: string | null
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_transactions_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          academic_year: string | null
          created_at: string
          created_by: string | null
          due_date: string | null
          id: string
          invoice_number: string
          notes: string | null
          paid_usd: number | null
          paid_zig: number | null
          status: string | null
          student_id: string
          term: string | null
          total_usd: number | null
          total_zig: number | null
          updated_at: string
        }
        Insert: {
          academic_year?: string | null
          created_at?: string
          created_by?: string | null
          due_date?: string | null
          id?: string
          invoice_number: string
          notes?: string | null
          paid_usd?: number | null
          paid_zig?: number | null
          status?: string | null
          student_id: string
          term?: string | null
          total_usd?: number | null
          total_zig?: number | null
          updated_at?: string
        }
        Update: {
          academic_year?: string | null
          created_at?: string
          created_by?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string
          notes?: string | null
          paid_usd?: number | null
          paid_zig?: number | null
          status?: string | null
          student_id?: string
          term?: string | null
          total_usd?: number | null
          total_zig?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      leave_requests: {
        Row: {
          approved_by: string | null
          created_at: string
          end_date: string
          id: string
          leave_type: string
          reason: string | null
          staff_id: string
          start_date: string
          status: string | null
          updated_at: string
        }
        Insert: {
          approved_by?: string | null
          created_at?: string
          end_date: string
          id?: string
          leave_type: string
          reason?: string | null
          staff_id: string
          start_date: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          approved_by?: string | null
          created_at?: string
          end_date?: string
          id?: string
          leave_type?: string
          reason?: string | null
          staff_id?: string
          start_date?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leave_requests_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      marks: {
        Row: {
          assessment_type: string | null
          created_at: string
          description: string | null
          id: string
          mark: number
          student_id: string
          subject_id: string
          teacher_id: string | null
          term: string
        }
        Insert: {
          assessment_type?: string | null
          created_at?: string
          description?: string | null
          id?: string
          mark: number
          student_id: string
          subject_id: string
          teacher_id?: string | null
          term?: string
        }
        Update: {
          assessment_type?: string | null
          created_at?: string
          description?: string | null
          id?: string
          mark?: number
          student_id?: string
          subject_id?: string
          teacher_id?: string | null
          term?: string
        }
        Relationships: [
          {
            foreignKeyName: "marks_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      meetings: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          meeting_date: string | null
          target_audience: string | null
          time: string | null
          title: string
          venue: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          meeting_date?: string | null
          target_audience?: string | null
          time?: string | null
          title: string
          venue?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          meeting_date?: string | null
          target_audience?: string | null
          time?: string | null
          title?: string
          venue?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          body: string
          created_at: string
          id: string
          is_read: boolean | null
          parent_message_id: string | null
          recipient_id: string
          sender_id: string
          subject: string | null
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          parent_message_id?: string | null
          recipient_id: string
          sender_id: string
          subject?: string | null
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          parent_message_id?: string | null
          recipient_id?: string
          sender_id?: string
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_parent_message_id_fkey"
            columns: ["parent_message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          link: string | null
          message: string | null
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string | null
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string | null
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      parent_students: {
        Row: {
          created_at: string
          id: string
          parent_id: string
          relationship: string | null
          student_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          parent_id: string
          relationship?: string | null
          student_id: string
        }
        Update: {
          created_at?: string
          id?: string
          parent_id?: string
          relationship?: string | null
          student_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount_usd: number | null
          amount_zig: number | null
          created_at: string
          id: string
          invoice_id: string | null
          notes: string | null
          payment_date: string | null
          payment_method: string | null
          receipt_number: string | null
          recorded_by: string | null
          reference_number: string | null
          student_id: string
        }
        Insert: {
          amount_usd?: number | null
          amount_zig?: number | null
          created_at?: string
          id?: string
          invoice_id?: string | null
          notes?: string | null
          payment_date?: string | null
          payment_method?: string | null
          receipt_number?: string | null
          recorded_by?: string | null
          reference_number?: string | null
          student_id: string
        }
        Update: {
          amount_usd?: number | null
          amount_zig?: number | null
          created_at?: string
          id?: string
          invoice_id?: string | null
          notes?: string | null
          payment_date?: string | null
          payment_method?: string | null
          receipt_number?: string | null
          recorded_by?: string | null
          reference_number?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      petty_cash: {
        Row: {
          amount_usd: number | null
          amount_zig: number | null
          created_at: string
          description: string | null
          id: string
          recorded_by: string | null
          reference_number: string | null
          transaction_date: string | null
          transaction_type: string | null
        }
        Insert: {
          amount_usd?: number | null
          amount_zig?: number | null
          created_at?: string
          description?: string | null
          id?: string
          recorded_by?: string | null
          reference_number?: string | null
          transaction_date?: string | null
          transaction_type?: string | null
        }
        Update: {
          amount_usd?: number | null
          amount_zig?: number | null
          created_at?: string
          description?: string | null
          id?: string
          recorded_by?: string | null
          reference_number?: string | null
          transaction_date?: string | null
          transaction_type?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      rooms: {
        Row: {
          capacity: number | null
          created_at: string
          current_occupancy: number | null
          floor: number | null
          hostel_id: string
          id: string
          notes: string | null
          room_number: string
          room_type: string | null
        }
        Insert: {
          capacity?: number | null
          created_at?: string
          current_occupancy?: number | null
          floor?: number | null
          hostel_id: string
          id?: string
          notes?: string | null
          room_number: string
          room_type?: string | null
        }
        Update: {
          capacity?: number | null
          created_at?: string
          current_occupancy?: number | null
          floor?: number | null
          hostel_id?: string
          id?: string
          notes?: string | null
          room_number?: string
          room_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rooms_hostel_id_fkey"
            columns: ["hostel_id"]
            isOneToOne: false
            referencedRelation: "hostels"
            referencedColumns: ["id"]
          },
        ]
      }
      school_projects: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          raised_amount: number | null
          target_amount: number | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          raised_amount?: number | null
          target_amount?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          raised_amount?: number | null
          target_amount?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string
          id: string
          setting_key: string
          setting_value: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          setting_key: string
          setting_value?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          setting_key?: string
          setting_value?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      staff: {
        Row: {
          address: string | null
          bank_details: string | null
          bio: string | null
          category: string | null
          created_at: string
          deleted_at: string | null
          department: string | null
          email: string | null
          emergency_contact: string | null
          employment_date: string | null
          full_name: string
          id: string
          national_id: string | null
          nssa_number: string | null
          paye_number: string | null
          phone: string | null
          photo_url: string | null
          qualifications: string | null
          role: string | null
          staff_number: string | null
          status: string | null
          subjects_taught: string[] | null
          title: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address?: string | null
          bank_details?: string | null
          bio?: string | null
          category?: string | null
          created_at?: string
          deleted_at?: string | null
          department?: string | null
          email?: string | null
          emergency_contact?: string | null
          employment_date?: string | null
          full_name: string
          id?: string
          national_id?: string | null
          nssa_number?: string | null
          paye_number?: string | null
          phone?: string | null
          photo_url?: string | null
          qualifications?: string | null
          role?: string | null
          staff_number?: string | null
          status?: string | null
          subjects_taught?: string[] | null
          title?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string | null
          bank_details?: string | null
          bio?: string | null
          category?: string | null
          created_at?: string
          deleted_at?: string | null
          department?: string | null
          email?: string | null
          emergency_contact?: string | null
          employment_date?: string | null
          full_name?: string
          id?: string
          national_id?: string | null
          nssa_number?: string | null
          paye_number?: string | null
          phone?: string | null
          photo_url?: string | null
          qualifications?: string | null
          role?: string | null
          staff_number?: string | null
          status?: string | null
          subjects_taught?: string[] | null
          title?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      student_classes: {
        Row: {
          academic_year: string | null
          class_id: string
          created_at: string
          id: string
          student_id: string
        }
        Insert: {
          academic_year?: string | null
          class_id: string
          created_at?: string
          id?: string
          student_id: string
        }
        Update: {
          academic_year?: string | null
          class_id?: string
          created_at?: string
          id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_classes_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      student_verification_codes: {
        Row: {
          code: string
          created_at: string
          expires_at: string
          id: string
          student_id: string
          used_at: string | null
          used_by: string | null
        }
        Insert: {
          code: string
          created_at?: string
          expires_at?: string
          id?: string
          student_id: string
          used_at?: string | null
          used_by?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          expires_at?: string
          id?: string
          student_id?: string
          used_at?: string | null
          used_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_verification_codes_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          address: string | null
          admission_number: string | null
          boarding_status: string | null
          class: string | null
          created_at: string
          date_of_birth: string | null
          deleted_at: string | null
          emergency_contact: string | null
          enrollment_date: string | null
          first_name: string | null
          form: string | null
          full_name: string
          gender: string | null
          guardian_email: string | null
          guardian_name: string | null
          guardian_phone: string | null
          has_medical_alert: boolean | null
          id: string
          last_name: string | null
          medical_conditions: string | null
          profile_photo_url: string | null
          sports_activities: string[] | null
          status: string | null
          stream: string | null
          subject_combination: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address?: string | null
          admission_number?: string | null
          boarding_status?: string | null
          class?: string | null
          created_at?: string
          date_of_birth?: string | null
          deleted_at?: string | null
          emergency_contact?: string | null
          enrollment_date?: string | null
          first_name?: string | null
          form?: string | null
          full_name?: string
          gender?: string | null
          guardian_email?: string | null
          guardian_name?: string | null
          guardian_phone?: string | null
          has_medical_alert?: boolean | null
          id?: string
          last_name?: string | null
          medical_conditions?: string | null
          profile_photo_url?: string | null
          sports_activities?: string[] | null
          status?: string | null
          stream?: string | null
          subject_combination?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string | null
          admission_number?: string | null
          boarding_status?: string | null
          class?: string | null
          created_at?: string
          date_of_birth?: string | null
          deleted_at?: string | null
          emergency_contact?: string | null
          enrollment_date?: string | null
          first_name?: string | null
          form?: string | null
          full_name?: string
          gender?: string | null
          guardian_email?: string | null
          guardian_name?: string | null
          guardian_phone?: string | null
          has_medical_alert?: boolean | null
          id?: string
          last_name?: string | null
          medical_conditions?: string | null
          profile_photo_url?: string | null
          sports_activities?: string[] | null
          status?: string | null
          stream?: string | null
          subject_combination?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      study_materials: {
        Row: {
          class_id: string | null
          created_at: string
          description: string | null
          download_count: number | null
          expiry_date: string | null
          file_url: string | null
          form_level: string | null
          id: string
          is_published: boolean | null
          link_url: string | null
          material_type: string | null
          subject_id: string | null
          tags: string[] | null
          teacher_id: string | null
          term: string | null
          title: string
          uploaded_by: string | null
        }
        Insert: {
          class_id?: string | null
          created_at?: string
          description?: string | null
          download_count?: number | null
          expiry_date?: string | null
          file_url?: string | null
          form_level?: string | null
          id?: string
          is_published?: boolean | null
          link_url?: string | null
          material_type?: string | null
          subject_id?: string | null
          tags?: string[] | null
          teacher_id?: string | null
          term?: string | null
          title: string
          uploaded_by?: string | null
        }
        Update: {
          class_id?: string | null
          created_at?: string
          description?: string | null
          download_count?: number | null
          expiry_date?: string | null
          file_url?: string | null
          form_level?: string | null
          id?: string
          is_published?: boolean | null
          link_url?: string | null
          material_type?: string | null
          subject_id?: string | null
          tags?: string[] | null
          teacher_id?: string | null
          term?: string | null
          title?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "study_materials_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "study_materials_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          code: string | null
          created_at: string
          department: string | null
          id: string
          is_examinable: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          department?: string | null
          id?: string
          is_examinable?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          code?: string | null
          created_at?: string
          department?: string | null
          id?: string
          is_examinable?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      supplier_invoices: {
        Row: {
          amount_usd: number | null
          amount_zig: number | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          invoice_date: string | null
          invoice_number: string | null
          paid_usd: number | null
          paid_zig: number | null
          recorded_by: string | null
          status: string | null
          supplier_contact: string | null
          supplier_name: string
          updated_at: string
        }
        Insert: {
          amount_usd?: number | null
          amount_zig?: number | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          invoice_date?: string | null
          invoice_number?: string | null
          paid_usd?: number | null
          paid_zig?: number | null
          recorded_by?: string | null
          status?: string | null
          supplier_contact?: string | null
          supplier_name: string
          updated_at?: string
        }
        Update: {
          amount_usd?: number | null
          amount_zig?: number | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          invoice_date?: string | null
          invoice_number?: string | null
          paid_usd?: number | null
          paid_zig?: number | null
          recorded_by?: string | null
          status?: string | null
          supplier_contact?: string | null
          supplier_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      supplier_payments: {
        Row: {
          amount_usd: number | null
          amount_zig: number | null
          created_at: string
          id: string
          notes: string | null
          payment_date: string | null
          payment_method: string | null
          recorded_by: string | null
          reference_number: string | null
          supplier_invoice_id: string
        }
        Insert: {
          amount_usd?: number | null
          amount_zig?: number | null
          created_at?: string
          id?: string
          notes?: string | null
          payment_date?: string | null
          payment_method?: string | null
          recorded_by?: string | null
          reference_number?: string | null
          supplier_invoice_id: string
        }
        Update: {
          amount_usd?: number | null
          amount_zig?: number | null
          created_at?: string
          id?: string
          notes?: string | null
          payment_date?: string | null
          payment_method?: string | null
          recorded_by?: string | null
          reference_number?: string | null
          supplier_invoice_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_payments_supplier_invoice_id_fkey"
            columns: ["supplier_invoice_id"]
            isOneToOne: false
            referencedRelation: "supplier_invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      term_reports: {
        Row: {
          academic_year: string | null
          attendance_percentage: number | null
          class_teacher_comment: string | null
          conduct: string | null
          created_at: string
          exam_id: string | null
          form_level: string | null
          head_comment: string | null
          id: string
          is_published: boolean | null
          published_at: string | null
          student_id: string
          term: string | null
          updated_at: string
        }
        Insert: {
          academic_year?: string | null
          attendance_percentage?: number | null
          class_teacher_comment?: string | null
          conduct?: string | null
          created_at?: string
          exam_id?: string | null
          form_level?: string | null
          head_comment?: string | null
          id?: string
          is_published?: boolean | null
          published_at?: string | null
          student_id: string
          term?: string | null
          updated_at?: string
        }
        Update: {
          academic_year?: string | null
          attendance_percentage?: number | null
          class_teacher_comment?: string | null
          conduct?: string | null
          created_at?: string
          exam_id?: string | null
          form_level?: string | null
          head_comment?: string | null
          id?: string
          is_published?: boolean | null
          published_at?: string | null
          student_id?: string
          term?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "term_reports_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
        ]
      }
      textbook_issues: {
        Row: {
          condition_on_issue: string | null
          condition_on_return: string | null
          created_at: string
          due_date: string
          fine_amount_usd: number | null
          fine_amount_zig: number | null
          id: string
          inventory_item_id: string
          issue_date: string | null
          return_date: string | null
          status: string | null
          student_id: string
        }
        Insert: {
          condition_on_issue?: string | null
          condition_on_return?: string | null
          created_at?: string
          due_date: string
          fine_amount_usd?: number | null
          fine_amount_zig?: number | null
          id?: string
          inventory_item_id: string
          issue_date?: string | null
          return_date?: string | null
          status?: string | null
          student_id: string
        }
        Update: {
          condition_on_issue?: string | null
          condition_on_return?: string | null
          created_at?: string
          due_date?: string
          fine_amount_usd?: number | null
          fine_amount_zig?: number | null
          id?: string
          inventory_item_id?: string
          issue_date?: string | null
          return_date?: string | null
          status?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "textbook_issues_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
        ]
      }
      timetable: {
        Row: {
          class_id: string
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          start_time: string
          subject_id: string | null
        }
        Insert: {
          class_id: string
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          start_time: string
          subject_id?: string | null
        }
        Update: {
          class_id?: string
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          start_time?: string
          subject_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "timetable_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timetable_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      timetable_entries: {
        Row: {
          class_id: string
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          room: string | null
          start_time: string
          subject_id: string | null
          teacher_id: string | null
        }
        Insert: {
          class_id: string
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          room?: string | null
          start_time: string
          subject_id?: string | null
          teacher_id?: string | null
        }
        Update: {
          class_id?: string
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          room?: string | null
          start_time?: string
          subject_id?: string | null
          teacher_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "timetable_entries_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timetable_entries_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timetable_entries_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      verification_codes: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          id: string
          is_used: boolean | null
          student_id: string
          used_by: string | null
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_used?: boolean | null
          student_id: string
          used_by?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_used?: boolean | null
          student_id?: string
          used_by?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: { Args: { _user_id: string }; Returns: string }
      has_any_role: {
        Args: {
          _roles: Database["public"]["Enums"]["app_role"][]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "student"
        | "parent"
        | "teacher"
        | "admin"
        | "finance"
        | "principal"
        | "deputy_principal"
        | "hod"
        | "admin_supervisor"
        | "registration"
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
        "student",
        "parent",
        "teacher",
        "admin",
        "finance",
        "principal",
        "deputy_principal",
        "hod",
        "admin_supervisor",
        "registration",
      ],
    },
  },
} as const
