'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { BunordenFooter } from '@/components/layout/BunordenFooter'
import { useTheme, useTranslation, useLanguage } from '@/app/providers'
import {
  Sun, Moon, LogOut, Trash2, Download, Shield, Bell,
  ChevronRight, ArrowLeftRight, LayoutGrid
} from 'lucide-react'
import Link from 'next/link'
import { Language } from '@/lib/i18n/translations'
import { requestNotificationPermission } from '@/lib/notifications'

export default function SettingsPage() {
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()
  const { t } = useTranslation()
  const { language, setLanguage } = useLanguage()
  
  const [profileName, setProfileName] = useState('')
  const [currency, setCurrency] = useState('HKD')
  const [mfaFactors, setMfaFactors] = useState<any[]>([])

  const fetchProfile = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data: factors } = await supabase.auth.mfa.listFactors()
    setMfaFactors(factors?.all || [])

    const { data } = await supabase.from('profiles').select('display_name, currency').eq('id', user.id).single()
    if (data) {
      setProfileName(data.display_name || '')
      setCurrency(data.currency || 'HKD')
    }
  }, [router])

  useEffect(() => { fetchProfile() }, [fetchProfile])

  const handleUpdateProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('profiles').update({ display_name: profileName || null, currency, language }).eq('id', user.id)
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
          <p className="text-[9px] font-black uppercase tracking-[0.25em] text-secondary mt-1">v0.5.0 • Vault Secured</p>
        </header>

        <section className="animate-slide-up delay-1 mb-10">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary mb-3 px-1">{t('settings.profile')}</h2>
          <div className="list-wrapper px-5 py-6 space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-secondary ml-1">{t('settings.display_name')}</label>
              <input type="text" value={profileName} onChange={(e) => setProfileName(e.target.value)} onBlur={handleUpdateProfile} className="w-full input-minimal pr-2" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-secondary ml-1">{t('settings.currency')}</label>
                <select value={currency} onChange={(e) => { setCurrency(e.target.value); handleUpdateProfile() }} className="w-full input-minimal pr-2">
                  {['HKD', 'USD', 'EUR', 'GBP', 'JPY', 'CNY', 'TWD', 'SGD'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-secondary ml-1">{t('settings.language')}</label>
                <select value={language} onChange={(e) => { setLanguage(e.target.value as Language); handleUpdateProfile() }} className="w-full input-minimal pr-2">
                  <option value="en">English</option>
                  <option value="zh-TW">繁體中文</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        <section className="animate-slide-up delay-2 mb-10">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary mb-3 px-1">{t('settings.appearance')} & {t('settings.manage')}</h2>
          <div className="list-wrapper">
            <SettingsRow icon={theme === 'dark' ? Moon : Sun} label={t('settings.theme')} value={theme === 'dark' ? 'DARK' : 'LIGHT'} onClick={toggleTheme} />
            <Link href="/settings/accounts"><SettingsRow icon={ArrowLeftRight} label={t('settings.accounts')} /></Link>
            <Link href="/settings/categories"><SettingsRow icon={LayoutGrid} label={t('settings.categories')} /></Link>
            <SettingsRow icon={Bell} label="Notifications" value={(typeof window !== 'undefined' && Notification.permission === 'granted') ? 'ON' : 'OFF'} onClick={async () => await requestNotificationPermission()} />
          </div>
        </section>

        <section className="animate-slide-up delay-3 mb-10">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary mb-3 px-1">{t('settings.security')} & {t('settings.data')}</h2>
          <div className="list-wrapper">
            <SettingsRow icon={Shield} label={t('settings.mfa_title')} value={mfaFactors.length > 0 ? 'SECURED' : 'UNSET'} onClick={() => router.push('/settings/security')} />
            <SettingsRow icon={Download} label={t('settings.export_data')} onClick={() => {}} />
          </div>
        </section>

        <section className="animate-slide-up delay-4 mb-20">
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
