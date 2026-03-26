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
          file_attachments: string[] | null
          id: string
          is_public: boolean
          target_ids: string[] | null
          target_type: string | null
          title: string
        }
        Insert: {
          author_id?: string | null
          content?: string | null
          created_at?: string
          expires_at?: string | null
          file_attachments?: string[] | null
          id?: string
          is_public?: boolean
          target_ids?: string[] | null
          target_type?: string | null
          title: string
        }
        Update: {
          author_id?: string | null
          content?: string | null
          created_at?: string
          expires_at?: string | null
          file_attachments?: string[] | null
          id?: string
          is_public?: boolean
          target_ids?: string[] | null
          target_type?: string | null
          title?: string
        }
        Relationships: []
      }
      appointments: {
        Row: {
          admin_notes: string | null
          authority: string
          created_at: string
          department: string | null
          email: string
          id: string
          name: string
          phone: string | null
          preferred_date: string
          preferred_time: string
          reason: string
          status: string
        }
        Insert: {
          admin_notes?: string | null
          authority: string
          created_at?: string
          department?: string | null
          email: string
          id?: string
          name: string
          phone?: string | null
          preferred_date: string
          preferred_time: string
          reason: string
          status?: string
        }
        Update: {
          admin_notes?: string | null
          authority?: string
          created_at?: string
          department?: string | null
          email?: string
          id?: string
          name?: string
          phone?: string | null
          preferred_date?: string
          preferred_time?: string
          reason?: string
          status?: string
        }
        Relationships: []
      }
      assessment_results: {
        Row: {
          assessment_id: string
          created_at: string | null
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
          created_at?: string | null
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
          created_at?: string | null
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
          {
            foreignKeyName: "assessment_results_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_submissions: {
        Row: {
          assessment_id: string
          comments: string | null
          created_at: string | null
          file_url: string | null
          id: string
          status: string
          student_id: string
          submission_date: string | null
        }
        Insert: {
          assessment_id: string
          comments?: string | null
          created_at?: string | null
          file_url?: string | null
          id?: string
          status?: string
          student_id: string
          submission_date?: string | null
        }
        Update: {
          assessment_id?: string
          comments?: string | null
          created_at?: string | null
          file_url?: string | null
          id?: string
          status?: string
          student_id?: string
          submission_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assessment_submissions_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_submissions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      assessments: {
        Row: {
          assessment_type: string
          class_id: string | null
          created_at: string | null
          due_date: string | null
          file_url: string | null
          id: string
          instructions: string | null
          is_published: boolean | null
          max_marks: number | null
          subject_id: string | null
          teacher_id: string
          title: string
        }
        Insert: {
          assessment_type?: string
          class_id?: string | null
          created_at?: string | null
          due_date?: string | null
          file_url?: string | null
          id?: string
          instructions?: string | null
          is_published?: boolean | null
          max_marks?: number | null
          subject_id?: string | null
          teacher_id: string
          title: string
        }
        Update: {
          assessment_type?: string
          class_id?: string | null
          created_at?: string | null
          due_date?: string | null
          file_url?: string | null
          id?: string
          instructions?: string | null
          is_published?: boolean | null
          max_marks?: number | null
          subject_id?: string | null
          teacher_id?: string
          title?: string
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
          class_id: string
          created_at: string
          id: string
          notes: string | null
          recorded_by: string | null
          status: string
          student_id: string
          updated_at: string
        }
        Insert: {
          attendance_date?: string
          class_id: string
          created_at?: string
          id?: string
          notes?: string | null
          recorded_by?: string | null
          status?: string
          student_id: string
          updated_at?: string
        }
        Update: {
          attendance_date?: string
          class_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          recorded_by?: string | null
          status?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
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
      bank_transactions: {
        Row: {
          account_number: string | null
          amount_usd: number
          amount_zig: number
          bank_name: string | null
          created_at: string
          description: string
          id: string
          matched_expense_id: string | null
          matched_payment_id: string | null
          matched_supplier_payment_id: string | null
          notes: string | null
          reconciliation_status: string
          recorded_by: string | null
          reference_number: string | null
          transaction_date: string
          transaction_type: string
        }
        Insert: {
          account_number?: string | null
          amount_usd?: number
          amount_zig?: number
          bank_name?: string | null
          created_at?: string
          description: string
          id?: string
          matched_expense_id?: string | null
          matched_payment_id?: string | null
          matched_supplier_payment_id?: string | null
          notes?: string | null
          reconciliation_status?: string
          recorded_by?: string | null
          reference_number?: string | null
          transaction_date?: string
          transaction_type?: string
        }
        Update: {
          account_number?: string | null
          amount_usd?: number
          amount_zig?: number
          bank_name?: string | null
          created_at?: string
          description?: string
          id?: string
          matched_expense_id?: string | null
          matched_payment_id?: string | null
          matched_supplier_payment_id?: string | null
          notes?: string | null
          reconciliation_status?: string
          recorded_by?: string | null
          reference_number?: string | null
          transaction_date?: string
          transaction_type?: string
        }
        Relationships: []
      }
      bed_allocations: {
        Row: {
          allocation_end_date: string | null
          allocation_start_date: string
          bed_number: string | null
          created_at: string
          created_by: string | null
          id: string
          room_id: string
          status: string
          student_id: string
        }
        Insert: {
          allocation_end_date?: string | null
          allocation_start_date?: string
          bed_number?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          room_id: string
          status?: string
          student_id: string
        }
        Update: {
          allocation_end_date?: string | null
          allocation_start_date?: string
          bed_number?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          room_id?: string
          status?: string
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
          {
            foreignKeyName: "bed_allocations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      carousel_images: {
        Row: {
          created_at: string
          display_order: number
          id: string
          image_url: string
          is_active: boolean
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          image_url: string
          is_active?: boolean
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string
          is_active?: boolean
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
          {
            foreignKeyName: "class_subjects_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "staff_public"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          capacity: number | null
          class_teacher_id: string | null
          created_at: string
          form_level: string | null
          id: string
          name: string
          room: string | null
          stream: string | null
        }
        Insert: {
          capacity?: number | null
          class_teacher_id?: string | null
          created_at?: string
          form_level?: string | null
          id?: string
          name: string
          room?: string | null
          stream?: string | null
        }
        Update: {
          capacity?: number | null
          class_teacher_id?: string | null
          created_at?: string
          form_level?: string | null
          id?: string
          name?: string
          room?: string | null
          stream?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "classes_class_teacher_id_fkey"
            columns: ["class_teacher_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classes_class_teacher_id_fkey"
            columns: ["class_teacher_id"]
            isOneToOne: false
            referencedRelation: "staff_public"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_logs: {
        Row: {
          channel: string
          created_at: string
          error_message: string | null
          id: string
          message: string
          recipient_count: number
          recipient_ids: string[] | null
          recipient_type: string
          reference: string | null
          scheduled_at: string | null
          sent_at: string | null
          sent_by: string | null
          status: string
          subject: string | null
          template_id: string | null
        }
        Insert: {
          channel?: string
          created_at?: string
          error_message?: string | null
          id?: string
          message: string
          recipient_count?: number
          recipient_ids?: string[] | null
          recipient_type?: string
          reference?: string | null
          scheduled_at?: string | null
          sent_at?: string | null
          sent_by?: string | null
          status?: string
          subject?: string | null
          template_id?: string | null
        }
        Update: {
          channel?: string
          created_at?: string
          error_message?: string | null
          id?: string
          message?: string
          recipient_count?: number
          recipient_ids?: string[] | null
          recipient_type?: string
          reference?: string | null
          scheduled_at?: string | null
          sent_at?: string | null
          sent_by?: string | null
          status?: string
          subject?: string | null
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "communication_logs_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "sms_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          subject: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          subject?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          subject?: string | null
        }
        Relationships: []
      }
      contracts: {
        Row: {
          contract_type: string
          created_at: string
          documents: string | null
          end_date: string | null
          id: string
          salary: number | null
          staff_id: string
          start_date: string
        }
        Insert: {
          contract_type?: string
          created_at?: string
          documents?: string | null
          end_date?: string | null
          id?: string
          salary?: number | null
          staff_id: string
          start_date: string
        }
        Update: {
          contract_type?: string
          created_at?: string
          documents?: string | null
          end_date?: string | null
          id?: string
          salary?: number | null
          staff_id?: string
          start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "contracts_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_public"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          id: string
          joined_at: string
          last_read_at: string | null
          user_id: string
        }
        Insert: {
          conversation_id: string
          id?: string
          joined_at?: string
          last_read_at?: string | null
          user_id: string
        }
        Update: {
          conversation_id?: string
          id?: string
          joined_at?: string
          last_read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          class_id: string | null
          created_at: string
          created_by: string
          id: string
          name: string | null
          type: string
          updated_at: string
        }
        Insert: {
          class_id?: string | null
          created_at?: string
          created_by: string
          id?: string
          name?: string | null
          type?: string
          updated_at?: string
        }
        Update: {
          class_id?: string | null
          created_at?: string
          created_by?: string
          id?: string
          name?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      downloads: {
        Row: {
          category: string
          created_at: string
          description: string | null
          file_url: string
          id: string
          title: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          file_url: string
          id?: string
          title: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          file_url?: string
          id?: string
          title?: string
        }
        Relationships: []
      }
      enrollments: {
        Row: {
          academic_year: string
          class_id: string | null
          created_at: string
          enrollment_date: string | null
          id: string
          student_id: string
        }
        Insert: {
          academic_year: string
          class_id?: string | null
          created_at?: string
          enrollment_date?: string | null
          id?: string
          student_id: string
        }
        Update: {
          academic_year?: string
          class_id?: string | null
          created_at?: string
          enrollment_date?: string | null
          id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string
          description: string | null
          event_date: string
          event_type: string
          id: string
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          event_date: string
          event_type?: string
          id?: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          event_date?: string
          event_type?: string
          id?: string
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
          mark: number
          student_id: string
          subject_id: string
          teacher_comment: string | null
        }
        Insert: {
          created_at?: string
          exam_id: string
          grade?: string | null
          id?: string
          mark?: number
          student_id: string
          subject_id: string
          teacher_comment?: string | null
        }
        Update: {
          created_at?: string
          exam_id?: string
          grade?: string | null
          id?: string
          mark?: number
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
            foreignKeyName: "exam_results_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
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
          created_at: string
          end_time: string
          exam_date: string
          exam_id: string
          id: string
          invigilators: string[] | null
          notes: string | null
          start_time: string
          subject_id: string
          venue: string | null
        }
        Insert: {
          created_at?: string
          end_time: string
          exam_date: string
          exam_id: string
          id?: string
          invigilators?: string[] | null
          notes?: string | null
          start_time: string
          subject_id: string
          venue?: string | null
        }
        Update: {
          created_at?: string
          end_time?: string
          exam_date?: string
          exam_id?: string
          id?: string
          invigilators?: string[] | null
          notes?: string | null
          start_time?: string
          subject_id?: string
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
          academic_year: string
          created_at: string
          end_date: string | null
          exam_type: string
          form_level: string
          id: string
          is_published: boolean
          name: string
          start_date: string | null
          subject_ids: string[] | null
          term: string
        }
        Insert: {
          academic_year?: string
          created_at?: string
          end_date?: string | null
          exam_type?: string
          form_level: string
          id?: string
          is_published?: boolean
          name: string
          start_date?: string | null
          subject_ids?: string[] | null
          term?: string
        }
        Update: {
          academic_year?: string
          created_at?: string
          end_date?: string | null
          exam_type?: string
          form_level?: string
          id?: string
          is_published?: boolean
          name?: string
          start_date?: string | null
          subject_ids?: string[] | null
          term?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount_usd: number
          amount_zig: number
          category: string
          created_at: string
          description: string
          expense_date: string
          id: string
          payment_method: string
          receipt_url: string | null
          recorded_by: string | null
          reference_number: string | null
        }
        Insert: {
          amount_usd?: number
          amount_zig?: number
          category?: string
          created_at?: string
          description: string
          expense_date?: string
          id?: string
          payment_method?: string
          receipt_url?: string | null
          recorded_by?: string | null
          reference_number?: string | null
        }
        Update: {
          amount_usd?: number
          amount_zig?: number
          category?: string
          created_at?: string
          description?: string
          expense_date?: string
          id?: string
          payment_method?: string
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
          facility_type: string
          id: string
          image_url: string
          is_active: boolean
        }
        Insert: {
          caption?: string | null
          created_at?: string
          facility_type?: string
          id?: string
          image_url: string
          is_active?: boolean
        }
        Update: {
          caption?: string | null
          created_at?: string
          facility_type?: string
          id?: string
          image_url?: string
          is_active?: boolean
        }
        Relationships: []
      }
      fee_structures: {
        Row: {
          academic_year: string
          amount_usd: number
          amount_zig: number
          boarding_status: string
          created_at: string
          description: string | null
          form: string
          id: string
          is_active: boolean
          term: string
        }
        Insert: {
          academic_year: string
          amount_usd?: number
          amount_zig?: number
          boarding_status?: string
          created_at?: string
          description?: string | null
          form: string
          id?: string
          is_active?: boolean
          term: string
        }
        Update: {
          academic_year?: string
          amount_usd?: number
          amount_zig?: number
          boarding_status?: string
          created_at?: string
          description?: string | null
          form?: string
          id?: string
          is_active?: boolean
          term?: string
        }
        Relationships: []
      }
      finance_approval_requests: {
        Row: {
          action_type: string
          created_at: string
          description: string
          id: string
          metadata: Json | null
          requested_by: string
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          target_id: string
          target_table: string
        }
        Insert: {
          action_type: string
          created_at?: string
          description: string
          id?: string
          metadata?: Json | null
          requested_by: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          target_id: string
          target_table: string
        }
        Update: {
          action_type?: string
          created_at?: string
          description?: string
          id?: string
          metadata?: Json | null
          requested_by?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          target_id?: string
          target_table?: string
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
          is_active: boolean
        }
        Insert: {
          caption?: string | null
          category?: string | null
          created_at?: string
          id?: string
          image_url: string
          is_active?: boolean
        }
        Update: {
          caption?: string | null
          category?: string | null
          created_at?: string
          id?: string
          image_url?: string
          is_active?: boolean
        }
        Relationships: []
      }
      guardians: {
        Row: {
          created_at: string
          email: string | null
          id: string
          is_primary: boolean
          name: string
          phone: string | null
          relationship: string | null
          student_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          is_primary?: boolean
          name: string
          phone?: string | null
          relationship?: string | null
          student_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          is_primary?: boolean
          name?: string
          phone?: string | null
          relationship?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guardians_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      health_visits: {
        Row: {
          created_at: string
          diagnosis: string | null
          follow_up_date: string | null
          id: string
          medication_given: string | null
          notes: string | null
          parent_notified: boolean
          student_id: string
          symptoms: string | null
          treatment: string | null
          visit_date: string
          visited_by: string | null
        }
        Insert: {
          created_at?: string
          diagnosis?: string | null
          follow_up_date?: string | null
          id?: string
          medication_given?: string | null
          notes?: string | null
          parent_notified?: boolean
          student_id: string
          symptoms?: string | null
          treatment?: string | null
          visit_date?: string
          visited_by?: string | null
        }
        Update: {
          created_at?: string
          diagnosis?: string | null
          follow_up_date?: string | null
          id?: string
          medication_given?: string | null
          notes?: string | null
          parent_notified?: boolean
          student_id?: string
          symptoms?: string | null
          treatment?: string | null
          visit_date?: string
          visited_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "health_visits_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      homework: {
        Row: {
          class_id: string
          created_at: string
          description: string | null
          due_date: string
          id: string
          subject_id: string
          teacher_id: string
          title: string
        }
        Insert: {
          class_id: string
          created_at?: string
          description?: string | null
          due_date: string
          id?: string
          subject_id: string
          teacher_id: string
          title: string
        }
        Update: {
          class_id?: string
          created_at?: string
          description?: string | null
          due_date?: string
          id?: string
          subject_id?: string
          teacher_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "homework_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "homework_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      hostels: {
        Row: {
          assistant_housemaster_id: string | null
          created_at: string
          current_occupancy: number
          description: string | null
          housemaster_id: string | null
          id: string
          is_active: boolean
          location: string | null
          name: string
          phone: string | null
          total_capacity: number
        }
        Insert: {
          assistant_housemaster_id?: string | null
          created_at?: string
          current_occupancy?: number
          description?: string | null
          housemaster_id?: string | null
          id?: string
          is_active?: boolean
          location?: string | null
          name: string
          phone?: string | null
          total_capacity?: number
        }
        Update: {
          assistant_housemaster_id?: string | null
          created_at?: string
          current_occupancy?: number
          description?: string | null
          housemaster_id?: string | null
          id?: string
          is_active?: boolean
          location?: string | null
          name?: string
          phone?: string | null
          total_capacity?: number
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
            foreignKeyName: "hostels_assistant_housemaster_id_fkey"
            columns: ["assistant_housemaster_id"]
            isOneToOne: false
            referencedRelation: "staff_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hostels_housemaster_id_fkey"
            columns: ["housemaster_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hostels_housemaster_id_fkey"
            columns: ["housemaster_id"]
            isOneToOne: false
            referencedRelation: "staff_public"
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
          quantity: number
          reorder_level: number | null
          supplier: string | null
          supplier_contact: string | null
          unit: string
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
          quantity?: number
          reorder_level?: number | null
          supplier?: string | null
          supplier_contact?: string | null
          unit?: string
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
          quantity?: number
          reorder_level?: number | null
          supplier?: string | null
          supplier_contact?: string | null
          unit?: string
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
          created_by: string | null
          id: string
          item_id: string
          notes: string | null
          quantity: number
          reference: string | null
          transaction_type: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          item_id: string
          notes?: string | null
          quantity: number
          reference?: string | null
          transaction_type?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
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
      invoice_items: {
        Row: {
          amount_usd: number
          amount_zig: number
          description: string
          fee_structure_id: string | null
          id: string
          invoice_id: string
        }
        Insert: {
          amount_usd?: number
          amount_zig?: number
          description: string
          fee_structure_id?: string | null
          id?: string
          invoice_id: string
        }
        Update: {
          amount_usd?: number
          amount_zig?: number
          description?: string
          fee_structure_id?: string | null
          id?: string
          invoice_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_fee_structure_id_fkey"
            columns: ["fee_structure_id"]
            isOneToOne: false
            referencedRelation: "fee_structures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          academic_year: string
          created_at: string
          due_date: string | null
          id: string
          invoice_number: string
          notes: string | null
          paid_usd: number
          paid_zig: number
          status: string
          student_id: string
          term: string
          total_usd: number
          total_zig: number
        }
        Insert: {
          academic_year: string
          created_at?: string
          due_date?: string | null
          id?: string
          invoice_number: string
          notes?: string | null
          paid_usd?: number
          paid_zig?: number
          status?: string
          student_id: string
          term: string
          total_usd?: number
          total_zig?: number
        }
        Update: {
          academic_year?: string
          created_at?: string
          due_date?: string | null
          id?: string
          invoice_number?: string
          notes?: string | null
          paid_usd?: number
          paid_zig?: number
          status?: string
          student_id?: string
          term?: string
          total_usd?: number
          total_zig?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoices_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
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
          status: string
        }
        Insert: {
          approved_by?: string | null
          created_at?: string
          end_date: string
          id?: string
          leave_type?: string
          reason?: string | null
          staff_id: string
          start_date: string
          status?: string
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
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "leave_requests_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_requests_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_public"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_plans: {
        Row: {
          assessment_strategy: string | null
          class_id: string | null
          conclusion: string | null
          created_at: string
          date: string
          duration_minutes: number | null
          homework_notes: string | null
          id: string
          introduction: string | null
          main_activity: string | null
          materials_needed: string | null
          objectives: string | null
          reflection: string | null
          status: string
          subject_id: string | null
          teacher_id: string
          title: string
          updated_at: string
        }
        Insert: {
          assessment_strategy?: string | null
          class_id?: string | null
          conclusion?: string | null
          created_at?: string
          date?: string
          duration_minutes?: number | null
          homework_notes?: string | null
          id?: string
          introduction?: string | null
          main_activity?: string | null
          materials_needed?: string | null
          objectives?: string | null
          reflection?: string | null
          status?: string
          subject_id?: string | null
          teacher_id: string
          title: string
          updated_at?: string
        }
        Update: {
          assessment_strategy?: string | null
          class_id?: string | null
          conclusion?: string | null
          created_at?: string
          date?: string
          duration_minutes?: number | null
          homework_notes?: string | null
          id?: string
          introduction?: string | null
          main_activity?: string | null
          materials_needed?: string | null
          objectives?: string | null
          reflection?: string | null
          status?: string
          subject_id?: string | null
          teacher_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_plans_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_plans_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      marks: {
        Row: {
          assessment_type: string
          comment: string | null
          created_at: string
          description: string | null
          id: string
          mark: number
          student_id: string
          subject_id: string
          teacher_id: string
          term: string
        }
        Insert: {
          assessment_type?: string
          comment?: string | null
          created_at?: string
          description?: string | null
          id?: string
          mark: number
          student_id: string
          subject_id: string
          teacher_id: string
          term?: string
        }
        Update: {
          assessment_type?: string
          comment?: string | null
          created_at?: string
          description?: string | null
          id?: string
          mark?: number
          student_id?: string
          subject_id?: string
          teacher_id?: string
          term?: string
        }
        Relationships: [
          {
            foreignKeyName: "marks_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
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
          description: string | null
          id: string
          location: string | null
          meeting_date: string
          meeting_type: string
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          location?: string | null
          meeting_date: string
          meeting_type?: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          location?: string | null
          meeting_date?: string
          meeting_type?: string
          title?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          message_type: string
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          message_type?: string
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          message_type?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          message: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      online_payments: {
        Row: {
          amount_usd: number
          completed_at: string | null
          created_at: string
          currency: string
          description: string | null
          id: string
          payer_email: string
          payer_name: string
          payer_phone: string | null
          payment_type: string
          project_id: string | null
          status: string
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
          student_id: string | null
          student_number: string | null
        }
        Insert: {
          amount_usd?: number
          completed_at?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          payer_email: string
          payer_name: string
          payer_phone?: string | null
          payment_type?: string
          project_id?: string | null
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          student_id?: string | null
          student_number?: string | null
        }
        Update: {
          amount_usd?: number
          completed_at?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          payer_email?: string
          payer_name?: string
          payer_phone?: string | null
          payment_type?: string
          project_id?: string | null
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          student_id?: string | null
          student_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "online_payments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "school_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "online_payments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      parent_communication_logs: {
        Row: {
          communication_type: string
          created_at: string
          follow_up_completed: boolean | null
          follow_up_date: string | null
          id: string
          notes: string | null
          parent_name: string | null
          student_id: string | null
          subject: string
          teacher_id: string
        }
        Insert: {
          communication_type?: string
          created_at?: string
          follow_up_completed?: boolean | null
          follow_up_date?: string | null
          id?: string
          notes?: string | null
          parent_name?: string | null
          student_id?: string | null
          subject: string
          teacher_id: string
        }
        Update: {
          communication_type?: string
          created_at?: string
          follow_up_completed?: boolean | null
          follow_up_date?: string | null
          id?: string
          notes?: string | null
          parent_name?: string | null
          student_id?: string | null
          subject?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "parent_communication_logs_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      parent_students: {
        Row: {
          created_at: string
          id: string
          parent_id: string
          student_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          parent_id: string
          student_id: string
        }
        Update: {
          created_at?: string
          id?: string
          parent_id?: string
          student_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount_usd: number
          amount_zig: number
          created_at: string
          id: string
          invoice_id: string | null
          notes: string | null
          payment_date: string
          payment_method: string
          receipt_number: string
          recorded_by: string | null
          reference_number: string | null
          student_id: string
        }
        Insert: {
          amount_usd?: number
          amount_zig?: number
          created_at?: string
          id?: string
          invoice_id?: string | null
          notes?: string | null
          payment_date?: string
          payment_method?: string
          receipt_number: string
          recorded_by?: string | null
          reference_number?: string | null
          student_id: string
        }
        Update: {
          amount_usd?: number
          amount_zig?: number
          created_at?: string
          id?: string
          invoice_id?: string | null
          notes?: string | null
          payment_date?: string
          payment_method?: string
          receipt_number?: string
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
          {
            foreignKeyName: "payments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      personal_timetables: {
        Row: {
          activity: string
          activity_type: string
          created_at: string
          day_of_week: number
          description: string | null
          end_time: string | null
          id: string
          location: string | null
          time_slot: string
          user_id: string
        }
        Insert: {
          activity: string
          activity_type?: string
          created_at?: string
          day_of_week: number
          description?: string | null
          end_time?: string | null
          id?: string
          location?: string | null
          time_slot: string
          user_id: string
        }
        Update: {
          activity?: string
          activity_type?: string
          created_at?: string
          day_of_week?: number
          description?: string | null
          end_time?: string | null
          id?: string
          location?: string | null
          time_slot?: string
          user_id?: string
        }
        Relationships: []
      }
      petty_cash: {
        Row: {
          amount_usd: number
          amount_zig: number
          created_at: string
          description: string
          id: string
          recorded_by: string | null
          reference_number: string | null
          transaction_date: string
          transaction_type: string
        }
        Insert: {
          amount_usd?: number
          amount_zig?: number
          created_at?: string
          description: string
          id?: string
          recorded_by?: string | null
          reference_number?: string | null
          transaction_date?: string
          transaction_type?: string
        }
        Update: {
          amount_usd?: number
          amount_zig?: number
          created_at?: string
          description?: string
          id?: string
          recorded_by?: string | null
          reference_number?: string | null
          transaction_date?: string
          transaction_type?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          class_name: string | null
          created_at: string
          email: string | null
          full_name: string
          grade: string | null
          id: string
          phone: string | null
        }
        Insert: {
          avatar_url?: string | null
          class_name?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          grade?: string | null
          id: string
          phone?: string | null
        }
        Update: {
          avatar_url?: string | null
          class_name?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          grade?: string | null
          id?: string
          phone?: string | null
        }
        Relationships: []
      }
      rooms: {
        Row: {
          capacity: number
          created_at: string
          current_occupancy: number
          floor: number | null
          hostel_id: string
          id: string
          notes: string | null
          room_number: string
          room_type: string
        }
        Insert: {
          capacity?: number
          created_at?: string
          current_occupancy?: number
          floor?: number | null
          hostel_id: string
          id?: string
          notes?: string | null
          room_number: string
          room_type?: string
        }
        Update: {
          capacity?: number
          created_at?: string
          current_occupancy?: number
          floor?: number | null
          hostel_id?: string
          id?: string
          notes?: string | null
          room_number?: string
          room_type?: string
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
          is_active: boolean
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          title?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          id: string
          setting_key: string
          setting_value: string
          updated_at: string
        }
        Insert: {
          id?: string
          setting_key: string
          setting_value: string
          updated_at?: string
        }
        Update: {
          id?: string
          setting_key?: string
          setting_value?: string
          updated_at?: string
        }
        Relationships: []
      }
      sms_templates: {
        Row: {
          category: string
          created_at: string
          id: string
          name: string
          template_text: string
          variables: string[] | null
        }
        Insert: {
          category?: string
          created_at?: string
          id?: string
          name: string
          template_text: string
          variables?: string[] | null
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          name?: string
          template_text?: string
          variables?: string[] | null
        }
        Relationships: []
      }
      sports_schedule: {
        Row: {
          academic_year: string | null
          activity_name: string
          activity_type: string
          class_id: string | null
          coach_id: string | null
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          start_time: string
          term: string | null
          venue: string | null
        }
        Insert: {
          academic_year?: string | null
          activity_name: string
          activity_type?: string
          class_id?: string | null
          coach_id?: string | null
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          start_time: string
          term?: string | null
          venue?: string | null
        }
        Update: {
          academic_year?: string | null
          activity_name?: string
          activity_type?: string
          class_id?: string | null
          coach_id?: string | null
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          start_time?: string
          term?: string | null
          venue?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sports_schedule_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sports_schedule_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sports_schedule_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "staff_public"
            referencedColumns: ["id"]
          },
        ]
      }
      staff: {
        Row: {
          address: string | null
          bank_details: string | null
          bio: string | null
          category: string
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
          user_id: string | null
        }
        Insert: {
          address?: string | null
          bank_details?: string | null
          bio?: string | null
          category?: string
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
          user_id?: string | null
        }
        Update: {
          address?: string | null
          bank_details?: string | null
          bio?: string | null
          category?: string
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
          user_id?: string | null
        }
        Relationships: []
      }
      student_classes: {
        Row: {
          class_id: string
          id: string
          student_id: string
        }
        Insert: {
          class_id: string
          id?: string
          student_id: string
        }
        Update: {
          class_id?: string
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
      student_restrictions: {
        Row: {
          applied_at: string
          applied_by: string | null
          id: string
          is_active: boolean
          removed_at: string | null
          restriction_type: string
          student_id: string
        }
        Insert: {
          applied_at?: string
          applied_by?: string | null
          id?: string
          is_active?: boolean
          removed_at?: string | null
          restriction_type: string
          student_id: string
        }
        Update: {
          applied_at?: string
          applied_by?: string | null
          id?: string
          is_active?: boolean
          removed_at?: string | null
          restriction_type?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_restrictions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
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
          created_at: string
          date_of_birth: string | null
          deleted_at: string | null
          email: string | null
          emergency_contact: string | null
          enrollment_date: string | null
          form: string
          full_name: string
          gender: string | null
          guardian_email: string | null
          guardian_name: string | null
          guardian_phone: string | null
          has_medical_alert: boolean
          id: string
          medical_conditions: string | null
          profile_photo_url: string | null
          sports_activities: string[] | null
          status: string
          stream: string | null
          subject_combination: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          admission_number?: string | null
          boarding_status?: string | null
          created_at?: string
          date_of_birth?: string | null
          deleted_at?: string | null
          email?: string | null
          emergency_contact?: string | null
          enrollment_date?: string | null
          form?: string
          full_name: string
          gender?: string | null
          guardian_email?: string | null
          guardian_name?: string | null
          guardian_phone?: string | null
          has_medical_alert?: boolean
          id?: string
          medical_conditions?: string | null
          profile_photo_url?: string | null
          sports_activities?: string[] | null
          status?: string
          stream?: string | null
          subject_combination?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          admission_number?: string | null
          boarding_status?: string | null
          created_at?: string
          date_of_birth?: string | null
          deleted_at?: string | null
          email?: string | null
          emergency_contact?: string | null
          enrollment_date?: string | null
          form?: string
          full_name?: string
          gender?: string | null
          guardian_email?: string | null
          guardian_name?: string | null
          guardian_phone?: string | null
          has_medical_alert?: boolean
          id?: string
          medical_conditions?: string | null
          profile_photo_url?: string | null
          sports_activities?: string[] | null
          status?: string
          stream?: string | null
          subject_combination?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      study_materials: {
        Row: {
          class_id: string | null
          created_at: string
          description: string | null
          download_count: number
          expiry_date: string | null
          file_url: string | null
          id: string
          is_published: boolean
          link_url: string | null
          material_type: string
          subject_id: string | null
          tags: string[] | null
          teacher_id: string
          thumbnail_url: string | null
          title: string
        }
        Insert: {
          class_id?: string | null
          created_at?: string
          description?: string | null
          download_count?: number
          expiry_date?: string | null
          file_url?: string | null
          id?: string
          is_published?: boolean
          link_url?: string | null
          material_type?: string
          subject_id?: string | null
          tags?: string[] | null
          teacher_id: string
          thumbnail_url?: string | null
          title: string
        }
        Update: {
          class_id?: string | null
          created_at?: string
          description?: string | null
          download_count?: number
          expiry_date?: string | null
          file_url?: string | null
          id?: string
          is_published?: boolean
          link_url?: string | null
          material_type?: string
          subject_id?: string | null
          tags?: string[] | null
          teacher_id?: string
          thumbnail_url?: string | null
          title?: string
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
          form_levels: string[] | null
          id: string
          is_examinable: boolean | null
          name: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          department?: string | null
          form_levels?: string[] | null
          id?: string
          is_examinable?: boolean | null
          name: string
        }
        Update: {
          code?: string | null
          created_at?: string
          department?: string | null
          form_levels?: string[] | null
          id?: string
          is_examinable?: boolean | null
          name?: string
        }
        Relationships: []
      }
      supplier_invoices: {
        Row: {
          amount_usd: number
          amount_zig: number
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          invoice_date: string
          invoice_number: string
          paid_usd: number
          paid_zig: number
          recorded_by: string | null
          status: string
          supplier_contact: string | null
          supplier_name: string
        }
        Insert: {
          amount_usd?: number
          amount_zig?: number
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          invoice_date?: string
          invoice_number: string
          paid_usd?: number
          paid_zig?: number
          recorded_by?: string | null
          status?: string
          supplier_contact?: string | null
          supplier_name: string
        }
        Update: {
          amount_usd?: number
          amount_zig?: number
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          invoice_date?: string
          invoice_number?: string
          paid_usd?: number
          paid_zig?: number
          recorded_by?: string | null
          status?: string
          supplier_contact?: string | null
          supplier_name?: string
        }
        Relationships: []
      }
      supplier_payments: {
        Row: {
          amount_usd: number
          amount_zig: number
          created_at: string
          id: string
          notes: string | null
          payment_date: string
          payment_method: string
          recorded_by: string | null
          reference_number: string | null
          supplier_invoice_id: string
        }
        Insert: {
          amount_usd?: number
          amount_zig?: number
          created_at?: string
          id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: string
          recorded_by?: string | null
          reference_number?: string | null
          supplier_invoice_id: string
        }
        Update: {
          amount_usd?: number
          amount_zig?: number
          created_at?: string
          id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: string
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
      teacher_resources: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_favorite: boolean | null
          resource_type: string
          subject_id: string | null
          tags: string[] | null
          teacher_id: string
          title: string
          url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_favorite?: boolean | null
          resource_type?: string
          subject_id?: string | null
          tags?: string[] | null
          teacher_id: string
          title: string
          url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_favorite?: boolean | null
          resource_type?: string
          subject_id?: string | null
          tags?: string[] | null
          teacher_id?: string
          title?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teacher_resources_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      term_registrations: {
        Row: {
          academic_year: string
          boarding_status: string | null
          id: string
          invoice_id: string | null
          registered_at: string
          registered_by: string | null
          student_id: string
          subjects: string[] | null
          term: string
        }
        Insert: {
          academic_year: string
          boarding_status?: string | null
          id?: string
          invoice_id?: string | null
          registered_at?: string
          registered_by?: string | null
          student_id: string
          subjects?: string[] | null
          term: string
        }
        Update: {
          academic_year?: string
          boarding_status?: string | null
          id?: string
          invoice_id?: string | null
          registered_at?: string
          registered_by?: string | null
          student_id?: string
          subjects?: string[] | null
          term?: string
        }
        Relationships: [
          {
            foreignKeyName: "term_registrations_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "term_registrations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      term_reports: {
        Row: {
          academic_year: string
          assessment_data: Json | null
          average_mark: number | null
          class_id: string | null
          class_rank: number | null
          class_size: number | null
          class_teacher_comment: string | null
          created_at: string
          exam_data: Json | null
          form_level: string
          form_rank: number | null
          form_size: number | null
          generated_at: string | null
          generated_by: string | null
          head_comment: string | null
          id: string
          is_published: boolean | null
          overall_grade: string | null
          student_id: string
          term: string
          total_marks: number | null
        }
        Insert: {
          academic_year: string
          assessment_data?: Json | null
          average_mark?: number | null
          class_id?: string | null
          class_rank?: number | null
          class_size?: number | null
          class_teacher_comment?: string | null
          created_at?: string
          exam_data?: Json | null
          form_level: string
          form_rank?: number | null
          form_size?: number | null
          generated_at?: string | null
          generated_by?: string | null
          head_comment?: string | null
          id?: string
          is_published?: boolean | null
          overall_grade?: string | null
          student_id: string
          term: string
          total_marks?: number | null
        }
        Update: {
          academic_year?: string
          assessment_data?: Json | null
          average_mark?: number | null
          class_id?: string | null
          class_rank?: number | null
          class_size?: number | null
          class_teacher_comment?: string | null
          created_at?: string
          exam_data?: Json | null
          form_level?: string
          form_rank?: number | null
          form_size?: number | null
          generated_at?: string | null
          generated_by?: string | null
          head_comment?: string | null
          id?: string
          is_published?: boolean | null
          overall_grade?: string | null
          student_id?: string
          term?: string
          total_marks?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "term_reports_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "term_reports_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
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
          issue_date: string
          issued_by: string | null
          return_date: string | null
          status: string
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
          issue_date?: string
          issued_by?: string | null
          return_date?: string | null
          status?: string
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
          issue_date?: string
          issued_by?: string | null
          return_date?: string | null
          status?: string
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
          {
            foreignKeyName: "textbook_issues_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      timetable: {
        Row: {
          class_id: string
          day_of_week: number
          id: string
          subject_id: string | null
          time_slot: string
        }
        Insert: {
          class_id: string
          day_of_week: number
          id?: string
          subject_id?: string | null
          time_slot: string
        }
        Update: {
          class_id?: string
          day_of_week?: number
          id?: string
          subject_id?: string | null
          time_slot?: string
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
          academic_year: string | null
          class_id: string
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          room: string | null
          start_time: string
          subject_id: string | null
          teacher_id: string | null
          term: string | null
        }
        Insert: {
          academic_year?: string | null
          class_id: string
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          room?: string | null
          start_time: string
          subject_id?: string | null
          teacher_id?: string | null
          term?: string | null
        }
        Update: {
          academic_year?: string | null
          class_id?: string
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          room?: string | null
          start_time?: string
          subject_id?: string | null
          teacher_id?: string | null
          term?: string | null
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
          {
            foreignKeyName: "timetable_entries_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "staff_public"
            referencedColumns: ["id"]
          },
        ]
      }
      user_blocks: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string
          id: string
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string
          id?: string
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      user_reports: {
        Row: {
          created_at: string
          details: string | null
          id: string
          reason: string
          reported_id: string
          reporter_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          created_at?: string
          details?: string | null
          id?: string
          reason: string
          reported_id: string
          reporter_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          details?: string | null
          id?: string
          reason?: string
          reported_id?: string
          reporter_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
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
      users: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          role: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          role?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          role?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      staff_public: {
        Row: {
          bio: string | null
          category: string | null
          department: string | null
          full_name: string | null
          id: string | null
          photo_url: string | null
          title: string | null
        }
        Insert: {
          bio?: string | null
          category?: string | null
          department?: string | null
          full_name?: string | null
          id?: string | null
          photo_url?: string | null
          title?: string | null
        }
        Update: {
          bio?: string | null
          category?: string | null
          department?: string | null
          full_name?: string | null
          id?: string | null
          photo_url?: string | null
          title?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      column_exists: { Args: { col: string; tbl: string }; Returns: boolean }
      delete_class_cascade: { Args: { _class_id: string }; Returns: undefined }
      delete_staff_cascade: { Args: { _staff_id: string }; Returns: undefined }
      delete_student_cascade: {
        Args: { _student_id: string }
        Returns: undefined
      }
      get_exam_rankings: {
        Args: { p_exam_id: string; p_student_id: string }
        Returns: Json
      }
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
      is_conversation_participant: {
        Args: { _conversation_id: string; _user_id: string }
        Returns: boolean
      }
      recalculate_invoice_payment_totals: {
        Args: { p_invoice_id: string }
        Returns: undefined
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
        | "finance_clerk"
        | "bursar"
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
        "finance_clerk",
        "bursar",
      ],
    },
  },
} as const
