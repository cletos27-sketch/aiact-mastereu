export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      user_tasks: {
        Row: {
          id: string
          user_id: string
          task: string
          category: string
          is_completed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          task: string
          category: string
          is_completed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          task?: string
          category?: string
          is_completed?: boolean
          created_at?: string
        }
      }
      risk_assessments: {
        Row: {
          id: string
          user_id: string
          responses: Json
          risk_classification: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          responses: Json
          risk_classification?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          responses?: Json
          risk_classification?: string | null
          created_at?: string
          updated_at?: string
        }
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
  }
}