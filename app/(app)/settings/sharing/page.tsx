'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useTranslation } from '@/app/providers'
import { ChevronLeft, Users, Trash2, Mail, Check, X, Loader2, Plus } from 'lucide-react'
import Link from 'next/link'

interface SharedSession {
  id: string
  name: string
  emoji: string
  type: string
  owner_id: string
  recipients: Array<{
    notif_id: string
    email: string
    status: 'pending' | 'accepted'
  }>
}

export default function SharingPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const [sessions, setSessions] = useState<SharedSession[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [shareEmail, setShareEmail] = useState('')
  const [selectedSession, setSelectedSession] = useState<string | null>(null)
  const [sharing, setSharing] = useState(false)

  const fetchSessions = useCallback(async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch all sessions created by the user
      const { data: userSessions } = await supabase
        .from('split_sessions')
        .select('id, name, emoji, type, user_id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (!userSessions) {
        setSessions([])
        return
      }

      // For each session, fetch pending and accepted invites
      const sessionsWithRecipients = await Promise.all(
        (userSessions || []).map(async (session) => {
          const { data: invites } = await supabase
            .from('notifications')
            .select('id, status, metadata')
            .eq('type', 'invite')
            .eq('sender_id', user.id)
            .in('status', ['pending', 'accepted'])

          // Filter invites for this session
          const sessionInvites = (invites || []).filter(
            (inv: any) => inv.metadata?.session_id === session.id
          )

          // Get recipient emails for this session's invites
          const recipients = await Promise.all(
            sessionInvites.map(async (inv: any) => {
              const recipientId = inv.metadata?.recipient_id
              if (!recipientId) return null

              const { data: userData } = await supabase
                .from('user_emails')
                .select('email')
                .eq('id', recipientId)
                .maybeSingle()

              return {
                notif_id: inv.id,
                email: userData?.email || 'Unknown',
                status: inv.status as 'pending' | 'accepted'
              }
            })
          )

          return {
            id: session.id,
            name: session.name,
            emoji: session.emoji,
            type: session.type,
            owner_id: session.user_id,
            recipients: recipients.filter(r => r !== null) as Array<{ notif_id: string; email: string; status: 'pending' | 'accepted' }>
          }
        })
      )

      setSessions(sessionsWithRecipients)
    } catch (err) {
      console.error('Fetch sessions error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  const handleShare = async () => {
    if (!shareEmail.trim() || !selectedSession) return

    setSharing(true)
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser) return

      if (shareEmail.trim().toLowerCase() === currentUser.email?.toLowerCase()) {
        alert('You cannot invite yourself.')
        return
      }

      const { data: found, error: lookupError } = await supabase
        .from('user_emails')
        .select('id')
        .eq('email', shareEmail.trim().toLowerCase())
        .maybeSingle()

      if (lookupError || !found) {
        alert('User not found.')
        return
      }

      const session = sessions.find(s => s.id === selectedSession)
      if (!session) return

      const { error: inviteError } = await supabase.from('notifications').insert({
        user_id: found.id,
        sender_id: currentUser.id,
        type: 'invite',
        title: `${currentUser.email?.split('@')[0] ?? 'Someone'} invited you`,
        message: `You have been invited to join "${session.name}". Accept to view and collaborate on expenses.`,
        metadata: {
          session_id: selectedSession,
          session_name: session.name,
          session_emoji: session.emoji,
          session_type: session.type,
          recipient_id: found.id
        }
      })

      if (inviteError) throw inviteError

      setShareEmail('')
      setSelectedSession(null)
      alert('Invitation sent!')
      fetchSessions()
    } catch (err) {
      console.error('Share error:', err)
      alert('Failed to send invitation.')
    } finally {
      setSharing(false)
    }
  }

  const handleRemoveShare = async (notifId: string) => {
    if (!confirm('Remove this person from the project?')) return

    setDeleting(notifId)
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notifId)

      if (error) throw error

      fetchSessions()
    } catch (err) {
      console.error('Remove share error:', err)
      alert('Failed to remove access.')
    } finally {
      setDeleting(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-accent-primary" size={24} />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 max-w-2xl mx-auto w-full px-5 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-white/8 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-primary">Manage Sharing</h1>
            <p className="text-xs text-secondary mt-1 uppercase tracking-widest font-black">Projects & Collaborators</p>
          </div>
        </div>

        {sessions.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <Users size={24} className="text-secondary" />
            </div>
            <p className="text-sm font-bold text-primary mb-2">No shared projects yet</p>
            <p className="text-xs text-secondary">Go to Split & Travel to create and share projects.</p>
            <Link
              href="/split"
              className="inline-block mt-4 px-6 py-2 rounded-xl bg-accent-primary text-white text-xs font-black uppercase tracking-wider hover:opacity-90 transition-opacity"
            >
              Go to Projects
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map(session => (
              <div
                key={session.id}
                className="rounded-2xl p-5 border border-white/10 bg-white/3 space-y-4"
              >
                {/* Session Header */}
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{session.emoji}</span>
                  <div className="flex-1">
                    <p className="font-bold text-primary">{session.name}</p>
                    <p className="text-[9px] text-secondary uppercase tracking-widest font-black mt-1">
                      {session.type.toUpperCase()}
                    </p>
                  </div>
                </div>

                {/* Recipients List */}
                {session.recipients.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-secondary px-1">
                      Shared With ({session.recipients.length})
                    </p>
                    {session.recipients.map((recipient, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-xl bg-white/5"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Mail size={14} className="text-secondary flex-shrink-0" />
                          <span className="text-sm text-primary truncate">{recipient.email}</span>
                          {recipient.status === 'accepted' ? (
                            <Check size={14} className="text-green-500 flex-shrink-0" />
                          ) : (
                            <span className="text-[9px] text-yellow-500 uppercase font-black flex-shrink-0">
                              Pending
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => handleRemoveShare(recipient.notif_id)}
                          disabled={deleting === recipient.notif_id}
                          className="ml-2 p-2 rounded-lg hover:bg-danger/10 text-danger transition-colors disabled:opacity-50"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}

                {/* Add Collaborator */}
                {selectedSession === session.id ? (
                  <div className="p-3 rounded-xl bg-accent-primary/10 border border-accent-primary/20 space-y-2">
                    <input
                      type="email"
                      value={shareEmail}
                      onChange={(e) => setShareEmail(e.target.value)}
                      placeholder="Enter email address"
                      className="w-full input-minimal px-3 py-2 text-sm"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleShare}
                        disabled={sharing || !shareEmail.trim()}
                        className="flex-1 py-2 rounded-xl bg-accent-primary text-white text-xs font-black uppercase tracking-wider hover:opacity-90 disabled:opacity-50 transition-opacity"
                      >
                        {sharing ? <Loader2 className="inline animate-spin mr-1" size={12} /> : null}
                        Send Invite
                      </button>
                      <button
                        onClick={() => {
                          setSelectedSession(null)
                          setShareEmail('')
                        }}
                        className="px-4 py-2 rounded-xl border border-white/20 text-secondary text-xs font-black uppercase tracking-wider hover:bg-white/5 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setSelectedSession(session.id)}
                    className="w-full py-2.5 rounded-xl border border-accent-primary/30 text-accent-primary text-xs font-black uppercase tracking-wider hover:bg-accent-primary/10 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus size={14} />
                    Add Collaborator
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
