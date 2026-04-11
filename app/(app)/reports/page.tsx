'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { BunordenFooter } from '@/components/layout/BunordenFooter'
import { formatCurrency } from '@/lib/utils'
import { 
  BarChart3, PieChart as PieChartIcon, TrendingUp, TrendingDown, 
  ChevronRight, Filter, SortAsc, LayoutGrid, List, Eye, EyeOff
} from 'lucide-react'
import { useTranslation, useLanguage } from '@/app/providers'
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip,
  BarChart, Bar, XAxis, YAxis, Legend, CartesianGrid 
} from 'recharts'
import { PageSkeleton } from '@/components/ui/PageSkeleton'

interface CategoryTotal {
  name: string
  icon: string
  total: number
  type: 'income' | 'expense'
}

interface MonthSummary {
  month: string
  income: number
  expense: number
}

const COLORS = [
  '#3b82f6', '#8b5cf6', '#ec4899', '#ef4444', 
  '#f59e0b', '#10b981', '#06b6d4', '#6366f1',
  '#f43f5e', '#a855f7'
]

export default function ReportsPage() {
  const { t } = useTranslation()
  const { language } = useLanguage()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [currency, setCurrency] = useState('HKD')
  const [categoryTotals, setCategoryTotals] = useState<CategoryTotal[]>([])
  const [monthSummaries, setMonthSummaries] = useState<MonthSummary[]>([])
  const [totalIncome, setTotalIncome] = useState(0)
  const [totalExpense, setTotalExpense] = useState(0)
  const [viewType, setViewType] = useState<'categories' | 'monthly'>('categories')
  const [sortBy, setSortBy] = useState<'amount' | 'name'>('amount')
  const [filterType, setFilterType] = useState<'income' | 'expense'>('expense')
  const [isVisible, setIsVisible] = useState(true)

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

      const { data: profile } = await supabase
        .from('profiles').select('currency').eq('id', user.id).single()
      if (profile?.currency) setCurrency(profile.currency)

      const { data: rawTxs } = await supabase
        .from('transactions')
        .select('type, amount, date, category:categories(name, icon)')
        .eq('user_id', user.id)
        .eq('exclude_from_budget', false)
        .order('date', { ascending: false })

      if (!rawTxs || rawTxs.length === 0) { setLoading(false); return }

      const txs = rawTxs.map((t: any) => ({
        ...t,
        category: Array.isArray(t.category) ? t.category[0] || null : t.category,
      }))

      const catMap: Record<string, CategoryTotal> = {}
      let inc = 0, exp = 0
      const monthMap: Record<string, { income: number; expense: number }> = {}

      txs.forEach((t: any) => {
        const amt = Number(t.amount)
        if (t.type === 'income') inc += amt
        else if (t.type === 'expense') exp += amt

        const catName = t.category?.name || (t.type === 'income' ? 'Income' : 'Uncategorized')
        const catIcon = t.category?.icon || (t.type === 'income' ? '💰' : '💸')
        const key = `${catName}-${t.type}`
        if (!catMap[key]) catMap[key] = { name: catName, icon: catIcon, total: 0, type: t.type as 'income' | 'expense' }
        catMap[key].total += amt

        const month = t.date.slice(0, 7)
        if (!monthMap[month]) monthMap[month] = { income: 0, expense: 0 }
        if (t.type === 'income') monthMap[month].income += amt
        else if (t.type === 'expense') monthMap[month].expense += amt
      })

      setTotalIncome(inc)
      setTotalExpense(exp)
      setCategoryTotals(Object.values(catMap))
      setMonthSummaries(
        Object.entries(monthMap)
          .sort(([a], [b]) => a.localeCompare(b)) // Oldest first for trend
          .map(([month, data]) => ({ month, ...data }))
      )
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => { fetchData() }, [fetchData])

  const filteredSortedCategories = useMemo(() => {
    return categoryTotals
      .filter(c => c.type === filterType)
      .sort((a, b) => {
        if (sortBy === 'amount') return b.total - a.total
        return a.name.localeCompare(b.name, language === 'zh-TW' ? 'zh-Hant' : 'en')
      })
  }, [categoryTotals, filterType, sortBy, language])

  const chartData = useMemo(() => {
    return filteredSortedCategories.map(c => ({
      name: c.name,
      value: c.total,
      icon: c.icon
    }))
  }, [filteredSortedCategories])

  const maxCatTotal = Math.max(...filteredSortedCategories.map(c => c.total), 1)

  const monthLabel = (m: string) => {
    const [y, mo] = m.split('-')
    return new Date(Number(y), Number(mo) - 1).toLocaleDateString(language === 'zh-TW' ? 'zh-TW' : 'en-US', { month: 'short' })
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="surface-elevated p-3 shadow-xl border-none">
          <p className="text-sm font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
            {payload[0].name}
          </p>
          <p className="text-sm font-semibold" style={{ color: filterType === 'income' ? 'var(--success)' : 'var(--danger)' }}>
            {formatCurrency(Number(payload[0].value), currency)}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 px-4 lg:px-8 py-6 lg:py-8 max-w-3xl mx-auto w-full">
        <header className="mb-8 animate-slide-up">
          <h1 className="text-3xl font-bold tracking-tight mb-2 text-[var(--text-primary)]">
            {t('reports.title')}
          </h1>
          <p className="text-sm text-[var(--text-tertiary)]">
            {viewType === 'categories' ? t('reports.by_category') : t('reports.monthly')}
          </p>
        </header>

        {loading ? (
          <PageSkeleton />
        ) : categoryTotals.length === 0 ? (
          <div className="surface-elevated text-center py-20 animate-slide-up">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
              <BarChart3 size={32} className="text-[var(--text-tertiary)]" />
            </div>
            <h2 className="text-xl font-bold mb-2 text-[var(--text-primary)]">{t('reports.no_data')}</h2>
            <p className="text-sm max-w-xs mx-auto mb-8 text-[var(--text-tertiary)]">
              {t('reports.no_data_subtitle')}
            </p>
            <button 
              onClick={() => router.push('/add')}
              className="btn-apple-primary px-8 py-3 rounded-full"
            >
              {t('common.add_transaction')}
            </button>
          </div>
        ) : (
          <div className="space-y-8 pb-10">
            {/* Assets Overview Pie Chart */}
            <div className="surface-elevated animate-slide-up delay-1 overflow-hidden">
              <div className="flex items-center justify-between mb-6 px-1">
                <h3 className="text-sm font-bold text-[var(--text-primary)]">{t('reports.assets_overview')}</h3>
                <button
                  onClick={toggleVisibility}
                  className="p-1.5 rounded-lg hover:bg-white/5 transition-colors text-[var(--text-tertiary)]"
                  aria-label={isVisible ? 'Hide values' : 'Show values'}
                >
                  {isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
              </div>
              <div className="h-[280px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: t('reports.total_earned'), value: totalIncome },
                        { name: t('reports.total_spent'), value: totalExpense }
                      ]}
                      innerRadius={85}
                      outerRadius={110}
                      paddingAngle={8}
                      dataKey="value"
                      cornerRadius={12}
                    >
                      <Cell fill="var(--success)" />
                      <Cell fill="var(--danger)" />
                    </Pie>
                    <RechartsTooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none" style={{ marginTop: '-18px' }}>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">{t('dashboard.balance_title')}</p>
                  <p className={`text-2xl font-black ${totalIncome - totalExpense >= 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
                    {isVisible ? formatCurrency(totalIncome - totalExpense, currency) : '••••••'}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Summary Cards */}
            <div className="grid grid-cols-2 gap-4 animate-slide-up delay-2">
              <div className="surface-elevated flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full bg-[var(--success-bg)] flex items-center justify-center mb-3">
                  <TrendingUp size={20} className="text-[var(--success)]" />
                </div>
                <p className="text-xs font-semibold mb-1 text-[var(--text-tertiary)]">{t('reports.total_income')}</p>
                <p className="text-xl font-bold text-[var(--success)]">
                  {isVisible ? formatCurrency(totalIncome, currency) : '••••'}
                </p>
              </div>
              <div className="surface-elevated flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full bg-[var(--danger-bg)] flex items-center justify-center mb-3">
                  <TrendingDown size={20} className="text-[var(--danger)]" />
                </div>
                <p className="text-xs font-semibold mb-1 text-[var(--text-tertiary)]">{t('reports.total_expenses')}</p>
                <p className="text-xl font-bold text-[var(--danger)]">
                  {isVisible ? formatCurrency(totalExpense, currency) : '••••'}
                </p>
              </div>
            </div>

            {/* Main Tabs */}
            <div className="surface-elevated p-1.5 flex gap-1 animate-slide-up delay-2">
              <button
                onClick={() => setViewType('categories')}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold transition-all"
                style={{
                  background: viewType === 'categories' ? 'var(--accent-primary)' : 'transparent',
                  color: viewType === 'categories' ? 'white' : 'var(--text-tertiary)',
                  boxShadow: viewType === 'categories' ? '0 4px 12px rgba(59, 130, 246, 0.3)' : 'none',
                }}
                aria-label={t('reports.by_category')}
                aria-pressed={viewType === 'categories'}
              >
                <PieChartIcon size={18} /> {t('reports.by_category')}
              </button>
              <button
                onClick={() => setViewType('monthly')}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold transition-all"
                style={{
                  background: viewType === 'monthly' ? 'var(--accent-primary)' : 'transparent',
                  color: viewType === 'monthly' ? 'white' : 'var(--text-tertiary)',
                  boxShadow: viewType === 'monthly' ? '0 4px 12px rgba(59, 130, 246, 0.3)' : 'none',
                }}
                aria-label={t('reports.monthly')}
                aria-pressed={viewType === 'monthly'}
              >
                <BarChart3 size={18} /> {t('reports.monthly')}
              </button>
            </div>

            {viewType === 'categories' && (
              <div className="space-y-6 animate-slide-up delay-3">
                {/* Visual Section */}
                <div className="surface-elevated pb-8 overflow-hidden">
                  <div className="flex items-center justify-between mb-8 px-2">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setFilterType('expense')}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                          filterType === 'expense' 
                            ? 'bg-danger/10 border-danger text-danger' 
                            : 'bg-white/5 border-transparent text-tertiary'
                        }`}
                      >
                        {t('dashboard.expenses')}
                      </button>
                      <button 
                        onClick={() => setFilterType('income')}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                          filterType === 'income' 
                            ? 'bg-success/10 border-success text-success' 
                            : 'bg-white/5 border-transparent text-tertiary'
                        }`}
                      >
                        {t('dashboard.income')}
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <label htmlFor="sort-by-select" className="text-[10px] font-bold uppercase text-[var(--text-tertiary)]">{t('reports.sort_by')}:</label>
                      <select 
                        id="sort-by-select"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="bg-transparent text-xs font-bold focus:outline-none text-[var(--accent-primary)]"
                        aria-label={t('reports.sort_by')}
                      >
                        <option value="amount" className="bg-zinc-900">{t('reports.amount')}</option>
                        <option value="name" className="bg-zinc-900">{t('reports.name')}</option>
                      </select>
                    </div>
                  </div>

                  <div className="h-[300px] w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          innerRadius={80}
                          outerRadius={105}
                          paddingAngle={5}
                          dataKey="value"
                          cornerRadius={10}
                          cx="50%"
                          cy="50%"
                          stroke="none"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">{t('common.total')}</p>
                      <p className="text-xl font-black text-[var(--text-primary)]">
                        {isVisible ? formatCurrency(filterType === 'income' ? totalIncome : totalExpense, currency) : '••••'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* List Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-2 mb-2">
                    <h3 className="text-sm font-bold text-[var(--text-primary)]">{filterType === 'income' ? t('reports.income_by_category') : t('reports.expenses_by_category')}</h3>
                    <div className="flex items-center gap-1.5 opacity-50 text-[var(--text-primary)]">
                       <LayoutGrid size={14} />
                    </div>
                  </div>
                  
                  {filteredSortedCategories.map((cat, i) => (
                    <div key={cat.name + cat.type} className="surface-elevated-interactive flex flex-col gap-3 group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm bg-[var(--overlay)] text-[var(--text-primary)]">
                          {cat.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-sm text-[var(--text-primary)]">{cat.name}</span>
                            <span className={`font-bold text-sm ${cat.type === 'income' ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
                              {formatCurrency(cat.total, currency)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-[var(--overlay)]">
                              <div
                                className="h-full rounded-full transition-all duration-1000 ease-out"
                                style={{
                                  width: `${(cat.total / maxCatTotal) * 100}%`,
                                  background: COLORS[i % COLORS.length]
                                }}
                              />
                            </div>
                            <span className="text-[10px] font-bold w-8 text-right text-[var(--text-tertiary)]">
                              {Math.round((cat.total / (filterType === 'income' ? totalIncome : totalExpense)) * 100)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {viewType === 'monthly' && (
              <div className="space-y-6 animate-slide-up delay-3">
                <div className="surface-elevated">
                  <h3 className="text-sm font-bold mb-8 px-2 text-[var(--text-primary)]">{t('reports.trend')}</h3>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthSummaries}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis 
                          dataKey="month" 
                          tickFormatter={monthLabel} 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: 'var(--text-tertiary)', fontSize: 10, fontWeight: 'bold' }}
                          dy={10}
                        />
                        <YAxis hide />
                        <RechartsTooltip 
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="surface-elevated p-3 shadow-2xl border-none">
                                  <p className="text-xs font-bold mb-2 uppercase tracking-wider text-[var(--text-tertiary)]">{monthLabel(label)}</p>
                                  <div className="space-y-1">
                                    <p className="text-sm font-bold flex items-center gap-2 text-[var(--success)]">
                                      <div className="w-2 h-2 rounded-full bg-[var(--success)]" /> {formatCurrency(Number(payload[0].value), currency)}
                                    </p>
                                    <p className="text-sm font-bold flex items-center gap-2 text-[var(--danger)]">
                                      <div className="w-2 h-2 rounded-full bg-[var(--danger)]" /> {formatCurrency(Number(payload[1].value), currency)}
                                    </p>
                                  </div>
                                </div>
                              )
                            }
                            return null
                          }}
                        />
                        <Bar dataKey="income" fill="var(--success)" radius={[4, 4, 0, 0]} name={t('dashboard.income')} />
                        <Bar dataKey="expense" fill="var(--danger)" radius={[4, 4, 0, 0]} name={t('dashboard.expenses')} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="space-y-3">
                  {monthSummaries.slice().reverse().map((ms) => {
                    const net = ms.income - ms.expense
                    return (
                      <div key={ms.month} className="surface-elevated flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-black text-xs text-[var(--text-secondary)]">
                            {monthLabel(ms.month).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-xs font-bold uppercase tracking-widest mb-0.5 text-[var(--text-tertiary)]">{ms.month.split('-')[0]}</p>
                            <p className="text-sm font-black text-[var(--text-primary)]">
                              {net >= 0 ? '+' : ''}{formatCurrency(net, currency)}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-[10px] font-bold text-[var(--success)]">+{formatCurrency(ms.income, currency)}</span>
                          <span className="text-[10px] font-bold text-[var(--danger)]">-{formatCurrency(ms.expense, currency)}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <BunordenFooter />
    </div>
  )
}
