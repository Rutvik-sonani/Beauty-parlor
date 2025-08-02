import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database Tables Schema
export interface Database {
  public: {
    Tables: {
      customers: {
        Row: {
          id: number
          name: string
          phone: string
          email: string
          birthday: string | null
          loyalty_points: number
          total_visits: number
          last_visit: string | null
          tier: "Bronze" | "Silver" | "Gold" | "Platinum"
          favorite_service: string | null
          total_spent: number
          notes: string | null
          status: "Active" | "Inactive"
          join_date: string
          age: number | null
          whatsapp: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["customers"]["Row"], "id" | "created_at" | "updated_at">
        Update: Partial<Database["public"]["Tables"]["customers"]["Insert"]>
      }
      staff: {
        Row: {
          id: number
          name: string
          role: string
          specialization: string[]
          experience: string
          rating: number
          phone: string
          email: string
          salary: number
          status: "Active" | "Inactive"
          availability: string
          join_date: string
          address: string | null
          emergency_contact: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["staff"]["Row"], "id" | "created_at" | "updated_at">
        Update: Partial<Database["public"]["Tables"]["staff"]["Insert"]>
      }
      services: {
        Row: {
          id: number
          name: string
          description: string
          price: number
          duration: string
          category: string
          status: "Active" | "Inactive"
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["services"]["Row"], "id" | "created_at" | "updated_at">
        Update: Partial<Database["public"]["Tables"]["services"]["Insert"]>
      }
      appointments: {
        Row: {
          id: number
          customer_id: number
          staff_id: number
          service_id: number
          date: string
          time: string
          status: "Confirmed" | "Pending" | "Cancelled" | "Completed"
          notes: string | null
          amount: number
          source: "Website" | "Walk-in" | "Phone"
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["appointments"]["Row"], "id" | "created_at" | "updated_at">
        Update: Partial<Database["public"]["Tables"]["appointments"]["Insert"]>
      }
      products: {
        Row: {
          id: number
          name: string
          category: string
          price: number
          stock: number
          min_stock: number
          supplier: string | null
          description: string | null
          status: "Active" | "Inactive"
          expiry_date: string | null
          last_restocked: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["products"]["Row"], "id" | "created_at" | "updated_at">
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>
      }
      courses: {
        Row: {
          id: number
          name: string
          duration: string
          description: string
          price: number
          instructor_id: number
          max_students: number
          current_students: number
          status: "Active" | "Inactive" | "Completed"
          start_date: string
          end_date: string | null
          schedule: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["courses"]["Row"], "id" | "created_at" | "updated_at">
        Update: Partial<Database["public"]["Tables"]["courses"]["Insert"]>
      }
      students: {
        Row: {
          id: number
          name: string
          phone: string
          email: string
          course_id: number
          enrollment_date: string
          payment_status: "Paid" | "Pending" | "Partial"
          progress: number
          total_fees: number
          paid_amount: number
          status: "Active" | "Completed" | "Dropped"
          age: number | null
          whatsapp: string | null
          address: string | null
          emergency_contact: string | null
          batch: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["students"]["Row"], "id" | "created_at" | "updated_at">
        Update: Partial<Database["public"]["Tables"]["students"]["Insert"]>
      }
      service_history: {
        Row: {
          id: number
          customer_id: number
          appointment_id: number
          services: string[]
          staff_name: string
          amount: number
          duration: string
          notes: string | null
          date: string
          created_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["service_history"]["Row"], "id" | "created_at">
        Update: Partial<Database["public"]["Tables"]["service_history"]["Insert"]>
      }
      reviews: {
        Row: {
          id: number
          customer_id: number
          service_id: number
          rating: number
          comment: string
          status: "Published" | "Pending" | "Hidden"
          response: string | null
          date: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["reviews"]["Row"], "id" | "created_at" | "updated_at">
        Update: Partial<Database["public"]["Tables"]["reviews"]["Insert"]>
      }
      data_backups: {
        Row: {
          id: number
          backup_name: string
          backup_data: any
          created_by: string
          created_at: string
          description: string | null
        }
        Insert: Omit<Database["public"]["Tables"]["data_backups"]["Row"], "id" | "created_at">
        Update: Partial<Database["public"]["Tables"]["data_backups"]["Insert"]>
      }
      marketing_campaigns: {
        Row: {
          id: number
          name: string
          type: string
          status: string
          sent: number
          responses: number
          response_rate: number
          message: string
          target_audience: string
          scheduled_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["marketing_campaigns"]["Row"], "id" | "created_at" | "updated_at">
        Update: Partial<Database["public"]["Tables"]["marketing_campaigns"]["Insert"]>
      }
      business_settings: {
        Row: {
          id: number
          business_name: string
          business_phone: string
          business_address: string
          email_notifications: boolean
          sms_notifications: boolean
          push_notifications: boolean
          strong_passwords: boolean
          two_factor_auth: boolean
          session_timeout: number
          auto_backups: boolean
          data_encryption: boolean
          audit_logging: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["business_settings"]["Row"], "id" | "created_at" | "updated_at">
        Update: Partial<Database["public"]["Tables"]["business_settings"]["Insert"]>
      }
      staff_accounts: {
        Row: {
          id: number
          name: string
          email: string
          role: string
          staff_id: string
          password: string
          permissions: any
          is_active: boolean
          last_login: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["staff_accounts"]["Row"], "id" | "created_at" | "updated_at">
        Update: Partial<Database["public"]["Tables"]["staff_accounts"]["Insert"]>
      }
    }
  }
}
