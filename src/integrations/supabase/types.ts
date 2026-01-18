export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      assessment_responses: {
        Row: {
          completed_at: string
          compliance_score: number
          created_at: string
          id: string
          responses: Json
          risk_classification: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          compliance_score?: number
          created_at?: string
          id?: string
          responses: Json
          risk_classification: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string
          compliance_score?: number
          created_at?: string
          id?: string
          responses?: Json
          risk_classification?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          is_paid: boolean
          updated_at: string
          user_id: string
          full_name: string | null
          company_name: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_paid?: boolean
          updated_at?: string
          user_id: string
          full_name?: string | null
          company_name?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_paid?: boolean
          updated_at?: string
          user_id?: string
          full_name?: string | null
          company_name?: string | null
        }
        Relationships: []
      }
      risk_assessments: {
        Row: {
          created_at: string
          id: string
          legal_justification: string | null
          priority_actions: string[] | null
          relevant_articles: string[] | null
          responses: Json | null
          risk_classification: string | null
          risk_score: number | null
          user_email: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          legal_justification?: string | null
          priority_actions?: string[] | null
          relevant_articles?: string[] | null
          responses?: Json | null
          risk_classification?: string | null
          risk_score?: number | null
          user_email?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          legal_justification?: string | null
          priority_actions?: string[] | null
          relevant_articles?: string[] | null
          responses?: Json | null
          risk_classification?: string | null
          risk_score?: number | null
          user_email?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "risk_assessments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      system_announcements: {
        Row: {
          announcement_type: string
          content: string
          created_at: string
          id: string
          priority: number
          published_at: string
          title: string
        }
        Insert: {
          announcement_type?: string
          content: string
          created_at?: string
          id?: string
          priority?: number
          published_at?: string
          title: string
        }
        Update: {
          announcement_type?: string
          content?: string
          created_at?: string
          id?: string
          priority?: number
          published_at?: string
          title?: string
        }
        Relationships: []
      }
      system_updates: {
        Row: {
          content: string
          created_at: string
          id: string
          priority: number
          published_at: string
          title: string
          update_type: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          priority?: number
          published_at?: string
          title: string
          update_type?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          priority?: number
          published_at?: string
          title?: string
          update_type?: string
        }
        Relationships: []
      }
      user_purchases: {
        Row: {
          amount: number | null
          created_at: string
          currency: string | null
          id: string
          price_id: string | null
          product_id: string | null
          purchased_at: string | null
          status: string | null
          stripe_customer_id: string | null
          stripe_session_id: string | null
          updated_at: string | null
          user_email: string | null
          user_id: string
        }
        Insert: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          id?: string
          price_id?: string | null
          product_id?: string | null
          purchased_at?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_session_id?: string | null
          updated_at?: string | null
          user_email?: string | null
          user_id: string
        }
        Update: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          id?: string
          price_id?: string | null
          product_id?: string | null
          purchased_at?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_session_id?: string | null
          updated_at?: string | null
          user_email?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_purchases_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_task_progress: {
        Row: {
          completed: boolean
          created_at: string
          id: string
          task_key: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          id?: string
          task_key: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          id?: string
          task_key?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_task_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_tasks: {
        Row: {
          category: string
          created_at: string
          id: string
          is_completed: boolean
          premium: boolean
          task: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          is_completed?: boolean
          premium?: boolean
          task: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          is_completed?: boolean
          premium?: boolean
          task?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_tasks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never