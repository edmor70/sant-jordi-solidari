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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      billing_audit: {
        Row: {
          action: string
          actor: string | null
          created_at: string
          detail: Json
          entity_id: string | null
          id: number
        }
        Insert: {
          action: string
          actor?: string | null
          created_at?: string
          detail?: Json
          entity_id?: string | null
          id?: never
        }
        Update: {
          action?: string
          actor?: string | null
          created_at?: string
          detail?: Json
          entity_id?: string | null
          id?: never
        }
        Relationships: []
      }
      billing_counters: {
        Row: {
          fiscal_year: number
          is_test: boolean
          last_number: number
          series: string
        }
        Insert: {
          fiscal_year: number
          is_test: boolean
          last_number?: number
          series: string
        }
        Update: {
          fiscal_year?: number
          is_test?: boolean
          last_number?: number
          series?: string
        }
        Relationships: []
      }
      billing_dispatch: {
        Row: {
          attempts: number
          email_error: string | null
          email_sent_at: string | null
          email_status: string
          invoice_id: string
          lease_until: string | null
          notion_error: string | null
          notion_page_id: string | null
          notion_status: string
          pdf_path: string | null
          pdf_sha256: string | null
          provider_id: string | null
        }
        Insert: {
          attempts?: number
          email_error?: string | null
          email_sent_at?: string | null
          email_status?: string
          invoice_id: string
          lease_until?: string | null
          notion_error?: string | null
          notion_page_id?: string | null
          notion_status?: string
          pdf_path?: string | null
          pdf_sha256?: string | null
          provider_id?: string | null
        }
        Update: {
          attempts?: number
          email_error?: string | null
          email_sent_at?: string | null
          email_status?: string
          invoice_id?: string
          lease_until?: string | null
          notion_error?: string | null
          notion_page_id?: string | null
          notion_status?: string
          pdf_path?: string | null
          pdf_sha256?: string | null
          provider_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_dispatch_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: true
            referencedRelation: "billing_invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_events: {
        Row: {
          actor: string
          amount: number
          created_at: string
          id: string
          idempotency_key: string
          kind: string
          operation_date: string
          order_id: string
          reason: string
        }
        Insert: {
          actor: string
          amount?: number
          created_at?: string
          id?: string
          idempotency_key: string
          kind: string
          operation_date: string
          order_id: string
          reason?: string
        }
        Update: {
          actor?: string
          amount?: number
          created_at?: string
          id?: string
          idempotency_key?: string
          kind?: string
          operation_date?: string
          order_id?: string
          reason?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "billing_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_invoices: {
        Row: {
          actor: string
          base: number
          event_id: string
          fiscal_year: number
          id: string
          is_test: boolean
          issued_at: string
          kind: string
          number: string
          operation_date: string
          order_id: string
          original_invoice_id: string | null
          reason: string
          sequence_number: number
          series: string
          snapshot: Json
          total: number
          vat: number
        }
        Insert: {
          actor: string
          base: number
          event_id: string
          fiscal_year: number
          id?: string
          is_test?: boolean
          issued_at?: string
          kind: string
          number: string
          operation_date: string
          order_id: string
          original_invoice_id?: string | null
          reason?: string
          sequence_number: number
          series: string
          snapshot: Json
          total: number
          vat: number
        }
        Update: {
          actor?: string
          base?: number
          event_id?: string
          fiscal_year?: number
          id?: string
          is_test?: boolean
          issued_at?: string
          kind?: string
          number?: string
          operation_date?: string
          order_id?: string
          original_invoice_id?: string | null
          reason?: string
          sequence_number?: number
          series?: string
          snapshot?: Json
          total?: number
          vat?: number
        }
        Relationships: [
          {
            foreignKeyName: "billing_invoices_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: true
            referencedRelation: "billing_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_invoices_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "billing_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_invoices_original_invoice_id_fkey"
            columns: ["original_invoice_id"]
            isOneToOne: false
            referencedRelation: "billing_invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_orders: {
        Row: {
          created_at: string
          customer: Json
          id: string
          is_test: boolean
          lines: Json
          reservation_id: string | null
          status: string
        }
        Insert: {
          created_at?: string
          customer: Json
          id?: string
          is_test?: boolean
          lines: Json
          reservation_id?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          customer?: Json
          id?: string
          is_test?: boolean
          lines?: Json
          reservation_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_orders_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "quote_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_document_dispatch: {
        Row: {
          document_id: string
          email_error: string | null
          email_status: string
          lease_token: string | null
          lease_until: string | null
          mail_payload: Json | null
          mail_prepared_at: string | null
          notion_error: string | null
          notion_page_id: string | null
          notion_status: string
          pdf_path: string | null
          pdf_sha256: string | null
          provider_id: string | null
        }
        Insert: {
          document_id: string
          email_error?: string | null
          email_status?: string
          lease_token?: string | null
          lease_until?: string | null
          mail_payload?: Json | null
          mail_prepared_at?: string | null
          notion_error?: string | null
          notion_page_id?: string | null
          notion_status?: string
          pdf_path?: string | null
          pdf_sha256?: string | null
          provider_id?: string | null
        }
        Update: {
          document_id?: string
          email_error?: string | null
          email_status?: string
          lease_token?: string | null
          lease_until?: string | null
          mail_payload?: Json | null
          mail_prepared_at?: string | null
          notion_error?: string | null
          notion_page_id?: string | null
          notion_status?: string
          pdf_path?: string | null
          pdf_sha256?: string | null
          provider_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_document_dispatch_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: true
            referencedRelation: "payment_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_documents: {
        Row: {
          advance_document_id: string | null
          base: number
          due_date: string
          id: string
          issued_date: string
          number: string
          operation_id: string
          paid: number
          stage: string
          total: number
          vat: number
        }
        Insert: {
          advance_document_id?: string | null
          base: number
          due_date: string
          id?: string
          issued_date?: string
          number: string
          operation_id: string
          paid?: number
          stage: string
          total: number
          vat: number
        }
        Update: {
          advance_document_id?: string | null
          base?: number
          due_date?: string
          id?: string
          issued_date?: string
          number?: string
          operation_id?: string
          paid?: number
          stage?: string
          total?: number
          vat?: number
        }
        Relationships: [
          {
            foreignKeyName: "payment_documents_advance_document_id_fkey"
            columns: ["advance_document_id"]
            isOneToOne: false
            referencedRelation: "payment_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_documents_operation_id_fkey"
            columns: ["operation_id"]
            isOneToOne: false
            referencedRelation: "payment_operations"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_operation_counters: {
        Row: {
          is_test: boolean
          last_number: number
        }
        Insert: {
          is_test: boolean
          last_number?: number
        }
        Update: {
          is_test?: boolean
          last_number?: number
        }
        Relationships: []
      }
      payment_operations: {
        Row: {
          created_at: string
          id: string
          is_test: boolean
          operation_key: string
          order_id: string | null
          plan: string
          reservation_id: string | null
          sequence_number: number
          snapshot: Json
        }
        Insert: {
          created_at?: string
          id?: string
          is_test?: boolean
          operation_key: string
          order_id?: string | null
          plan: string
          reservation_id?: string | null
          sequence_number: number
          snapshot: Json
        }
        Update: {
          created_at?: string
          id?: string
          is_test?: boolean
          operation_key?: string
          order_id?: string | null
          plan?: string
          reservation_id?: string | null
          sequence_number?: number
          snapshot?: Json
        }
        Relationships: [
          {
            foreignKeyName: "payment_operations_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "billing_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_operations_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "quote_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_requests: {
        Row: {
          billing_address: string | null
          billing_email: string | null
          billing_tax_id: string | null
          bookmarks: number
          breakdown: Json
          buyer_email_status: string
          buyer_type: string
          company: string | null
          created_at: string
          destinations: Json
          dispatch_attempts: number
          dispatch_token: string | null
          dispatch_until: string | null
          email: string
          email_error: string | null
          email_provider_id: string | null
          email_status: string
          full_name: string
          id: string
          idempotency_key: string
          internal_notice: Json | null
          invoice_number: number | null
          ip_hash: string | null
          lang: string
          mode: string
          needs_invoice: boolean
          needs_review: boolean
          notes: string | null
          notion_error: string | null
          notion_page_id: string | null
          notion_revision: number
          notion_status: string
          pdf_status: string
          phone: string | null
          reference: string
          reservation_status: string
          revision: number
          rose_type: string
          submission_hash: string | null
          total_roses: number
          updated_at: string
        }
        Insert: {
          billing_address?: string | null
          billing_email?: string | null
          billing_tax_id?: string | null
          bookmarks?: number
          breakdown: Json
          buyer_email_status?: string
          buyer_type: string
          company?: string | null
          created_at?: string
          destinations?: Json
          dispatch_attempts?: number
          dispatch_token?: string | null
          dispatch_until?: string | null
          email: string
          email_error?: string | null
          email_provider_id?: string | null
          email_status?: string
          full_name: string
          id?: string
          idempotency_key: string
          internal_notice?: Json | null
          invoice_number?: number | null
          ip_hash?: string | null
          lang: string
          mode: string
          needs_invoice?: boolean
          needs_review?: boolean
          notes?: string | null
          notion_error?: string | null
          notion_page_id?: string | null
          notion_revision?: number
          notion_status?: string
          pdf_status?: string
          phone?: string | null
          reference: string
          reservation_status?: string
          revision?: number
          rose_type?: string
          submission_hash?: string | null
          total_roses: number
          updated_at?: string
        }
        Update: {
          billing_address?: string | null
          billing_email?: string | null
          billing_tax_id?: string | null
          bookmarks?: number
          breakdown?: Json
          buyer_email_status?: string
          buyer_type?: string
          company?: string | null
          created_at?: string
          destinations?: Json
          dispatch_attempts?: number
          dispatch_token?: string | null
          dispatch_until?: string | null
          email?: string
          email_error?: string | null
          email_provider_id?: string | null
          email_status?: string
          full_name?: string
          id?: string
          idempotency_key?: string
          internal_notice?: Json | null
          invoice_number?: number | null
          ip_hash?: string | null
          lang?: string
          mode?: string
          needs_invoice?: boolean
          needs_review?: boolean
          notes?: string | null
          notion_error?: string | null
          notion_page_id?: string | null
          notion_revision?: number
          notion_status?: string
          pdf_status?: string
          phone?: string | null
          reference?: string
          reservation_status?: string
          revision?: number
          rose_type?: string
          submission_hash?: string | null
          total_roses?: number
          updated_at?: string
        }
        Relationships: []
      }
      reservation_notices: {
        Row: {
          created_at: string
          error: string | null
          id: string
          kind: string
          payload: Json | null
          prepared_at: string | null
          provider_id: string | null
          reservation_id: string
          revision: number
          status: string
        }
        Insert: {
          created_at?: string
          error?: string | null
          id?: string
          kind: string
          payload?: Json | null
          prepared_at?: string | null
          provider_id?: string | null
          reservation_id: string
          revision: number
          status?: string
        }
        Update: {
          created_at?: string
          error?: string | null
          id?: string
          kind?: string
          payload?: Json | null
          prepared_at?: string | null
          provider_id?: string | null
          reservation_id?: string
          revision?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservation_notices_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "quote_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: string
          user_id: string
        }
        Insert: {
          id?: string
          role: string
          user_id: string
        }
        Update: {
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      billing_issue_test: {
        Args: { p_actor: string; p_event: string; p_original?: string }
        Returns: string
      }
      billing_record_event: {
        Args: {
          p_actor: string
          p_amount: number
          p_date: string
          p_key: string
          p_kind: string
          p_order: string
          p_reason: string
        }
        Returns: string
      }
      has_billing_role: { Args: { _user_id: string }; Returns: boolean }
      payment_document_claim: {
        Args: { p_id: string }
        Returns: {
          document_id: string
          email_error: string | null
          email_status: string
          lease_token: string | null
          lease_until: string | null
          mail_payload: Json | null
          mail_prepared_at: string | null
          notion_error: string | null
          notion_page_id: string | null
          notion_status: string
          pdf_path: string | null
          pdf_sha256: string | null
          provider_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "payment_document_dispatch"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      payment_prepare: {
        Args: {
          p_actor: string
          p_key: string
          p_order: string
          p_plan: string
          p_reservation: string
          p_snapshot: Json
          p_stage: string
          p_test: boolean
        }
        Returns: string
      }
      reservation_claim: {
        Args: { p_id: string }
        Returns: {
          billing_address: string | null
          billing_email: string | null
          billing_tax_id: string | null
          bookmarks: number
          breakdown: Json
          buyer_email_status: string
          buyer_type: string
          company: string | null
          created_at: string
          destinations: Json
          dispatch_attempts: number
          dispatch_token: string | null
          dispatch_until: string | null
          email: string
          email_error: string | null
          email_provider_id: string | null
          email_status: string
          full_name: string
          id: string
          idempotency_key: string
          internal_notice: Json | null
          invoice_number: number | null
          ip_hash: string | null
          lang: string
          mode: string
          needs_invoice: boolean
          needs_review: boolean
          notes: string | null
          notion_error: string | null
          notion_page_id: string | null
          notion_revision: number
          notion_status: string
          pdf_status: string
          phone: string | null
          reference: string
          reservation_status: string
          revision: number
          rose_type: string
          submission_hash: string | null
          total_roses: number
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "quote_requests"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      reservation_save: {
        Args: { p_hash: string; p_key: string; p_row: Json }
        Returns: {
          billing_address: string | null
          billing_email: string | null
          billing_tax_id: string | null
          bookmarks: number
          breakdown: Json
          buyer_email_status: string
          buyer_type: string
          company: string | null
          created_at: string
          destinations: Json
          dispatch_attempts: number
          dispatch_token: string | null
          dispatch_until: string | null
          email: string
          email_error: string | null
          email_provider_id: string | null
          email_status: string
          full_name: string
          id: string
          idempotency_key: string
          internal_notice: Json | null
          invoice_number: number | null
          ip_hash: string | null
          lang: string
          mode: string
          needs_invoice: boolean
          needs_review: boolean
          notes: string | null
          notion_error: string | null
          notion_page_id: string | null
          notion_revision: number
          notion_status: string
          pdf_status: string
          phone: string | null
          reference: string
          reservation_status: string
          revision: number
          rose_type: string
          submission_hash: string | null
          total_roses: number
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "quote_requests"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      reservation_update: {
        Args: {
          p_actor: string
          p_id: string
          p_patch: Json
          p_revision: number
        }
        Returns: {
          billing_address: string | null
          billing_email: string | null
          billing_tax_id: string | null
          bookmarks: number
          breakdown: Json
          buyer_email_status: string
          buyer_type: string
          company: string | null
          created_at: string
          destinations: Json
          dispatch_attempts: number
          dispatch_token: string | null
          dispatch_until: string | null
          email: string
          email_error: string | null
          email_provider_id: string | null
          email_status: string
          full_name: string
          id: string
          idempotency_key: string
          internal_notice: Json | null
          invoice_number: number | null
          ip_hash: string | null
          lang: string
          mode: string
          needs_invoice: boolean
          needs_review: boolean
          notes: string | null
          notion_error: string | null
          notion_page_id: string | null
          notion_revision: number
          notion_status: string
          pdf_status: string
          phone: string | null
          reference: string
          reservation_status: string
          revision: number
          rose_type: string
          submission_hash: string | null
          total_roses: number
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "quote_requests"
          isOneToOne: true
          isSetofReturn: false
        }
      }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
