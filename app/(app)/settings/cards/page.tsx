'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { BunordenFooter } from '@/components/layout/BunordenFooter'
import { useTranslation } from '@/app/providers'
import { ArrowLeft, Plus, Edit2, Trash2, X, CreditCard, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

interface Card {
  id: string
  name: string
  number: string
  expiry: string
  icon?: string
}

// Card network detection from last 4 digits (colour only)
type CardNetwork = 'visa' | 'mastercard' | 'amex' | 'unionpay' | 'other'

const CARD_NETWORKS: { id: CardNetwork; label: string; gradient: string; logo: string }[] = [
  { id: 'visa',      label: 'Visa',      gradient: 'linear-gradient(135deg, #1a1f71 0%, #2563eb 100%)', logo: 'VISA' },
  { id: 'mastercard',label: 'Mastercard',gradient: 'linear-gradient(135deg, #eb5757 0%, #f7971e 100%)', logo: 'MC'   },
  { id: 'amex',      label: 'Amex',      gradient: 'linear-gradient(135deg, #007666 0%, #00a693 100%)', logo: 'AMEX' },
  { id: 'unionpay',  label: 'UnionPay',  gradient: 'linear-gradient(135deg, #c41230 0%, #8b0000 100%)', logo: 'UP'   },
  { id: 'other',     label: 'Other',     gradient: 'linear-gradient(135deg, #2d2d2d 0%, #4a4a4a 100%)', logo: '••'   },
]

function isExpiringSoon(expiry: string): boolean {
  if (!expiry || !expiry.includes('/')) return false
  const [mm, yy] = expiry.split('/')
  const exp = new Date(2000 + parseInt(yy), parseInt(mm) - 1, 1)
  const now = new Date()
  const diff = exp.getTime() - now.getTime()
  return diff > 0 && diff < 90 * 24 * 60 * 60 * 1000 // within 90 days
}

function isExpired(expiry: string): boolean {
  if (!expiry || !expiry.includes('/')) return false
  const [mm, yy] = expiry.split('/')
  const exp = new Date(2000 + parseInt(yy), parseInt(mm), 0) // last day of month
  return exp < new Date()
}

// Chip SVG
function ChipIcon() {
  return (
    <svg width="36" height="28" viewBox="0 0 36 28" fill="none" aria-hidden="true">
      <rect x="0.5" y="0.5" width="35" height="27" rx="5.5" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" />
      <rect x="13" y="0.5" width="10" height="27" fill="rgba(255,255,255,0.08)" />
      <rect x="0.5" y="9" width="35" height="10" fill="rgba(255,255,255,0.08)" />
      <rect x="13.5" y="9.5" width="9" height="9" rx="1" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.2)" />
    </svg>
  )
}

export default function CardsPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCard, setEditingCard] = useState<Card | null>(null)

  const [name, setName]       = useState('')
  const [number, setNumber]   = useState('')
  const [expiry, setExpiry]   = useState('')
  const [network, setNetwork] = useState<CardNetwork>('visa')
  const [processing, setProcessing]           = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data } = await supabase.from('cards').select('*').eq('user_id', user.id).order('created_at', { ascending: true })
      setCards(data || [])
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

      const digits = number.replace(/\D/g, '')
      const lastFour = digits.slice(-4)
      const storedNumber = lastFour.length === 4 ? `****${lastFour}` : number.trim()
      const networkIcon = CARD_NETWORKS.find(n => n.id === network)?.label ?? network

      if (editingCard) {
        const { error } = await supabase.from('cards')
          .update({ name: name.trim(), number: storedNumber, expiry, icon: networkIcon })
          .eq('id', editingCard.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('cards')
          .insert({ user_id: user.id, name: name.trim(), number: storedNumber, expiry, icon: networkIcon })
        if (error) throw error
      }
      setShowModal(false)
      fetchData()
      resetForm()
    } catch (err: any) {
      alert(err.message || 'Error saving card')
    } finally {
      setProcessing(false)
    }
  }

  const handleDelete = async (id: string) => {
    setProcessing(true)
    try {
      const { error } = await supabase.from('cards').delete().eq('id', id)
      if (error) throw error
      setShowDeleteModal(null)
      fetchData()
    } catch (err: any) {
      alert(err.message || 'Error deleting card')
    } finally {
      setProcessing(false)
    }
  }

  const resetForm = () => { setName(''); setNumber(''); setExpiry(''); setNetwork('visa'); setEditingCard(null) }

  const openEdit = (c: Card) => {
    const net = CARD_NETWORKS.find(n => n.label === c.icon || n.id === c.icon)?.id ?? 'other'
    setEditingCard(c); setName(c.name); setNumber(c.number); setExpiry(c.expiry); setNetwork(net as CardNetwork); setShowModal(true)
  }

  const getNetworkMeta = (card: Card) =>
    CARD_NETWORKS.find(n => n.label === card.icon || n.id === card.icon) ?? CARD_NETWORKS[4]

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 px-4 lg:px-8 py-6 lg:py-8 max-w-2xl mx-auto w-full">

        {/* Header */}
        <header className="flex items-center gap-4 mb-2 animate-slide-up">
          <Link href="/settings" className="w-10 h-10 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center justify-center text-primary active:scale-95 transition-transform">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-primary">{t('settings.cards')}</h1>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] mt-0.5">
              {t('settings.cards_subtitle')}
            </p>
          </div>
        </header>

        {/* Explainer banner */}
        <div className="mb-6 mt-4 animate-slide-up delay-1 px-4 py-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] flex items-start gap-3">
          <CreditCard size={16} className="text-[var(--text-secondary)] flex-shrink-0 mt-0.5" />
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            <span className="font-bold text-primary">Credit Cards</span> are payment methods stored for reference when logging transactions. They don't track a balance — use <Link href="/settings/accounts" className="text-[var(--accent-primary)] font-bold hover:underline">Accounts</Link> for that.
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map(i => <div key={i} className="skeleton h-44 rounded-3xl" />)}
          </div>
        ) : (
          <div className="space-y-4 animate-slide-up delay-2">
            {cards.map((card) => {
              const meta = getNetworkMeta(card)
              const expSoon = isExpiringSoon(card.expiry)
              const expired = isExpired(card.expiry)
              return (
                <div key={card.id} className="group relative">
                  {/* Physical card design */}
                  <div
                    className="relative w-full rounded-3xl p-6 overflow-hidden"
                    style={{
                      background: meta.gradient,
                      aspectRatio: '1.586 / 1',
                      maxHeight: 200,
                      boxShadow: '0 20px 60px -12px rgba(0,0,0,0.5)',
                    }}
                  >
                    {/* Shine overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                    {/* Network watermark */}
                    <div className="absolute -right-4 -bottom-4 text-[120px] font-black opacity-10 select-none leading-none text-white pointer-events-none">
                      {meta.logo}
                    </div>

                    {/* Card header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">Payment Card</p>
                        <p className="text-base font-bold text-white mt-0.5 truncate max-w-[180px]">{card.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/60">{meta.label}</p>
                        {(expired || expSoon) && (
                          <div className={`flex items-center gap-1 mt-1 ${expired ? 'text-red-300' : 'text-yellow-300'}`}>
                            <AlertTriangle size={10} />
                            <span className="text-[9px] font-black uppercase tracking-widest">
                              {expired ? 'Expired' : 'Expiring soon'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Chip */}
                    <div className="mb-4"><ChipIcon /></div>

                    {/* Card number + expiry */}
                    <div className="flex items-end justify-between">
                      <p className="text-white font-mono text-lg font-bold tracking-[0.2em]">{card.number}</p>
                      {card.expiry && (
                        <div className="text-right">
                          <p className="text-[9px] text-white/60 uppercase tracking-widest">EXP</p>
                          <p className={`text-sm font-mono font-bold ${expired ? 'text-red-300' : 'text-white'}`}>{card.expiry}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action buttons below card */}
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => openEdit(card)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] text-xs font-bold text-[var(--text-secondary)] hover:text-primary hover:border-[var(--accent-primary)]/40 transition-all active:scale-[0.98]"
                    >
                      <Edit2 size={13} /> Edit
                    </button>
                    <button
                      onClick={() => setShowDeleteModal(card.id)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--danger)] hover:border-[var(--danger)]/40 transition-all active:scale-[0.98]"
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </div>
              )
            })}

            {/* Add button */}
            <button
              onClick={() => { resetForm(); setShowModal(true) }}
              className="w-full flex items-center justify-center gap-2 py-5 rounded-[2rem] border-2 border-dashed border-[var(--border)] hover:border-[var(--accent-primary)]/50 hover:bg-[var(--accent-primary)]/5 transition-all text-sm font-bold group"
              style={{ color: 'var(--text-tertiary)' }}
            >
              <div className="w-8 h-8 rounded-full border border-[var(--border)] flex items-center justify-center group-hover:border-[var(--accent-primary)] group-hover:text-[var(--accent-primary)] transition-colors">
                <Plus size={18} />
              </div>
              {t('settings.cards_add')}
            </button>
          </div>
        )}
      </div>

      <BunordenFooter />

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md" 
              onClick={() => setShowModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm surface-elevated p-6 md:p-8 shadow-[0_32px_96px_-12px_rgba(0,0,0,0.8)] border border-white/10 rounded-[2rem] max-h-[90dvh] overflow-y-auto custom-scrollbar" 
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-primary">
                {editingCard ? t('settings.cards_edit') : t('settings.cards_new')}
              </h3>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-xl bg-[var(--bg-elevated)] flex items-center justify-center">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              {/* Network picker */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] mb-2">Card Network</label>
                <div className="grid grid-cols-5 gap-2">
                  {CARD_NETWORKS.map(n => (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => setNetwork(n.id)}
                      className={`py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${network === n.id ? 'border-[var(--accent-primary)] text-[var(--accent-primary)] bg-[var(--accent-primary)]/10' : 'border-[var(--border)] text-[var(--text-secondary)] bg-[var(--bg-elevated)]'}`}
                    >
                      {n.logo}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] mb-2">{t('settings.cards_name')}</label>
                <input
                  autoFocus
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder={t('settings.cards_name_placeholder')}
                  className="input-minimal w-full"
                  required
                />
              </div>

              {/* Card number (last 4) */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] mb-2">
                  {t('settings.cards_number')}
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-[var(--text-secondary)] text-sm pointer-events-none">**** **** ****</span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={number.replace(/\D/g, '').slice(-4)}
                    onChange={e => setNumber(e.target.value.replace(/\D/g, '').slice(-4))}
                    placeholder="1234"
                    maxLength={4}
                    className="input-minimal w-full font-mono text-right pr-4"
                    style={{ letterSpacing: '0.2em' }}
                  />
                </div>
                <p className="text-[10px] text-[var(--text-secondary)] mt-1 ml-1">Enter the last 4 digits only — we never store full card numbers.</p>
              </div>

              {/* Expiry */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] mb-2">{t('settings.cards_expiry')}</label>
                <input
                  type="text"
                  value={expiry}
                  onChange={e => {
                    let val = e.target.value.replace(/\D/g, '')
                    if (val.length > 4) val = val.slice(0, 4)
                    if (val.length > 2) val = val.slice(0, 2) + '/' + val.slice(2)
                    setExpiry(val)
                  }}
                  placeholder={t('settings.cards_expiry_placeholder')}
                  className="input-minimal w-full font-mono"
                  maxLength={5}
                />
              </div>

              {/* Mini preview */}
              <div
                className="relative w-full rounded-2xl p-4 overflow-hidden"
                style={{
                  background: CARD_NETWORKS.find(n => n.id === network)?.gradient,
                  minHeight: 80,
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-bold text-sm">{name || 'Card Name'}</p>
                    <p className="text-white/70 font-mono text-xs mt-1">**** **** **** {number.replace(/\D/g, '').slice(-4) || '••••'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/60">{CARD_NETWORKS.find(n => n.id === network)?.label}</p>
                    {expiry && <p className="text-white font-mono text-xs mt-0.5">{expiry}</p>}
                  </div>
                </div>
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
          </motion.div>
        </div>
      )}
      </AnimatePresence>

      {/* Delete Modal */}
      <AnimatePresence>
      {showDeleteModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-md" 
            onClick={() => setShowDeleteModal(null)}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-xs surface-elevated p-6 md:p-8 text-center shadow-[0_32px_96px_-12px_rgba(0,0,0,0.8)] border border-white/10 rounded-[2rem]" 
            onClick={e => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-[var(--danger-bg)] flex items-center justify-center mx-auto mb-4">
                <Trash2 size={28} className="text-[var(--danger)]" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-primary">{t('settings.cards_delete_confirm')}</h3>
              <p className="text-sm mb-6 text-[var(--text-secondary)]">{t('settings.cards_delete_warning')}</p>
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
          </motion.div>
        </div>
      )}
      </AnimatePresence>
    </div>
  )
}
