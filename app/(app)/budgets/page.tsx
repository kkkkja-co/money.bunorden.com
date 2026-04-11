'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { BunordenFooter } from '@/components/layout/BunordenFooter'
import { formatCurrency } from '@/lib/utils'
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react'
import { useTranslation, useLanguage } from '@/app/providers'
import { PageSkeleton } from '@/components/ui/PageSkeleton'

interface Category {
  id: string
  name: string
  icon: string
}

function monthBounds(offset: number) {
  const d = new Date()
  d.setMonth(d.getMonth() + offset)
  const y = d.getFullYear()
  const m = d.getMonth()
  const start = `${y}-${String(m + 1).padStart(2, '0')}-01`
  const last = new Date(y, m + 1, 0).getDate()
  const end = `${y}-${String(m + 1).padStart(2, '0')}-${String(last).padStart(2, '0')}`
  return { start, end, y, m }
}

export default function BudgetsPage() {
  const { t } = useTranslation()
  const { language } = useLanguage()
  const router = useRouter()
  const [offset, setOffset] = useState(0)
  const [currency, setCurrency] = useState('HKD')
  const [userId, setUserId] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [spentTotal, setSpentTotal] = useState(0)
  const [spentByCat, setSpentByCat] = useState<Record<string, number>>({})
  const [overallInput, setOverallInput] = useState('')
  const [catInputs, setCatInputs] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState('')

  const { start: monthStart, end: monthEnd, y, m } = monthBounds(offset)

  const monthLabel = new Date(y, m).toLocaleDateString(
    language === 'zh-TW' ? 'zh-TW' : 'en-US',
    { month: 'long', year: 'numeric' }
  )

  const persistBudget = async (categoryId: string | null, raw: string) => {
    if (!userId) return
    const trimmed = raw.trim()
    const n = parseFloat(trimmed)
    const hasAmount = trimmed !== '' && !Number.isNaN(n) && n > 0

    let del = supabase.from('budgets').delete().eq('user_id', userId).eq('month_year', monthStart)
    if (categoryId === null) del = del.is('category_id', null)
    else del = del.eq('category_id', categoryId)

    if (!hasAmount) {
      const { error } = await del
      if (error) console.error(error)
      return
    }

    let sel = supabase.from('budgets').select('id').eq('user_id', userId).eq('month_year', monthStart)
    if (categoryId === null) sel = sel.is('category_id', null)
    else sel = sel.eq('category_id', categoryId)

    const { data: row, error: selErr } = await sel.maybeSingle()
    if (selErr) {
      console.error(selErr)
      return
    }

    if (row) {
      const { error } = await supabase
        .from('budgets')
        .update({ amount: n, currency })
        .eq('id', row.id)
      if (error) console.error(error)
    } else {
      const { error } = await supabase.from('budgets').insert({
        user_id: userId,
        category_id: categoryId,
        month_year: monthStart,
        amount: n,
        currency,
      })
      if (error) console.error(error)
    }
  }

  const fetchData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }
    setUserId(user.id)

    const { data: profile } = await supabase.from('profiles').select('currency').eq('id', user.id).single()
    if (profile?.currency) setCurrency(profile.currency)

    const { data: cats } = await supabase
      .from('categories')
      .select('id, name, icon')
      .eq('user_id', user.id)
      .eq('type', 'expense')
      .eq('archived', false)
      .order('sort_order')
    setCategories(cats || [])

    const { data: txs } = await supabase
      .from('transactions')
      .select('amount, category_id')
      .eq('user_id', user.id)
      .eq('type', 'expense')
      .eq('exclude_from_budget', false)
      .gte('date', monthStart)
      .lte('date', monthEnd)

    let total = 0
    const byCat: Record<string, number> = {}
    ;(txs || []).forEach((row) => {
      const a = Number(row.amount)
      total += a
      const cid = row.category_id
      if (cid) byCat[cid] = (byCat[cid] || 0) + a
    })
    setSpentTotal(total)
    setSpentByCat(byCat)

    const { data: budRows } = await supabase
      .from('budgets')
      .select('category_id, amount')
      .eq('user_id', user.id)
      .eq('month_year', monthStart)

    let overall = ''
    const nextCat: Record<string, string> = {}
    ;(budRows || []).forEach((b) => {
      if (b.category_id === null) overall = String(Number(b.amount))
      else nextCat[b.category_id] = String(Number(b.amount))
    })
    setOverallInput(overall)
    const catMap: Record<string, string> = {}
    ;(cats || []).forEach((c) => {
      catMap[c.id] = nextCat[c.id] ?? ''
    })
    setCatInputs(catMap)
    setLoading(false)
  }, [router, monthStart, monthEnd])

  useEffect(() => {
    setLoading(true)
    fetchData()
  }, [fetchData])

  const showSaved = () => {
    setToast(t('budgets.saved'))
    setTimeout(() => setToast(''), 2000)
  }

  const barPct = (spent: number, cap: number) => {
    if (cap <= 0) return 0
    return Math.min(100, Math.round((spent / cap) * 100))
  }

  const overallCap = parseFloat(overallInput) || 0

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 px-4 lg:px-8 py-6 lg:py-8 max-w-3xl mx-auto w-full">
        <div className="flex items-center gap-3 mb-6 animate-slide-up">
          <Link
            href="/dashboard"
            className="w-10 h-10 rounded-xl flex items-center justify-center lg:hidden bg-[var(--overlay)] border border-[var(--border)]"
            aria-label={t('common.back')}
          >
            <ArrowLeft size={18} className="text-[var(--text-secondary)]" />
          </Link>
          <h1 className="text-3xl font-bold tracking-tight flex-1 text-[var(--text-primary)]">
            {t('budgets.title')}
          </h1>
        </div>

        <p className="text-sm mb-6 animate-slide-up delay-1 text-[var(--text-tertiary)]">
          {t('budgets.subtitle')}
        </p>

        {/* Month switcher */}
        <div
          className="surface-elevated flex items-center justify-between py-3 px-4 mb-6 animate-slide-up delay-1"
        >
          <button
            type="button"
            onClick={() => setOffset((o) => o - 1)}
            className="w-10 h-10 rounded-xl flex items-center justify-center bg-[var(--overlay)] text-[var(--text-secondary)]"
            aria-label={t('budgets.prev_month')}
          >
            <ChevronLeft size={20} />
          </button>
          <span className="font-semibold text-sm text-[var(--text-primary)]">{monthLabel}</span>
          <button
            type="button"
            onClick={() => setOffset((o) => o + 1)}
            className="w-10 h-10 rounded-xl flex items-center justify-center bg-[var(--overlay)] text-[var(--text-secondary)]"
            aria-label={t('budgets.next_month')}
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {loading ? (
          <PageSkeleton />
        ) : (
          <>
            {/* Overall */}
            <div className="surface-elevated p-4 mb-6 animate-slide-up delay-2">
              <h2 className="text-sm font-bold mb-3 text-[var(--text-primary)]">
                {t('budgets.overall')}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                <div>
                  <label htmlFor="overall-budget" className="block text-xs font-medium mb-1.5 text-[var(--text-tertiary)]">
                    {t('budgets.budget_cap')}
                  </label>
                  <input
                    id="overall-budget"
                    type="number"
                    min={0}
                    step="0.01"
                    value={overallInput}
                    onChange={(e) => setOverallInput(e.target.value)}
                    onBlur={(e) => {
                      void persistBudget(null, e.target.value).then(showSaved)
                    }}
                    className="input-minimal w-full"
                    placeholder="0"
                  />
                </div>
                <div>
                  <p className="text-xs font-medium mb-1.5 text-[var(--text-tertiary)]">
                    {t('budgets.spent')}
                  </p>
                  <p className="text-lg font-bold text-[var(--danger)]">
                    {formatCurrency(spentTotal, currency)}
                  </p>
                </div>
              </div>
              {overallCap > 0 && (
                <>
                  <div className="h-3 rounded-full overflow-hidden mb-2 relative bg-[var(--overlay)]">
                    <div
                      className="absolute top-0 left-0 h-full rounded-full transition-all shadow-[0_0_12px_rgba(175,82,222,0.2)]"
                      style={{
                        width: `${barPct(spentTotal, overallCap)}%`,
                        background:
                          spentTotal > overallCap
                            ? 'var(--danger)'
                            : 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))',
                      }}
                    />
                  </div>
                  <p className="text-xs text-[var(--text-tertiary)]">
                    {spentTotal <= overallCap
                      ? t('budgets.remaining', {
                          amount: formatCurrency(overallCap - spentTotal, currency),
                        })
                      : t('budgets.over_by', {
                          amount: formatCurrency(spentTotal - overallCap, currency),
                        })}
                  </p>
                </>
              )}
            </div>

            {/* By category */}
            <h2 className="text-sm font-semibold mb-3 px-1 text-[var(--text-tertiary)]">
              {t('budgets.by_category')}
            </h2>
            <div className="space-y-3 mb-8">
              {categories.length === 0 ? (
                <div className="surface-elevated text-center py-12 text-sm text-[var(--text-tertiary)]">
                  {t('budgets.no_expense_categories')}
                </div>
              ) : (
                categories.map((cat) => {
                  const cap = parseFloat(catInputs[cat.id] || '') || 0
                  const spent = spentByCat[cat.id] || 0
                  return (
                    <div key={cat.id} className="surface-elevated p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg">{cat.icon}</span>
                        <span className="font-medium text-sm text-[var(--text-primary)]">
                          {cat.name}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
                        <div>
                          <label htmlFor={`budget-${cat.id}`} className="block text-[10px] font-medium mb-1 text-[var(--text-tertiary)]">
                            {t('budgets.budget_cap')}
                          </label>
                          <input
                            id={`budget-${cat.id}`}
                            type="number"
                            min={0}
                            step="0.01"
                            value={catInputs[cat.id] ?? ''}
                            onChange={(e) =>
                              setCatInputs((prev) => ({ ...prev, [cat.id]: e.target.value }))
                            }
                            onBlur={(e) => {
                              void persistBudget(cat.id, e.target.value).then(showSaved)
                            }}
                            className="input-minimal w-full text-sm"
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <p className="text-[10px] font-medium mb-1 text-[var(--text-tertiary)]">
                            {t('budgets.spent')}
                          </p>
                          <p className="text-sm font-bold text-[var(--danger)]">
                            {formatCurrency(spent, currency)}
                          </p>
                        </div>
                      </div>
                      {cap > 0 && (
                        <div className="h-3 rounded-full overflow-hidden relative bg-[var(--overlay)]">
                          <div
                            className="absolute top-0 left-0 h-full rounded-full transition-all"
                            style={{
                              width: `${barPct(spent, cap)}%`,
                              background:
                                spent > cap
                                  ? 'var(--danger)'
                                  : 'var(--accent-primary)',
                            }}
                          />
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </>
        )}
      </div>

      <BunordenFooter />

      {toast && <div className="toast toast-success">{toast}</div>}
    </div>
  )
}
