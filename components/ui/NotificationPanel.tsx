'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Bell, X, Check, UserPlus, AlertCircle, RefreshCw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase/client'
import { useTranslation } from '@/app/providers'

interface Notification {
  id: string
  type: 'invite' | 'alert' | 'budget' | 'system'
  title: string
  message: string
  status: 'pending' | 'accepted' | 'declined' | 'read'
  created_at: string
  sender_id: string | null
  metadata: {
    session_id?: string
    session_name?: string
    session_emoji?: string
    session_type?: string
  }
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  if (diff < 60_000) return 'Just now'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`
  return `${Math.floor(diff / 86_400_000)}d ago`
}

export function NotificationPanel() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [actionId, setActionId] = useState<string | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const pendingCount = notifications.filter(n => n.status === 'pending').length

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['pending', 'accepted', 'declined'])
        .order('created_at', { ascending: false })
        .limit(20)

      if (!error && data) {
        setNotifications(data.map((n: any) => ({
          id: n.id,
          type: n.type,
          title: n.title,
          message: n.message,
          status: n.status,
          created_at: n.created_at,
          sender_id: n.sender_id,
          metadata: n.metadata ?? {},
        })))
      }
    } catch (err) {
      console.error('Fetch notifications error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch on mount and when panel opens
  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  useEffect(() => {
    if (open) fetchNotifications()
  }, [open, fetchNotifications])

  // Real-time subscription
  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      channel = supabase
        .channel('notifications-realtime')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          () => { fetchNotifications() }
        )
        .subscribe()
    })

    return () => {
      if (channel) supabase.removeChannel(channel)
    }
  }, [fetchNotifications])

  const handleAction = async (notif: Notification, action: 'accepted' | 'declined') => {
    setActionId(notif.id)
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ status: action })
        .eq('id', notif.id)

      if (error) throw error

      setNotifications(prev =>
        prev.map(n => n.id === notif.id ? { ...n, status: action } : n)
      )
    } catch (err) {
      console.error('Notification action error:', err)
    } finally {
      setActionId(null)
    }
  }

  const handleDismiss = async (id: string) => {
    try {
      await supabase.from('notifications').update({ status: 'read' }).eq('id', id)
      setNotifications(prev => prev.filter(n => n.id !== id))
    } catch (err) {
      console.error('Dismiss error:', err)
    }
  }

  const unreadInvites = notifications.filter(n => n.type === 'invite' && n.status === 'pending')
  const otherNotifs = notifications.filter(n => !(n.type === 'invite' && n.status === 'pending'))

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen(prev => !prev)}
        className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:bg-white/8 active:scale-90"
        style={{ color: open ? 'var(--accent-primary)' : 'var(--text-secondary)' }}
        aria-label="Notifications"
        id="notification-bell"
      >
        <Bell size={18} strokeWidth={open ? 2.5 : 2} />
        {pendingCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-[var(--danger)] text-white text-[9px] font-black px-1"
          >
            {pendingCount > 9 ? '9+' : pendingCount}
          </motion.span>
        )}
      </button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="absolute right-0 top-12 w-80 max-h-[480px] overflow-y-auto rounded-[24px] shadow-[0_32px_96px_-12px_rgba(0,0,0,0.8)] border border-white/10 z-[500]"
            style={{ background: 'var(--bg-elevated)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <Bell size={14} className="text-[var(--accent-primary)]" />
                <span className="text-sm font-bold text-primary">Notifications</span>
                {pendingCount > 0 && (
                  <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-[var(--danger)]/10 text-[var(--danger)]">
                    {pendingCount} pending
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={fetchNotifications}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-secondary hover:bg-white/8 transition-colors"
                  aria-label="Refresh"
                >
                  <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-secondary hover:bg-white/8 transition-colors"
                  aria-label="Close"
                >
                  <X size={13} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-3 space-y-2">
              {/* Pending invites */}
              {unreadInvites.length > 0 && (
                <>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] px-2 pt-1">
                    Invitations
                  </p>
                  {unreadInvites.map(notif => (
                    <motion.div
                      key={notif.id}
                      layout
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 12, height: 0 }}
                      className="rounded-2xl p-4 border border-[var(--accent-primary)]/20 bg-[var(--accent-primary)]/5 relative"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-9 h-9 rounded-xl bg-[var(--accent-primary)]/15 flex items-center justify-center flex-shrink-0">
                          <span className="text-lg">
                            {notif.metadata.session_emoji ?? '📋'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-primary truncate">{notif.title}</p>
                          <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed mt-0.5">
                            {notif.message}
                          </p>
                          <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-tertiary)] mt-1">
                            {timeAgo(notif.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAction(notif, 'declined')}
                          disabled={actionId === notif.id}
                          className="flex-1 py-2 rounded-xl border border-[var(--border)] text-[11px] font-black uppercase tracking-wider text-[var(--text-secondary)] hover:bg-white/5 transition-colors disabled:opacity-40"
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => handleAction(notif, 'accepted')}
                          disabled={actionId === notif.id}
                          className="flex-1 py-2 rounded-xl bg-[var(--accent-primary)] text-white text-[11px] font-black uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-1.5"
                        >
                          <Check size={11} strokeWidth={3} /> Accept
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </>
              )}

              {/* Other notifications */}
              {otherNotifs.length > 0 && (
                <>
                  {unreadInvites.length > 0 && (
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)] px-2 pt-2">
                      Recent
                    </p>
                  )}
                  {otherNotifs.map(notif => (
                    <motion.div
                      key={notif.id}
                      layout
                      className="flex items-start gap-3 rounded-2xl p-3.5 bg-white/3 hover:bg-white/6 transition-colors group relative"
                    >
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-white/5">
                        {notif.type === 'invite'
                          ? <UserPlus size={14} className="text-[var(--accent-primary)]" />
                          : <AlertCircle size={14} className="text-[var(--text-secondary)]" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <p className="text-xs font-bold text-primary truncate">{notif.title}</p>
                          <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md flex-shrink-0 ${
                            notif.status === 'accepted'
                              ? 'bg-[var(--success)]/10 text-[var(--success)]'
                              : notif.status === 'declined'
                              ? 'bg-[var(--danger)]/10 text-[var(--danger)]'
                              : 'bg-white/5 text-[var(--text-tertiary)]'
                          }`}>
                            {notif.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed">{notif.message}</p>
                        <p className="text-[9px] text-[var(--text-tertiary)] mt-1">{timeAgo(notif.created_at)}</p>
                      </div>
                      <button
                        onClick={() => handleDismiss(notif.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2 w-5 h-5 rounded-md flex items-center justify-center text-secondary hover:text-primary"
                      >
                        <X size={11} />
                      </button>
                    </motion.div>
                  ))}
                </>
              )}

              {/* Empty state */}
              {notifications.length === 0 && !loading && (
                <div className="text-center py-10">
                  <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                    <Bell size={22} className="text-[var(--text-tertiary)]" />
                  </div>
                  <p className="text-sm font-bold text-[var(--text-secondary)]">All caught up</p>
                  <p className="text-[10px] text-[var(--text-tertiary)] mt-1">No notifications yet</p>
                </div>
              )}

              {loading && notifications.length === 0 && (
                <div className="space-y-2 p-1">
                  {[1, 2].map(i => (
                    <div key={i} className="skeleton h-20 rounded-2xl" />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
