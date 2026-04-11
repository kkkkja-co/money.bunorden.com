'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Trash2, TrendingUp, TrendingDown, ArrowLeftRight, Plus, Search, Edit2, ArrowLeft } from 'lucide-react'
import { useTranslation, useLanguage } from '@/app/providers'
import { motion, AnimatePresence } from 'framer-motion'
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
  const [toast, setToast] = useState('')

  const fetchTransactions = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    let query = supabase
      .from('transactions')
      .select('id, type, amount, currency, date, note, tags, exclude_from_budget, category:categories(name, icon)')
      .eq('user_id', user.id)
      .order('date', { ascending: false })

    if (filter !== 'all') {
      query = query.eq('type', filter)
    }

    const { data } = await query
    const mapped = (data || []).map((t: any) => ({
      ...t,
      category: Array.isArray(t.category) ? t.category[0] || null : t.category,
    }))
    setTransactions(mapped)
    setLoading(false)
  }, [router, filter])

  useEffect(() => { fetchTransactions() }, [fetchTransactions])

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      const { error } = await supabase.from('transactions').delete().eq('id', deleteId)
      if (error) throw error
      setTransactions(prev => prev.filter(t => t.id !== deleteId))
      setDeleteId(null)
      setToast(t('transactions.toast_deleted'))
      setTimeout(() => setToast(''), 3000)
    } finally {
      setDeleting(false)
    }
  }

  const filtered = transactions.filter(t => {
    if (!search) return true
    const s = search.toLowerCase()
    return (
      t.note?.toLowerCase().includes(s) ||
      t.category?.name.toLowerCase().includes(s) ||
      t.amount.toString().includes(s) ||
      (t.tags || []).some((tag) => tag.toLowerCase().includes(s))
    )
  })

  const grouped: Record<string, Transaction[]> = {}
  filtered.forEach(t => {
    const key = t.date.slice(0, 7)
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(t)
  })

  const monthLabel = (key: string) => {
    const [y, m] = key.split('-')
    return new Date(Number(y), Number(m) - 1).toLocaleDateString(language === 'zh-TW' ? 'zh-TW' : 'en-US', { month: 'long', year: 'numeric' })
  }

  return (
    <div className="flex flex-col min-h-screen bg-primary">
      <div className="flex-1 px-4 lg:px-8 py-6 lg:py-10 max-w-2xl mx-auto w-full">
        {/* Compact Header */}
        <header className="flex items-center gap-4 mb-8 animate-elegant">
          <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold tracking-tight text-primary">
              {t('transactions.title')}
            </h1>
          </div>
          <button onClick={() => router.push('/add')} className="w-10 h-10 rounded-full bg-accent-primary text-white flex items-center justify-center">
            <Plus size={20} strokeWidth={3} />
          </button>
        </header>

        {/* Compact Search & Filter Combined */}
        <div className="space-y-3 mb-8 animate-elegant delay-1">
          <div className="relative group">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-tertiary" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('transactions.search_placeholder')}
              className="w-full bg-secondary/50 border border-border rounded-2xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-accent-primary transition-all"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'income', 'expense'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                  filter === f ? 'bg-accent-primary border-accent-primary text-white shadow-lg shadow-accent-primary/20' : 'bg-secondary border-border text-tertiary'
                }`}
              >
                {t(`transactions.filter_${f}`)}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        {loading ? (
          <PageSkeleton />
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 opacity-40 animate-elegant">
            <p className="text-sm font-bold uppercase tracking-widest">{t('transactions.no_matches')}</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(grouped).map(([month, txs]) => (
              <div key={month} className="animate-elegant">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-tertiary mb-4 px-1">
                  {monthLabel(month)}
                </h3>
                <div className="space-y-1">
                  {txs.map((tx) => (
                    <div
                      key={tx.id}
                      className={`flex items-center gap-4 py-3 px-4 rounded-2xl transition-all hover:bg-secondary/50 group ${tx.exclude_from_budget ? 'opacity-40 grayscale' : ''}`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-lg">
                        {tx.category?.icon || (tx.type === 'income' ? '💰' : '💸')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate">{tx.category?.name || tx.note || tx.type}</p>
                        <p className="text-[10px] font-bold text-tertiary uppercase tracking-widest opacity-60">
                          {formatDate(tx.date)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold text-sm ${tx.type === 'income' ? 'text-success' : 'text-danger'}`}>
                          {tx.type === 'income' ? '+' : '-'}{formatCurrency(Math.abs(tx.amount), tx.currency)}
                        </p>
                        <div className="flex justify-end gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => router.push(`/add?id=${tx.id}`)} className="text-tertiary hover:text-accent-primary">
                            <Edit2 size={12} />
                          </button>
                          <button onClick={() => setDeleteId(tx.id)} className="text-tertiary hover:text-danger">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {deleteId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setDeleteId(null)}>
          <div className="bg-secondary rounded-[32px] p-8 max-w-sm w-full border border-white/10 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-danger/10 flex items-center justify-center text-danger mx-auto mb-6">
                <Trash2 size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">{t('transactions.delete_title')}</h3>
              <p className="text-sm text-tertiary mb-8 leading-relaxed">{t('transactions.delete_subtitle')}</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="flex-1 py-4 rounded-2xl font-bold text-sm bg-primary border border-border">
                  {t('common.cancel')}
                </button>
                <button onClick={handleDelete} disabled={deleting} className="flex-1 py-4 rounded-2xl font-bold text-sm bg-danger text-white">
                  {deleting ? '...' : t('common.delete')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="fixed bottom-24 left-1/2 -translate-x-1/2 py-3 px-6 rounded-2xl bg-success text-white text-xs font-bold shadow-xl animate-elegant">{toast}</div>}
    </div>
  )
}
