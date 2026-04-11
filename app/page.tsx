'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function Page() {
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        router.push(user ? '/dashboard' : '/login')
      } catch {
        router.push('/login')
      }
    }
    checkAuth()
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
          L
        </div>
        <div
          className="animate-pulse font-black text-xs tracking-[0.3em] uppercase opacity-50"
          style={{ color: 'var(--accent-primary)' }}
        >
          Loading...
        </div>
      </div>
    </div>
  )
}
