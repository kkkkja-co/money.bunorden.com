'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { BunordenFooter } from '@/components/layout/BunordenFooter'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Trash2, X, TrendingUp, TrendingDown, ArrowLeftRight, Plus, Search, Edit2 } from 'lucide-react'
import { useTranslation, useLanguage } from '@/app/providers'
import { motion, AnimatePresence } from 'framer-motion'

interface Transaction {
  id: string
  type: 'expense' | 'income' | 'transfer'
  amount: number
  currency: string
  date: string
  note: string | null
  category: { name: string; icon: string } | null
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
      .select('id, type, amount, currency, date, note, category:categories(name, icon)')
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
    } catch (err) {
      console.error('Delete error:', err)
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
      t.amount.toString().includes(s)
    )
  })

  // Group by month
  const grouped: Record<string, Transaction[]> = {}
  filtered.forEach(t => {
    const key = t.date.slice(0, 7) // YYYY-MM
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(t)
  })

  const monthLabel = (key: string) => {
    const [y, m] = key.split('-')
    return new Date(Number(y), Number(m) - 1).toLocaleDateString(language === 'zh-TW' ? 'zh-TW' : 'en-US', { month: 'long', year: 'numeric' })
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 px-4 lg:px-8 py-6 lg:py-8 max-w-3xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 animate-fade-up">
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            {t('transactions.title')}
          </h1>
          <button
            onClick={() => router.push('/add')}
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
              boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
              transition: 'all 0.3s',
            }}
          >
            <Plus size={20} color="#fff" strokeWidth={2.5} />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4 animate-fade-up delay-1">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('transactions.search_placeholder')}
            className="input-glass pl-10"
          />
        </div>

        {/* Filter */}
        <div className="glass-card p-1.5 flex gap-1 mb-6 animate-fade-up delay-2">
          {(['all', 'income', 'expense'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold capitalize"
              style={{
                background: filter === f ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                color: filter === f ? 'var(--accent-primary)' : 'var(--text-tertiary)',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              {t(`transactions.filter_${f}`)}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="skeleton h-16 rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-card text-center py-16 animate-fade-up">
            <div className="text-5xl mb-4">{search ? '🔍' : '📝'}</div>
            <p className="font-semibold text-lg mb-1" style={{ color: 'var(--text-secondary)' }}>
              {search ? t('transactions.no_matches') : t('common.no_transactions')}
            </p>
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
              {search ? t('transactions.try_different_search') : t('transactions.tap_plus')}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([month, txs]) => (
              <motion.div 
                key={month} 
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="animate-fade-up"
              >
                <h3 className="text-sm font-semibold mb-3 px-1" style={{ color: 'var(--text-tertiary)' }}>
                  {monthLabel(month)}
                </h3>
                <div className="space-y-2">
                  <AnimatePresence mode="popLayout">
                    {txs.map((tx) => (
                      <motion.div
                        key={tx.id}
                        layout
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="glass-card flex items-center gap-3 py-3 px-4 group"
                      >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                        style={{ background: 'var(--overlay)' }}
                      >
                        {tx.category?.icon || (tx.type === 'income' ? '💰' : tx.type === 'transfer' ? '🔄' : '💸')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                          {tx.category?.name || tx.note || tx.type}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                          {formatDate(tx.date)}
                          {tx.note && tx.category?.name ? ` · ${tx.note}` : ''}
                        </p>
                      </div>
                      <span
                        className="font-semibold text-sm flex-shrink-0"
                        style={{ color: tx.type === 'income' ? 'var(--success)' : 'var(--danger)' }}
                      >
                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(Number(tx.amount), tx.currency)}
                      </span>
                      <button
                        onClick={() => router.push(`/add?id=${tx.id}`)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 lg:opacity-100"
                        style={{
                          background: 'rgba(59, 130, 246, 0.1)',
                          color: 'var(--accent-primary)',
                          transition: 'all 0.2s',
                          flexShrink: 0,
                        }}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteId(tx.id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 lg:opacity-100"
                        style={{
                          background: 'var(--danger-bg)',
                          color: 'var(--danger)',
                          transition: 'all 0.2s',
                          flexShrink: 0,
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <BunordenFooter />

      {/* Delete confirmation modal */}
      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal-content p-6" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{ background: 'var(--danger-bg)' }}>
                <Trash2 size={24} style={{ color: 'var(--danger)' }} />
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                {t('transactions.delete_title')}
              </h3>
              <p className="text-sm mb-6" style={{ color: 'var(--text-tertiary)' }}>
                {t('transactions.delete_subtitle')}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteId(null)}
                  className="btn-secondary-glass flex-1 py-3"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="btn-danger-glass flex-1 py-3"
                >
                  {deleting ? t('common.loading') : t('common.delete')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="toast toast-success">{toast}</div>
      )}
    </div>
  )
}
