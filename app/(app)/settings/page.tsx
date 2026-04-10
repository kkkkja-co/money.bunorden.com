'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { BunordenFooter } from '@/components/layout/BunordenFooter'
import { useTheme, useTranslation, useLanguage } from '@/app/providers'
import {
  Sun, Moon, LogOut, Trash2, Download, Shield, Mail,
  Scale, ChevronRight, User, AlertTriangle, X, Globe,
  ArrowLeftRight, LayoutGrid
} from 'lucide-react'
import Link from 'next/link'
import { Language } from '@/lib/i18n/translations'

export default function SettingsPage() {
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()
  const { t } = useTranslation()
  const { language, setLanguage } = useLanguage()
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
  
  // MFA States
  const [mfaFactors, setMfaFactors] = useState<any[]>([])
  const [showMfaModal, setShowMfaModal] = useState(false)
  const [mfaEnrollData, setMfaEnrollData] = useState<any>(null)
  const [mfaVerifyCode, setMfaVerifyCode] = useState('')
  const [mfaProcessing, setMfaProcessing] = useState(false)

  const fetchProfile = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    setEmail(user.email || '')

    // Check MFA
    const { data: factors } = await supabase.auth.mfa.listFactors()
    setMfaFactors(factors?.all || [])

    const { data } = await supabase
      .from('profiles')
      .select('display_name, currency, language')
      .eq('id', user.id)
      .single()

    if (data) {
      setProfileName(data.display_name || '')
      setCurrency(data.currency || 'HKD')
    }
  }, [router])

  useEffect(() => { fetchProfile() }, [fetchProfile])

  const handleEnrollMFA = async () => {
    setMfaProcessing(true)
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp'
      })
      if (error) throw error
      setMfaEnrollData(data)
      setShowMfaModal(true)
    } catch (err: any) {
      setToast(err.message || 'MFA enrollment failed')
      setTimeout(() => setToast(''), 3000)
    } finally {
      setMfaProcessing(false)
    }
  }

  const handleVerifyMFA = async () => {
    if (!mfaEnrollData || !mfaVerifyCode) return
    setMfaProcessing(true)
    try {
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: mfaEnrollData.id
      })
      if (challengeError) throw challengeError

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: mfaEnrollData.id,
        challengeId: challengeData.id,
        code: mfaVerifyCode
      })
      if (verifyError) throw verifyError

      setToast('2FA enabled successfully')
      setShowMfaModal(false)
      setMfaEnrollData(null)
      setMfaVerifyCode('')
      fetchProfile()
    } catch (err: any) {
      setToast(err.message || 'MFA verification failed')
    } finally {
      setMfaProcessing(false)
      setTimeout(() => setToast(''), 3000)
    }
  }

  const handleUnenrollMFA = async (factorId: string) => {
    if (!confirm('Disable 2FA? This will make your account less secure.')) return
    setLoading(true)
    try {
      const { error } = await supabase.auth.mfa.unenroll({ factorId })
      if (error) throw error
      setToast('2FA disabled')
      fetchProfile()
    } catch (err: any) {
      setToast(err.message || 'Failed to disable 2FA')
    } finally {
      setLoading(false)
      setTimeout(() => setToast(''), 3000)
    }
  }

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
      .update({ display_name: profileName || null, currency, language })
      .eq('id', user.id)

    setToast(t('common.save'))
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
        filename = `clavi-export-${new Date().toISOString().split('T')[0]}.json`
        mimeType = 'application/json'
      } else {
        const header = 'Date,Type,Amount,Currency,Category,Note\n'
        const rows = data.map((t: any) => {
          const category = Array.isArray(t.category) ? t.category[0] : t.category
          return `${t.date},${t.type},${t.amount},${t.currency},"${category?.name || ''}","${t.note || ''}"`
        }).join('\n')
        content = header + rows
        filename = `clavi-export-${new Date().toISOString().split('T')[0]}.csv`
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
      setToast(`${t('settings.export_data')} ${format.toUpperCase()}`)
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
    icon: any
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
          {t('common.settings')}
        </h1>

        {/* Profile Section */}
        <div className="mb-6 animate-fade-up delay-1">
          <h2 className="text-sm font-semibold mb-3 px-1" style={{ color: 'var(--text-tertiary)' }}>
            {t('settings.profile')}
          </h2>
          <div className="glass-card space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-tertiary)' }}>
                {t('settings.display_name')}
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
                {t('settings.email')}
              </label>
              <p className="text-sm font-medium px-1" style={{ color: 'var(--text-secondary)' }}>{email}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-tertiary)' }}>
                  {t('settings.currency')}
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
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-tertiary)' }}>
                  {t('settings.language')}
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as Language)}
                  className="input-glass"
                >
                  <option value="en">English</option>
                  <option value="zh-TW">繁體中文</option>
                </select>
              </div>
            </div>
            <button onClick={handleUpdateProfile} className="btn-primary-gradient w-full py-3 text-sm">
              {t('common.save')}
            </button>
          </div>
        </div>

        {/* Security Section */}
        <div className="mb-6 animate-fade-up delay-2">
          <h2 className="text-sm font-semibold mb-3 px-1" style={{ color: 'var(--text-tertiary)' }}>
            {t('settings.security')}
          </h2>
          <div className="glass-card space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-tertiary)' }}>
                {t('settings.new_password')}
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="input-glass"
              />
              
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
                {t('settings.confirm_password')}
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
              {t('settings.update_password')}
            </button>

            <div className="pt-4 border-t border-white/5">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{t('settings.mfa_title')}</p>
                  <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{t('settings.mfa_subtitle')}</p>
                </div>
                <div 
                  className="px-2 py-1 rounded-md text-[10px] font-bold uppercase"
                  style={{ 
                    background: mfaFactors.length > 0 ? 'var(--success-bg)' : 'var(--overlay)',
                    color: mfaFactors.length > 0 ? 'var(--success)' : 'var(--text-tertiary)',
                    border: '1px solid var(--border)'
                  }}
                >
                  {mfaFactors.length > 0 ? t('settings.mfa_active') : t('settings.mfa_inactive')}
                </div>
              </div>
              
              {mfaFactors.length > 0 ? (
                <button
                  onClick={() => handleUnenrollMFA(mfaFactors[0].id)}
                  className="w-full py-3 rounded-xl text-xs font-semibold mt-2"
                  style={{ background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid rgba(255,59,48,0.2)' }}
                >
                  {t('settings.mfa_disable')}
                </button>
              ) : (
                <button
                  onClick={handleEnrollMFA}
                  disabled={mfaProcessing}
                  className="w-full py-3 rounded-xl text-xs font-semibold mt-2"
                  style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-primary)', border: '1px solid rgba(59, 130, 246, 0.2)' }}
                >
                  {mfaProcessing ? t('common.loading') : t('settings.mfa_enable')}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Management */}
        <div className="mb-6 animate-fade-up delay-2">
          <h2 className="text-sm font-semibold mb-3 px-1" style={{ color: 'var(--text-tertiary)' }}>
            {t('settings.manage')}
          </h2>
          <div className="space-y-2">
            <Link href="/settings/accounts">
              <SettingsItem 
                icon={ArrowLeftRight} 
                label={t('settings.accounts')} 
                sublabel={t('settings.accounts_subtitle')} 
              />
            </Link>
            <Link href="/settings/categories">
              <SettingsItem 
                icon={LayoutGrid} 
                label={t('settings.categories')} 
                sublabel={t('settings.categories_subtitle')} 
              />
            </Link>
          </div>
        </div>

        {/* Appearance */}
        <div className="mb-6 animate-fade-up delay-3">
          <h2 className="text-sm font-semibold mb-3 px-1" style={{ color: 'var(--text-tertiary)' }}>
            {t('settings.appearance')}
          </h2>
          <div className="space-y-2">
            <SettingsItem
              icon={theme === 'dark' ? Moon : Sun}
              label={t('settings.theme')}
              sublabel={theme === 'dark' ? t('settings.theme_dark') : t('settings.theme_light')}
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
            {t('settings.data')}
          </h2>
          <div className="space-y-2">
            <SettingsItem
              icon={Download}
              label={t('settings.export_data')}
              sublabel={t('settings.export_subtitle')}
              onClick={() => setShowExportModal(true)}
            />
          </div>
        </div>

        {/* Legal */}
        <div className="mb-6 animate-fade-up delay-5">
          <h2 className="text-sm font-semibold mb-3 px-1" style={{ color: 'var(--text-tertiary)' }}>
            {t('settings.legal')}
          </h2>
          <div className="space-y-2">
            <Link href="/privacy">
              <SettingsItem icon={Shield} label={t('settings.privacy')} sublabel="How we handle your data" />
            </Link>
            <Link href="/terms">
              <SettingsItem icon={Scale} label={t('settings.terms')} sublabel="Rules and guidelines" />
            </Link>
            <Link href="/contact">
              <SettingsItem icon={Mail} label={t('settings.contact')} sublabel="contact@bunorden.com" />
            </Link>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="mb-6 animate-fade-up delay-6">
          <h2 className="text-sm font-semibold mb-3 px-1" style={{ color: 'var(--danger)' }}>
            {t('settings.danger_zone')}
          </h2>
          <div className="space-y-2">
            <SettingsItem
              icon={LogOut}
              label={t('common.logout')}
              onClick={handleLogout}
              danger
            />
            <SettingsItem
              icon={Trash2}
              label={t('settings.delete_account')}
              sublabel={t('settings.delete_subtitle')}
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
              <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{t('settings.export_data')}</h3>
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
                {t('settings.delete_account')}?
              </h3>
              <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                {t('settings.delete_subtitle')}. This action cannot be undone.
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
                {t('common.cancel')}
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirm !== 'DELETE' || loading}
                className="btn-danger-glass flex-1 py-3"
                style={{ opacity: deleteConfirm !== 'DELETE' ? 0.4 : 1 }}
              >
                {loading ? t('common.loading') : t('common.delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MFA Enrollment Modal */}
      {showMfaModal && mfaEnrollData && (
        <div className="modal-overlay" onClick={() => setShowMfaModal(false)}>
          <div className="modal-content p-6 max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{t('settings.mfa_title')}</h3>
              <button onClick={() => setShowMfaModal(false)} className="p-1" style={{ color: 'var(--text-tertiary)' }}>
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                  Scan this QR code with your authenticator app
                </p>
                <div className="p-4 bg-white rounded-2xl inline-block mb-4">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(mfaEnrollData.totp.uri)}`} 
                    alt="2FA QR Code"
                    className="w-[180px] h-[180px]"
                  />
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-[10px] uppercase font-bold mb-1" style={{ color: 'var(--text-tertiary)' }}>Verification Code</p>
                  <input
                    type="text"
                    maxLength={6}
                    value={mfaVerifyCode}
                    onChange={(e) => setMfaVerifyCode(e.target.value)}
                    placeholder="000000"
                    className="w-full bg-transparent text-center text-2xl font-bold tracking-[0.5em] focus:outline-none"
                    style={{ color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              <button
                onClick={handleVerifyMFA}
                disabled={mfaVerifyCode.length !== 6 || mfaProcessing}
                className="btn-primary-gradient w-full py-4 text-base"
              >
                {mfaProcessing ? t('common.loading') : t('settings.mfa_enable')}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast toast-success">{toast}</div>}
    </div>
  )
}
