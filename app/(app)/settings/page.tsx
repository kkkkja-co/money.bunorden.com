'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { BunordenFooter } from '@/components/layout/BunordenFooter'
import { useTheme } from '@/app/providers'
import {
  Sun, Moon, LogOut, Trash2, Download, Shield, Mail,
  Scale, ChevronRight, User, AlertTriangle, X
} from 'lucide-react'
import Link from 'next/link'

export default function SettingsPage() {
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()
  const [email, setEmail] = useState('')
  const [profileName, setProfileName] = useState('')
  const [currency, setCurrency] = useState('HKD')
  const [loading, setLoading] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [showExportModal, setShowExportModal] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [toast, setToast] = useState('')

  const fetchProfile = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    setEmail(user.email || '')

    const { data } = await supabase
      .from('profiles')
      .select('display_name, currency')
      .eq('id', user.id)
      .single()

    if (data) {
      setProfileName(data.display_name || '')
      setCurrency(data.currency || 'HKD')
    }
  }, [router])

  useEffect(() => { fetchProfile() }, [fetchProfile])

  const handleLogout = async () => {
    setLoading(true)
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleUpdateProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase
      .from('profiles')
      .update({ display_name: profileName || null, currency })
      .eq('id', user.id)

    setToast('Profile updated')
    setTimeout(() => setToast(''), 3000)
  }

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmNewPassword) {
      setToast('Passwords do not match')
      setTimeout(() => setToast(''), 3000)
      return
    }

    const hasUpperCase = /[A-Z]/.test(newPassword)
    const hasLowerCase = /[a-z]/.test(newPassword)
    const hasNumber = /[0-9]/.test(newPassword)
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword)
    const isLongEnough = newPassword.length >= 8

    if (!isLongEnough || !hasUpperCase || !hasLowerCase || !hasNumber || !hasSymbol) {
      setToast('Password does not meet requirements')
      setTimeout(() => setToast(''), 3000)
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      setToast('Password updated successfully')
      setNewPassword('')
      setConfirmNewPassword('')
    } catch (err: any) {
      setToast(err.message || 'Error updating password')
    } finally {
      setLoading(false)
      setTimeout(() => setToast(''), 3000)
    }
  }

  const handleExport = async (format: 'json' | 'csv') => {
    setExporting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('transactions')
        .select('type, amount, currency, date, note, category:categories(name)')
        .eq('user_id', user.id)
        .order('date', { ascending: false })

      if (!data) return

      let content: string
      let filename: string
      let mimeType: string

      if (format === 'json') {
        const mapped = (data || []).map((t: any) => ({
          ...t,
          category: Array.isArray(t.category) ? t.category[0] || null : t.category,
        }))
        content = JSON.stringify(mapped, null, 2)
        filename = `ledger-export-${new Date().toISOString().split('T')[0]}.json`
        mimeType = 'application/json'
      } else {
        const header = 'Date,Type,Amount,Currency,Category,Note\n'
        const rows = data.map((t: any) => {
          const category = Array.isArray(t.category) ? t.category[0] : t.category
          return `${t.date},${t.type},${t.amount},${t.currency},"${category?.name || ''}","${t.note || ''}"`
        }).join('\n')
        content = header + rows
        filename = `ledger-export-${new Date().toISOString().split('T')[0]}.csv`
        mimeType = 'text/csv'
      }

      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)

      setShowExportModal(false)
      setToast(`Exported as ${format.toUpperCase()}`)
      setTimeout(() => setToast(''), 3000)
    } catch (err) {
      console.error('Export error:', err)
    } finally {
      setExporting(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') return
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Delete all user data (cascade will handle related tables)
      await supabase.from('profiles').delete().eq('id', user.id)
      await supabase.auth.signOut()
      router.push('/login')
    } catch (err) {
      console.error('Delete account error:', err)
    } finally {
      setLoading(false)
    }
  }

  const SettingsItem = ({
    icon: Icon,
    label,
    sublabel,
    right,
    onClick,
    danger = false,
  }: {
    icon: typeof Sun
    label: string
    sublabel?: string
    right?: React.ReactNode
    onClick?: () => void
    danger?: boolean
  }) => (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 py-4 px-4 rounded-xl text-left"
      style={{
        background: 'var(--overlay)',
        border: '1px solid var(--border)',
        transition: 'all 0.2s',
        color: danger ? 'var(--danger)' : 'var(--text-primary)',
      }}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{
          background: danger ? 'var(--danger-bg)' : 'rgba(59, 130, 246, 0.1)',
          color: danger ? 'var(--danger)' : 'var(--accent-primary)',
        }}
      >
        <Icon size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{label}</p>
        {sublabel && <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{sublabel}</p>}
      </div>
      {right || <ChevronRight size={16} style={{ color: 'var(--text-tertiary)' }} />}
    </button>
  )

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 px-4 lg:px-8 py-6 lg:py-8 max-w-2xl mx-auto w-full">
        <h1 className="text-3xl font-bold tracking-tight mb-8 animate-fade-up" style={{ color: 'var(--text-primary)' }}>
          Settings
        </h1>

        {/* Profile Section */}
        <div className="mb-6 animate-fade-up delay-1">
          <h2 className="text-sm font-semibold mb-3 px-1" style={{ color: 'var(--text-tertiary)' }}>
            PROFILE
          </h2>
          <div className="glass-card space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-tertiary)' }}>
                Display Name
              </label>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="Your name"
                className="input-glass"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-tertiary)' }}>
                Email
              </label>
              <p className="text-sm font-medium px-1" style={{ color: 'var(--text-secondary)' }}>{email}</p>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-tertiary)' }}>
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="input-glass"
              >
                {['HKD', 'USD', 'EUR', 'GBP', 'JPY', 'CNY', 'MYR', 'SGD', 'TWD', 'KRW', 'AUD', 'CAD'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <button onClick={handleUpdateProfile} className="btn-primary-gradient w-full py-3 text-sm">
              Save Changes
            </button>
          </div>
        </div>

        {/* Security Section */}
        <div className="mb-6 animate-fade-up delay-2">
          <h2 className="text-sm font-semibold mb-3 px-1" style={{ color: 'var(--text-tertiary)' }}>
            SECURITY
          </h2>
          <div className="glass-card space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-tertiary)' }}>
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="input-glass"
              />
              
              {/* Requirements indicator (same as signup) */}
              <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 px-1 py-1">
                {[
                  { label: '8+ Characters', met: newPassword.length >= 8 },
                  { label: 'Uppercase', met: /[A-Z]/.test(newPassword) },
                  { label: 'Lowercase', met: /[a-z]/.test(newPassword) },
                  { label: 'Digit & Symbol', met: /[0-9]/.test(newPassword) && /[!@#$%^&*(),.?":{}|<>]/.test(newPassword) },
                ].map((req, i) => (
                  <div key={i} className="flex items-center gap-1.5 transition-all">
                    <div 
                      className="w-1.5 h-1.5 rounded-full transition-colors" 
                      style={{ background: req.met ? 'var(--success)' : 'var(--overlay)' }} 
                    />
                    <span className="text-[10px] uppercase tracking-wider font-bold" style={{ color: req.met ? 'var(--text-secondary)' : 'var(--text-tertiary)' }}>
                      {req.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-tertiary)' }}>
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="••••••••"
                className="input-glass"
              />
            </div>
            <button 
              onClick={handleUpdatePassword} 
              disabled={!newPassword || loading}
              className="btn-secondary-glass w-full py-3 text-sm"
              style={{ opacity: !newPassword ? 0.5 : 1 }}
            >
              Update Password
            </button>
          </div>
        </div>

        {/* Appearance */}
        <div className="mb-6 animate-fade-up delay-3">
          <h2 className="text-sm font-semibold mb-3 px-1" style={{ color: 'var(--text-tertiary)' }}>
            APPEARANCE
          </h2>
          <div className="space-y-2">
            <SettingsItem
              icon={theme === 'dark' ? Moon : Sun}
              label="Theme"
              sublabel={`Currently ${theme} mode`}
              onClick={toggleTheme}
              right={
                <div
                  className="w-12 h-7 rounded-full p-1 flex items-center"
                  style={{
                    background: theme === 'dark' ? 'var(--accent-primary)' : 'var(--overlay)',
                    border: '1px solid var(--border)',
                    transition: 'all 0.3s',
                  }}
                >
                  <div
                    className="w-5 h-5 rounded-full"
                    style={{
                      background: 'var(--text-primary)',
                      transform: theme === 'dark' ? 'translateX(20px)' : 'translateX(0)',
                      transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                  />
                </div>
              }
            />
          </div>
        </div>

        {/* Data */}
        <div className="mb-6 animate-fade-up delay-4">
          <h2 className="text-sm font-semibold mb-3 px-1" style={{ color: 'var(--text-tertiary)' }}>
            DATA
          </h2>
          <div className="space-y-2">
            <SettingsItem
              icon={Download}
              label="Export Data"
              sublabel="Download your data as JSON or CSV"
              onClick={() => setShowExportModal(true)}
            />
          </div>
        </div>

        {/* Legal */}
        <div className="mb-6 animate-fade-up delay-5">
          <h2 className="text-sm font-semibold mb-3 px-1" style={{ color: 'var(--text-tertiary)' }}>
            LEGAL
          </h2>
          <div className="space-y-2">
            <Link href="/privacy">
              <SettingsItem icon={Shield} label="Privacy Policy" sublabel="How we handle your data" />
            </Link>
            <Link href="/terms">
              <SettingsItem icon={Scale} label="Terms of Use" sublabel="Rules and guidelines" />
            </Link>
            <Link href="/contact">
              <SettingsItem icon={Mail} label="Contact Us" sublabel="contact@bunorden.com" />
            </Link>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="mb-6 animate-fade-up delay-6">
          <h2 className="text-sm font-semibold mb-3 px-1" style={{ color: 'var(--danger)' }}>
            DANGER ZONE
          </h2>
          <div className="space-y-2">
            <SettingsItem
              icon={LogOut}
              label="Sign Out"
              onClick={handleLogout}
              danger
            />
            <SettingsItem
              icon={Trash2}
              label="Delete Account"
              sublabel="Permanently delete all your data"
              onClick={() => setShowDeleteModal(true)}
              danger
            />
          </div>
        </div>
      </div>

      <BunordenFooter />

      {/* Export Modal */}
      {showExportModal && (
        <div className="modal-overlay" onClick={() => setShowExportModal(false)}>
          <div className="modal-content p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Export Data</h3>
              <button onClick={() => setShowExportModal(false)} className="p-1" style={{ color: 'var(--text-tertiary)' }}>
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => handleExport('json')}
                disabled={exporting}
                className="btn-secondary-glass w-full flex items-center justify-center gap-2 py-4"
              >
                <Download size={18} /> Export as JSON
              </button>
              <button
                onClick={() => handleExport('csv')}
                disabled={exporting}
                className="btn-secondary-glass w-full flex items-center justify-center gap-2 py-4"
              >
                <Download size={18} /> Export as CSV
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content p-6" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{ background: 'var(--danger-bg)' }}>
                <AlertTriangle size={24} style={{ color: 'var(--danger)' }} />
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                Delete Account Forever?
              </h3>
              <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                This will permanently delete your account and all your data. This action cannot be undone.
              </p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Type <strong>DELETE</strong> to confirm
              </label>
              <input
                type="text"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder="DELETE"
                className="input-glass"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setShowDeleteModal(false); setDeleteConfirm('') }} className="btn-secondary-glass flex-1 py-3">
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirm !== 'DELETE' || loading}
                className="btn-danger-glass flex-1 py-3"
                style={{ opacity: deleteConfirm !== 'DELETE' ? 0.4 : 1 }}
              >
                {loading ? 'Deleting...' : 'Delete Forever'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast toast-success">{toast}</div>}
    </div>
  )
}
