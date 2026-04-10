'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { BunordenFooter } from '@/components/layout/BunordenFooter'
import { useTranslation, useLanguage } from '@/app/providers'
import { formatCurrency } from '@/lib/utils'
import { 
  ArrowLeft, Plus, Edit2, Trash2, Check, X, 
  CreditCard, Wallet, Landmark, PiggyBank, Briefcase
} from 'lucide-react'
import Link from 'next/link'

interface Account {
  id: string
  name: string
  icon: string
  colour: string
  is_default: boolean
  balance?: number
}

const ICONS = ['💳', '💰', '🏦', '💸', '🏦', '💼', '🏠', '🚗', '📱', '🍎']
const COLOURS = ['#007AFF', '#34C759', '#FF9500', '#FF3B30', '#AF52DE', '#5856D6', '#5AC8FA', '#000000']

export default function AccountsPage() {
  const { t } = useTranslation()
  const { language } = useLanguage()
  const router = useRouter()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [currency, setCurrency] = useState('HKD')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  
  // Form states
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('💳')
  const [colour, setColour] = useState('#007AFF')
  const [processing, setProcessing] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      // Get profile for currency
      const { data: profile } = await supabase
        .from('profiles').select('currency').eq('id', user.id).single()
      if (profile?.currency) setCurrency(profile.currency)

      // Get accounts
      const { data: accountsData } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })

      // Get balances
      const { data: txs } = await supabase
        .from('transactions')
        .select('account_id, amount, type')
        .eq('user_id', user.id)

      const balMap: Record<string, number> = {}
      txs?.forEach(tx => {
        const amt = Number(tx.amount)
        if (!balMap[tx.account_id]) balMap[tx.account_id] = 0
        if (tx.type === 'income') balMap[tx.account_id] += amt
        else if (tx.type === 'expense') balMap[tx.account_id] -= amt
      })

      setAccounts((accountsData || []).map(a => ({
        ...a,
        balance: balMap[a.id] || 0
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
        const { error } = await supabase
          .from('accounts')
          .update({ name: name.trim(), icon, colour })
          .eq('id', editingAccount.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('accounts')
          .insert({
            user_id: user.id,
            name: name.trim(),
            icon,
            colour,
            is_default: accounts.length === 0
          })
        if (error) throw error
      }

      setShowModal(false)
      fetchData()
      setName('')
      setEditingAccount(null)
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
      alert(err.message || 'Error deleting account. Ensure no transactions are linked.')
    } finally {
      setProcessing(false)
    }
  }

  const openEdit = (a: Account) => {
    setEditingAccount(a)
    setName(a.name)
    setIcon(a.icon)
    setColour(a.colour)
    setShowModal(true)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 px-4 lg:px-8 py-6 lg:py-8 max-w-2xl mx-auto w-full">
        <header className="flex items-center gap-4 mb-8 animate-fade-up">
          <Link href="/settings" className="p-2 -ml-2 rounded-full hover:bg-white/5 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            {t('settings.accounts')}
          </h1>
        </header>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="skeleton h-24 rounded-2xl" />)}
          </div>
        ) : (
          <div className="space-y-4 animate-fade-up delay-1">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="glass-card flex items-center gap-4 p-5 group relative overflow-hidden"
              >
                <div 
                  className="absolute left-0 top-0 w-1 h-full" 
                  style={{ background: account.colour }} 
                />
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: `${account.colour}15`, color: account.colour }}
                >
                  {account.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-bold text-base truncate" style={{ color: 'var(--text-primary)' }}>{account.name}</p>
                    {account.is_default && (
                      <span className="text-[10px] bg-accent-primary/10 text-accent-primary px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="font-bold text-lg" style={{ color: 'var(--text-secondary)' }}>
                    {formatCurrency(account.balance || 0, currency)}
                  </p>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => openEdit(account)}
                    className="p-2 rounded-lg hover:bg-white/5" 
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    <Edit2 size={18} />
                  </button>
                  {!account.is_default && (
                    <button 
                      onClick={() => setShowDeleteModal(account.id)}
                      className="p-2 rounded-lg hover:bg-danger/10" 
                      style={{ color: 'var(--danger)' }}
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            ))}

            <button
              onClick={() => { setEditingAccount(null); setName(''); setShowModal(true); }}
              className="w-full flex items-center justify-center gap-2 py-5 rounded-[2rem] border-2 border-dashed border-white/10 hover:border-accent-primary/50 hover:bg-accent-primary/5 transition-all text-sm font-bold group"
              style={{ color: 'var(--text-tertiary)' }}
            >
              <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:border-accent-primary group-hover:text-accent-primary transition-colors">
                <Plus size={18} />
              </div>
              Add Account
            </button>
          </div>
        )}
      </div>

      <BunordenFooter />

      {/* Account Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
              {editingAccount ? 'Edit Account' : 'New Account'}
            </h3>
            
            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-tertiary)' }}>
                  Account Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Savings, Wallet"
                  className="input-glass text-lg"
                  autoFocus
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-tertiary)' }}>
                  Icon
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {ICONS.map(i => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setIcon(i)}
                      className={`h-12 rounded-xl text-xl transition-all ${icon === i ? 'bg-accent-primary/20 scale-110 shadow-lg ring-2 ring-accent-primary' : 'bg-white/5'}`}
                    >
                      {i}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-tertiary)' }}>
                  Theme Colour
                </label>
                <div className="flex flex-wrap gap-2">
                  {COLOURS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColour(c)}
                      className={`w-8 h-8 rounded-full transition-all ${colour === c ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-black' : 'opacity-60'}`}
                      style={{ background: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary-glass flex-1 py-3 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing || !name.trim()}
                  className="btn-primary-gradient flex-1 py-3 font-bold"
                >
                  {processing ? 'Saving...' : 'Save Account'}
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
              <div className="w-16 h-16 rounded-full bg-danger-bg flex items-center justify-center mx-auto mb-4">
                <Trash2 size={32} style={{ color: 'var(--danger)' }} />
              </div>
              <h3 className="text-lg font-bold mb-2">Delete Account?</h3>
              <p className="text-sm mb-8" style={{ color: 'var(--text-tertiary)' }}>
                This will fail if any transactions are linked to this account.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteModal(null)} className="btn-secondary-glass flex-1 py-3 font-bold">Cancel</button>
                <button 
                  onClick={() => handleDelete(showDeleteModal)} 
                  disabled={processing}
                  className="btn-danger-glass flex-1 py-3 font-bold"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
