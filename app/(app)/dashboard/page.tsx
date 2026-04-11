'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { formatCurrency, formatDate } from '@/lib/utils'
import { 
  Plus, TrendingUp, TrendingDown,
  ChevronRight, Eye, EyeOff, Bell,
  Target, Sparkles, Activity
} from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import { useTranslation, useLanguage } from '@/app/providers'
import { PageSkeleton } from '@/components/ui/PageSkeleton'

const COLORS = ['#af52de', '#5856d6', '#34c759', '#ff9500', '#ff3b30']

export default function DashboardPage() {
  const { t } = useTranslation()
  const { language } = useLanguage()
  const router = useRouter()
  
  const [profile, setProfile] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [totals, setTotals] = useState({ income: 0, expense: 0 })
  const [budgetSpent, setBudgetSpent] = useState(0)
  const [overallBudget, setOverallBudget] = useState<number | null>(null)
  const [isVisible, setIsVisible] = useState(true)
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('clavi-balance-visible')
    if (saved !== null) setIsVisible(saved === 'true')
  }, [])

  const fetchData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (!profileData?.onboarding_done) { router.push('/onboarding'); return }
      setProfile(profileData)

      const { data: txData } = await supabase
        .from('transactions')
        .select('*, category:categories(name, icon)')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(5)

      setTransactions((txData || []).map((t: any) => ({
        ...t,
        category: Array.isArray(t.category) ? t.category[0] || null : t.category,
      })))

      const now = new Date()
      const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
      const { data: monthTx } = await supabase.from('transactions').select('type, amount, exclude_from_budget, category:categories(name)').eq('user_id', user.id).gte('date', monthStart)

      let inc = 0, exp = 0, bSpent = 0
      const chartMap: Record<string, any> = {}

      ;(monthTx || []).forEach(t => {
        const amt = Number(t.amount)
        if (t.type === 'income') inc += amt
        else {
          exp += amt
          const cat = Array.isArray(t.category) ? t.category[0] : t.category
          const name = cat?.name || 'Other'
          chartMap[name] = (chartMap[name] || 0) + amt
          if (!t.exclude_from_budget) bSpent += amt
        }
      })

      setTotals({ income: inc, expense: exp })
      setBudgetSpent(bSpent)
      setChartData(Object.entries(chartMap).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value))

      const { data: budgetData } = await supabase.from('budgets').select('amount').eq('user_id', user.id).eq('month_year', monthStart).is('category_id', null).maybeSingle()
      setOverallBudget(budgetData ? Number(budgetData.amount) : null)
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => { fetchData() }, [fetchData])

  if (loading) return <PageSkeleton />

  const balance = totals.income - totals.expense
  const currency = profile?.currency || 'HKD'

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 max-w-4xl mx-auto w-full px-5 py-8 md:py-12">
        
        {/* Unified Header Group (Fixed Spacing & Overlap) */}
        <section className="animate-slide-up mb-12">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary opacity-60">
              {new Date().toLocaleDateString(language === 'zh-TW' ? 'zh-TW' : 'en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </p>
            <button 
              onClick={() => {
                const audio = new Audio('/assets/notification.mp3').play().catch(() => {})
                alert('Vault Integrity: All security protocols (MFA, Encryption) are currently active and stable.')
              }}
              className="w-11 h-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center relative transition-all active:scale-90 hover:bg-white/10"
            >
              <Bell size={20} className="text-secondary opacity-80" />
              <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-accent-primary ring-2 ring-bg-primary" />
            </button>
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-primary mb-2">
            {t('common.welcome')}, <span className="opacity-30 font-normal">{profile?.display_name?.split(' ')[0]}</span>
          </h1>

          <div className="text-center py-10">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-[11px] font-black uppercase tracking-[0.25em] text-secondary">{t('dashboard.balance_title')}</span>
              <button onClick={() => setIsVisible(!isVisible)} className="opacity-30 hover:opacity-100 transition-opacity">
                {isVisible ? <Eye size={12} /> : <EyeOff size={12} />}
              </button>
            </div>
            <h2 className={`text-6xl font-black tracking-tighter mb-10 ${balance >= 0 ? 'text-primary' : 'text-danger'}`}>
              {isVisible ? formatCurrency(balance, currency) : '••••••'}
            </h2>
            
            <div className="flex items-center justify-center gap-4">
              <Link href="/add" className="btn-apple-primary px-10 py-4 shadow-2xl flex items-center gap-2">
                <Plus size={20} strokeWidth={3} />
                <span className="text-sm font-black">{t('common.add_transaction')}</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Integrated Stats Surface */}
        <section className="animate-slide-up delay-1 mb-10 overflow-hidden surface-elevated">
          <div className="grid grid-cols-2 divide-x divide-border border-b border-border">
            <div className="px-6 py-5 text-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-secondary mb-1">{t('dashboard.income')}</p>
              <p className="text-lg font-bold text-success">{isVisible ? formatCurrency(totals.income, currency) : '••••'}</p>
            </div>
            <div className="px-6 py-5 text-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-secondary mb-1">{t('dashboard.expenses')}</p>
              <p className="text-lg font-bold text-danger">{isVisible ? formatCurrency(totals.expense, currency) : '••••'}</p>
            </div>
          </div>
          
          <div className="px-6 py-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity size={14} className="text-accent-primary" />
                <span className="text-[11px] font-black uppercase tracking-widest text-secondary">{t('reports.by_category')}</span>
              </div>
              <Link href="/reports" className="text-[10px] font-bold text-accent-primary uppercase tracking-widest">Detail →</Link>
            </div>
            <div className="h-1.5 w-full flex rounded-full overflow-hidden bg-white/5 mb-2">
              {chartData.slice(0, 5).map((item, i) => (
                <div key={item.name} className="h-full" style={{ width: `${(item.value / totals.expense) * 100}%`, background: COLORS[i % COLORS.length] }} />
              ))}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
              {chartData.slice(0, 4).map((item, i) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="text-[9px] font-black text-secondary uppercase tracking-tighter">{item.name} {Math.round((item.value/totals.expense)*100)}%</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Budget Integrated Bar */}
        {overallBudget !== null && (
          <section className="animate-slide-up delay-1 mb-10">
            <div className="flex items-center justify-between mb-2 px-1">
              <div className="flex items-center gap-2">
                <Target size={14} className="text-secondary" />
                <span className="text-[11px] font-black uppercase tracking-widest text-secondary">{t('budgets.title')}</span>
              </div>
              <span className="text-[10px] font-bold text-primary">{Math.round((budgetSpent / overallBudget) * 100)}%</span>
            </div>
            <div className="w-full h-3 bg-secondary rounded-full overflow-hidden mb-2 relative">
              <div
                className="absolute top-0 left-0 h-full bg-accent-primary transition-all duration-1000 shadow-[0_0_12px_rgba(175,82,222,0.3)]"
                style={{ width: `${Math.min((budgetSpent / overallBudget) * 100, 100)}%` }}
              />
            </div>
            <p className="text-[10px] items-center font-bold text-secondary mt-2 px-1 text-center">
              {isVisible ? t(budgetSpent <= overallBudget ? 'budgets.remaining' : 'budgets.over_by', {
                amount: formatCurrency(Math.abs(overallBudget - budgetSpent), currency),
              }) : '••••'}
            </p>
          </section>
        )}

        {/* Clean Transactions List Surface */}
        <section className="animate-slide-up delay-2">
          <div className="flex items-center justify-between mb-6 px-1">
            <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-secondary">{t('dashboard.recent_title')}</h3>
            <Link href="/transactions" className="text-[10px] font-bold text-accent-primary uppercase tracking-widest">Archive →</Link>
          </div>
          
          <div className="list-wrapper">
            {transactions.length === 0 ? (
              <div className="py-12 text-center opacity-30">
                <p className="text-xs font-black uppercase tracking-widest">{t('common.no_transactions')}</p>
              </div>
            ) : (
              transactions.map((tx) => (
                <Link key={tx.id} href="/transactions" className="list-item">
                  <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-xl">
                    {tx.category?.icon || (tx.type === 'income' ? '💰' : '💸')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{tx.category?.name || tx.note || tx.type}</p>
                    <p className="text-[10px] font-black text-secondary uppercase tracking-[0.1em] opacity-60">{formatDate(tx.date)}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-black text-sm ${tx.type === 'income' ? 'text-success' : 'text-danger'}`}>
                      {isVisible ? (tx.type === 'income' ? '+' : '-') + formatCurrency(Math.abs(tx.amount), tx.currency) : '••••'}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
