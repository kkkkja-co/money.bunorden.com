'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { BunordenFooter } from '@/components/layout/BunordenFooter'

export default function SettingsPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    setLoading(true)
    try {
      await supabase.auth.signOut()
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleDarkMode = () => {
    const isDark = document.documentElement.classList.toggle('dark')
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black flex flex-col pb-20 md:pb-0">
      <div className="flex-1 px-4 py-8 max-w-2xl mx-auto w-full">
        <h1 className="text-3xl font-bold text-[#1C1C1E] dark:text-white mb-8">
          Settings
        </h1>

        {/* Appearance */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-[#1C1C1E] dark:text-white mb-3">
            Appearance
          </h2>
          <button
            onClick={toggleDarkMode}
            className="w-full card flex items-center justify-between py-4 px-4 hover:opacity-70 transition-opacity"
          >
            <span className="text-[#1C1C1E] dark:text-white">Dark mode</span>
            <span className="text-lg">🌙</span>
          </button>
        </div>

        {/* Account */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-[#1C1C1E] dark:text-white mb-3">
            Account
          </h2>
          <button
            onClick={handleLogout}
            disabled={loading}
            className="btn-danger w-full"
          >
            {loading ? 'Signing out...' : 'Sign out'}
          </button>
        </div>

        {/* Privacy & Data */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-[#1C1C1E] dark:text-white mb-3">
            Privacy & Data
          </h2>
          <div className="card">
            <p className="text-[#636366] dark:text-[#8E8E93] text-sm">
              Data export and account deletion features are coming soon.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-auto">
        <BunordenFooter />
      </div>
    </div>
  )
}
