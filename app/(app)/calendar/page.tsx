'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useTranslation, useLanguage } from '@/app/providers'
import { AnimatedCard } from '@/components/ui/AnimatedCard'
import { PageSkeleton } from '@/components/ui/PageSkeleton'
import { ChevronLeft, ChevronRight, X, Calendar as CalendarIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default function CalendarPage() {
  const router = useRouter()
  const { t: tr, language } = useTranslation()
  const isZh = language === 'zh-TW'
  
  const [transactions, setTransactions] = useState<any[]>([])
  const [bills, setBills] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currency, setCurrency] = useState('HKD')
  
  const [currentDate, setCurrentDate] = useState(() => new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: profile } = await supabase.from('profiles').select('currency').eq('id', user.id).single()
      if (profile) setCurrency(profile.currency)

      // Fetch ALL transactions for this month (we could filter by date, but getting more is okay for caching)
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
      
      // format to YYYY-MM-DD
      const startStr = `${startOfMonth.getFullYear()}-${String(startOfMonth.getMonth() + 1).padStart(2, '0')}-01`
      const endStr = `${endOfMonth.getFullYear()}-${String(endOfMonth.getMonth() + 1).padStart(2, '0')}-${String(endOfMonth.getDate()).padStart(2, '0')}`

      const [{ data: txs }, { data: billsData }] = await Promise.all([
        supabase
          .from('transactions')
          .select('id, type, amount, date, note, category:categories(name, icon)')
          .eq('user_id', user.id)
          .gte('date', startStr)
          .lte('date', endStr),
        supabase
          .from('bills')
          .select('id, name, icon, due_day, amount, is_active')
          .eq('user_id', user.id)
          .eq('is_active', true)
      ])

      setTransactions((txs || []).map(t => ({
        ...t,
        category: Array.isArray(t.category) ? t.category[0] : t.category
      })))
      
      setBills(billsData || [])
    } finally {
      setLoading(false)
    }
  }, [currentDate, router])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  const goToday = () => {
    setCurrentDate(new Date())
    setSelectedDate(new Date()) // Open detail sheet for today
  }

  // Calendar logic
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()
  
  // Adjust so Monday is 0, Sunday is 6
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1
  
  const weekDays = isZh 
    ? ['一', '二', '三', '四', '五', '六', '日']
    : ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

  // Group transactions by date string (YYYY-MM-DD)
  const txByDate = useMemo(() => {
    const map = new Map<string, any[]>()
    transactions.forEach(tx => {
      if (!map.has(tx.date)) map.set(tx.date, [])
      map.get(tx.date)!.push(tx)
    })
    return map
  }, [transactions])

  const renderCell = (day: number) => {
    if (day <= 0 || day > daysInMonth) {
      return <div key={`empty-${day}`} className="h-20 sm:h-24 opacity-20" />
    }

    const cellDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    const dateStr = `${cellDate.getFullYear()}-${String(cellDate.getMonth() + 1).padStart(2, '0')}-${String(cellDate.getDate()).padStart(2, '0')}`
    
    const dayTxs = txByDate.get(dateStr) || []
    const dayBills = bills.filter(b => b.due_day === day)
    
    // Calculate totals for tooltip/preview
    const income = dayTxs.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
    const expense = dayTxs.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)

    const isToday = process.env.NODE_ENV !== 'production' ? false : new Date().toDateString() === cellDate.toDateString()
    const irlToday = new Date().toDateString() === cellDate.toDateString() // Override for dev check
    
    return (
      <button
        key={`day-${day}`}
        onClick={() => setSelectedDate(cellDate)}
        className={`h-20 sm:h-24 relative p-1.5 flex flex-col items-center border border-[var(--border-subtle)] transition-all hover:bg-[var(--overlay)]
          ${irlToday ? 'bg-[var(--accent-primary)]/10 border-[var(--accent-primary)]/30' : 'bg-[var(--bg-secondary)]'}
        `}
      >
        <span className={`text-sm font-bold ${irlToday ? 'text-accent-primary' : 'text-primary'}`}>
          {day}
        </span>
        
        {/* Indicators */}
        <div className="flex flex-col gap-1 w-full mt-auto items-center">
          {/* Bills */}
          {dayBills.length > 0 && (
            <div className="flex gap-0.5 justify-center">
              {dayBills.slice(0, 3).map((_, i) => <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#0a84ff]" />)}
            </div>
          )}
          {/* Transactions */}
          <div className="flex gap-1 justify-center w-full">
            {income > 0 && <div className="w-2 h-2 rounded-full shadow-[0_0_8px_rgba(52,199,89,0.4)]" style={{ background: 'var(--success)' }} />}
            {expense > 0 && <div className="w-2 h-2 rounded-full shadow-[0_0_8px_rgba(255,59,48,0.4)]" style={{ background: 'var(--danger)' }} />}
          </div>
          {/* Amount hint on desktop */}
          <div className="hidden sm:block text-[8px] font-black tracking-widest uppercase opacity-40 mt-1 truncate w-full text-center">
             {expense > 0 && `-${Math.round(expense)}`}
          </div>
        </div>
      </button>
    )
  }

  if (loading) return <PageSkeleton />

  const monthName = currentDate.toLocaleString(isZh ? 'zh-TW' : 'en-US', { month: 'long', year: 'numeric' })
  
  // Prepare data for the selected date sheet
  const selectedDateStr = selectedDate 
    ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`
    : ''
  const selectedTxs = txByDate.get(selectedDateStr) || []
  const selectedBills = selectedDate ? bills.filter(b => b.due_day === selectedDate.getDate()) : []

  return (
    <div className="flex flex-col min-h-screen pb-24">
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-8 py-8 md:py-12">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary animate-slide-up">
              {isZh ? '行事曆' : 'Calendar'}
            </h1>
          </div>
          <button 
            onClick={goToday}
            className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-[var(--overlay)] border border-[var(--border)] text-primary hover:bg-white/10 transition-colors animate-scale-in delay-1"
          >
            {isZh ? '今天' : 'Today'}
          </button>
        </header>

        <AnimatedCard delay={2} direction="up" className="surface-elevated overflow-hidden border border-[var(--border)]">
          {/* Calendar Header */}
          <div className="flex items-center justify-between p-4 border-b border-[var(--border)] bg-black/20">
            <h2 className="text-xl font-bold text-primary">{monthName}</h2>
            <div className="flex gap-2">
              <button onClick={prevMonth} className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--overlay)] hover:bg-white/10 transition-colors">
                <ChevronLeft size={20} />
              </button>
              <button onClick={nextMonth} className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--overlay)] hover:bg-white/10 transition-colors">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* Weekdays */}
          <div className="grid grid-cols-7 border-b border-[var(--border)]">
            {weekDays.map(day => (
              <div key={day} className="py-2 text-center text-[10px] font-black uppercase tracking-widest text-secondary">
                {day}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-7">
            {Array.from({ length: startOffset }).map((_, i) => renderCell(0 - i))}
            {Array.from({ length: daysInMonth }).map((_, i) => renderCell(i + 1))}
            {/* Fill remaining cells in the last row */}
            {Array.from({ length: (7 - ((startOffset + daysInMonth) % 7)) % 7 }).map((_, i) => renderCell(daysInMonth + i + 1))}
          </div>
        </AnimatedCard>

        {/* Selected Date Bottom Sheet */}
        {selectedDate && (
          <div className="modal-overlay z-50 p-4 sm:p-0 items-end sm:items-center" onClick={() => setSelectedDate(null)}>
            <div 
              className="w-full max-w-md bg-[var(--bg-elevated)] border border-[var(--border)] rounded-3xl p-6 relative overflow-hidden shadow-2xl modal-content" 
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-accent-primary/10 flex items-center justify-center border border-accent-primary/20">
                    <span className="text-xl font-bold text-accent-primary">{selectedDate.getDate()}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-primary">
                      {selectedDate.toLocaleString(isZh ? 'zh-TW' : 'en-US', { weekday: 'long' })}
                    </h3>
                    <p className="text-xs text-secondary">
                      {selectedDate.toLocaleString(isZh ? 'zh-TW' : 'en-US', { month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <button onClick={() => setSelectedDate(null)} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-secondary">
                  <X size={20} />
                </button>
              </div>

              {selectedBills.length === 0 && selectedTxs.length === 0 ? (
                <div className="py-12 text-center">
                  <CalendarIcon size={40} className="mx-auto text-secondary opacity-30 mb-3" />
                  <p className="text-sm font-bold text-secondary">{isZh ? '這天沒有紀錄' : 'No records for this day'}</p>
                </div>
              ) : (
                <div className="space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                  {/* Bills Due */}
                  {selectedBills.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-[#0a84ff] mb-2 pl-1 border-l-2 border-[#0a84ff]">
                        {isZh ? '帳單到期' : 'Bills Due'}
                      </h4>
                      <div className="space-y-2">
                        {selectedBills.map(bill => (
                          <div key={bill.id} className="flex flex-col gap-1 p-3 rounded-xl bg-[#0a84ff]/5 border border-[#0a84ff]/20">
                            <div className="flex items-center justify-between">
                              <span className="font-bold flex items-center gap-2 text-primary">{bill.icon} {bill.name}</span>
                              <span className="font-bold text-[#0a84ff]">{bill.amount ? formatCurrency(bill.amount, currency) : '--'}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Transactions */}
                  {selectedTxs.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-secondary mb-2 pl-1">
                        {isZh ? '交易紀錄' : 'Transactions'}
                      </h4>
                      <div className="space-y-2">
                        {selectedTxs.map(tx => (
                          <button
                            key={tx.id}
                            onClick={() => router.push(`/add?id=${tx.id}`)}
                            className="w-full flex items-center justify-between p-3 rounded-xl bg-[var(--overlay)] border border-[var(--border)] hover:border-[var(--accent-primary)] transition-colors text-left"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                                {tx.category?.icon || (tx.type === 'income' ? '💰' : '💸')}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-sm text-primary truncate max-w-[120px] sm:max-w-[150px]">
                                  {tx.category?.name || tx.note || tx.type}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {tx.type === 'income' ? <ArrowUpRight size={14} className="text-success" /> : <ArrowDownRight size={14} className="text-danger" />}
                              <p className={`font-bold text-sm ${tx.type === 'income' ? 'text-success' : 'text-danger'}`}>
                                {formatCurrency(Math.abs(tx.amount), currency)}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
