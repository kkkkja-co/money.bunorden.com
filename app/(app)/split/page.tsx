'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Plus, Trash2, ArrowLeft, Users, Receipt, Calculator,
  Plane, Briefcase, MoreHorizontal, ChevronRight, X, Check,
  ArrowRight, DollarSign, Share2, Mail
} from 'lucide-react'
import { useTranslation } from '@/app/providers'
import { BunordenFooter } from '@/components/layout/BunordenFooter'
import { formatCurrency } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const STORAGE_KEY = 'clavi-split-sessions-v1'

type SessionType = 'travel' | 'project' | 'other'

interface SplitExpense {
  id: string
  description: string
  amount: number
  paidBy: string
  splitAmong: string[]
  date: string
}

interface SplitSession {
  id: string
  name: string
  emoji: string
  type: SessionType
  currency: string
  participants: string[]
  expenses: SplitExpense[]
  createdAt: string
}

type Debt = { from: string; to: string; amount: number }

function calculateSettlement(session: SplitSession): Debt[] {
  const balance: Record<string, number> = {}
  session.participants.forEach(p => { balance[p] = 0 })

  session.expenses.forEach(exp => {
    if (!exp.splitAmong.length) return
    const share = exp.amount / exp.splitAmong.length
    balance[exp.paidBy] = (balance[exp.paidBy] ?? 0) + exp.amount
    exp.splitAmong.forEach(p => { balance[p] = (balance[p] ?? 0) - share })
  })

  // Round to 2 decimals
  Object.keys(balance).forEach(k => { balance[k] = Math.round(balance[k] * 100) / 100 })

  const pos = Object.entries(balance).filter(([, v]) => v > 0.005).sort((a, b) => b[1] - a[1])
  const neg = Object.entries(balance).filter(([, v]) => v < -0.005).sort((a, b) => a[1] - b[1])

  const creditors = pos.map(([n, v]) => ({ n, v }))
  const debtors   = neg.map(([n, v]) => ({ n, v: Math.abs(v) }))

  const debts: Debt[] = []
  let ci = 0, di = 0
  while (ci < creditors.length && di < debtors.length) {
    const amount = Math.round(Math.min(creditors[ci].v, debtors[di].v) * 100) / 100
    if (amount > 0.005) debts.push({ from: debtors[di].n, to: creditors[ci].n, amount })
    creditors[ci].v -= amount
    debtors[di].v  -= amount
    if (creditors[ci].v < 0.005) ci++
    if (debtors[di].v  < 0.005) di++
  }
  return debts
}

function load(): SplitSession[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') }
  catch { return [] }
}
function persist(s: SplitSession[]) { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)) }

const TYPE_META: Record<SessionType, { icon: typeof Plane; color: string; label: string; labelZh: string }> = {
  travel:  { icon: Plane,          color: '#0a84ff', label: 'Travel',  labelZh: '旅行' },
  project: { icon: Briefcase,      color: '#af52de', label: 'Project', labelZh: '專案' },
  other:   { icon: MoreHorizontal, color: '#8e8e93', label: 'Other',   labelZh: '其他' },
}

const CURRENCIES = ['HKD', 'USD', 'EUR', 'GBP', 'JPY', 'CNY', 'TWD', 'SGD']
const EMOJIS = ['✈️','🏖️','🏕️','🗼','🎉','🍜','🍣','💼','🏔️','🚢','🎭','🛒','🏠','🎓','⚽']

export default function SplitPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [sessions, setSessions] = useState<SplitSession[]>([])
  const [activeSession, setActiveSession] = useState<SplitSession | null>(null)
  const [tab, setTab] = useState<'expenses' | 'settlement'>('expenses')
  const [loading, setLoading] = useState(true)

  // Modals
  const [showCreateSession, setShowCreateSession] = useState(false)
  const [showAddExpense, setShowAddExpense] = useState(false)

  // New session form
  const [newName, setNewName] = useState('')
  const [newEmoji, setNewEmoji] = useState('✈️')
  const [newType, setNewType] = useState<SessionType>('travel')
  const [newCurrency, setNewCurrency] = useState('HKD')
  const [newParticipants, setNewParticipants] = useState<string[]>(['', ''])

  // New expense form
  const [expDesc, setExpDesc] = useState('')
  const [expAmount, setExpAmount] = useState('')
  const [expPaidBy, setExpPaidBy] = useState('')
  const [expSplitAmong, setExpSplitAmong] = useState<string[]>([])

  // Share state
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareEmail, setShareEmail] = useState('')
  const [sharing, setSharing] = useState(false)
  const [sharingSuccess, setSharingSuccess] = useState(false)


  const fetchSessions = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      // Fetch sessions
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('split_sessions')
        .select('*, expenses:split_expenses(*)')
        .order('created_at', { ascending: false })

      if (sessionsError) throw sessionsError

      const mappedData = (sessionsData || []).map(s => ({
        id: s.id,
        name: s.name,
        emoji: s.emoji,
        type: s.type as SessionType,
        currency: s.currency,
        participants: s.participants,
        createdAt: s.created_at,
        expenses: (s.expenses || []).map((e: any) => ({
          id: e.id,
          description: e.description,
          amount: Number(e.amount),
          paidBy: e.paid_by,
          splitAmong: e.split_among,
          date: e.date
        }))
      }))

      setSessions(mappedData)
      persist(mappedData)
    } catch (err) {
      console.error('Fetch sessions error:', err)
      setSessions(load())
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => { fetchSessions() }, [fetchSessions])

  // Sync activeSession from sessions list
  useEffect(() => {
    if (activeSession) {
      const updated = sessions.find(s => s.id === activeSession.id)
      if (updated) setActiveSession(updated)
    }
  }, [sessions]) // eslint-disable-line react-hooks/exhaustive-deps

  const updateSessions = (updated: SplitSession[]) => {
    setSessions(updated)
    persist(updated)
  }

  const createSession = async () => {
    const participants = newParticipants.filter(p => p.trim())
    if (!newName.trim() || participants.length < 2) return
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('split_sessions')
        .insert({
          user_id: user.id,
          name: newName.trim(),
          emoji: newEmoji,
          type: newType,
          currency: newCurrency,
          participants,
        })
        .select()
        .single()

      if (error) throw error

      const session: SplitSession = {
        id: data.id,
        name: data.name,
        emoji: data.emoji,
        type: data.type as SessionType,
        currency: data.currency,
        participants,
        expenses: [],
        createdAt: data.created_at,
      }
      updateSessions([session, ...sessions])
      setActiveSession(session)
      setShowCreateSession(false)
      resetCreateForm()
    } catch (err) {
      console.error('Create session error:', err)
    }
  }

  const resetCreateForm = () => {
    setNewName(''); setNewEmoji('✈️'); setNewType('travel')
    setNewCurrency('HKD'); setNewParticipants(['', ''])
  }

  const addExpense = async () => {
    if (!expDesc.trim() || !expAmount || !expPaidBy || !expSplitAmong.length || !activeSession) return
    try {
      const expenseData = {
        session_id: activeSession.id,
        description: expDesc.trim(),
        amount: parseFloat(expAmount),
        paid_by: expPaidBy,
        split_among: expSplitAmong,
      }

      const { data, error } = await supabase
        .from('split_expenses')
        .insert(expenseData)
        .select()
        .single()

      if (error) throw error

      const expense: SplitExpense = {
        id: data.id,
        description: data.description,
        amount: Number(data.amount),
        paidBy: data.paid_by,
        splitAmong: data.split_among,
        date: data.date,
      }
      const updated = sessions.map(s =>
        s.id === activeSession.id ? { ...s, expenses: [...s.expenses, expense] } : s
      )
      updateSessions(updated)
      setShowAddExpense(false)
      resetExpenseForm()
    } catch (err) {
      console.error('Add expense error:', err)
    }
  }

  const resetExpenseForm = () => {
    setExpDesc(''); setExpAmount(''); setExpPaidBy(''); setExpSplitAmong([])
  }

  const deleteExpense = async (expId: string) => {
    if (!activeSession) return
    try {
      const { error } = await supabase.from('split_expenses').delete().eq('id', expId)
      if (error) throw error

      const updated = sessions.map(s =>
        s.id === activeSession.id ? { ...s, expenses: s.expenses.filter(e => e.id !== expId) } : s
      )
      updateSessions(updated)
    } catch (err) {
      console.error('Delete expense error:', err)
    }
  }

  const deleteSession = async (id: string) => {
    if (!confirm(t('split.delete_session_confirm'))) return
    try {
      const { error } = await supabase.from('split_sessions').delete().eq('id', id)
      if (error) throw error

      const updated = sessions.filter(s => s.id !== id)
      updateSessions(updated)
      if (activeSession?.id === id) setActiveSession(null)
    } catch (err) {
      console.error('Delete session error:', err)
    }
  }

  const handleShare = async () => {
    if (!shareEmail.trim() || !activeSession) return
    setSharing(true)
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser) return

      // Guard: cannot invite yourself
      if (shareEmail.trim().toLowerCase() === currentUser.email?.toLowerCase()) {
        alert('You cannot invite yourself to your own project.')
        return
      }

      // Look up recipient via the user_emails view (created in 006_split_bill.sql)
      // This view exposes {id, email} from auth.users safely.
      const { data: found, error: lookupError } = await supabase
        .from('user_emails')
        .select('id')
        .eq('email', shareEmail.trim().toLowerCase())
        .maybeSingle()

      if (lookupError || !found) {
        alert('User not found. Please make sure the email belongs to a registered Clavi account.')
        return
      }

      const recipientId = found.id

      // Guard: check if a pending invite already exists for this session + recipient
      const { data: existing } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', recipientId)
        .eq('type', 'invite')
        .eq('status', 'pending')
        .maybeSingle()

      // Filter by session_id in JS (JSONB path filter can vary by Supabase version)
      // Re-fetch all pending invites for this recipient to check the session_id
      const { data: pendingInvites } = await supabase
        .from('notifications')
        .select('id, metadata')
        .eq('user_id', recipientId)
        .eq('type', 'invite')
        .eq('status', 'pending')

      const alreadyInvited = (pendingInvites ?? []).some(
        (n: any) => n.metadata?.session_id === activeSession.id
      )

      if (alreadyInvited) {
        alert('A pending invitation has already been sent to this user.')
        return
      }

      // Insert the notification/invite
      const { error: inviteError } = await supabase.from('notifications').insert({
        user_id: recipientId,
        sender_id: currentUser.id,
        type: 'invite',
        title: `${currentUser.email?.split('@')[0] ?? 'Someone'} invited you`,
        message: `You have been invited to join "${activeSession.name}". Accept to view and collaborate on expenses.`,
        metadata: {
          session_id: activeSession.id,
          session_name: activeSession.name,
          session_emoji: activeSession.emoji,
          session_type: activeSession.type,
        },
      })

      if (inviteError) throw inviteError

      setShowShareModal(false)
      setShareEmail('')
      // Show success inline (no alert — better UX)
      setSharingSuccess(true)
      setTimeout(() => setSharingSuccess(false), 3000)
    } catch (err) {
      console.error('Share error:', err)
      alert('Failed to send invitation. Please try again.')
    } finally {
      setSharing(false)
    }
  }

  const openAddExpense = useCallback(() => {
    if (!activeSession) return
    setExpPaidBy(activeSession.participants[0] ?? '')
    setExpSplitAmong([...activeSession.participants])
    setShowAddExpense(true)
  }, [activeSession])

  const totalSpent = (s: SplitSession) => s.expenses.reduce((acc, e) => acc + e.amount, 0)

  // ── SESSION DETAIL ──
  if (activeSession) {
    const debts = calculateSettlement(activeSession)
    const total = totalSpent(activeSession)

    return (
      <div className="flex flex-col min-h-screen">
        {/* Invite success toast */}
        <AnimatePresence>
          {sharingSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-5 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-[var(--success)]/90 text-white text-sm font-bold backdrop-blur-xl shadow-xl"
            >
              <Check size={15} strokeWidth={3} /> Invitation sent!
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex-1 max-w-xl mx-auto w-full px-4 py-6 md:py-8">
          {/* Header */}
          <header className="mb-6 animate-slide-up">

            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => { setActiveSession(null); setTab('expenses') }}
                className="w-10 h-10 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center justify-center text-primary active:scale-95 transition-transform flex-shrink-0"
              >
                <ArrowLeft size={18} />
              </button>
              <div className="flex-1 min-w-0 flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: `${TYPE_META[activeSession.type].color}20` }}
                >
                  {activeSession.emoji}
                </div>
                <div>
                  <h1 className="text-lg font-bold tracking-tight text-primary truncate">{activeSession.name}</h1>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">
                    {activeSession.participants.length} people · {activeSession.currency}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowShareModal(true)}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-accent-primary hover:bg-accent-primary/10 transition-colors"
                  title="Share Project"
                >
                  <Share2 size={18} />
                </button>
                <button
                  onClick={() => deleteSession(activeSession.id)}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-[var(--danger)] hover:bg-[var(--danger)]/10 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="surface-elevated text-center py-3 px-2">
                <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] mb-1">{t('split.total')}</p>
                <p className="text-base font-black text-primary">{formatCurrency(total, activeSession.currency)}</p>
              </div>
              <div className="surface-elevated text-center py-3 px-2">
                <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] mb-1">{t('split.expenses')}</p>
                <p className="text-base font-black text-primary">{activeSession.expenses.length}</p>
              </div>
              <div className="surface-elevated text-center py-3 px-2">
                <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] mb-1">Per Person</p>
                <p className="text-base font-black text-primary">
                  {activeSession.participants.length > 0
                    ? formatCurrency(total / activeSession.participants.length, activeSession.currency)
                    : '—'}
                </p>
              </div>
            </div>
          </header>

          {/* Tabs */}
          <div className="surface-elevated p-1.5 flex gap-1 mb-6 animate-slide-up delay-1">
            {(['expenses', 'settlement'] as const).map(t_ => (
              <button
                key={t_}
                onClick={() => setTab(t_)}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold transition-all"
                style={{
                  background: tab === t_ ? 'var(--accent-primary)' : 'transparent',
                  color: tab === t_ ? 'white' : 'var(--text-secondary)',
                }}
              >
                {t_ === 'expenses' ? <Receipt size={15} /> : <Calculator size={15} />}
                {t_ === 'expenses' ? t('split.expenses') : t('split.settlement')}
              </button>
            ))}
          </div>

          {/* Expenses tab */}
          {tab === 'expenses' && (
            <div className="space-y-3 animate-slide-up delay-2">
              <button
                onClick={openAddExpense}
                className="w-full py-4 rounded-3xl border-2 border-dashed border-[var(--border)] text-[var(--text-secondary)] text-sm font-bold flex items-center justify-center gap-2 hover:border-[var(--accent-primary)]/40 hover:text-[var(--accent-primary)] transition-all active:scale-[0.98]"
              >
                <Plus size={16} strokeWidth={3} /> {t('split.add_expense')}
              </button>

              {activeSession.expenses.length === 0 ? (
                <div className="surface-elevated text-center py-16">
                  <DollarSign size={28} className="text-[var(--text-secondary)] mx-auto mb-3 opacity-40" />
                  <p className="text-sm font-bold text-[var(--text-secondary)]">{t('split.no_expenses')}</p>
                  <p className="text-xs text-[var(--text-secondary)] opacity-60 mt-1">{t('split.no_expenses_desc')}</p>
                </div>
              ) : (
                <div className="list-wrapper">
                  {[...activeSession.expenses].reverse().map(exp => {
                    const share = exp.amount / exp.splitAmong.length
                    return (
                      <div key={exp.id} className="list-item group relative transition-colors cursor-default">
                        <div className="w-10 h-10 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center justify-center text-xl flex-shrink-0">
                          {activeSession.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-primary truncate mb-0.5">{exp.description}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-[10px] font-black uppercase tracking-widest text-secondary">
                              Paid <span className="text-accent-primary">{exp.paidBy}</span>
                            </p>
                            <span className="text-[10px] text-secondary opacity-30">•</span>
                            <p className="text-[10px] font-black uppercase tracking-widest text-secondary opacity-60">
                              {exp.splitAmong.length === activeSession.participants.length
                                ? t('split.everyone')
                                : exp.splitAmong.join(', ')}
                            </p>
                          </div>
                          <p className="text-[10px] text-secondary mt-1 opacity-60 italic">
                            {formatCurrency(share, activeSession.currency)}/person
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-base font-black text-primary leading-tight">{formatCurrency(exp.amount, activeSession.currency)}</p>
                          <div className="flex justify-end mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => deleteExpense(exp.id)}
                              className="p-1.5 rounded-lg text-tertiary hover:text-danger hover:bg-danger/10 transition-colors"
                              title={t('common.delete')}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Settlement tab */}
          {tab === 'settlement' && (
            <div className="space-y-3 animate-slide-up delay-2">
              {debts.length === 0 ? (
                <div className="surface-elevated text-center py-16">
                  <Check size={28} className="text-[var(--success)] mx-auto mb-3" />
                  <p className="text-sm font-bold text-[var(--success)]">{t('split.all_settled')}</p>
                </div>
              ) : (
                <>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] px-1 mb-4">
                    {t('split.settlement')}
                  </p>
                  {debts.map((d, i) => (
                    <div key={i} className="surface-elevated flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-[var(--danger)]/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-black text-[var(--danger)]">{d.from[0]?.toUpperCase()}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-primary">
                          <span className="text-[var(--danger)]">{d.from}</span>
                          {' '}{t('split.owes')}{' '}
                          <span className="text-[var(--success)]">{d.to}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-base font-black text-primary">{formatCurrency(d.amount, activeSession.currency)}</p>
                        <ArrowRight size={14} className="text-[var(--text-secondary)]" />
                      </div>
                    </div>
                  ))}
                </>
              )}

              {/* Per-person balance breakdown */}
              <div className="surface-elevated mt-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] mb-4 px-1">Balance</p>
                <div className="space-y-0">
                  {activeSession.participants.map(person => {
                    let paid = 0, owed = 0
                    activeSession.expenses.forEach(e => {
                      if (e.paidBy === person) paid += e.amount
                      if (e.splitAmong.includes(person)) owed += e.amount / e.splitAmong.length
                    })
                    const net = Math.round((paid - owed) * 100) / 100
                    return (
                      <div key={person} className="list-item">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--bg-elevated)' }}>
                          <span className="text-sm font-black text-[var(--text-secondary)]">{person[0]?.toUpperCase()}</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-primary">{person}</p>
                          <p className="text-[10px] text-[var(--text-secondary)]">
                            Paid {formatCurrency(paid, activeSession.currency)}
                          </p>
                        </div>
                        <p className={`text-sm font-black ${net >= 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
                          {net >= 0 ? '+' : ''}{formatCurrency(net, activeSession.currency)}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Add Expense Modal */}
        <AnimatePresence>
          {showAddExpense && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-md" 
                onClick={() => setShowAddExpense(false)}
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-sm surface-elevated p-6 md:p-8 shadow-[0_32px_96px_-12px_rgba(0,0,0,0.8)] border border-white/10 rounded-[2rem] max-h-[90dvh] overflow-y-auto custom-scrollbar" 
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold text-primary">{t('split.add_expense')}</h3>
                  <button onClick={() => { setShowAddExpense(false); resetExpenseForm() }} className="w-8 h-8 rounded-xl bg-[var(--bg-elevated)] flex items-center justify-center hover:bg-white/10 transition-colors">
                    <X size={16} />
                  </button>
                </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] mb-1.5">{t('split.description')}</label>
                  <input
                    autoFocus
                    type="text"
                    value={expDesc}
                    onChange={e => setExpDesc(e.target.value)}
                    placeholder={t('split.description_placeholder')}
                    className="w-full input-minimal"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] mb-1.5">{t('transactions.amount')}</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={expAmount}
                    onChange={e => setExpAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full input-minimal"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] mb-1.5">{t('split.paid_by')}</label>
                  <div className="flex flex-wrap gap-2">
                    {activeSession.participants.map(p => (
                      <button
                        key={p}
                        onClick={() => setExpPaidBy(p)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                          expPaidBy === p ? 'bg-[var(--accent-primary)] border-[var(--accent-primary)] text-white' : 'bg-[var(--bg-elevated)] border-[var(--border)] text-[var(--text-secondary)]'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">{t('split.split_among')}</label>
                    <button
                      onClick={() => setExpSplitAmong(
                        expSplitAmong.length === activeSession.participants.length ? [] : [...activeSession.participants]
                      )}
                      className="text-[10px] font-black uppercase tracking-widest text-[var(--accent-primary)]"
                    >
                      {expSplitAmong.length === activeSession.participants.length ? 'Clear' : t('split.everyone')}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {activeSession.participants.map(p => {
                      const selected = expSplitAmong.includes(p)
                      return (
                        <button
                          key={p}
                          onClick={() => setExpSplitAmong(prev => selected ? prev.filter(x => x !== p) : [...prev, p])}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                            selected ? 'bg-[var(--success)]/10 border-[var(--success)] text-[var(--success)]' : 'bg-[var(--bg-elevated)] border-[var(--border)] text-[var(--text-secondary)]'
                          }`}
                        >
                          {p}
                        </button>
                      )
                    })}
                  </div>
                  {expAmount && expSplitAmong.length > 0 && (
                    <p className="text-[10px] text-[var(--text-secondary)] mt-2">
                      {formatCurrency(parseFloat(expAmount) / expSplitAmong.length, activeSession.currency)} / person
                    </p>
                  )}
                </div>

                <button
                  onClick={addExpense}
                  disabled={!expDesc.trim() || !expAmount || !expPaidBy || !expSplitAmong.length}
                  className="w-full py-4 rounded-2xl bg-[var(--accent-primary)] text-white text-xs font-black uppercase tracking-[0.2em] disabled:opacity-40 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  {t('split.add_expense')}
                </button>
              </div>
            </motion.div>
          </div>
          )}
        </AnimatePresence>
        {/* Share Modal */}
        <AnimatePresence>
          {showShareModal && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-md" 
                onClick={() => setShowShareModal(false)}
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-sm surface-elevated p-6 md:p-8 shadow-[0_32px_96px_-12px_rgba(0,0,0,0.8)] border border-white/10 rounded-[2rem]" 
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-xl font-bold text-primary">{t('split.share_title') || 'Share Project'}</h3>
                    <p className="text-xs text-secondary mt-1">Invite others to collaborate</p>
                  </div>
                  <button onClick={() => setShowShareModal(false)} className="w-8 h-8 rounded-xl bg-[var(--bg-elevated)] flex items-center justify-center hover:bg-white/10 transition-colors">
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] mb-2">Member Email</label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary" />
                      <input
                        autoFocus
                        type="email"
                        value={shareEmail}
                        onChange={e => setShareEmail(e.target.value)}
                        placeholder="user@example.com"
                        className="w-full input-minimal pl-11"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleShare}
                    disabled={sharing || !shareEmail.trim()}
                    className="w-full py-4 rounded-2xl bg-[var(--accent-primary)] text-white text-xs font-black uppercase tracking-[0.2em] disabled:opacity-40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    {sharing ? 'Processing...' : 'Send Invitation'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <BunordenFooter />
      </div>
    )
  }

  // ── SESSIONS LIST ──
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 max-w-xl mx-auto w-full px-4 py-6 md:py-10">
        {/* Header */}
        <header className="mb-8 animate-slide-up">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-primary">{t('split.title')}</h1>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] mt-1">{t('split.subtitle')}</p>
            </div>
            <button
              onClick={() => { resetCreateForm(); setNewParticipants(['', '']); setShowCreateSession(true) }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[var(--accent-primary)] text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-[var(--accent-primary)]/20 hover:scale-105 active:scale-95 transition-all"
            >
              <Plus size={14} strokeWidth={3} /> {t('split.new_session')}
            </button>
          </div>
        </header>

        {sessions.length === 0 ? (
          <div className="surface-elevated text-center py-20 animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-[var(--accent-primary)]/10 flex items-center justify-center mx-auto mb-6">
              <Users size={32} className="text-[var(--accent-primary)]" />
            </div>
            <h2 className="text-lg font-bold text-primary mb-2">{t('split.no_sessions')}</h2>
            <p className="text-sm text-[var(--text-secondary)] mb-8 max-w-sm mx-auto">{t('split.no_sessions_desc')}</p>
            <button
              onClick={() => { resetCreateForm(); setNewParticipants(['', '']); setShowCreateSession(true) }}
              className="btn-apple-primary px-8 py-3 rounded-full text-sm font-bold"
            >
              {t('split.new_session')}
            </button>
          </div>
        ) : (
          <div className="space-y-3 animate-slide-up delay-1">
            {sessions.map((s, i) => {
              const meta = TYPE_META[s.type]
              const total = totalSpent(s)
              return (
                <button
                  key={s.id}
                  onClick={() => { setActiveSession(s); setTab('expenses') }}
                  className="w-full text-left surface-elevated-interactive group relative overflow-hidden"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 blur-3xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: `${meta.color}15` }} />
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                      style={{ background: `${meta.color}15` }}>
                      {s.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-primary truncate">{s.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md"
                          style={{ background: `${meta.color}20`, color: meta.color }}>
                          {meta.label}
                        </span>
                        <span className="text-[10px] text-[var(--text-secondary)]">
                          {s.participants.length} people · {s.expenses.length} expenses
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <p className="text-base font-black text-primary">{formatCurrency(total, s.currency)}</p>
                      <ChevronRight size={14} className="text-[var(--text-secondary)] opacity-40" />
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Create Session Modal */}
      <AnimatePresence>
        {showCreateSession && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md" 
              onClick={() => setShowCreateSession(false)}
            />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-sm surface-elevated p-6 md:p-8 shadow-[0_32px_96px_-12px_rgba(0,0,0,0.8)] border border-white/10 rounded-[2rem] max-h-[90dvh] overflow-y-auto custom-scrollbar" 
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold text-primary">{t('split.new_session')}</h3>
                  <button onClick={() => setShowCreateSession(false)} className="w-8 h-8 rounded-xl bg-[var(--bg-elevated)] flex items-center justify-center hover:bg-white/10 transition-colors">
                    <X size={16} />
                  </button>
                </div>

            <div className="space-y-5">
              {/* Emoji picker */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] mb-2">Emoji</label>
                <div className="flex flex-wrap gap-2">
                  {EMOJIS.map(e => (
                    <button key={e} onClick={() => setNewEmoji(e)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all ${newEmoji === e ? 'ring-2 ring-[var(--accent-primary)] scale-110' : 'hover:scale-105'}`}
                      style={{ background: 'var(--bg-elevated)' }}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              {/* Type */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] mb-2">Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.entries(TYPE_META) as [SessionType, typeof TYPE_META[SessionType]][]).map(([id, meta]) => (
                    <button key={id} onClick={() => setNewType(id)}
                      className={`py-3 rounded-2xl text-xs font-bold transition-all border flex flex-col items-center gap-1.5 ${
                        newType === id ? 'border-transparent text-white' : 'border-[var(--border)] text-[var(--text-secondary)] bg-[var(--bg-elevated)]'
                      }`}
                      style={newType === id ? { background: meta.color } : {}}>
                      <meta.icon size={16} /> {meta.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] mb-1.5">{t('split.session_name')}</label>
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder={t('split.session_name_placeholder')}
                  className="w-full input-minimal"
                />
              </div>

              {/* Currency */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] mb-1.5">{t('settings.currency')}</label>
                <select value={newCurrency} onChange={e => setNewCurrency(e.target.value)} className="w-full input-minimal">
                  {CURRENCIES.map(c => <option key={c} value={c} className="bg-zinc-900">{c}</option>)}
                </select>
              </div>

              {/* Participants */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] mb-2">{t('split.participants')}</label>
                <div className="space-y-2">
                  {newParticipants.map((p, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={p}
                        onChange={e => {
                          const arr = [...newParticipants]
                          arr[i] = e.target.value
                          setNewParticipants(arr)
                        }}
                        placeholder={`${t('split.participant_placeholder')} ${i + 1}`}
                        className="flex-1 input-minimal"
                      />
                      {newParticipants.length > 2 && (
                        <button onClick={() => setNewParticipants(prev => prev.filter((_, j) => j !== i))}
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-[var(--danger)] hover:bg-[var(--danger)]/10">
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => setNewParticipants(prev => [...prev, ''])}
                    className="flex items-center gap-2 text-[var(--accent-primary)] text-xs font-bold py-2"
                  >
                    <Plus size={14} strokeWidth={3} /> {t('split.add_participant')}
                  </button>
                </div>
              </div>

              <button
                onClick={createSession}
                disabled={!newName.trim() || newParticipants.filter(p => p.trim()).length < 2}
                className="w-full py-4 rounded-2xl bg-[var(--accent-primary)] text-white text-xs font-black uppercase tracking-[0.2em] disabled:opacity-40 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Create Session
              </button>
            </div>
          </motion.div>
        </div>
      )}
      </AnimatePresence>

      <BunordenFooter />
    </div>
  )
}
