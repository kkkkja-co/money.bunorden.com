'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { BunordenFooter } from '@/components/layout/BunordenFooter'
import { useTheme, useTranslation, useLanguage, AccentColor } from '@/app/providers'
import {
  Sun, Moon, LogOut, Trash2, Download, Shield, Bell,
  ChevronRight, ArrowLeftRight, LayoutGrid, Check, Loader2, Palette,
  FileText, Scale, CreditCard, Mail, Link2, Link2Off, Github
} from 'lucide-react'
import Link from 'next/link'
import { Language } from '@/lib/i18n/translations'
import { requestNotificationPermission } from '@/lib/notifications'
import { exportDataAsJson } from '@/lib/export'

const ACCENT_PRESETS: { id: AccentColor; color: string; label: string; labelZh: string }[] = [
  { id: 'violet', color: '#af52de', label: 'Violet', labelZh: '紫羅蘭' },
  { id: 'ocean', color: '#0a84ff', label: 'Ocean', labelZh: '海洋藍' },
  { id: 'emerald', color: '#30d158', label: 'Emerald', labelZh: '翡翠綠' },
  { id: 'sunset', color: '#ff9f0a', label: 'Sunset', labelZh: '日落橘' },
  { id: 'rose', color: '#ff375f', label: 'Rose', labelZh: '玫瑰紅' },
  { id: 'slate', color: '#8e8e93', label: 'Slate', labelZh: '石板灰' },
]

// Google SVG icon (no external tracker)
function GoogleIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

type OAuthProvider = 'google' | 'github'
type IdentityRecord = { provider: string; id: string }

export default function SettingsPage() {
  const router = useRouter()
  const { theme, toggleTheme, accent, setAccent } = useTheme()
  const { t } = useTranslation()
  const { language, setLanguage } = useLanguage()

  const [profileName, setProfileName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [currency, setCurrency] = useState('HKD')
  const [localLanguage, setLocalLanguage] = useState<Language>('en')
  const [mfaFactors, setMfaFactors] = useState<any[]>([])
  const [identities, setIdentities] = useState<IdentityRecord[]>([])
  const [saving, setSaving] = useState(false)
  const [showSaved, setShowSaved] = useState(false)
  const [notifPermission, setNotifPermission] = useState<string>('default')
  const [exporting, setExporting] = useState(false)
  const [linkingProvider, setLinkingProvider] = useState<OAuthProvider | null>(null)
  const [linkToast, setLinkToast] = useState<{ msg: string; ok: boolean } | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && window.Notification) {
      setNotifPermission(window.Notification.permission)
    }
  }, [])

  // Handle OAuth redirect result for account linking
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const linked = params.get('linked')
    if (linked) {
      const ok = linked === 'success'
      showLinkToast(ok ? t('settings.link_success') : t('settings.link_error'), ok)
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const showLinkToast = (msg: string, ok: boolean) => {
    setLinkToast({ msg, ok })
    setTimeout(() => setLinkToast(null), 3500)
  }

  const fetchProfile = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    setUserEmail(user.email || '')

    const { data: factors } = await supabase.auth.mfa.listFactors()
    setMfaFactors(factors?.all || [])

    // Fetch linked OAuth identities
    const { data: idData } = await supabase.auth.getUserIdentities()
    setIdentities((idData?.identities || []).map((i: any) => ({ provider: i.provider, id: i.id })))

    const { data } = await supabase.from('profiles').select('display_name, currency, language').eq('id', user.id).single()
    if (data) {
      setProfileName(data.display_name || '')
      setCurrency(data.currency || 'HKD')
      setLocalLanguage((data.language as Language) || 'en')
    }
  }, [router])

  useEffect(() => { fetchProfile() }, [fetchProfile])

  const handleUpdateProfile = async () => {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase.from('profiles').update({
        display_name: profileName || null,
        currency,
        language: localLanguage
      }).eq('id', user.id)

      if (error) throw error

      setLanguage(localLanguage)
      setShowSaved(true)
      setTimeout(() => setShowSaved(false), 3000)
    } finally {
      setSaving(false)
    }
  }

  const handleExport = async () => {
    setExporting(true)
    const success = await exportDataAsJson()
    setExporting(false)
    if (success) {
      alert('Data export successful! Your backup file has been downloaded.')
    } else {
      alert('Failed to export data. Please check your connection and try again.')
    }
  }

  const isProviderLinked = (provider: OAuthProvider) =>
    identities.some(id => id.provider === provider)

  const handleLinkProvider = async (provider: OAuthProvider) => {
    setLinkingProvider(provider)
    try {
      const redirectTo = `${window.location.origin}/settings?linked=success`
      const { error } = await supabase.auth.linkIdentity({
        provider,
        options: { redirectTo }
      })
      if (error) throw error
      // Will redirect to OAuth — no further action needed here
    } catch (err: any) {
      showLinkToast(err.message || t('settings.link_error'), false)
      setLinkingProvider(null)
    }
  }

  const handleUnlinkProvider = async (provider: OAuthProvider) => {
    const identity = identities.find(id => id.provider === provider)
    if (!identity) return
    if (!confirm(`${t('settings.unlink_confirm')} ${t('settings.unlink_warning')}`)) return

    setLinkingProvider(provider)
    try {
      const { error } = await supabase.auth.unlinkIdentity({ identityId: identity.id, provider } as any)
      if (error) throw error
      setIdentities(prev => prev.filter(id => id.provider !== provider))
      showLinkToast(t('settings.link_success'), true)
    } catch (err: any) {
      showLinkToast(err.message || t('settings.link_error'), false)
    } finally {
      setLinkingProvider(null)
    }
  }

  const SettingsRow = ({ icon: Icon, label, subtitle, value, onClick, danger }: any) => (
    <button onClick={onClick} className="list-item w-full text-left">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${danger ? 'bg-danger/10 text-danger' : 'bg-primary/5 text-secondary'}`}>
        <Icon size={16} />
      </div>
      <div className="flex-1 min-w-0 pr-2">
        <p className={`font-bold text-sm truncate ${danger ? 'text-danger' : 'text-primary'}`}>{label}</p>
        {subtitle && <p className="text-[10px] text-[var(--text-secondary)] truncate mt-0.5 opacity-80">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {value && <span className="text-[10px] text-secondary font-black uppercase tracking-widest">{value}</span>}
        <ChevronRight size={14} className="text-secondary opacity-30" />
      </div>
    </button>
  )

  const SocialLinkButton = ({ provider, linked, loading }: { provider: OAuthProvider; linked: boolean; loading: boolean }) => {
    const isGoogle = provider === 'google'
    const label = linked
      ? t(isGoogle ? 'settings.unlink_google' : 'settings.unlink_github')
      : t(isGoogle ? 'settings.link_google' : 'settings.link_github')

    return (
      <button
        onClick={() => linked ? handleUnlinkProvider(provider) : handleLinkProvider(provider)}
        disabled={loading}
        className={`
          relative flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl border transition-all duration-300
          ${linked
            ? 'border-[var(--border)] bg-[var(--bg-elevated)] hover:border-danger/40 hover:bg-danger/5 group'
            : 'border-[var(--border)] bg-[var(--bg-elevated)] hover:border-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/5 group'}
          disabled:opacity-50 active:scale-[0.98]
        `}
        style={{ touchAction: 'manipulation' }}
      >
        {/* Provider icon */}
        <div className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center bg-[var(--bg-primary)] border border-[var(--border)]">
          {isGoogle
            ? <GoogleIcon size={16} />
            : <Github size={16} className="text-primary" />
          }
        </div>

        {/* Label + status */}
        <div className="flex-1 text-left">
          <p className={`text-sm font-bold transition-colors duration-200 ${linked ? 'text-primary group-hover:text-danger' : 'text-primary'}`}>
            {label}
          </p>
          <p className={`text-[10px] font-black uppercase tracking-widest mt-0.5 transition-colors duration-200 ${linked ? 'text-[var(--success)] group-hover:text-danger/80' : 'text-[var(--text-secondary)]'}`}>
            {linked ? t('settings.linked') : t('settings.not_linked')}
          </p>
        </div>

        {/* Status icon */}
        <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${linked ? 'bg-[var(--success)]/10 text-[var(--success)] group-hover:bg-danger/10 group-hover:text-danger' : 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]'}`}>
          {loading
            ? <Loader2 size={12} className="animate-spin" />
            : linked
              ? <Link2Off size={12} className="opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              : <Link2 size={12} />
          }
          {linked && !loading && (
            <Check size={12} className="absolute group-hover:opacity-0 transition-opacity duration-200" />
          )}
        </div>
      </button>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Link Toast Notification */}
      {linkToast && (
        <div
          className={`
            fixed top-5 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl shadow-xl
            flex items-center gap-2.5 text-sm font-bold
            animate-toast-in
            ${linkToast.ok
              ? 'bg-[var(--success)]/90 text-white backdrop-blur-xl'
              : 'bg-danger/90 text-white backdrop-blur-xl'}
          `}
          style={{ minWidth: 220 }}
        >
          {linkToast.ok ? <Check size={15} strokeWidth={3} /> : <Link2Off size={15} />}
          {linkToast.msg}
        </div>
      )}

      <div className="flex-1 max-w-xl mx-auto w-full px-5 py-8 md:py-12">
        <header className="mb-10 animate-slide-up">
          <h1 className="text-2xl font-bold tracking-tight text-primary">{t('common.settings')}</h1>
          <p className="text-[9px] font-black uppercase tracking-[0.25em] text-secondary mt-1">v0.7.0 • Vault Secured</p>
        </header>

        {/* ── PROFILE ── */}
        <section className="animate-slide-up delay-1 mb-10">
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)]">{t('settings.profile')}</h2>
            {showSaved && (
              <div className="flex items-center gap-1.5 text-[var(--success)] animate-fade-in">
                <Check size={12} strokeWidth={3} />
                <span className="text-[10px] font-black uppercase tracking-wider">{t('budgets.saved')}</span>
              </div>
            )}
          </div>
          <div className="list-wrapper px-5 py-6 space-y-5">
            {/* Email (read-only) */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] ml-1 flex items-center gap-1.5">
                <Mail size={9} />
                {t('settings.email_label')}
              </label>
              <div className="relative">
                <div className="w-full input-minimal pr-4 flex items-center gap-2 opacity-70 cursor-default select-all" style={{ userSelect: 'text' }}>
                  <Mail size={14} className="text-[var(--text-secondary)] flex-shrink-0" />
                  <span className="text-sm text-primary truncate">{userEmail || '—'}</span>
                </div>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] opacity-50 pointer-events-none">
                  {t('settings.email_hint').split(' ').slice(0, 2).join(' ')}
                </span>
              </div>
            </div>

            {/* Display Name */}
            <div className="space-y-1.5">
              <label htmlFor="display-name" className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] ml-1">{t('settings.display_name')}</label>
              <input id="display-name" type="text" value={profileName} onChange={(e) => setProfileName(e.target.value)} className="w-full input-minimal pr-2" placeholder="Enter your name" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="currency-select" className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] ml-1">{t('settings.currency')}</label>
                <select id="currency-select" value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full input-minimal pr-2">
                  {['HKD', 'USD', 'EUR', 'GBP', 'JPY', 'CNY', 'TWD', 'SGD'].map(c => <option key={c} value={c} className="bg-zinc-900">{c}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="language-select" className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] ml-1">{t('settings.language')}</label>
                <select id="language-select" value={localLanguage} onChange={(e) => setLocalLanguage(e.target.value as Language)} className="w-full input-minimal pr-2">
                  <option value="en" className="bg-zinc-900">English</option>
                  <option value="zh-TW" className="bg-zinc-900">繁體中文</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleUpdateProfile}
              disabled={saving}
              className="w-full py-4 rounded-2xl bg-[var(--accent-primary)] text-white text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-accent-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : null}
              {saving ? t('common.loading') : t('common.save')}
            </button>
          </div>
        </section>

        {/* ── LINKED ACCOUNTS ── */}
        <section className="animate-slide-up delay-2 mb-10">
          <div className="mb-3 px-1">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)]">{t('settings.connected_accounts')}</h2>
            <p className="text-[10px] text-[var(--text-secondary)] mt-0.5 opacity-70">{t('settings.connected_accounts_subtitle')}</p>
          </div>
          <div className="space-y-2.5">
            <SocialLinkButton
              provider="google"
              linked={isProviderLinked('google')}
              loading={linkingProvider === 'google'}
            />
            <SocialLinkButton
              provider="github"
              linked={isProviderLinked('github')}
              loading={linkingProvider === 'github'}
            />
          </div>
        </section>

        {/* ── APPEARANCE ── */}
        <section className="animate-slide-up delay-3 mb-10">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary mb-3 px-1">{t('settings.appearance')}</h2>
          <div className="list-wrapper">
            <SettingsRow icon={theme === 'dark' ? Moon : Sun} label={t('settings.theme')} value={theme === 'dark' ? 'DARK' : 'LIGHT'} onClick={toggleTheme} />
          </div>

          {/* Accent Color Picker */}
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-3 px-1">
              <Palette size={12} className="text-secondary" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary">{t('settings.accent_color')}</span>
            </div>
            <div className="list-wrapper p-4">
              <div className="grid grid-cols-6 gap-3">
                {ACCENT_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => setAccent(preset.id)}
                    className="flex flex-col items-center gap-1.5 group"
                    aria-label={language === 'zh-TW' ? preset.labelZh : preset.label}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300"
                      style={{
                        background: preset.color,
                        boxShadow: accent === preset.id ? `0 0 0 3px var(--bg-secondary), 0 0 0 5px ${preset.color}` : 'none',
                        transform: accent === preset.id ? 'scale(1.1)' : 'scale(1)',
                      }}
                    >
                      {accent === preset.id && <Check size={16} className="text-white" strokeWidth={3} />}
                    </div>
                    <span className="text-[8px] font-bold uppercase tracking-wider text-secondary opacity-60">
                      {language === 'zh-TW' ? preset.labelZh : preset.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── MANAGEMENT ── */}
        <section className="animate-slide-up delay-4 mb-10">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary mb-3 px-1">{t('settings.manage')}</h2>
          <div className="list-wrapper">
            <Link href="/settings/accounts" aria-label={t('settings.accounts')}><SettingsRow icon={ArrowLeftRight} label={t('settings.accounts')} subtitle={t('settings.accounts_subtitle')} /></Link>
            <Link href="/settings/categories" aria-label={t('settings.categories')}><SettingsRow icon={LayoutGrid} label={t('settings.categories')} subtitle={t('settings.categories_subtitle')} /></Link>
            <Link href="/settings/cards" aria-label={t('settings.cards')}><SettingsRow icon={CreditCard} label={t('settings.cards')} subtitle={t('settings.cards_subtitle')} /></Link>
            <SettingsRow
              icon={Bell}
              label={t('tour.notifications_title')}
              value={notifPermission === 'granted' ? 'ON' : 'OFF'}
              onClick={async () => {
                const granted = await requestNotificationPermission()
                if (granted) {
                  setNotifPermission('granted')
                  alert('Vault Test: Notifications are strictly for security alerts and major updates.')
                } else {
                  if (typeof window !== 'undefined' && 'Notification' in window && window.Notification) {
                    setNotifPermission(window.Notification.permission)
                  }
                }
              }}
            />
          </div>
        </section>

        {/* ── SECURITY & DATA ── */}
        <section className="animate-slide-up delay-5 mb-10">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary mb-3 px-1">{t('settings.security')} & {t('settings.data')}</h2>
          <div className="list-wrapper">
            <SettingsRow icon={Shield} label={t('settings.mfa_title')} value={mfaFactors.length > 0 ? 'SECURED' : 'UNSET'} onClick={() => router.push('/settings/security')} />
            <SettingsRow
              icon={Download}
              label={t('settings.export_data')}
              value={exporting ? 'EXPORTING...' : ''}
              onClick={handleExport}
            />
          </div>
        </section>

        {/* ── LEGAL ── */}
        <section className="animate-slide-up delay-5 mb-10">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary mb-3 px-1">{t('settings.legal')}</h2>
          <div className="list-wrapper">
            <Link href="/privacy"><SettingsRow icon={FileText} label={t('settings.privacy')} /></Link>
            <Link href="/terms"><SettingsRow icon={Scale} label={t('settings.terms')} /></Link>
          </div>
        </section>

        {/* ── DANGER ZONE ── */}
        <section className="animate-slide-up delay-5 mb-20">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-danger mb-3 px-1">{t('settings.danger_zone')}</h2>
          <div className="list-wrapper border-danger/10">
            <SettingsRow icon={LogOut} label={t('common.logout')} onClick={async () => { await supabase.auth.signOut(); router.push('/login') }} />
            <SettingsRow icon={Trash2} label={t('settings.delete_account')} danger onClick={() => {}} />
          </div>
        </section>
      </div>

      <BunordenFooter />
    </div>
  )
}
