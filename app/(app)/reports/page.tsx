'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { BunordenFooter } from '@/components/layout/BunordenFooter'
import { formatCurrency } from '@/lib/utils'
import { BarChart3, PieChart, TrendingUp, TrendingDown } from 'lucide-react'

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

export default function ReportsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [currency, setCurrency] = useState('HKD')
  const [categoryTotals, setCategoryTotals] = useState<CategoryTotal[]>([])
  const [monthSummaries, setMonthSummaries] = useState<MonthSummary[]>([])
  const [totalIncome, setTotalIncome] = useState(0)
  const [totalExpense, setTotalExpense] = useState(0)
  const [viewType, setViewType] = useState<'categories' | 'monthly'>('categories')

  const fetchData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data: profile } = await supabase
      .from('profiles').select('currency').eq('id', user.id).single()
    if (profile?.currency) setCurrency(profile.currency)

    // Get all transactions with categories
    const { data: rawTxs } = await supabase
      .from('transactions')
      .select('type, amount, date, category:categories(name, icon)')
      .eq('user_id', user.id)
      .order('date', { ascending: false })

    if (!rawTxs || rawTxs.length === 0) { setLoading(false); return }

    // Flatten category arrays from Supabase joins
    const txs = rawTxs.map((t: any) => ({
      ...t,
      category: Array.isArray(t.category) ? t.category[0] || null : t.category,
    }))

    // Category totals
    const catMap: Record<string, CategoryTotal> = {}
    let inc = 0, exp = 0

    // Monthly summaries
    const monthMap: Record<string, { income: number; expense: number }> = {}

    txs.forEach((t: any) => {
      const amt = Number(t.amount)
      if (t.type === 'income') inc += amt
      else if (t.type === 'expense') exp += amt

      // Category grouping
      const catName = t.category?.name || 'Uncategorised'
      const catIcon = t.category?.icon || (t.type === 'income' ? '💰' : '💸')
      const key = `${catName}-${t.type}`
      if (!catMap[key]) catMap[key] = { name: catName, icon: catIcon, total: 0, type: t.type as 'income' | 'expense' }
      catMap[key].total += amt

      // Monthly grouping
      const month = t.date.slice(0, 7)
      if (!monthMap[month]) monthMap[month] = { income: 0, expense: 0 }
      if (t.type === 'income') monthMap[month].income += amt
      else if (t.type === 'expense') monthMap[month].expense += amt
    })

    setTotalIncome(inc)
    setTotalExpense(exp)
    setCategoryTotals(Object.values(catMap).sort((a, b) => b.total - a.total))
    setMonthSummaries(
      Object.entries(monthMap)
        .sort(([a], [b]) => b.localeCompare(a))
        .slice(0, 12)
        .map(([month, data]) => ({ month, ...data }))
    )
    setLoading(false)
  }, [router])

  useEffect(() => { fetchData() }, [fetchData])

  const maxCatTotal = Math.max(...categoryTotals.map(c => c.total), 1)

  const monthLabel = (m: string) => {
    const [y, mo] = m.split('-')
    return new Date(Number(y), Number(mo) - 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 px-4 lg:px-8 py-6 lg:py-8 max-w-3xl mx-auto w-full">
        <h1 className="text-3xl font-bold tracking-tight mb-6 animate-fade-up" style={{ color: 'var(--text-primary)' }}>
          Reports
        </h1>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="skeleton h-20 rounded-2xl" />)}
          </div>
        ) : categoryTotals.length === 0 ? (
          <div className="glass-card text-center py-16 animate-fade-up">
            <div className="text-5xl mb-4">📊</div>
            <p className="font-semibold text-lg mb-1" style={{ color: 'var(--text-secondary)' }}>
              No data yet
            </p>
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
              Add transactions to see your reports
            </p>
          </div>
        ) : (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="glass-card animate-fade-up delay-1">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp size={16} style={{ color: 'var(--success)' }} />
                  <span className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>Total Income</span>
                </div>
                <p className="text-xl font-bold" style={{ color: 'var(--success)' }}>
                  {formatCurrency(totalIncome, currency)}
                </p>
              </div>
              <div className="glass-card animate-fade-up delay-2">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown size={16} style={{ color: 'var(--danger)' }} />
                  <span className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>Total Expenses</span>
                </div>
                <p className="text-xl font-bold" style={{ color: 'var(--danger)' }}>
                  {formatCurrency(totalExpense, currency)}
                </p>
              </div>
            </div>

            {/* View toggle */}
            <div className="glass-card p-1.5 flex gap-1 mb-6 animate-fade-up delay-3">
              <button
                onClick={() => setViewType('categories')}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold"
                style={{
                  background: viewType === 'categories' ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                  color: viewType === 'categories' ? 'var(--accent-primary)' : 'var(--text-tertiary)',
                  transition: 'all 0.25s',
                }}
              >
                <PieChart size={16} /> By Category
              </button>
              <button
                onClick={() => setViewType('monthly')}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold"
                style={{
                  background: viewType === 'monthly' ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                  color: viewType === 'monthly' ? 'var(--accent-primary)' : 'var(--text-tertiary)',
                  transition: 'all 0.25s',
                }}
              >
                <BarChart3 size={16} /> Monthly
              </button>
            </div>

            {/* Category breakdown */}
            {viewType === 'categories' && (
              <div className="space-y-2 animate-fade-up delay-4">
                {categoryTotals.map((cat, i) => (
                  <div key={cat.name + cat.type} className="glass-card py-3 px-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-lg">{cat.icon}</span>
                      <span className="flex-1 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {cat.name}
                      </span>
                      <span className="text-sm font-semibold" style={{
                        color: cat.type === 'income' ? 'var(--success)' : 'var(--danger)'
                      }}>
                        {formatCurrency(cat.total, currency)}
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--overlay)' }}>
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(cat.total / maxCatTotal) * 100}%`,
                          background: cat.type === 'income'
                            ? 'linear-gradient(90deg, var(--success), #6ee7b7)'
                            : 'linear-gradient(90deg, var(--danger), #fca5a5)',
                          transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Monthly view */}
            {viewType === 'monthly' && (
              <div className="space-y-3 animate-fade-up delay-4">
                {monthSummaries.map((ms) => {
                  const net = ms.income - ms.expense
                  const maxVal = Math.max(ms.income, ms.expense, 1)
                  return (
                    <div key={ms.month} className="glass-card py-4 px-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {monthLabel(ms.month)}
                        </span>
                        <span className="text-sm font-bold" style={{
                          color: net >= 0 ? 'var(--success)' : 'var(--danger)',
                        }}>
                          {net >= 0 ? '+' : ''}{formatCurrency(net, currency)}
                        </span>
                      </div>
                      {/* Income bar */}
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs w-16" style={{ color: 'var(--text-tertiary)' }}>Income</span>
                        <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--overlay)' }}>
                          <div className="h-full rounded-full" style={{
                            width: `${(ms.income / maxVal) * 100}%`,
                            background: 'var(--success)',
                            transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                          }} />
                        </div>
                        <span className="text-xs font-medium w-20 text-right" style={{ color: 'var(--success)' }}>
                          {formatCurrency(ms.income, currency)}
                        </span>
                      </div>
                      {/* Expense bar */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs w-16" style={{ color: 'var(--text-tertiary)' }}>Expense</span>
                        <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--overlay)' }}>
                          <div className="h-full rounded-full" style={{
                            width: `${(ms.expense / maxVal) * 100}%`,
                            background: 'var(--danger)',
                            transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                          }} />
                        </div>
                        <span className="text-xs font-medium w-20 text-right" style={{ color: 'var(--danger)' }}>
                          {formatCurrency(ms.expense, currency)}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>

      <BunordenFooter />
    </div>
  )
}
