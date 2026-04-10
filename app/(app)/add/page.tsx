'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { ArrowLeft, Check, Settings, Plus, X, Trash2 } from 'lucide-react'

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

function AddTransactionForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('id')
  const [userId, setUserId] = useState('')
  const [type, setType] = useState<TxType>('expense')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  const [categoryId, setCategoryId] = useState('')
  const [accountId, setAccountId] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [recurring, setRecurring] = useState(false)
  
  // Category management states
  const [showCatModal, setShowCatModal] = useState(false)
  const [editingCat, setEditingCat] = useState<Category | null>(null)
  const [catName, setCatName] = useState('')
  const [catIcon, setCatIcon] = useState('💰')
  
  const [loading, setLoading] = useState(false)
  const [catLoading, setCatLoading] = useState(false)
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

    // If editing, fetch transaction
    if (editId) {
      const { data: tx } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', editId)
        .eq('user_id', user.id)
        .single()
      
      if (tx) {
        setType(tx.type as TxType)
        setAmount(tx.amount.toString())
        setNote(tx.note || '')
        setDate(tx.date)
        setCategoryId(tx.category_id || '')
        setAccountId(tx.account_id)
        setRecurring(tx.recurring)
      }
    } else if (accs && accs.length > 0) {
      setAccountId(accs[0].id)
    }
  }, [router, editId])

  useEffect(() => { fetchData() }, [fetchData])

  const filteredCategories = categories.filter(c => c.type === type)

  const handleSaveCategory = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!catName.trim()) return
    
    setCatLoading(true)
    try {
      if (editingCat) {
        const { error } = await supabase
          .from('categories')
          .update({ name: catName.trim(), icon: catIcon })
          .eq('id', editingCat.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('categories')
          .insert({
            user_id: userId,
            name: catName.trim(),
            icon: catIcon,
            type: type === 'transfer' ? 'expense' : type,
          })
        if (error) throw error
      }
      
      await fetchData()
      setShowCatModal(false)
      setEditingCat(null)
      setCatName('')
      setCatIcon('💰')
    } catch (err) {
      console.error('Category error:', err)
      setError(err instanceof Error ? err.message : 'Category operation failed')
    } finally {
      setCatLoading(false)
    }
  }

  const handleArchiveCategory = async (id: string) => {
    if (!confirm('Archive this category? It will no longer appear in selection.')) return
    try {
      const { error } = await supabase
        .from('categories')
        .update({ archived: true })
        .eq('id', id)
      if (error) throw error
      await fetchData()
      if (categoryId === id) setCategoryId('')
    } catch (err) {
      console.error('Archive error:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || Number(amount) <= 0) { setError('Enter a valid amount'); return }
    if (!accountId) { setError('No account found. Complete onboarding first.'); return }

    setLoading(true)
    setError('')

    try {
      if (editId) {
        const { error: updateError } = await supabase
          .from('transactions')
          .update({
            account_id: accountId,
            category_id: categoryId || null,
            type,
            amount: Number(amount),
            currency,
            date,
            note: note.trim() || null,
            recurring,
          })
          .eq('id', editId)
          .eq('user_id', userId)

        if (updateError) throw updateError
      } else {
        const { error: insertError } = await supabase.from('transactions').insert({
          user_id: userId,
          account_id: accountId,
          category_id: categoryId || null,
          type,
          amount: Number(amount),
          currency,
          date,
          note: note.trim() || null,
          recurring,
        })

        if (insertError) throw insertError
      }

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

          {/* Category Selection */}
          {type !== 'transfer' && (
            <div className="animate-fade-up delay-3">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Category
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCat(null)
                      setCatName('')
                      setCatIcon(type === 'income' ? '💰' : '☕')
                      setShowCatModal(true)
                    }}
                    className="p-1 px-2 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"
                    style={{ background: 'var(--overlay)', border: '1px solid var(--border)', color: 'var(--accent-primary)' }}
                  >
                    <Plus size={10} strokeWidth={3} /> Add
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {filteredCategories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id === categoryId ? '' : cat.id)}
                    onContextMenu={(e) => {
                      e.preventDefault()
                      setEditingCat(cat)
                      setCatName(cat.name)
                      setCatIcon(cat.icon)
                      setShowCatModal(true)
                    }}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl text-center relative group"
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
                    
                    {/* Edit trigger on long press / hover icon */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setEditingCat(cat)
                        setCatName(cat.name)
                        setCatIcon(cat.icon)
                        setShowCatModal(true)
                      }}
                      className="absolute top-1 right-1 p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: 'var(--overlay)', border: '1px solid var(--border)', color: 'var(--text-tertiary)' }}
                    >
                      <Settings size={10} />
                    </button>
                  </button>
                ))}
                
                {filteredCategories.length === 0 && (
                  <div className="col-span-full py-6 text-center text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    No categories for {type}. Click &quot;Add&quot; to create one.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Category Modal */}
          {showCatModal && (
            <div className="modal-overlay z-[100]" onClick={() => setShowCatModal(false)}>
              <div className="modal-content p-6" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                    {editingCat ? 'Edit Category' : 'New Category'}
                  </h3>
                  <button onClick={() => setShowCatModal(false)} style={{ color: 'var(--text-tertiary)' }}>
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-4">
                    <button
                      type="button"
                      className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl group relative overflow-hidden"
                      style={{ background: 'var(--overlay)', border: '1px solid var(--border)' }}
                    >
                      <span className="relative z-10">{catIcon}</span>
                      <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                    <div className="flex-1">
                      <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-tertiary)' }}>
                        Category Icon
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {['☕', '🍔', '🛒', '🚕', '🏠', '💡', '🎮', '💊', '💰', '💼', '🎁', '🔌', '🎥', '🏋️', '✈️', '🧴'].map(emoji => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => setCatIcon(emoji)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all hover:scale-110 active:scale-95"
                            style={{ 
                              background: catIcon === emoji ? 'var(--accent-primary)' : 'var(--overlay)',
                              color: catIcon === emoji ? 'white' : 'inherit',
                              border: catIcon === emoji ? 'none' : '1px solid var(--border)'
                            }}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-tertiary)' }}>
                      Category Name
                    </label>
                    <input
                      type="text"
                      value={catName}
                      onChange={(e) => setCatName(e.target.value)}
                      className="input-glass"
                      placeholder="e.g. Coffee"
                      autoFocus
                    />
                  </div>

                  <div className="pt-2 flex gap-3">
                    {editingCat && (
                      <button
                        type="button"
                        onClick={() => handleArchiveCategory(editingCat.id)}
                        className="p-3 px-4 rounded-xl text-danger border border-transparent hover:border-danger/[0.2] transition-all flex items-center justify-center"
                        style={{ background: 'var(--danger-bg)' }}
                        title="Archive category"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={catLoading || !catName.trim()}
                      onClick={handleSaveCategory}
                      className="btn-primary-gradient flex-1 py-3"
                    >
                      {catLoading ? 'Saving...' : 'Save Category'}
                    </button>
                  </div>
                </div>
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

          {/* Recurring */}
          <div className="animate-fade-up delay-5 flex items-center justify-between p-1">
            <div>
              <label className="block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                Recurring
              </label>
              <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>Repeat this transaction monthly</p>
            </div>
            <button
              type="button"
              onClick={() => setRecurring(!recurring)}
              className="w-12 h-7 rounded-full p-1 flex items-center transition-all bg-overlay"
              style={{
                background: recurring ? 'var(--accent-primary)' : 'var(--overlay)',
                border: '1px solid var(--border)',
              }}
            >
              <div
                className="w-5 h-5 rounded-full bg-white shadow-sm transition-transform"
                style={{
                  transform: recurring ? 'translateX(20px)' : 'translateX(0)',
                }}
              />
            </button>
          </div>

          {/* Note */}
          <div className="animate-fade-up delay-6">
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

export default function AddPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    }>
      <AddTransactionForm />
    </Suspense>
  )
}
