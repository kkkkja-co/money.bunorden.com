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
  AlertTriangle, Sparkles, Bell
} from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import { useTranslation, useLanguage } from '@/app/providers'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { ProductTour } from '@/components/ui/ProductTour'
import { NewFeaturePopup } from '@/components/ui/NewFeaturePopup'
import { PageSkeleton } from '@/components/ui/PageSkeleton'

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
  const [budgetSpent, setBudgetSpent] = useState(0)
  const [overallBudget, setOverallBudget] = useState<number | null>(null)
  const [mfaEnabled, setMfaEnabled] = useState(true)
  const [showMfaReminder, setShowMfaReminder] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [chartData, setChartData] = useState<{ name: string, value: number }[]>([])
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

      const { data: factors } = await supabase.auth.mfa.listFactors()
      const isMfaActive = factors?.all?.length ? factors.all.length > 0 : false
      setMfaEnabled(isMfaActive)
      
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

      const { data: txData } = await supabase
        .from('transactions')
        .select('id, type, amount, currency, date, note, tags, category:categories(name, icon)')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(5)

      const mapped = (txData || []).map((t: any) => ({
        ...t,
        category: Array.isArray(t.category) ? t.category[0] || null : t.category,
      }))
      setTransactions(mapped)

      const now = new Date()
      const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
      const { data: monthTx } = await supabase
        .from('transactions')
        .select('type, amount, exclude_from_budget, category:categories(name, icon)')
        .eq('user_id', user.id)
        .gte('date', monthStart)

      let inc = 0, exp = 0, bSpent = 0
      const chartMap: Record<string, { name: string, value: number }> = {}

      ;(monthTx || []).forEach(t => {
        const amt = Number(t.amount)
        if (t.type === 'income') {
          inc += amt
        } else if (t.type === 'expense') {
          exp += amt
          const cat = Array.isArray(t.category) ? t.category[0] : t.category
          const catName = cat?.name || 'Other'
          if (!chartMap[catName]) chartMap[catName] = { name: catName, value: 0 }
          chartMap[catName].value += amt
          if (!t.exclude_from_budget) bSpent += amt
        }
      })

      setTotals({ income: inc, expense: exp })
      setBudgetSpent(bSpent)
      setChartData(Object.values(chartMap).sort((a, b) => b.value - a.value).slice(0, 10))

      const { data: budgetData } = await supabase
        .from('budgets')
        .select('amount')
        .eq('user_id', user.id)
        .eq('month_year', monthStart)
        .is('category_id', null)
        .maybeSingle()
      
      setOverallBudget(budgetData ? Number(budgetData.amount) : null)
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => { fetchData() }, [fetchData])

  if (loading) return <PageSkeleton />

  const balance = totals.income - totals.expense
  const currency = profile?.currency || 'HKD'

  // Notification logic: Combine into a single elegant notice if multiple exist
  const notifications = []
  if (showMfaReminder) notifications.push('mfa')
  if (overallBudget !== null && budgetSpent > overallBudget) notifications.push('overbudget')
  if (transactions.length > 0 && new Date(transactions[0].date).toDateString() !== new Date().toDateString()) notifications.push('reminder')

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 px-4 lg:px-8 py-6 lg:py-10 max-w-2xl mx-auto w-full">
        
        {/* Compact Header */}
        <header className="flex items-center justify-between mb-10 animate-elegant">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-primary">
              {t('common.welcome')}{profile?.display_name ? `, ${profile.display_name}` : ''}
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-tertiary">
              {new Date().toLocaleDateString(language === 'zh-TW' ? 'zh-TW' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <Link href="/settings" className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center hover:bg-tertiary transition-colors">
            <Bell size={18} className="text-tertiary" />
          </Link>
        </header>

        {/* Notifications: Only show one at a time for less bloat */}
        {notifications.length > 0 && (
          <div className="mb-8 animate-elegant">
            {notifications[0] === 'overbudget' && (
              <Link href="/budgets" className="flex items-center gap-4 p-4 rounded-2xl bg-danger/5 border border-danger/10 group">
                <div className="w-10 h-10 rounded-xl bg-danger-bg flex items-center justify-center text-danger">
                  <AlertTriangle size={20} />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-xs text-danger">{t('budgets.over_by').split(' {')[0]}</p>
                  <p className="text-[11px] text-tertiary">{t('budgets.over_by').replace('{amount}', formatCurrency(budgetSpent - overallBudget!, currency))}</p>
                </div>
                <ChevronRight size={16} className="text-tertiary group-hover:text-danger transition-colors" />
              </Link>
            )}
            {notifications[0] === 'mfa' && notifications.length === 1 && (
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-secondary border border-border">
                <div className="w-10 h-10 rounded-xl bg-accent-primary/10 flex items-center justify-center text-accent-primary">
                  <Shield size={20} />
                </div>
                <div className="flex-1 min-w-0 pr-6 relative">
                  <p className="font-bold text-xs truncate">{t('dashboard.secure_account')}</p>
                  <Link href="/settings" className="text-[11px] text-tertiary hover:text-accent-primary underline">
                    {t('dashboard.go_to_settings')}
                  </Link>
                  <button onClick={() => { setShowMfaReminder(false); sessionStorage.setItem('dismissMfaReminder', 'true'); }} className="absolute top-0 right-0 p-1 opacity-40">
                    <X size={12} />
                  </button>
                </div>
              </div>
            )}
            {notifications[0] === 'reminder' && notifications.length === 1 && (
              <Link href="/add" className="flex items-center gap-4 p-4 rounded-2xl bg-accent-primary/5 border border-accent-primary/10">
                <div className="w-10 h-10 rounded-xl bg-accent-primary/20 flex items-center justify-center text-accent-primary">
                  <Sparkles size={18} />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-xs">{language === 'zh-TW' ? '今日尚未記帳' : 'Record Today'}</p>
                  <p className="text-[11px] text-tertiary">{language === 'zh-TW' ? '保持良好的理財習慣' : 'Keep your finances in check'}</p>
                </div>
              </Link>
            )}
          </div>
        )}

        {/* Main Balance Card: Focal Point */}
        <div id="tour-balance" className="mb-10 text-center animate-elegant">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-tertiary">{t('dashboard.balance_title')}</span>
            <button onClick={toggleVisibility} className="opacity-40 hover:opacity-100 transition-opacity">
              {isVisible ? <Eye size={12} /> : <EyeOff size={12} />}
            </button>
          </div>
          <p className={`text-5xl lg:text-6xl font-bold tracking-tight mb-6 ${balance >= 0 ? 'text-success' : 'text-danger'}`}>
            {isVisible ? formatCurrency(balance, currency) : '••••••'}
          </p>
          
          <div className="flex items-center justify-center gap-4">
            <Link href="/add" className="btn-primary-gradient px-8 py-3.5 shadow-lg">
              <Plus size={18} strokeWidth={3} />
              <span className="text-sm font-bold">{t('common.add_transaction')}</span>
            </Link>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8 animate-elegant delay-1">
          <div className="glass-card py-4 flex flex-col items-center">
            <span className="text-[9px] font-black uppercase tracking-widest text-tertiary mb-1">{t('dashboard.income')}</span>
            <span className="text-lg font-bold text-success">
              {isVisible ? formatCurrency(totals.income, currency) : '••••'}
            </span>
          </div>
          <div className="glass-card py-4 flex flex-col items-center">
            <span className="text-[9px] font-black uppercase tracking-widest text-tertiary mb-1">{t('dashboard.expenses')}</span>
            <span className="text-lg font-bold text-danger">
              {isVisible ? formatCurrency(totals.expense, currency) : '••••'}
            </span>
          </div>
        </div>

        {/* Analytics & Progress Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 animate-elegant delay-2">
          {chartData.length > 0 && (
            <Link href="/reports" className="glass-card-interactive group min-h-[140px] flex flex-col justify-center">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-tertiary">{t('reports.by_category')}</span>
                <ChevronRight size={14} className="text-tertiary group-hover:text-accent-primary transition-colors" />
              </div>
              <div className="h-2 w-full flex rounded-full overflow-hidden bg-primary/5">
                {chartData.slice(0, 5).map((item, i) => (
                  <div 
                    key={item.name}
                    className="h-full transition-all duration-1000"
                    style={{ 
                      width: `${(item.value / totals.expense) * 100}%`,
                      background: COLORS[i % COLORS.length]
                    }}
                  />
                ))}
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {chartData.slice(0, 3).map((item, i) => (
                  <div key={item.name} className="flex items-center gap-1.5 min-w-0">
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-[9px] font-bold text-tertiary truncate uppercase tracking-tighter">{item.name}</span>
                  </div>
                ))}
              </div>
            </Link>
          )}

          {overallBudget !== null && (
            <Link href="/budgets" className="glass-card-interactive group min-h-[140px] flex flex-col justify-center">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-tertiary">{t('budgets.title')}</span>
                <span className="text-[10px] font-bold text-primary">
                  {Math.round((budgetSpent / overallBudget) * 100)}%
                </span>
              </div>
              <div className="h-2 w-full rounded-full overflow-hidden bg-primary/5">
                <div 
                  className="h-full rounded-full transition-all duration-1000"
                  style={{ 
                    width: `${Math.min(100, (budgetSpent / overallBudget) * 100)}%`,
                    background: budgetSpent > overallBudget ? 'var(--danger)' : 'var(--accent-gradient)'
                  }}
                />
              </div>
              <p className="text-[9px] font-bold text-tertiary mt-4 uppercase tracking-tighter">
                {isVisible ? t(budgetSpent <= overallBudget ? 'budgets.remaining' : 'budgets.over_by', {
                  amount: formatCurrency(Math.abs(overallBudget - budgetSpent), currency),
                }) : '••••'}
              </p>
            </Link>
          )}
        </div>

        {/* Transactions Section */}
        <section className="animate-elegant delay-3 mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-tertiary">
              {t('dashboard.recent_title')}
            </h2>
            <Link href="/transactions" className="text-[10px] font-bold text-accent-primary uppercase tracking-widest hover:underline">
              {t('common.view_all')}
            </Link>
          </div>

          <div className="space-y-2">
            {transactions.length === 0 ? (
              <div className="glass-card text-center py-10 opacity-60">
                <p className="text-xs font-medium text-tertiary">{t('common.no_transactions')}</p>
              </div>
            ) : (
              transactions.map((tx, i) => (
                <Link
                  key={tx.id}
                  href="/transactions"
                  className="flex items-center gap-4 py-4 px-5 glass-card-interactive border-none shadow-none bg-secondary/50"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-lg">
                    {tx.category?.icon || (tx.type === 'income' ? '💰' : '💸')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{tx.category?.name || tx.note || tx.type}</p>
                    <p className="text-[10px] font-bold text-tertiary uppercase tracking-widest opacity-60">{formatDate(tx.date)}</p>
                  </div>
                  <span className={`font-bold text-sm ${tx.type === 'income' ? 'text-success' : 'text-danger'}`}>
                    {isVisible ? (tx.type === 'income' ? '+' : '-') + formatCurrency(Math.abs(tx.amount), tx.currency) : '••••'}
                  </span>
                </Link>
              ))
            )}
          </div>
        </section>
      </div>

      <ProductTour />
      <NewFeaturePopup />
      <BunordenFooter />
    </div>
  )
}
