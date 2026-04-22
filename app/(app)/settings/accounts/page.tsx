'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { BunordenFooter } from '@/components/layout/BunordenFooter'
import { useTranslation } from '@/app/providers'
import { formatCurrency } from '@/lib/utils'
import {
  ArrowLeft, Plus, Edit2, Trash2, Check, X,
  Wallet, Landmark, PiggyBank, Briefcase, DollarSign, TrendingUp, TrendingDown
} from 'lucide-react'
import Link from 'next/link'

interface Account {
  id: string
  name: string
  icon: string
  colour: string
  is_default: boolean
  balance?: number
  totalIncome?: number
  totalExpense?: number
}

type AccountType = 'wallet' | 'bank' | 'savings' | 'investment'
const ACCOUNT_TYPES: { id: AccountType; label: string; icon: typeof Wallet; emoji: string }[] = [
  { id: 'wallet',     label: 'Cash / Wallet',   icon: Wallet,     emoji: '💵' },
  { id: 'bank',       label: 'Bank Account',     icon: Landmark,   emoji: '🏦' },
  { id: 'savings',    label: 'Savings',          icon: PiggyBank,  emoji: '🐷' },
  { id: 'investment', label: 'Investment',       icon: Briefcase,  emoji: '📈' },
]

const COLOURS = [
  { hex: '#007AFF', name: 'Blue'   },
  { hex: '#34C759', name: 'Green'  },
  { hex: '#FF9500', name: 'Orange' },
  { hex: '#FF3B30', name: 'Red'    },
  { hex: '#AF52DE', name: 'Purple' },
  { hex: '#5856D6', name: 'Indigo' },
  { hex: '#5AC8FA', name: 'Cyan'   },
  { hex: '#FF2D55', name: 'Rose'   },
]

export default function AccountsPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [currency, setCurrency] = useState('HKD')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)

  const [name, setName]       = useState('')
  const [icon, setIcon]       = useState('💵')
  const [colour, setColour]   = useState('#007AFF')
  const [processing, setProcessing]           = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: profile } = await supabase
        .from('profiles').select('currency').eq('id', user.id).single()
      if (profile?.currency) setCurrency(profile.currency)

      const { data: accountsData } = await supabase
        .from('accounts').select('*').eq('user_id', user.id).order('created_at', { ascending: true })

      const { data: txs } = await supabase
        .from('transactions').select('account_id, amount, type').eq('user_id', user.id)

      const balMap:  Record<string, number> = {}
      const incMap:  Record<string, number> = {}
      const expMap:  Record<string, number> = {}
      txs?.forEach(tx => {
        const amt = Number(tx.amount)
        if (!balMap[tx.account_id]) { balMap[tx.account_id] = 0; incMap[tx.account_id] = 0; expMap[tx.account_id] = 0 }
        if (tx.type === 'income')  { balMap[tx.account_id] += amt; incMap[tx.account_id] += amt }
        else if (tx.type === 'expense') { balMap[tx.account_id] -= amt; expMap[tx.account_id] += amt }
      })

      setAccounts((accountsData || []).map(a => ({
        ...a,
        balance:      balMap[a.id] ?? 0,
        totalIncome:  incMap[a.id] ?? 0,
        totalExpense: expMap[a.id] ?? 0,
      })))
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => { fetchData() }, [fetchData])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setProcessing(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      if (editingAccount) {
        const { error } = await supabase.from('accounts')
          .update({ name: name.trim(), icon, colour }).eq('id', editingAccount.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('accounts')
          .insert({ user_id: user.id, name: name.trim(), icon, colour, is_default: accounts.length === 0 })
        if (error) throw error
      }
      setShowModal(false)
      fetchData()
      resetForm()
    } catch (err: any) {
      alert(err.message || 'Error saving account')
    } finally {
      setProcessing(false)
    }
  }

  const handleDelete = async (id: string) => {
    setProcessing(true)
    try {
      const { error } = await supabase.from('accounts').delete().eq('id', id)
      if (error) throw error
      setShowDeleteModal(null)
      fetchData()
    } catch (err: any) {
      alert(err.message || 'Cannot delete — transactions are still linked to this account.')
    } finally {
      setProcessing(false)
    }
  }

  const resetForm = () => { setName(''); setIcon('💵'); setColour('#007AFF'); setEditingAccount(null) }

  const openEdit = (a: Account) => {
    setEditingAccount(a); setName(a.name); setIcon(a.icon); setColour(a.colour); setShowModal(true)
  }

  const totalNetWorth = accounts.reduce((s, a) => s + (a.balance ?? 0), 0)

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 px-4 lg:px-8 py-6 lg:py-8 max-w-2xl mx-auto w-full">

        {/* Header */}
        <header className="flex items-center gap-4 mb-2 animate-slide-up">
          <Link href="/settings" className="w-10 h-10 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center justify-center text-primary active:scale-95 transition-transform">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-primary">{t('settings.accounts')}</h1>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] mt-0.5">
              {t('settings.accounts_subtitle')}
            </p>
          </div>
        </header>

        {/* Explainer banner */}
        <div className="mb-6 mt-4 animate-slide-up delay-1 px-4 py-3 rounded-2xl bg-[var(--accent-primary)]/8 border border-[var(--accent-primary)]/15 flex items-start gap-3">
          <Wallet size={16} className="text-[var(--accent-primary)] flex-shrink-0 mt-0.5" />
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            <span className="font-bold text-[var(--accent-primary)]">Accounts</span> are your money containers — cash, bank accounts, savings, investments. Transactions are assigned to an account to track your real-world balance.
          </p>
        </div>

        {/* Net worth summary */}
        {!loading && accounts.length > 0 && (
          <div className="surface-elevated mb-6 animate-slide-up delay-1 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Total Net Worth</p>
              <p className={`text-2xl font-black mt-1 ${totalNetWorth >= 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
                {formatCurrency(totalNetWorth, currency)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Accounts</p>
              <p className="text-2xl font-black mt-1 text-primary">{accounts.length}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="skeleton h-28 rounded-2xl" />)}
          </div>
        ) : (
          <div className="space-y-3 animate-slide-up delay-2">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="surface-elevated relative overflow-hidden group"
              >
                {/* Left colour bar */}
                <div className="absolute left-0 top-0 w-1 h-full rounded-l-[24px]" style={{ background: account.colour }} />

                <div className="pl-5 flex items-start justify-between gap-4">
                  {/* Icon + info */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                      style={{ background: `${account.colour}20` }}
                    >
                      {account.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-sm text-primary truncate">{account.name}</p>
                        {account.is_default && (
                          <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]">
                            {t('common.default')}
                          </span>
                        )}
                      </div>
                      {/* Balance */}
                      <p className={`text-lg font-black ${(account.balance ?? 0) >= 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
                        {(account.balance ?? 0) >= 0 ? '' : '-'}{formatCurrency(Math.abs(account.balance ?? 0), currency)}
                      </p>
                      {/* Mini income/expense */}
                      {((account.totalIncome ?? 0) > 0 || (account.totalExpense ?? 0) > 0) && (
                        <div className="flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1 text-[10px] font-bold text-[var(--success)]">
                            <TrendingUp size={9} /> +{formatCurrency(account.totalIncome ?? 0, currency)}
                          </span>
                          <span className="flex items-center gap-1 text-[10px] font-bold text-[var(--danger)]">
                            <TrendingDown size={9} /> -{formatCurrency(account.totalExpense ?? 0, currency)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions — always visible on mobile, hover on desktop */}
                  <div className="flex items-center gap-1 flex-shrink-0 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEdit(account)}
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--accent-primary)]/10 hover:text-[var(--accent-primary)] transition-colors"
                      aria-label="Edit account"
                    >
                      <Edit2 size={16} />
                    </button>
                    {!account.is_default && (
                      <button
                        onClick={() => setShowDeleteModal(account.id)}
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--danger)]/10 hover:text-[var(--danger)] transition-colors"
                        aria-label="Delete account"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Add button */}
            <button
              onClick={() => { resetForm(); setShowModal(true) }}
              className="w-full flex items-center justify-center gap-2 py-5 rounded-[2rem] border-2 border-dashed border-[var(--border)] hover:border-[var(--accent-primary)]/50 hover:bg-[var(--accent-primary)]/5 transition-all text-sm font-bold group"
              style={{ color: 'var(--text-tertiary)' }}
            >
              <div className="w-8 h-8 rounded-full border border-[var(--border)] flex items-center justify-center group-hover:border-[var(--accent-primary)] group-hover:text-[var(--accent-primary)] transition-colors">
                <Plus size={18} />
              </div>
              {t('settings.accounts_new')}
            </button>
          </div>
        )}
      </div>

      <BunordenFooter />

      {/* Account Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-primary">
                {editingAccount ? t('settings.accounts_edit') : t('settings.accounts_new')}
              </h3>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-xl bg-[var(--bg-elevated)] flex items-center justify-center">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              {/* Quick type selector */}
              {!editingAccount && (
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] mb-2">Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {ACCOUNT_TYPES.map(type => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => { setIcon(type.emoji) }}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl border text-sm font-bold transition-all ${
                          icon === type.emoji
                            ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]'
                            : 'border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-secondary)]'
                        }`}
                      >
                        <span className="text-xl">{type.emoji}</span>
                        <span className="text-xs font-bold">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] mb-2">
                  {t('settings.accounts_name')}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder={t('settings.accounts_name_placeholder')}
                  className="input-minimal w-full"
                  autoFocus={!!editingAccount}
                  required
                />
              </div>

              {/* Colour */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] mb-3">
                  {t('settings.accounts_colour')}
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {COLOURS.map(c => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setColour(c.hex)}
                      title={c.name}
                      className="relative w-9 h-9 rounded-full transition-all"
                      style={{
                        background: c.hex,
                        boxShadow: colour === c.hex ? `0 0 0 3px var(--bg-secondary), 0 0 0 5px ${c.hex}` : 'none',
                        transform: colour === c.hex ? 'scale(1.15)' : 'scale(1)',
                      }}
                    >
                      {colour === c.hex && <Check size={14} className="text-white absolute inset-0 m-auto" strokeWidth={3} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="rounded-2xl p-4 border border-[var(--border)] flex items-center gap-3" style={{ background: 'var(--bg-elevated)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: `${colour}20` }}>
                  {icon}
                </div>
                <div>
                  <p className="font-bold text-sm text-primary">{name || 'Account name'}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Balance: {formatCurrency(0, currency)}</p>
                </div>
                <div className="ml-auto w-1 h-10 rounded-full" style={{ background: colour }} />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-2xl border border-[var(--border)] font-bold text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={processing || !name.trim()}
                  className="btn-apple-primary flex-1 py-3 font-bold text-sm disabled:opacity-50"
                >
                  {processing ? t('common.loading') : t('common.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(null)}>
          <div className="modal-content p-6 max-w-xs" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-[var(--danger-bg)] flex items-center justify-center mx-auto mb-4">
                <Trash2 size={28} className="text-[var(--danger)]" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-primary">{t('settings.accounts_delete_confirm')}</h3>
              <p className="text-sm mb-6 text-[var(--text-secondary)]">{t('settings.accounts_delete_warning')}</p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteModal(null)} className="flex-1 py-3 rounded-2xl border border-[var(--border)] font-bold text-sm text-[var(--text-secondary)]">{t('common.cancel')}</button>
                <button
                  onClick={() => handleDelete(showDeleteModal)}
                  disabled={processing}
                  className="flex-1 py-3 rounded-2xl bg-[var(--danger)]/10 border border-[var(--danger)]/20 text-[var(--danger)] font-bold text-sm disabled:opacity-50"
                >
                  {processing ? t('common.loading') : t('common.delete')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
