'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { parseTagsInput, tagsToInputString } from '@/lib/tags'
import { ArrowLeft, Check, Settings, Plus, X, Trash2, Calendar } from 'lucide-react'
import { useTranslation } from '@/app/providers'
import { sendLocalNotification } from '@/lib/notifications'
import { PageSkeleton } from '@/components/ui/PageSkeleton'

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
  const { t } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('id')
  const [userId, setUserId] = useState('')
  const [type, setType] = useState<TxType>('expense')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  const [categoryId, setCategoryId] = useState('')
  const [accountId, setAccountId] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [recurring, setRecurring] = useState(false)
  const [includeInBudget, setIncludeInBudget] = useState(true)
  
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
        setTagsInput(tagsToInputString(tx.tags))
        setDate(tx.date)
        setCategoryId(tx.category_id || '')
        setAccountId(tx.account_id)
        setRecurring(tx.recurring)
        setIncludeInBudget(!tx.exclude_from_budget)
      }
    } else if (accs && accs.length > 0) {
      setAccountId(accs[0].id)
    }
  }, [router, editId])

  useEffect(() => { fetchData() }, [fetchData])

  if (!userId) return <PageSkeleton />

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

    const tags = parseTagsInput(tagsInput)

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
            tags,
            recurring,
            exclude_from_budget: !includeInBudget,
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
          tags,
          recurring,
          exclude_from_budget: !includeInBudget,
        })

        if (insertError) throw insertError

        // Check for budget overage (only if included in budget)
        if (type === 'expense' && includeInBudget) {
          const now = new Date()
          const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
          
          const [{ data: monthTxs }, { data: budgetData }] = await Promise.all([
            supabase.from('transactions')
              .select('amount')
              .eq('user_id', userId)
              .eq('type', 'expense')
              .eq('exclude_from_budget', false)
              .gte('date', monthStart),
            supabase.from('budgets').select('amount').eq('user_id', userId).eq('month_year', monthStart).is('category_id', null).maybeSingle()
          ])

          if (budgetData && monthTxs) {
            const spent = monthTxs.reduce((sum, tx) => sum + Number(tx.amount), 0)
            const cap = Number(budgetData.amount)
            if (spent > cap) {
              sendLocalNotification('Budget Alert! ⚠️', {
                body: `You've exceeded your monthly budget by ${spent - cap} ${currency}.`,
                tag: 'budget-overage'
              })
            }
          }
        }
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
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 bg-[var(--success-bg)]">
            <Check size={40} className="text-[var(--success)]" />
          </div>
          <p className="text-xl font-bold text-[var(--text-primary)]">{t('transactions.save_success')}</p>
          <p className="text-sm mt-1 text-[var(--text-tertiary)]">{t('transactions.redirecting')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 px-4 lg:px-8 py-6 max-w-xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8 animate-slide-up">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-xl flex items-center justify-center bg-[var(--overlay)] border border-[var(--border)] text-[var(--text-primary)] transition-all hover:scale-105 active:scale-95"
            aria-label={t('common.back')}
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            {editId ? t('transactions.edit_title') : t('transactions.add_title')}
          </h1>
        </div>

        {/* Type Selector */}
        <div className="surface-elevated p-1.5 flex gap-1 mb-6 animate-slide-up delay-1">
          {(['expense', 'income', 'transfer'] as TxType[]).map((t_index) => {
            const isActive = type === t_index
            const activeBg = t_index === 'expense' ? 'var(--danger-bg)' : t_index === 'income' ? 'var(--success-bg)' : 'rgba(59,130,246,0.1)'
            const activeText = t_index === 'expense' ? 'var(--danger)' : t_index === 'income' ? 'var(--success)' : 'var(--accent-primary)'
            
            return (
              <button
                key={t_index}
                onClick={() => { setType(t_index); setCategoryId('') }}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all duration-300"
                style={{
                  background: isActive ? activeBg : 'transparent',
                  color: isActive ? activeText : 'var(--text-tertiary)',
                }}
              >
                {t(`transactions.filter_${t_index === 'transfer' ? 'all' : t_index}`)}
              </button>
            )
          })}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Amount */}
          <div className="animate-slide-up delay-2">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="amount-input" className="block text-sm font-medium text-[var(--text-secondary)]">
                {t('transactions.amount')}
              </label>
              <select
                id="currency-selector"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="bg-transparent text-xs font-bold uppercase tracking-wider outline-none p-1 rounded-lg border border-white/5 hover:border-white/10 transition-all text-[var(--accent-primary)]"
                aria-label={t('transactions.currency')}
              >
                {['HKD', 'USD', 'EUR', 'GBP', 'JPY', 'CNY', 'MYR', 'SGD', 'TWD', 'KRW', 'AUD', 'CAD'].map(c => (
                  <option key={c} value={c} className="bg-zinc-900">{c}</option>
                ))}
              </select>
            </div>
            <input
              id="amount-input"
              type="text"
              inputMode="decimal"
              pattern="[0-9]*[.,]?[0-9]*"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9.,]/g, ''))}
              placeholder="0.00"
              className="input-minimal w-full text-3xl font-bold text-center py-6"
              style={{
                color: type === 'income' ? 'var(--success)' : type === 'expense' ? 'var(--danger)' : 'var(--accent-primary)',
              }}
              required
              autoFocus
            />
          </div>

          {/* Category Selection */}
          {type !== 'transfer' && (
            <div className="animate-slide-up delay-3">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-[var(--text-secondary)]">
                  {t('transactions.category')}
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
                    className="p-1 px-2 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 bg-[var(--overlay)] border border-[var(--border)] text-[var(--accent-primary)]"
                    aria-label={t('settings.categories_new')}
                  >
                    <Plus size={10} strokeWidth={3} /> {t('common.add_transaction').split(' ')[0]}
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
                    <span className="text-[11px] font-medium truncate w-full text-[var(--text-secondary)]">
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
                      className="absolute top-1 right-1 p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-[var(--overlay)] border border-[var(--border)] text-[var(--text-tertiary)]"
                      aria-label={t('settings.categories_edit')}
                    >
                      <Settings size={10} />
                    </button>
                  </button>
                ))}
                
                {filteredCategories.length === 0 && (
                  <div className="col-span-full py-6 text-center text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    {t('transactions.no_cats_for_type').replace('{type}', t(`transactions.filter_${type}`))}
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
                  <h3 className="text-lg font-bold text-[var(--text-primary)]">
                    {editingCat ? t('settings.categories_edit') : t('settings.categories_new')}
                  </h3>
                  <button onClick={() => setShowCatModal(false)} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]" aria-label={t('common.close')}>
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-4">
                    <button
                      type="button"
                      className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl group relative overflow-hidden bg-[var(--overlay)] border border-[var(--border)]"
                      aria-label={t('settings.categories_icon')}
                    >
                      <span className="relative z-10">{catIcon}</span>
                      <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                    <div className="flex-1">
                      <label className="block text-[10px] font-bold uppercase tracking-widest mb-1.5 text-[var(--text-tertiary)]">
                        {t('settings.categories_icon')}
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
                    <label htmlFor="cat-name-input" className="block text-[10px] font-bold uppercase tracking-widest mb-1.5 text-[var(--text-tertiary)]">
                      {t('settings.categories_name')}
                    </label>
                    <input
                      id="cat-name-input"
                      type="text"
                      value={catName}
                      onChange={(e) => setCatName(e.target.value)}
                      className="input-minimal w-full"
                      placeholder={t('settings.categories_name_placeholder')}
                      autoFocus
                    />
                  </div>

                  <div className="pt-2 flex gap-3">
                    {editingCat && (
                      <button
                        type="button"
                        onClick={() => handleArchiveCategory(editingCat.id)}
                        className="p-3 px-4 rounded-xl text-danger border border-transparent hover:border-danger/[0.2] transition-all flex items-center justify-center bg-[var(--danger-bg)]"
                        title="Archive category"
                        aria-label="Archive category"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={catLoading || !catName.trim()}
                      onClick={handleSaveCategory}
                      className="btn-apple-primary flex-1 py-3"
                    >
                      {catLoading ? t('common.loading') : t('common.save')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Account */}
          {accounts.length > 0 && (
            <div className="animate-slide-up delay-3">
              <label className="block text-sm font-medium mb-2 text-[var(--text-secondary)]">
                {t('transactions.account')}
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
          <div className="animate-slide-up delay-4">
            <label htmlFor="date-input" className="block text-sm font-medium mb-2 text-[var(--text-secondary)]">
              {t('transactions.date')}
            </label>
            <div className="relative w-full h-[56px] group">
              <input
                id="date-input"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-20"
                style={{ colorScheme: 'dark' }}
                required
              />
              <div className="absolute inset-0 surface-elevated-interactive py-4 px-4 flex items-center justify-center z-10 pointer-events-none">
                <Calendar size={18} className="absolute left-4 text-[var(--text-secondary)] group-hover:text-[var(--accent-primary)] transition-colors" />
                <span className="font-bold text-[var(--text-primary)]">
                  {date ? new Date(date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : t('common.default')}
                </span>
              </div>
            </div>
          </div>

          {/* Recurring */}
          <div className="animate-slide-up delay-5 flex items-center justify-between p-1">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)]">
                {t('transactions.recurring')}
              </label>
              <p className="text-[10px] text-[var(--text-tertiary)]">{t('transactions.recurring_subtitle')}</p>
            </div>
            <button
              type="button"
              onClick={() => setRecurring(!recurring)}
              className="w-12 h-7 rounded-full p-1 flex items-center transition-all bg-[var(--overlay)] border border-[var(--border)]"
              style={{
                background: recurring ? 'var(--accent-primary)' : '',
              }}
              aria-label={t('transactions.recurring')}
              aria-pressed={recurring}
            >
              <div
                className="w-5 h-5 rounded-full bg-white shadow-sm transition-transform"
                style={{
                  transform: recurring ? 'translateX(20px)' : 'translateX(0)',
                }}
              />
            </button>
          </div>

          {/* Include in Budget */}
          <div className="animate-slide-up delay-5 flex items-center justify-between p-1">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)]">
                {t('transactions.include_in_budget')}
              </label>
              <p className="text-[10px] text-[var(--text-tertiary)]">{t('transactions.include_in_budget_subtitle')}</p>
            </div>
            <button
              type="button"
              onClick={() => setIncludeInBudget(!includeInBudget)}
              className="w-12 h-7 rounded-full p-1 flex items-center transition-all bg-[var(--overlay)] border border-[var(--border)]"
              style={{
                background: includeInBudget ? 'var(--accent-primary)' : '',
              }}
              aria-label={t('transactions.include_in_budget')}
              aria-pressed={includeInBudget}
            >
              <div
                className="w-5 h-5 rounded-full bg-white shadow-sm transition-transform"
                style={{
                  transform: includeInBudget ? 'translateX(20px)' : 'translateX(0)',
                }}
              />
            </button>
          </div>

          {/* Note */}
          <div className="animate-slide-up delay-6">
            <label htmlFor="note-input" className="block text-sm font-medium mb-2 text-[var(--text-secondary)]">
              {t('transactions.note')} <span className="font-normal text-[var(--text-tertiary)]">({t('common.optional')})</span>
            </label>
            <input
              id="note-input"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t('transactions.note_placeholder')}
              className="input-minimal w-full box-border max-w-full"
              maxLength={280}
            />
          </div>

          {/* Tags */}
          <div className="animate-slide-up delay-6">
            <label htmlFor="tags-input" className="block text-sm font-medium mb-2 text-[var(--text-secondary)]">
              {t('transactions.tags')} <span className="font-normal text-[var(--text-tertiary)]">({t('common.optional')})</span>
            </label>
            <input
              id="tags-input"
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder={t('transactions.tags_placeholder')}
              className="input-minimal w-full box-border max-w-full"
            />
            <p className="text-[10px] mt-1.5 text-[var(--text-tertiary)]">{t('transactions.tags_hint')}</p>
          </div>

          {/* Error */}
          {error && (
            <div
              className="p-3 rounded-xl text-sm font-medium animate-slide-up"
              style={{ background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid rgba(255,59,48,0.2)' }}
            >
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !amount}
            className="btn-apple-primary w-full py-4 text-base animate-slide-up delay-6"
          >
            {loading ? t('common.loading') : t('common.save')}
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
        <div className="animate-pulse font-black text-sm tracking-[0.3em] uppercase opacity-40">Loading...</div>
      </div>
    }>
      <AddTransactionForm />
    </Suspense>
  )
}
