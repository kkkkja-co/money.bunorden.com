'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { BunordenFooter } from '@/components/layout/BunordenFooter'
import { useTranslation } from '@/app/providers'
import { 
  ArrowLeft, Plus, Edit2, Trash2, Check, X, 
  CreditCard
} from 'lucide-react'
import Link from 'next/link'

interface Card {
  id: string
  name: string
  number: string
  expiry: string
  icon?: string
}

const CARD_ICONS = ['💳', '🏦', '💰', '🎫', '💼', '🔐']

export default function CardsPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCard, setEditingCard] = useState<Card | null>(null)
  
  // Form states
  const [name, setName] = useState('')
  const [number, setNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [icon, setIcon] = useState('💳')
  const [processing, setProcessing] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      // Get cards
      const { data: cardsData } = await supabase
        .from('cards')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })

      setCards(cardsData || [])
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => { fetchData() }, [fetchData])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !number.trim()) return
    setProcessing(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Validate card number format (last 4 digits)
      const lastFour = number.replace(/\D/g, '').slice(-4)
      if (lastFour.length !== 4) {
        alert('Card number must be at least 4 digits')
        setProcessing(false)
        return
      }

      if (editingCard) {
        const { error } = await supabase
          .from('cards')
          .update({ name: name.trim(), number: `****${lastFour}`, expiry, icon })
          .eq('id', editingCard.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('cards')
          .insert({
            user_id: user.id,
            name: name.trim(),
            number: `****${lastFour}`,
            expiry,
            icon
          })
        if (error) throw error
      }

      setShowModal(false)
      fetchData()
      setName('')
      setNumber('')
      setExpiry('')
      setIcon('💳')
      setEditingCard(null)
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

  const openEdit = (c: Card) => {
    setEditingCard(c)
    setName(c.name)
    setNumber(c.number)
    setExpiry(c.expiry)
    setIcon(c.icon || '💳')
    setShowModal(true)
  }

  const formatCardNumber = (str: string) => {
    return str.replace(/\D/g, '').slice(-4).padStart(4, '*')
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 px-4 lg:px-8 py-6 lg:py-8 max-w-2xl mx-auto w-full">
        <header className="flex items-center gap-4 mb-8 animate-slide-up">
          <Link href="/settings" className="p-2 -ml-2 rounded-full hover:bg-white/5 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            {t('settings.cards')}
          </h1>
        </header>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="skeleton h-24 rounded-2xl" />)}
          </div>
        ) : (
          <div className="space-y-4 animate-slide-up delay-1">
            {cards.map((card) => (
              <div
                key={card.id}
                className="surface-elevated flex items-center gap-4 p-5 group relative overflow-hidden"
              >
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 bg-accent-primary/10"
                >
                  {card.icon || '💳'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-base truncate" style={{ color: 'var(--text-primary)' }}>{card.name}</p>
                  <p className="font-mono text-sm" style={{ color: 'var(--text-tertiary)' }}>
                    {card.number} {card.expiry && `• ${card.expiry}`}
                  </p>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => openEdit(card)}
                    className="p-2 rounded-lg hover:bg-white/5" 
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => setShowDeleteModal(card.id)}
                    className="p-2 rounded-lg hover:bg-danger/10" 
                    style={{ color: 'var(--danger)' }}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}

            <button
              onClick={() => { setEditingCard(null); setName(''); setNumber(''); setExpiry(''); setIcon('💳'); setShowModal(true); }}
              className="w-full flex items-center justify-center gap-2 py-5 rounded-[2rem] border-2 border-dashed border-white/10 hover:border-accent-primary/50 hover:bg-accent-primary/5 transition-all text-sm font-bold group"
              style={{ color: 'var(--text-tertiary)' }}
            >
              <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:border-accent-primary group-hover:text-accent-primary transition-colors">
                <Plus size={18} />
              </div>
              {t('settings.cards_add')}
            </button>
          </div>
        )}
      </div>

      <BunordenFooter />

      {/* Card Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
              {editingCard ? t('settings.cards_edit') : t('settings.cards_new')}
            </h3>
            
            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-tertiary)' }}>
                  {t('settings.cards_name')}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder={t('settings.cards_name_placeholder')}
                  className="input-minimal w-full text-lg"
                  autoFocus
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-tertiary)' }}>
                  {t('settings.cards_number')}
                </label>
                <input
                  type="tel"
                  value={formatCardNumber(number)}
                  onChange={e => setNumber(e.target.value)}
                  placeholder={t('settings.cards_number_placeholder')}
                  className="input-minimal w-full font-mono text-lg"
                  pattern="\d*"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-tertiary)' }}>
                  {t('settings.cards_expiry')}
                </label>
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
                  className="input-minimal w-full font-mono text-lg"
                  maxLength={5}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-tertiary)' }}>
                  Icon
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {CARD_ICONS.map(i => (
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

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="list-item justify-center bg-primary/5 text-primary border border-border rounded-xl flex-1 py-3 font-bold"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={processing || !name.trim() || !number.trim()}
                  className="btn-apple-primary flex-1 py-3 font-bold"
                  style={{ opacity: processing || !name.trim() || !number.trim() ? 0.5 : 1 }}
                >
                  {processing ? t('common.loading') : t('common.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(null)}>
          <div className="modal-content p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
              {t('settings.cards_delete_confirm')}
            </h3>
            <p className="text-sm mb-6" style={{ color: 'var(--text-tertiary)' }}>
              {t('settings.cards_delete_warning')}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="list-item justify-center bg-primary/5 text-primary border border-border rounded-xl flex-1 py-3 font-bold"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={() => handleDelete(showDeleteModal)}
                disabled={processing}
                className="list-item justify-center bg-danger/10 text-danger border border-danger/20 rounded-xl flex-1 py-3 font-bold"
              >
                {processing ? t('common.loading') : t('common.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
