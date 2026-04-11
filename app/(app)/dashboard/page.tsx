'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { BunordenFooter } from '@/components/layout/BunordenFooter'
import { formatCurrency, formatDate } from '@/lib/utils'
import { 
  Plus, TrendingUp, TrendingDown,
  ChevronRight, Shield, X, Eye, EyeOff, Target,
  AlertTriangle, Sparkles
} from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import { useTranslation, useLanguage } from '@/app/providers'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { ProductTour } from '@/components/ui/ProductTour'
import { NewFeaturePopup } from '@/components/ui/NewFeaturePopup'

const COLORS = [
  '#3b82f6', '#8b5cf6', '#ec4899', '#ef4444', 
  '#f59e0b', '#10b981', '#06b6d4', '#6366f1',
  '#f43f5e', '#a855f7'
]

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
  tags: string[] | null
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
  const [overallBudget, setOverallBudget] = useState<number | null>(null)
  const [mfaEnabled, setMfaEnabled] = useState(true)
  const [showMfaReminder, setShowMfaReminder] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const saved = localStorage.getItem('clavi-balance-visible')
    if (saved !== null) setIsVisible(saved === 'true')
  }, [])

  const toggleVisibility = () => {
    setIsVisible(prev => {
      const next = !prev
      localStorage.setItem('clavi-balance-visible', String(next))
      return next
    })
  }

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
        .select('id, type, amount, currency, date, note, tags, category:categories(name, icon)')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(5)

      // Supabase returns joined relations as arrays; flatten to single object
      const mapped = (txData || []).map((t: any) => ({
        ...t,
        tags: Array.isArray(t.tags) ? t.tags : [],
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

      // Fetch Budget
      const { data: budgetData } = await supabase
        .from('budgets')
        .select('amount')
        .eq('user_id', user.id)
        .eq('month_year', monthStart)
        .is('category_id', null)
        .maybeSingle()
      
      if (budgetData) setOverallBudget(Number(budgetData.amount))
      else setOverallBudget(null)
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

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 px-4 lg:px-8 py-6 lg:py-8 max-w-3xl mx-auto w-full">
        {/* Header */}
        <div className="mb-8 animate-fade-up flex items-start justify-between gap-4">
          <div>
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
          
          <Link 
            href="/budgets"
            className="group flex flex-col items-end gap-1 px-3 py-2 rounded-2xl transition-all"
            style={{ background: 'var(--overlay)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-accent-primary animate-pulse">Release</span>
              <div className="w-1 h-1 rounded-full bg-accent-primary" />
              <span className="text-[10px] font-bold text-tertiary">v0.5.0</span>
            </div>
            <span className="text-[11px] font-bold text-primary group-hover:text-accent-primary transition-colors">Budgeting is here! →</span>
          </Link>
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

        {/* Over-budget Alert */}
        {overallBudget !== null && totals.expense > overallBudget && (
          <div className="mb-6 animate-fade-up">
            <div 
              className="p-4 rounded-2xl flex items-center gap-4 relative overflow-hidden ring-1 ring-inset ring-danger/20"
              style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid var(--danger-bg)' }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}
              >
                <AlertTriangle size={20} />
              </div>
              <div className="flex-1 min-w-0 pr-6">
                <p className="font-bold text-sm mb-0.5" style={{ color: 'var(--danger)' }}>{t('budgets.over_by').split(' {')[0]}</p>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {t('budgets.over_by').replace('{amount}', formatCurrency(totals.expense - overallBudget, currency))}
                </p>
              </div>
              <Link 
                href="/budgets"
                className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 text-tertiary hover:text-danger hover:bg-danger/10 transition-colors"
              >
                <ChevronRight size={18} />
              </Link>
            </div>
          </div>
        )}

        {/* Record Reminder */}
        {transactions.length > 0 && new Date(transactions[0].date).toDateString() !== new Date().toDateString() && (
          <div className="mb-6 animate-fade-up">
            <div 
              className="p-4 rounded-2xl flex items-center gap-4 relative overflow-hidden"
              style={{ background: 'var(--overlay)', border: '1px solid var(--border)' }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white"
                style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' }}
              >
                <Sparkles size={18} />
              </div>
              <div className="flex-1 min-w-0 pr-6">
                <p className="font-bold text-sm mb-0.5" style={{ color: 'var(--text-primary)' }}>{language === 'zh-TW' ? '還沒紀錄今天的開支嗎？' : "Haven't recorded today yet?"}</p>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
                  {language === 'zh-TW' ? '保持良好的理財習慣，紀錄每一筆收支。' : 'Stay on top of your finances by tracking every transaction.'}
                  <Link href="/add" className="ml-1 font-bold underline" style={{ color: 'var(--accent-primary)' }}>
                    {t('common.add_transaction')}
                  </Link>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Balance Card */}
        <div id="tour-balance" className="glass-card mb-6 animate-fade-up delay-1 text-center relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background: 'radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.15), transparent 70%)',
            }}
          />
          <div className="relative">
            <div className="flex items-center justify-center gap-2 mb-2">
              <p className="text-sm font-medium" style={{ color: 'var(--text-tertiary)' }}>
                {t('dashboard.balance_title')}
              </p>
              <button 
                onClick={toggleVisibility}
                className="p-1 rounded-md hover:bg-white/5 transition-colors"
                style={{ color: 'var(--text-tertiary)' }}
              >
                {isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>
            </div>
            <p
              className="text-4xl lg:text-5xl font-bold tracking-tight mb-1"
              style={{ color: balance >= 0 ? 'var(--success)' : 'var(--danger)' }}
            >
              {isVisible ? formatCurrency(balance, currency) : '••••••'}
            </p>
          </div>
        </div>

        {/* Dashboard Chart Preview */}
        {transactions.length > 0 && (
          <div id="tour-analytics" className="glass-card mb-6 animate-fade-up delay-2 overflow-hidden">
            <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{t('reports.expenses_by_category')}</h3>
              <Link href="/reports" className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--accent-primary)' }}>
                {t('common.view_all')}
              </Link>
            </div>
            <div className="h-[140px] w-full flex items-center gap-4">
              <div className="w-1/2 h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={Object.values(
                        transactions
                          .filter(t => t.type === 'expense')
                          .reduce((acc: any, t) => {
                            const name = t.category?.name || 'Other'
                            if (!acc[name]) acc[name] = { name, value: 0 }
                            acc[name].value += Number(t.amount)
                            return acc
                          }, {})
                      ).slice(0, 5)}
                      innerRadius={45}
                      outerRadius={60}
                      paddingAngle={4}
                      dataKey="value"
                      cornerRadius={4}
                    >
                      {COLORS.map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-1/2 space-y-2">
                {Object.values(
                  transactions
                    .filter(t => t.type === 'expense')
                    .reduce((acc: any, t) => {
                      const name = t.category?.name || 'Other'
                      if (!acc[name]) acc[name] = { name, value: 0 }
                      acc[name].value += Number(t.amount)
                      return acc
                    }, {})
                )
                .sort((a: any, b: any) => b.value - a.value)
                .slice(0, 3)
                .map((item: any, i) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{item.name}</span>
                    </div>
                    <span className="text-[10px] font-bold" style={{ color: 'var(--text-primary)' }}>
                      {isVisible ? `${Math.round((item.value / totals.expense) * 100)}%` : '••%'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Income / Expense cards */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="glass-card animate-fade-up delay-2">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--success-bg)' }}>
                <TrendingUp size={14} style={{ color: 'var(--success)' }} />
              </div>
              <span className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>{t('dashboard.income')}</span>
            </div>
            <p className="text-xl lg:text-2xl font-bold" style={{ color: 'var(--success)' }}>
              {isVisible ? formatCurrency(totals.income, currency) : '••••••'}
            </p>
          </div>
          <div className="glass-card animate-fade-up delay-3">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--danger-bg)' }}>
                  <TrendingDown size={14} style={{ color: 'var(--danger)' }} />
                </div>
                <span className="text-xs font-medium truncate" style={{ color: 'var(--text-tertiary)' }}>{t('dashboard.expenses')}</span>
              </div>
              <Link
                href="/budgets"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider flex-shrink-0 transition-all active:scale-95"
                style={{ 
                  color: 'var(--accent-primary)',
                  background: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.2)'
                }}
              >
                <Target size={12} strokeWidth={2.5} />
                {t('budgets.short_link')}
              </Link>
            </div>
            <p className="text-xl lg:text-2xl font-bold" style={{ color: 'var(--danger)' }}>
              {isVisible ? formatCurrency(totals.expense, currency) : '••••••'}
            </p>
          </div>
        </div>

        {/* Budget Progress Card */}
        {overallBudget !== null && (
          <Link href="/budgets" id="tour-budgets" className="glass-card mb-6 block animate-fade-up delay-3 transition-transform active:scale-[0.98]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
                  <Target size={16} style={{ color: 'var(--accent-primary)' }} />
                </div>
                <div>
                  <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{t('budgets.title')}</h3>
                  <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{t('budgets.overall')}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold" style={{ color: totals.expense > overallBudget ? 'var(--danger)' : 'var(--text-primary)' }}>
                  {Math.round((totals.expense / overallBudget) * 100)}%
                </p>
                <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                  {isVisible ? t(totals.expense <= overallBudget ? 'budgets.remaining' : 'budgets.over_by', {
                    amount: formatCurrency(Math.abs(overallBudget - totals.expense), currency),
                  }) : '••••••'}
                </p>
              </div>
            </div>
            <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: 'var(--overlay)' }}>
              <div 
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{ 
                  width: `${Math.min(100, (totals.expense / overallBudget) * 100)}%`,
                  background: totals.expense > overallBudget 
                    ? 'var(--danger)' 
                    : 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))'
                }}
              />
            </div>
          </Link>
        )}

        {/* Quick Add Button */}
        <Link
          id="tour-action"
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
                      {(tx.tags?.length ?? 0) > 0 ? ` · ${tx.tags!.join(' · ')}` : ''}
                    </p>
                  </div>
                  <span
                    className="font-semibold text-sm"
                    style={{ color: tx.type === 'income' ? 'var(--success)' : 'var(--danger)' }}
                  >
                    {isVisible ? (tx.type === 'income' ? '+' : '-') + formatCurrency(Number(tx.amount), tx.currency) : '••••••'}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <ProductTour />
      <NewFeaturePopup />
      <BunordenFooter />
    </div>
  )
}
