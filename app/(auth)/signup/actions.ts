'use server'

import { supabaseAdmin } from '@/lib/supabase/server'

export async function signUpWithAutoConfirm(email: string, password: string) {
  try {
    // Create the user and mark as email_confirmed: true
    // This bypasses the SMTP provider entirely
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        signup_method: 'auto_confirm'
      }
    })

    if (error) {
      return { error: error.message }
    }

    return { success: true, user: data.user }
  } catch (err) {
    console.error('Signup action error:', err)
    return { error: err instanceof Error ? err.message : 'An unexpected error occurred during signup' }
  }
}
