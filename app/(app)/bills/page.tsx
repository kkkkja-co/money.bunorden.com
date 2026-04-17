'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useTranslation, useLanguage } from '@/app/providers'
import { AnimatedCard } from '@/components/ui/AnimatedCard'
import { PageSkeleton } from '@/components/ui/PageSkeleton'
import { Plus, CreditCard, Check, AlertCircle, Bell, BellOff, X, MoreVertical, Trash2, Edit2, CalendarCheck } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default function BillsPage() {
  const router = useRouter()
  const { t, language } = useLanguage() // useLanguage gives access to the language code
  const { t: tr } = useTranslation() // We'll keep t as the alias for tr
  
  const [bills, setBills] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currency, setCurrency] = useState('HKD')
  const [userId, setUserId] = useState('')

  const [showModal, setShowModal] = useState(false)
  const [editingBill, setEditingBill] = useState<any>(null)
  
  // Form state
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('💳')
  const [dueDay, setDueDay] = useState(1)
  const [amount, setAmount] = useState('')
  const [autoRemind, setAutoRemind] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Action sheet state
  const [activeBillId, setActiveBillId] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id)

      const { data: profileData } = await supabase.from('profiles').select('currency').eq('id', user.id).single()
      if (profileData) setCurrency(profileData.currency)

      const { data: billsData } = await supabase
        .from('bills')
        .select('*')
        .eq('user_id', user.id)
        .order('due_day', { ascending: true })

      setBills(billsData || [])
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => { fetchData() }, [fetchData])

  // Reminder scheduling effect
  useEffect(() => {
    if (!bills.length) return
    if (typeof window === 'undefined' || !('Notification' in window)) return
    if (Notification.permission !== 'granted') return

    const now = new Date()
    const timers: NodeJS.Timeout[] = []

    bills.forEach(bill => {
      if (!bill.auto_remind || !bill.is_active) return

      let dueDate = new Date(now.getFullYear(), now.getMonth(), bill.due_day)
      if (dueDate < now) {
        // If due date passed this month, setup for next month
        dueDate = new Date(now.getFullYear(), now.getMonth() + 1, bill.due_day)
      }

      const remindDate = new Date(dueDate)
      remindDate.setDate(remindDate.getDate() - bill.remind_days)
      // Set reminder to 9:00 AM
      remindDate.setHours(9, 0, 0, 0)

      const timeUntilReminder = remindDate.getTime() - now.getTime()

      if (timeUntilReminder > 0 && timeUntilReminder < 24 * 60 * 60 * 1000) {
        // Set a timeout if reminder is within the next 24 hours
        const timerId = setTimeout(() => {
          new Notification('Clavi Bill Reminder', {
            body: `${bill.name} is due in ${bill.remind_days} days.`,
            icon: '/assets/clavi-icon-dark.png' // Use a static png for notifications
          })
        }, timeUntilReminder)
        timers.push(timerId)
      }
    })

    return () => timers.forEach(clearTimeout)
  }, [bills])

  const openModal = (bill: any = null) => {
    setActiveBillId(null)
    setEditingBill(bill)
    if (bill) {
      setName(bill.name)
      setIcon(bill.icon)
      setDueDay(bill.due_day)
      setAmount(bill.amount ? String(bill.amount) : '')
      setAutoRemind(bill.auto_remind)
    } else {
      setName('')
      setIcon('💳')
      setDueDay(new Date().getDate())
      setAmount('')
      setAutoRemind(true)
    }
    setShowModal(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !dueDay) return
    
    setSaving(true)
    try {
      const payload = {
        user_id: userId,
        name: name.trim(),
        icon,
        due_day: dueDay,
        amount: amount ? Number(amount) : null,
        currency,
        auto_remind: autoRemind
      }

      if (editingBill) {
        await supabase.from('bills').update(payload).eq('id', editingBill.id)
      } else {
        await supabase.from('bills').insert(payload)
      }
      
      await fetchData()
      setShowModal(false)
    } catch (err) {
      console.error(err)
      alert(tr('common.error')) // Using a generic error key
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(tr('settings.delete_account') + '?')) return
    try {
      await supabase.from('bills').delete().eq('id', id)
      await fetchData()
    } catch (err) {
      console.error(err)
    }
    setActiveBillId(null)
  }

  const markPaid = (bill: any) => {
    // Navigate to add transaction page with prepopulated note
    const amountParam = bill.amount ? `&amount=${bill.amount}` : ''
    router.push(`/add?type=expense&note=${encodeURIComponent(bill.name)} bill payment${amountParam}`)
  }

  // Calculate days remaining
  const calculateStatus = (day: number) => {
    const now = new Date()
    const currentDay = now.getDate()
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    
    let daysUntil = day - currentDay
    if (daysUntil < 0) {
      // Overdue or next month
      if (daysUntil >= -3) { // 3 days grace period before flipping to next month
        return { text: tr('bills.overdue') || 'Overdue', color: 'text-danger', bg: 'bg-danger/10' }
      }
      daysUntil += daysInMonth
    } else if (daysUntil === 0) {
      return { text: tr('bills.due_today') || 'Due Today', color: 'text-danger', bg: 'bg-danger/10' }
    }
    
    let textKey = language === 'zh-TW' ? `${daysUntil} 天後到期` : `Due in ${daysUntil}d`
    
    if (daysUntil <= 3) return { text: textKey, color: 'text-danger', bg: 'bg-danger/10' }
    if (daysUntil <= 7) return { text: textKey, color: 'text-[#ff9f0a]', bg: 'bg-[#ff9f0a]/10' }
    return { text: textKey, color: 'text-success', bg: 'bg-success/10' }
  }

  if (loading) return <PageSkeleton />

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 max-w-xl mx-auto w-full px-5 py-8 md:py-12 pb-24">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary animate-slide-up">{tr('bills.title') || 'Bills'}</h1>
            <p className="text-[11px] font-black uppercase tracking-widest text-secondary mt-1 animate-slide-up delay-1">
              {bills.length} {tr('bills.active') || 'Active'}
            </p>
          </div>
          <button 
            onClick={() => openModal()}
            className="w-12 h-12 rounded-full flex items-center justify-center bg-[var(--accent-primary)] text-white shadow-lg transition-transform hover:scale-105 active:scale-95 animate-scale-in delay-2"
          >
            <Plus size={24} />
          </button>
        </header>

        <div className="space-y-4">
          {bills.length === 0 ? (
            <AnimatedCard delay={2} className="text-center py-16 surface-elevated border-dashed opacity-70">
              <CreditCard size={48} className="mx-auto text-secondary mb-4 opacity-50" />
              <p className="font-bold text-lg mb-2">{tr('bills.no_bills') || 'No bills configured'}</p>
              <p className="text-xs text-secondary mb-6">{tr('bills.no_bills_desc') || 'Add your credit cards or recurring bills to track due dates.'}</p>
              <button 
                onClick={() => openModal()}
                className="btn-apple-primary px-8 py-3 text-xs"
              >
                {tr('bills.add_bill') || 'Add Bill'}
              </button>
            </AnimatedCard>
          ) : (
            bills.map((bill, i) => {
              const status = calculateStatus(bill.due_day)
              const showActions = activeBillId === bill.id

              return (
                <AnimatedCard key={bill.id} delay={i + 2} direction="up" className="relative">
                  <div 
                    className="p-5 surface-elevated-interactive flex items-center gap-4 cursor-pointer"
                    onClick={() => setActiveBillId(showActions ? null : bill.id)}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-2xl border border-white/5 shrink-0">
                      {bill.icon}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-base truncate pr-2 text-primary">{bill.name}</h3>
                        {bill.auto_remind && <Bell size={12} className="text-accent-primary shrink-0" />}
                      </div>
                      <div className="flex flex-wrap gap-2 items-center">
                        <span className={`px-2 py-0.5 rounded flex items-center gap-1 text-[10px] font-black uppercase tracking-wider ${status.bg} ${status.color}`}>
                          {status.text}
                        </span>
                        <span className="text-[10px] text-secondary font-medium">
                          {tr('bills.day_prefix') || 'Day'} {bill.due_day}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="font-bold text-lg text-primary">
                        {bill.amount ? formatCurrency(bill.amount, bill.currency) : '--'}
                      </p>
                      <button 
                        className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 text-secondary hover:bg-white/10 transition-colors ml-auto mt-1"
                        onClick={(e) => { e.stopPropagation(); setActiveBillId(showActions ? null : bill.id) }}
                      >
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Actions Drawer */}
                  {showActions && (
                    <div className="absolute inset-x-0 bottom-full mb-2 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-2xl shadow-xl p-2 flex gap-2 z-20 animate-fade-in">
                      <button 
                        onClick={() => markPaid(bill)}
                        className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl bg-success/10 text-success hover:bg-success/20 transition-colors"
                      >
                        <Check size={18} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">{tr('bills.mark_paid') || 'Pay'}</span>
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); openModal(bill) }}
                        className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl bg-accent-primary/10 text-accent-primary hover:bg-accent-primary/20 transition-colors"
                      >
                        <Edit2 size={18} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">{tr('common.edit') || 'Edit'}</span>
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(bill.id) }}
                        className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl bg-danger/10 text-danger hover:bg-danger/20 transition-colors"
                      >
                        <Trash2 size={18} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">{tr('common.delete') || 'Delete'}</span>
                      </button>
                    </div>
                  )}
                </AnimatedCard>
              )
            })
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="modal-content p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold tracking-tight text-primary">
                {editingBill ? (tr('bills.edit_bill') || 'Edit Bill') : (tr('bills.add_bill') || 'New Bill')}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-secondary hover:text-primary transition-colors p-1">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="flex gap-4">
                <button
                  type="button"
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0 bg-[var(--overlay)] border border-[var(--border)]"
                >
                  {icon}
                </button>
                <div className="flex-1 space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-secondary">{tr('bills.name') || 'Name'}</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Visa, Rent"
                    className="input-minimal w-full"
                    autoFocus
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-secondary">{tr('bills.due_day') || 'Due Date (1-31)'}</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    required
                    value={dueDay}
                    onChange={e => setDueDay(parseInt(e.target.value) || 1)}
                    className="input-minimal w-full"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-secondary">{tr('bills.amount') || 'Amount'} (Opt)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="input-minimal w-full"
                  />
                </div>
              </div>

              <div className="surface-elevated-interactive py-3 px-4 flex items-center justify-between cursor-pointer" onClick={() => setAutoRemind(!autoRemind)}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${autoRemind ? 'bg-accent-primary/20 text-accent-primary' : 'bg-white/5 text-secondary'}`}>
                    {autoRemind ? <Bell size={18} /> : <BellOff size={18} />}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-primary">{tr('bills.remind') || 'Auto-Remind'}</p>
                    <p className="text-[10px] text-secondary">{tr('bills.remind_desc') || '3 days before due'}</p>
                  </div>
                </div>
                <div className={`w-12 h-7 rounded-full p-1 flex items-center transition-all bg-[var(--overlay)] border border-[var(--border)]`} style={{ background: autoRemind ? 'var(--accent-primary)' : '' }}>
                  <div className="w-5 h-5 rounded-full bg-white shadow-sm transition-transform" style={{ transform: autoRemind ? 'translateX(20px)' : 'translateX(0)' }} />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-[var(--border)] font-bold text-sm text-primary transition-colors"
                >
                  {tr('common.cancel') || 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={saving || !name}
                  className="btn-apple-primary flex-1 py-3"
                >
                  {saving ? tr('common.loading') : tr('common.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
