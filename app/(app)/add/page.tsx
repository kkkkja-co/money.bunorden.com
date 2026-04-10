'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { ArrowLeft, Check } from 'lucide-react'

interface Category {
  id: string
  name: string
  icon: string
  type: 'expense' | 'income'
}

interface Account {
  id: string
  name: string
  icon: string
}

type TxType = 'expense' | 'income' | 'transfer'

export default function AddPage() {
  const router = useRouter()
  const [userId, setUserId] = useState('')
  const [type, setType] = useState<TxType>('expense')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  const [categoryId, setCategoryId] = useState('')
  const [accountId, setAccountId] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [currency, setCurrency] = useState('HKD')

  const fetchData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    setUserId(user.id)

    const { data: profile } = await supabase
      .from('profiles').select('currency').eq('id', user.id).single()
    if (profile?.currency) setCurrency(profile.currency)

    const { data: cats } = await supabase
      .from('categories').select('id, name, icon, type')
      .eq('user_id', user.id).eq('archived', false).order('sort_order')
    setCategories(cats || [])

    const { data: accs } = await supabase
      .from('accounts').select('id, name, icon')
      .eq('user_id', user.id).order('created_at')
    setAccounts(accs || [])
    if (accs && accs.length > 0) setAccountId(accs[0].id)
  }, [router])

  useEffect(() => { fetchData() }, [fetchData])

  const filteredCategories = categories.filter(c => c.type === type)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || Number(amount) <= 0) { setError('Enter a valid amount'); return }
    if (!accountId) { setError('No account found. Complete onboarding first.'); return }

    setLoading(true)
    setError('')

    try {
      const { error: insertError } = await supabase.from('transactions').insert({
        user_id: userId,
        account_id: accountId,
        category_id: categoryId || null,
        type,
        amount: Number(amount),
        currency,
        date,
        note: note.trim() || null,
      })

      if (insertError) throw insertError

      setSuccess(true)
      setTimeout(() => router.push('/dashboard'), 1200)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center animate-scale-in">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: 'var(--success-bg)' }}
          >
            <Check size={40} style={{ color: 'var(--success)' }} />
          </div>
          <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Saved!</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>Redirecting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 px-4 lg:px-8 py-6 max-w-xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8 animate-fade-up">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: 'var(--overlay)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              transition: 'all 0.2s',
            }}
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Add Transaction
          </h1>
        </div>

        {/* Type Selector */}
        <div className="glass-card p-1.5 flex gap-1 mb-6 animate-fade-up delay-1">
          {(['expense', 'income', 'transfer'] as TxType[]).map((t) => (
            <button
              key={t}
              onClick={() => { setType(t); setCategoryId('') }}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold capitalize"
              style={{
                background: type === t
                  ? (t === 'expense' ? 'var(--danger-bg)' : t === 'income' ? 'var(--success-bg)' : 'rgba(59,130,246,0.1)')
                  : 'transparent',
                color: type === t
                  ? (t === 'expense' ? 'var(--danger)' : t === 'income' ? 'var(--success)' : 'var(--accent-primary)')
                  : 'var(--text-tertiary)',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              {t}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Amount */}
          <div className="animate-fade-up delay-2">
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Amount ({currency})
            </label>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="input-glass text-3xl font-bold text-center py-6"
              style={{
                color: type === 'income' ? 'var(--success)' : type === 'expense' ? 'var(--danger)' : 'var(--accent-primary)',
              }}
              required
              autoFocus
            />
          </div>

          {/* Category */}
          {type !== 'transfer' && filteredCategories.length > 0 && (
            <div className="animate-fade-up delay-3">
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Category
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {filteredCategories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id === categoryId ? '' : cat.id)}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl text-center"
                    style={{
                      background: categoryId === cat.id ? 'rgba(59, 130, 246, 0.1)' : 'var(--overlay)',
                      border: `1px solid ${categoryId === cat.id ? 'var(--accent-primary)' : 'var(--border)'}`,
                      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                      transform: categoryId === cat.id ? 'scale(1.02)' : 'scale(1)',
                    }}
                  >
                    <span className="text-xl">{cat.icon}</span>
                    <span className="text-[11px] font-medium truncate w-full" style={{ color: 'var(--text-secondary)' }}>
                      {cat.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Account */}
          {accounts.length > 1 && (
            <div className="animate-fade-up delay-3">
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Account
              </label>
              <div className="flex gap-2 flex-wrap">
                {accounts.map((acc) => (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => setAccountId(acc.id)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium"
                    style={{
                      background: accountId === acc.id ? 'rgba(59, 130, 246, 0.1)' : 'var(--overlay)',
                      border: `1px solid ${accountId === acc.id ? 'var(--accent-primary)' : 'var(--border)'}`,
                      color: 'var(--text-primary)',
                      transition: 'all 0.2s',
                    }}
                  >
                    <span>{acc.icon}</span>
                    {acc.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Date */}
          <div className="animate-fade-up delay-4">
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input-glass"
              required
            />
          </div>

          {/* Note */}
          <div className="animate-fade-up delay-5">
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Note (optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Coffee, Groceries, Rent..."
              className="input-glass"
              maxLength={280}
            />
          </div>

          {/* Error */}
          {error && (
            <div
              className="p-3 rounded-xl text-sm font-medium animate-fade-up"
              style={{ background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid rgba(255,59,48,0.2)' }}
            >
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !amount}
            className="btn-primary-gradient w-full py-4 text-base animate-fade-up delay-6"
          >
            {loading ? 'Saving...' : 'Save Transaction'}
          </button>
        </form>
      </div>
    </div>
  )
}
