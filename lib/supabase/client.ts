import { createBrowserClient } from '@supabase/ssr'

// Use createBrowserClient (from @supabase/ssr) instead of createClient.
// This stores session tokens in cookies rather than localStorage, which means
// the Next.js middleware (also cookie-based) can read and validate the session
// server-side — preventing the localStorage/cookie mismatch that caused the
// post-login/post-MFA redirect loop.
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

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
          tags: string[]
          recurring: boolean
          exclude_from_budget: boolean
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
          tags?: string[]
          recurring?: boolean
          exclude_from_budget?: boolean
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
          tags?: string[]
          recurring?: boolean
          created_at?: string
        }
      }
      budgets: {
        Row: {
          id: string
          user_id: string
          category_id: string | null
          month_year: string
          amount: number
          currency: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id?: string | null
          month_year: string
          amount: number
          currency?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category_id?: string | null
          month_year?: string
          amount?: number
          currency?: string
          created_at?: string
        }
      }
    }
  }
}
