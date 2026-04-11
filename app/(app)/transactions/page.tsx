'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Trash2, Plus, Search, Edit2, ArrowLeft, Calendar, X } from 'lucide-react'
import { useTranslation, useLanguage } from '@/app/providers'
import { PageSkeleton } from '@/components/ui/PageSkeleton'

interface Transaction {
  id: string
  type: 'expense' | 'income' | 'transfer'
  amount: number
  currency: string
  date: string
  note: string | null
  tags: string[] | null
  category: { name: string; icon: string } | null
  exclude_from_budget: boolean
}

export default function TransactionsPage() {
  const { t } = useTranslation()
  const { language } = useLanguage()
  const router = useRouter()
  
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all')
  const [search, setSearch] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  const fetchTransactions = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    let query = supabase
      .from('transactions')
      .select('*, category:categories(name, icon)')
      .eq('user_id', user.id)
      .order('date', { ascending: false })

    if (filter !== 'all') query = query.eq('type', filter)

    const { data } = await query
    setTransactions((data || []).map((t: any) => ({
      ...t,
      category: Array.isArray(t.category) ? t.category[0] || null : t.category,
    })))
    setLoading(false)
  }, [router, filter])

  useEffect(() => { fetchTransactions() }, [fetchTransactions])

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await supabase.from('transactions').delete().eq('id', deleteId)
      setTransactions(prev => prev.filter(t => t.id !== deleteId))
      setDeleteId(null)
    } finally {
      setDeleting(false)
    }
  }

  const filtered = transactions.filter(t => {
    // Search filter
    if (search) {
      const s = search.toLowerCase()
      if (!t.note?.toLowerCase().includes(s) && !t.category?.name.toLowerCase().includes(s) && !(t.tags || []).some(tag => tag.toLowerCase().includes(s))) {
        return false
      }
    }

    // Date range filter
    if (startDate && t.date < startDate) return false
    if (endDate && t.date > endDate) return false

    // Category filter
    if (selectedCategories.length > 0) {
      if (!t.category || !selectedCategories.includes(t.category.name)) return false
    }

    return true
  })

  // Get unique categories from filtered transactions
  const uniqueCategories = Array.from(new Set(
    transactions
      .filter(t => t.category)
      .map(t => t.category!.name)
  )).sort()

  const grouped: Record<string, Transaction[]> = {}
  filtered.forEach(t => {
    const key = t.date.slice(0, 7)
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(t)
  })

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 max-w-2xl mx-auto w-full px-5 py-8 md:py-12">
        <header className="flex items-center gap-4 mb-10 animate-slide-up">
          <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center border border-border">
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight">{t('transactions.title')}</h1>
          </div>
          <button onClick={() => router.push('/add')} className="w-10 h-10 rounded-full btn-apple-primary p-0 flex items-center justify-center">
            <Plus size={22} strokeWidth={3} />
          </button>
        </header>

        <div className="space-y-4 mb-8 animate-slide-up delay-1">
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('transactions.search_placeholder')}
              className="w-full input-minimal pl-11 py-4"
            />
          </div>

          {/* Date Range Picker */}
          <div className="flex gap-2 items-center">
            <div className="flex-1 relative">
              <Calendar size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary pointer-events-none" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input-minimal pl-11 py-3 text-[13px] w-full"
              />
            </div>
            <span className="text-secondary text-xs font-medium">to</span>
            <div className="flex-1 relative">
              <Calendar size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary pointer-events-none" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input-minimal pl-11 py-3 text-[13px] w-full"
              />
            </div>
            {(startDate || endDate) && (
              <button
                onClick={() => { setStartDate(''); setEndDate('') }}
                className="w-9 h-9 rounded-xl bg-secondary border border-border flex items-center justify-center hover:bg-secondary/80 transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Category Filter */}
          {uniqueCategories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategories([])}
                className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                  selectedCategories.length === 0
                    ? 'bg-accent-primary border-accent-primary text-white'
                    : 'bg-secondary border-border text-secondary hover:bg-secondary/80'
                }`}
              >
                All Categories
              </button>
              {uniqueCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategories(prev =>
                      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
                    )
                  }}
                  className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                    selectedCategories.includes(cat)
                      ? 'bg-accent-primary border-accent-primary text-white'
                      : 'bg-secondary border-border text-secondary hover:bg-secondary/80'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Type Filter */}
          <div className="flex gap-2">
            {(['all', 'income', 'expense'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 py-3 px-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                  filter === f ? 'bg-accent-primary border-accent-primary text-white shadow-lg shadow-accent-primary/20' : 'bg-secondary border-border text-secondary'
                }`}
              >
                {t(`transactions.filter_${f}`)}
              </button>
            ))}
          </div>
        </div>

        {loading ? <PageSkeleton /> : (
          <div className="animate-slide-up delay-2">
            {Object.keys(grouped).length === 0 ? (
              <div className="py-20 text-center opacity-30">
                <p className="text-sm font-black uppercase tracking-[0.3em]">{t('transactions.no_matches')}</p>
              </div>
            ) : (
              Object.entries(grouped).map(([month, txs]) => (
                <div key={month} className="mb-8 last:mb-0">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary mb-4 px-1">
                    {new Date(month).toLocaleDateString(language === 'zh-TW' ? 'zh-TW' : 'en-US', { month: 'long', year: 'numeric' })}
                  </h3>
                  <div className="list-wrapper">
                    {txs.map((tx) => (
                      <div key={tx.id} className={`list-item group ${tx.exclude_from_budget ? 'opacity-40 grayscale' : ''}`}>
                        <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-xl">
                          {tx.category?.icon || (tx.type === 'income' ? '💰' : '💸')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm truncate">{tx.category?.name || tx.note || tx.type}</p>
                          <p className="text-[10px] font-black text-secondary uppercase tracking-widest opacity-60">
                            {formatDate(tx.date)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`font-black text-sm ${tx.type === 'income' ? 'text-success' : 'text-danger'}`}>
                            {tx.type === 'income' ? '+' : '-'}{formatCurrency(Math.abs(tx.amount), tx.currency)}
                          </p>
                          <div className="flex justify-end gap-3 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => router.push(`/add?id=${tx.id}`)} className="text-secondary hover:text-accent-primary">
                              <Edit2 size={12} />
                            </button>
                            <button onClick={() => setDeleteId(tx.id)} className="text-secondary hover:text-danger">
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {deleteId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={() => setDeleteId(null)}>
          <div className="bg-secondary rounded-[32px] p-8 max-w-sm w-full border border-border" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">{t('transactions.delete_title')}</h3>
              <p className="text-sm text-secondary mb-8 leading-relaxed">{t('transactions.delete_subtitle')}</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest bg-primary/5 border border-border">
                  {t('common.cancel')}
                </button>
                <button onClick={handleDelete} disabled={deleting} className="flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest bg-danger text-white">
                  {deleting ? '...' : t('common.delete')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
