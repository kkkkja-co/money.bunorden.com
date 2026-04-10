'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { BunordenFooter } from '@/components/layout/BunordenFooter'
import type { User } from '@supabase/supabase-js'

interface Profile {
  display_name: string | null
  currency: string
  onboarding_done: boolean
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push('/login')
          return
        }

        setUser(user)

        // Fetch profile
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error) throw error
        setProfile(data)

        // Check if onboarding is complete
        if (!data?.onboarding_done) {
          router.push('/onboarding')
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black flex flex-col pb-20 md:pb-0">
      <div className="flex-1 px-4 py-8 max-w-2xl mx-auto w-full">
        <h1 className="text-3xl font-bold text-[#1C1C1E] dark:text-white mb-2">
          Welcome, {profile?.display_name || 'User'}
        </h1>
        <p className="text-[#636366] dark:text-[#8E8E93] mb-8">
          Your dashboard is ready
        </p>

        {/* Balance card */}
        <div className="card mb-6 text-center">
          <p className="text-[#636366] dark:text-[#8E8E93] text-sm mb-2">Total Balance</p>
          <p className="text-4xl font-bold text-[#1C1C1E] dark:text-white">
            HK$0.00
          </p>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="card">
            <p className="text-[#636366] dark:text-[#8E8E93] text-xs mb-1">Income</p>
            <p className="text-2xl font-bold text-[#34C759]">HK$0.00</p>
          </div>
          <div className="card">
            <p className="text-[#636366] dark:text-[#8E8E93] text-xs mb-1">Expenses</p>
            <p className="text-2xl font-bold text-[#FF3B30]">HK$0.00</p>
          </div>
        </div>

        {/* Placeholder for recent transactions */}
        <div>
          <h2 className="text-lg font-semibold text-[#1C1C1E] dark:text-white mb-4">
            Recent Transactions
          </h2>
          <div className="card text-center py-8">
            <p className="text-[#636366] dark:text-[#8E8E93]">
              No transactions yet. Add your first transaction to get started.
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
