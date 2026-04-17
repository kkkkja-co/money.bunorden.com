'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { formatCurrency, formatDate } from '@/lib/utils'
import { 
  Plus, TrendingUp, TrendingDown,
  ChevronRight, Eye, EyeOff, Bell,
  Target, Sparkles, Activity, X,
  ShieldCheck, Cpu, Globe, Lock
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { User } from '@supabase/supabase-js'
import { useTranslation, useLanguage } from '@/app/providers'
import { PageSkeleton } from '@/components/ui/PageSkeleton'
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher'

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
  const [showNotifications, setShowNotifications] = useState(false)

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
      <AnimatePresence>
        {showNotifications && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 sm:p-8">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNotifications(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-2xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-sm surface-elevated relative z-[310] overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.6)] border border-white/10 flex flex-col max-h-[85vh]"
            >
              <div className="p-6 overflow-y-auto custom-scrollbar">
                <div className="flex items-center justify-between mb-8 sticky top-0 bg-[var(--surface-primary)] z-20 pb-2">
                  <h3 className="text-xl font-bold text-primary flex items-center gap-2.5">
                    <ShieldCheck size={22} className="text-accent-primary" />
                    {t('notifications.title')}
                  </h3>
                  <button 
                    onClick={() => setShowNotifications(false)}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors"
                  >
                    <X size={20} className="text-secondary" />
                  </button>
                </div>

                {/* System Health dots */}
                <div className="mb-8">
                  <div className="flex gap-1.5 mb-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-1 flex-1 rounded-full bg-success shadow-[0_0_8px_rgba(52,199,89,0.5)]" />
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 opacity-60">
                      <ShieldCheck size={12} className="text-success" />
                      <span className="text-[9px] font-black uppercase tracking-wider text-secondary">{t('notifications.mfa')}</span>
                    </div>
                    <div className="flex items-center gap-2 opacity-60">
                      <Lock size={12} className="text-success" />
                      <span className="text-[9px] font-black uppercase tracking-wider text-secondary">{t('notifications.encryption')}</span>
                    </div>
                    <div className="flex items-center gap-2 opacity-60">
                      <Globe size={12} className="text-success" />
                      <span className="text-[9px] font-black uppercase tracking-wider text-secondary">{t('notifications.cloudflare')}</span>
                    </div>
                    <div className="flex items-center gap-2 opacity-60">
                      <Cpu size={12} className="text-success" />
                      <span className="text-[9px] font-black uppercase tracking-wider text-secondary">{t('notifications.vercel')}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Budget Insight */}
                  {overallBudget !== null && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-black uppercase tracking-widest text-secondary">{t('notifications.budget_integrity')}</p>
                        <span className={`text-[10px] font-bold ${budgetSpent > overallBudget ? 'text-danger' : 'text-success'}`}>
                          {budgetSpent > overallBudget ? 'Alert: Variance Detected' : 'All Clear'}
                        </span>
                      </div>
                      <div className={`p-4 rounded-2xl border ${budgetSpent > overallBudget ? 'bg-danger/5 border-danger/20' : 'bg-success/5 border-success/20'}`}>
                        <p className="text-sm font-bold mb-1">
                          {budgetSpent > overallBudget 
                            ? t('budgets.over_by', { amount: formatCurrency(budgetSpent - overallBudget, currency) }) 
                            : t('budgets.remaining', { amount: formatCurrency(overallBudget - budgetSpent, currency) })
                          }
                        </p>
                        <p className="text-[10px] text-tertiary">
                          {budgetSpent > overallBudget ? 'Consider reviewing recent outsized expenses.' : 'Your spending pace is within healthy limits for this period.'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Recent Updates */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-secondary">{t('notifications.recent_updates')}</p>
                    <div className="surface-elevated p-4 border border-white/5 bg-white/[0.02]">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles size={14} className="text-accent-primary" />
                        <p className="text-xs font-black uppercase text-accent-primary">{t('notifications.v051_title')}</p>
                      </div>
                      <p className="text-[11px] leading-relaxed text-secondary italic opacity-80">
                        "{t('notifications.v051_desc')}"
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex-1 max-w-4xl mx-auto w-full px-5 py-8 md:py-12">
        
        {/* Unified Header Group (Fixed Spacing & Overlap) */}
        <section className="animate-slide-up mb-12">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary opacity-60">
              {new Date().toLocaleDateString(language === 'zh-TW' ? 'zh-TW' : 'en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </p>
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <button 
                onClick={() => {
                  const audio = new Audio('/assets/notification.mp3').play().catch(() => {})
                  setShowNotifications(true)
                }}
                className="w-11 h-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center relative transition-all active:scale-90 hover:bg-white/10"
                aria-label={t('common.notifications_title') || 'Notifications'}
              >
                <Bell size={20} className="text-[var(--text-secondary)] opacity-80" />
                <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-[var(--accent-primary)] ring-2 ring-[var(--bg-primary)]" />
              </button>
            </div>
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-primary mb-2">
            {t('common.welcome')}, <span className="opacity-30 font-normal">{profile?.display_name?.split(' ')[0]}</span>
          </h1>

          <div className="text-center py-10">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-[11px] font-black uppercase tracking-[0.25em] text-secondary">{t('dashboard.balance_title')}</span>
              <button onClick={() => setIsVisible(!isVisible)} className="opacity-30 hover:opacity-100 transition-opacity" aria-label={isVisible ? 'Hide balance' : 'Show balance'}>
                {isVisible ? <Eye size={12} /> : <EyeOff size={12} />}
              </button>
            </div>
            <h2 className={`text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter mb-10 px-2 truncate ${balance >= 0 ? 'text-primary' : 'text-danger'}`}>
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
              <p className="text-lg font-bold text-success truncate px-1">{isVisible ? formatCurrency(totals.income, currency) : '••••'}</p>
            </div>
            <div className="px-6 py-5 text-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-secondary mb-1">{t('dashboard.expenses')}</p>
              <p className="text-lg font-bold text-danger truncate px-1">{isVisible ? formatCurrency(totals.expense, currency) : '••••'}</p>
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
                <div key={item.name} className="h-full" style={{ width: `${(item.value / totals.expense) * 100}%`, backgroundColor: COLORS[i % COLORS.length] }} />
              ))}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
              {chartData.slice(0, 4).map((item, i) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
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
                className="absolute top-0 left-0 h-full bg-[var(--accent-primary)] transition-all duration-1000 shadow-[0_0_12px_rgba(175,82,222,0.3)]"
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
                <Link key={tx.id} href={`/add?id=${tx.id}`} className="list-item active:bg-white/5 transition-colors">
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
