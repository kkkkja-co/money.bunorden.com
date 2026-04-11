'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { BunordenFooter } from '@/components/layout/BunordenFooter'
import { useTheme, useTranslation, useLanguage } from '@/app/providers'
import {
  Sun, Moon, LogOut, Trash2, Download, Shield, Mail,
  Scale, ChevronRight, User, AlertTriangle, X, Globe,
  ArrowLeftRight, LayoutGrid, Target, Bell
} from 'lucide-react'
import Link from 'next/link'
import { Language } from '@/lib/i18n/translations'
import { requestNotificationPermission, sendLocalNotification } from '@/lib/notifications'

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
  const [currentPassword, setCurrentPassword] = useState('')
  const [toast, setToast] = useState('')
  
  const [mfaFactors, setMfaFactors] = useState<any[]>([])
  const [showMfaModal, setShowMfaModal] = useState(false)
  const [mfaEnrollData, setMfaEnrollData] = useState<any>(null)
  const [mfaVerifyCode, setMfaVerifyCode] = useState('')
  const [mfaProcessing, setMfaProcessing] = useState(false)
  const [identities, setIdentities] = useState<any[]>([])

  const fetchProfile = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    setEmail(user.email || '')

    const { data: factors } = await supabase.auth.mfa.listFactors()
    setMfaFactors(factors?.all || [])
    setIdentities(user.identities || [])

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

  const handleUpdateProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('profiles').update({ display_name: profileName || null, currency, language }).eq('id', user.id)
    setToast(t('common.save'))
    setTimeout(() => setToast(''), 3000)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const SettingsRow = ({ icon: Icon, label, value, onClick, danger }: any) => (
    <button 
      onClick={onClick}
      className={`w-full flex items-center justify-between py-4 px-5 transition-all active:scale-[0.98] ${danger ? 'text-danger' : 'text-primary'}`}
    >
      <div className="flex items-center gap-4">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${danger ? 'bg-danger/10' : 'bg-primary/5'}`}>
          <Icon size={16} />
        </div>
        <span className="text-sm font-bold">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {value && <span className="text-xs text-tertiary font-bold uppercase tracking-widest">{value}</span>}
        <ChevronRight size={14} className="text-tertiary opacity-40" />
      </div>
    </button>
  )

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 px-4 lg:px-8 py-6 lg:py-10 max-w-xl mx-auto w-full">
        <header className="mb-10 animate-elegant">
          <h1 className="text-2xl font-bold tracking-tight text-primary">{t('common.settings')}</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-tertiary mt-1">Version v0.5.0</p>
        </header>

        {/* Profile Group */}
        <section className="mb-8 animate-elegant delay-1">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-tertiary mb-3 px-1">{t('settings.profile')}</h2>
          <div className="bg-secondary/50 rounded-3xl overflow-hidden border border-border">
            <div className="px-5 py-6 space-y-4">
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder={t('settings.display_name')}
                className="w-full bg-primary/5 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent-primary"
              />
              <div className="flex gap-3">
                <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="flex-1 bg-primary/5 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none">
                  {['HKD', 'USD', 'EUR', 'GBP', 'JPY', 'CNY', 'TWD', 'SGD'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={language} onChange={(e) => setLanguage(e.target.value as Language)} className="flex-1 bg-primary/5 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none">
                  <option value="en">English</option>
                  <option value="zh-TW">繁體中文</option>
                </select>
              </div>
              <button onClick={handleUpdateProfile} className="w-full btn-primary-gradient py-3 text-sm">{t('common.save')}</button>
            </div>
          </div>
        </section>

        {/* Preferences Group */}
        <section className="mb-8 animate-elegant delay-2">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-tertiary mb-3 px-1">{t('settings.appearance')} & {t('settings.manage')}</h2>
          <div className="bg-secondary/50 rounded-3xl overflow-hidden border border-border divide-y divide-border">
            <SettingsRow icon={theme === 'dark' ? Moon : Sun} label={t('settings.theme')} value={theme === 'dark' ? 'DARK' : 'LIGHT'} onClick={toggleTheme} />
            <Link href="/settings/accounts"><SettingsRow icon={ArrowLeftRight} label={t('settings.accounts')} /></Link>
            <Link href="/settings/categories"><SettingsRow icon={LayoutGrid} label={t('settings.categories')} /></Link>
            <SettingsRow 
              icon={Bell} 
              label="Notifications" 
              value={(typeof window !== 'undefined' && Notification.permission === 'granted') ? 'ON' : 'OFF'} 
              onClick={async () => {
                const granted = await requestNotificationPermission()
                if (granted) setToast('Enabled')
              }} 
            />
          </div>
        </section>

        {/* Security & Data Group */}
        <section className="mb-8 animate-elegant delay-3">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-tertiary mb-3 px-1">{t('settings.security')} & {t('settings.data')}</h2>
          <div className="bg-secondary/50 rounded-3xl overflow-hidden border border-border divide-y divide-border">
            <SettingsRow icon={Shield} label={t('settings.mfa_title')} value={mfaFactors.length > 0 ? 'SECURED' : 'RISKY'} onClick={() => router.push('/settings/security')} />
            <SettingsRow icon={Download} label={t('settings.export_data')} onClick={() => setShowExportModal(true)} />
          </div>
        </section>

        {/* Danger Zone */}
        <section className="mb-12 animate-elegant delay-4">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-danger mb-3 px-1">{t('settings.danger_zone')}</h2>
          <div className="bg-danger/5 rounded-3xl overflow-hidden border border-danger/10 divide-y divide-danger/10">
            <SettingsRow icon={LogOut} label={t('common.logout')} onClick={handleLogout} />
            <SettingsRow icon={Trash2} label={t('settings.delete_account')} danger onClick={() => setShowDeleteModal(true)} />
          </div>
        </section>
      </div>

      <BunordenFooter />

      {/* Export Modal (Simplified) */}
      {showExportModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm" onClick={() => setShowExportModal(false)}>
          <div className="bg-secondary rounded-[32px] p-8 max-w-sm w-full border border-border shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-6">{t('settings.export_data')}</h3>
            <div className="space-y-3">
              <button onClick={() => {}} className="w-full py-4 rounded-2xl bg-primary border border-border font-bold">Export JSON</button>
              <button onClick={() => {}} className="w-full py-4 rounded-2xl bg-primary border border-border font-bold">Export CSV</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="fixed bottom-24 left-1/2 -translate-x-1/2 py-3 px-6 rounded-2xl bg-success text-white text-xs font-bold shadow-xl">{toast}</div>}
    </div>
  )
}
