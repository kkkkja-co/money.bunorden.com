'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { BunordenFooter } from '@/components/layout/BunordenFooter'
import { useTheme, useTranslation, useLanguage, AccentColor } from '@/app/providers'
import {
  Sun, Moon, LogOut, Trash2, Download, Shield, Bell,
  ChevronRight, ArrowLeftRight, LayoutGrid, Check, Loader2, Palette,
  FileText, Scale, CreditCard
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

export default function SettingsPage() {
  const router = useRouter()
  const { theme, toggleTheme, accent, setAccent } = useTheme()
  const { t } = useTranslation()
  const { language, setLanguage } = useLanguage()
  
  const [profileName, setProfileName] = useState('')
  const [currency, setCurrency] = useState('HKD')
  const [localLanguage, setLocalLanguage] = useState<Language>('en')
  const [mfaFactors, setMfaFactors] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [showSaved, setShowSaved] = useState(false)
  const [notifPermission, setNotifPermission] = useState<string>('default')
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && window.Notification) {
      setNotifPermission(window.Notification.permission)
    }
  }, [])

  const fetchProfile = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data: factors } = await supabase.auth.mfa.listFactors()
    setMfaFactors(factors?.all || [])

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

      // Update global language state
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

  const SettingsRow = ({ icon: Icon, label, value, onClick, danger }: any) => (
    <button onClick={onClick} className="list-item w-full text-left">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${danger ? 'bg-danger/10 text-danger' : 'bg-primary/5 text-secondary'}`}>
        <Icon size={16} />
      </div>
      <div className="flex-1">
        <p className={`font-bold text-sm ${danger ? 'text-danger' : 'text-primary'}`}>{label}</p>
      </div>
      <div className="flex items-center gap-2">
        {value && <span className="text-[10px] text-secondary font-black uppercase tracking-widest">{value}</span>}
        <ChevronRight size={14} className="text-secondary opacity-30" />
      </div>
    </button>
  )

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 max-w-xl mx-auto w-full px-5 py-8 md:py-12">
        <header className="mb-10 animate-slide-up">
          <h1 className="text-2xl font-bold tracking-tight text-primary">{t('common.settings')}</h1>
          <p className="text-[9px] font-black uppercase tracking-[0.25em] text-secondary mt-1">v0.6.0 • Vault Secured</p>
        </header>

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
          <div className="list-wrapper px-5 py-6 space-y-6">
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

        <section className="animate-slide-up delay-2 mb-10">
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

        <section className="animate-slide-up delay-3 mb-10">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary mb-3 px-1">{t('settings.manage')}</h2>
          <div className="list-wrapper">
            <Link href="/settings/accounts" aria-label={t('settings.accounts')}><SettingsRow icon={ArrowLeftRight} label={t('settings.accounts')} /></Link>
            <Link href="/settings/categories" aria-label={t('settings.categories')}><SettingsRow icon={LayoutGrid} label={t('settings.categories')} /></Link>
            <Link href="/settings/cards" aria-label={t('settings.cards')}><SettingsRow icon={CreditCard} label={t('settings.cards')} /></Link>
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

        <section className="animate-slide-up delay-4 mb-10">
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

        <section className="animate-slide-up delay-5 mb-10">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary mb-3 px-1">{t('settings.legal')}</h2>
          <div className="list-wrapper">
            <Link href="/privacy"><SettingsRow icon={FileText} label={t('settings.privacy')} /></Link>
            <Link href="/terms"><SettingsRow icon={Scale} label={t('settings.terms')} /></Link>
          </div>
        </section>

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
