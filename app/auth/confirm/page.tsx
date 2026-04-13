'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

/**
 * /auth/confirm
 *
 * This page handles the implicit (hash-based) OAuth / magic-link flow.
 * When Supabase sends a user back via a URL hash (e.g. #access_token=...),
 * the server cannot read it. The auth/callback route bounces the user here,
 * where the client-side Supabase SDK detects and exchanges the hash tokens
 * automatically via onAuthStateChange.
 */
export default function AuthConfirmPage() {
  const router = useRouter()

  useEffect(() => {
    // Supabase client automatically detects hash tokens on mount
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          // Check if MFA is needed
          const { data: mfaData } =
            await supabase.auth.mfa.getAuthenticatorAssuranceLevel()

          if (
            mfaData &&
            mfaData.nextLevel === 'aal2' &&
            mfaData.currentLevel !== 'aal2'
          ) {
            // User has MFA — send back to login for TOTP verification
            router.replace('/login')
          } else {
            router.replace('/dashboard')
          }
        } else if (event === 'PASSWORD_RECOVERY') {
          router.replace('/settings?tab=security')
        }
      }
    )

    // Safety fallback: if no auth event fires in 4 seconds, redirect to login
    const fallback = setTimeout(() => {
      router.replace('/login')
    }, 4000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(fallback)
    }
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-3">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl font-bold"
          style={{
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
            animation: 'float 2s ease-in-out infinite',
          }}
        >
          C
        </div>
        <div
          className="animate-pulse font-black text-xs tracking-[0.3em] uppercase opacity-50"
          style={{ color: 'var(--accent-primary)' }}
        >
          Signing in...
        </div>
      </div>
    </div>
  )
}
