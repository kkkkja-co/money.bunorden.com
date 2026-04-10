import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string | null
          avatar_url: string | null
          mode: 'simple' | 'multi'
          motion_enabled: boolean
          dark_mode: boolean
          currency: string
          onboarding_done: boolean
          created_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          avatar_url?: string | null
          mode?: 'simple' | 'multi'
          motion_enabled?: boolean
          dark_mode?: boolean
          currency?: string
          onboarding_done?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          display_name?: string | null
          avatar_url?: string | null
          mode?: 'simple' | 'multi'
          motion_enabled?: boolean
          dark_mode?: boolean
          currency?: string
          onboarding_done?: boolean
          created_at?: string
        }
      }
      accounts: {
        Row: {
          id: string
          user_id: string
          name: string
          icon: string
          colour: string
          is_default: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          icon?: string
          colour?: string
          is_default?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          icon?: string
          colour?: string
          is_default?: boolean
          created_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          user_id: string
          name: string
          icon: string
          colour: string
          type: 'expense' | 'income'
          archived: boolean
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          icon?: string
          colour?: string
          type: 'expense' | 'income'
          archived?: boolean
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          icon?: string
          colour?: string
          type?: 'expense' | 'income'
          archived?: boolean
          sort_order?: number
          created_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          account_id: string
          to_account_id: string | null
          category_id: string | null
          type: 'expense' | 'income' | 'transfer'
          amount: number
          currency: string
          date: string
          note: string | null
          recurring: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          account_id: string
          to_account_id?: string | null
          category_id?: string | null
          type: 'expense' | 'income' | 'transfer'
          amount: number
          currency?: string
          date: string
          note?: string | null
          recurring?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          account_id?: string
          to_account_id?: string | null
          category_id?: string | null
          type?: 'expense' | 'income' | 'transfer'
          amount?: number
          currency?: string
          date?: string
          note?: string | null
          recurring?: boolean
          created_at?: string
        }
      }
    }
  }
}
