'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { BunordenFooter } from '@/components/layout/BunordenFooter'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Plus, TrendingUp, TrendingDown, ArrowLeftRight, ChevronRight, Shield, X } from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import { useTranslation, useLanguage } from '@/app/providers'

interface Profile {
  display_name: string | null
  currency: string
  onboarding_done: boolean
}

interface Transaction {
  id: string
  type: 'expense' | 'income' | 'transfer'
  amount: number
  currency: string
  date: string
  note: string | null
  category?: { name: string; icon: string } | null
}

export default function DashboardPage() {
  const { t } = useTranslation()
  const { language } = useLanguage()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [totals, setTotals] = useState({ income: 0, expense: 0 })
  const [mfaEnabled, setMfaEnabled] = useState(true)
  const [showMfaReminder, setShowMfaReminder] = useState(false)
  const router = useRouter()

  const fetchData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)

      // Check MFA status
      const { data: factors, error: mfaError } = await supabase.auth.mfa.listFactors()
      const isMfaActive = factors?.all?.length ? factors.all.length > 0 : false
      setMfaEnabled(isMfaActive)
      
      // Only show reminder if not enabled and not previously dismissed in this session
      if (!isMfaActive && !sessionStorage.getItem('dismissMfaReminder')) {
        setShowMfaReminder(true)
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (!profileData?.onboarding_done) { router.push('/onboarding'); return }
      setProfile(profileData)

      // Fetch recent transactions with categories
      const { data: txData } = await supabase
        .from('transactions')
        .select('id, type, amount, currency, date, note, category:categories(name, icon)')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(5)

      // Supabase returns joined relations as arrays; flatten to single object
      const mapped = (txData || []).map((t: any) => ({
        ...t,
        category: Array.isArray(t.category) ? t.category[0] || null : t.category,
      }))
      setTransactions(mapped)

      // Calculate totals for current month
      const now = new Date()
      const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
      const { data: monthTx } = await supabase
        .from('transactions')
        .select('type, amount')
        .eq('user_id', user.id)
        .gte('date', monthStart)

      let inc = 0, exp = 0
      ;(monthTx || []).forEach(t => {
        if (t.type === 'income') inc += Number(t.amount)
        else if (t.type === 'expense') exp += Number(t.amount)
      })
      setTotals({ income: inc, expense: exp })
    } catch (error) {
      console.error('Dashboard error:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => { fetchData() }, [fetchData])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: 'var(--accent-primary)', borderTopColor: 'transparent' }} />
          <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>{t('common.loading')}</span>
        </div>
      </div>
    )
  }

  const balance = totals.income - totals.expense
  const currency = profile?.currency || 'HKD'

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'income': return <TrendingUp size={16} style={{ color: 'var(--success)' }} />
      case 'expense': return <TrendingDown size={16} style={{ color: 'var(--danger)' }} />
      default: return <ArrowLeftRight size={16} style={{ color: 'var(--accent-primary)' }} />
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 px-4 lg:px-8 py-6 lg:py-8 max-w-3xl mx-auto w-full">
        {/* Header */}
        <div className="mb-8 animate-fade-up">
          <h1
            className="text-3xl lg:text-4xl font-bold tracking-tight mb-1"
            style={{ color: 'var(--text-primary)' }}
          >
            {t('common.welcome')}{profile?.display_name ? `, ${profile.display_name}` : ''}
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
            {new Date().toLocaleDateString(language === 'zh-TW' ? 'zh-TW' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* 2FA Reminder */}
        {showMfaReminder && (
          <div className="mb-6 animate-fade-up">
            <div 
              className="p-4 rounded-2xl flex items-center gap-4 relative overflow-hidden"
              style={{ background: 'var(--overlay)', border: '1px solid var(--border)' }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-primary)' }}
              >
                <Shield size={20} />
              </div>
              <div className="flex-1 min-w-0 pr-6">
                <p className="font-bold text-sm mb-0.5" style={{ color: 'var(--text-primary)' }}>{t('dashboard.secure_account')}</p>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
                  {t('dashboard.mfa_reminder')}
                  <Link href="/settings" className="ml-1 font-bold underline" style={{ color: 'var(--accent-primary)' }}>
                    {t('dashboard.go_to_settings')}
                  </Link>
                </p>
              </div>
              <button 
                onClick={() => {
                  setShowMfaReminder(false)
                  sessionStorage.setItem('dismissMfaReminder', 'true')
                }}
                className="absolute top-2 right-2 p-1.5 opacity-40 hover:opacity-100 transition-opacity"
                style={{ color: 'var(--text-primary)' }}
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Balance Card */}
        <div className="glass-card mb-6 animate-fade-up delay-1 text-center relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background: 'radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.15), transparent 70%)',
            }}
          />
          <div className="relative">
            <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-tertiary)' }}>
              {t('dashboard.balance_title')}
            </p>
            <p
              className="text-4xl lg:text-5xl font-bold tracking-tight mb-1"
              style={{ color: balance >= 0 ? 'var(--success)' : 'var(--danger)' }}
            >
              {formatCurrency(balance, currency)}
            </p>
          </div>
        </div>

        {/* Income / Expense cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="glass-card animate-fade-up delay-2">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--success-bg)' }}>
                <TrendingUp size={14} style={{ color: 'var(--success)' }} />
              </div>
              <span className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>{t('dashboard.income')}</span>
            </div>
            <p className="text-xl lg:text-2xl font-bold" style={{ color: 'var(--success)' }}>
              {formatCurrency(totals.income, currency)}
            </p>
          </div>
          <div className="glass-card animate-fade-up delay-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--danger-bg)' }}>
                <TrendingDown size={14} style={{ color: 'var(--danger)' }} />
              </div>
              <span className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>{t('dashboard.expenses')}</span>
            </div>
            <p className="text-xl lg:text-2xl font-bold" style={{ color: 'var(--danger)' }}>
              {formatCurrency(totals.expense, currency)}
            </p>
          </div>
        </div>

        {/* Quick Add Button */}
        <Link
          href="/add"
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl mb-8 font-semibold text-white animate-fade-up delay-4"
          style={{
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
            boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <Plus size={20} strokeWidth={2.5} />
          {t('common.add_transaction')}
        </Link>

        {/* Recent Transactions */}
        <div className="animate-fade-up delay-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              {t('dashboard.recent_title')}
            </h2>
            {transactions.length > 0 && (
              <Link
                href="/transactions"
                className="flex items-center gap-1 text-sm font-medium"
                style={{ color: 'var(--accent-primary)' }}
              >
                {t('common.view_all')} <ChevronRight size={14} />
              </Link>
            )}
          </div>

          {transactions.length === 0 ? (
            <div className="glass-card text-center py-12">
              <div className="text-4xl mb-3">📝</div>
              <p className="font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                {t('common.no_transactions')}
              </p>
              <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                {t('common.start_tracking')}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.map((tx, i) => (
                <Link
                  key={tx.id}
                  href="/transactions"
                  className="glass-card-interactive flex items-center gap-3 py-3 px-4"
                  style={{ animationDelay: `${0.3 + i * 0.05}s` }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                    style={{ background: 'var(--overlay)' }}
                  >
                    {tx.category?.icon || (tx.type === 'income' ? '💰' : '💸')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                      {tx.category?.name || tx.note || tx.type}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                      {formatDate(tx.date)}
                    </p>
                  </div>
                  <span
                    className="font-semibold text-sm"
                    style={{ color: tx.type === 'income' ? 'var(--success)' : 'var(--danger)' }}
                  >
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(Number(tx.amount), tx.currency)}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <BunordenFooter />
    </div>
  )
}
