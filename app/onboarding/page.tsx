'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { PERSONA_PRESETS } from '@/lib/presets'
import { Check, ArrowLeft, Sparkles, Mail, RefreshCw, Languages } from 'lucide-react'
import { useTranslation, useLanguage, useTheme } from '@/app/providers'
import { Language } from '@/lib/i18n/translations'

export default function OnboardingPage() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const { language, setLanguage } = useLanguage()
  const [step, setStep] = useState(0)
  const [selectedPersona, setSelectedPersona] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [accountName, setAccountName] = useState('')
  const [currency, setCurrency] = useState('HKD')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setCheckingAuth(false)
      
      if (!user) {
        router.push('/login')
      } else {
        setAccountName(t('common.main_account'))
      }
    }
    checkUser()
  }, [router])

  const handleResendEmail = async () => {
    if (!user?.email) return
    setResending(true)
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      })
      if (error) throw error
      alert('Verification email resent! Please check your spam folder too.')
    } catch (err: any) {
      console.error('Error resending email:', err)
      alert(`Error: ${err.message || 'Could not resend email'}`)
    } finally {
      setResending(false)
    }
  }

  const handleComplete = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Update/Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          onboarding_done: true,
          display_name: displayName.trim() || null,
          language: language,
          currency: currency,
        })

      if (profileError) throw profileError

      // Create default account
      const { error: accountError } = await supabase.from('accounts').insert({
        user_id: user.id,
        name: accountName.trim() || t('common.main_account'),
        icon: '💳',
        is_default: true,
      })

      if (accountError) throw accountError

      // Create categories based on persona
      const persona = PERSONA_PRESETS.find((p) => p.id === selectedPersona)
      if (persona && persona.id !== 'custom') {
        const categories = persona.categories.map((cat) => ({
          user_id: user.id,
          name: t(cat.name as any),
          icon: cat.icon,
          type: cat.type,
        }))
        const { error: catError } = await supabase.from('categories').insert(categories)
        if (catError) throw catError
      }

      router.push('/dashboard')
    } catch (error: any) {
      console.error('Onboarding error:', error)
      alert(error.message || 'Failed to complete onboarding')
    } finally {
      setLoading(false)
    }
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  // Verification Gate
  if (user && !user.email_confirmed_at) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 text-center">
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(circle at 30% 20%, rgba(59, 130, 246, 0.08) 0%, transparent 50%),
              radial-gradient(circle at 70% 80%, rgba(139, 92, 246, 0.08) 0%, transparent 50%)
            `,
          }}
        />
        
        <div className="w-full max-w-md relative z-10 surface-elevated p-10 rounded-[2.5rem] border border-white/5 space-y-8 shadow-2xl">
          <div
            className="w-20 h-20 rounded-3xl mx-auto flex items-center justify-center overflow-hidden"
            style={{
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
            }}
          >
            <img 
              src={theme === 'dark' ? '/assets/clavi-icon-dark.svg' : '/assets/clavi-icon-light.svg'} 
              alt="Clavi Logo" 
              className="w-full h-full object-cover"
            />
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-3" style={{ color: 'var(--text-primary)' }}>
              {t('auth.verify_email_title')}
            </h1>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
              {t('auth.verify_email_subtitle', { email: user.email })}
            </p>
          </div>

          <div className="pt-4 space-y-4">
            <button
              onClick={() => window.location.reload()}
              className="btn-apple-primary w-full py-4 text-base flex items-center justify-center gap-2"
            >
              <RefreshCw size={18} /> {t('auth.verify_email_button')}
            </button>
            <button
              onClick={handleResendEmail}
              disabled={resending}
              className="w-full py-4 text-sm font-medium rounded-2xl transition-all border border-white/5 hover:bg-white/5"
              style={{ color: 'var(--text-secondary)' }}
            >
              {resending ? t('common.loading') : t('auth.resend_email')}
            </button>
          </div>

          <button
            onClick={() => supabase.auth.signOut().then(() => router.push('/login'))}
            className="text-xs font-medium"
            style={{ color: 'var(--text-quaternary)' }}
          >
            {t('auth.try_another_email')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 30% 20%, rgba(59, 130, 246, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 70% 80%, rgba(139, 92, 246, 0.08) 0%, transparent 50%)
          `,
        }}
      />

      <div className="w-full max-w-2xl relative z-10">
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8 animate-fade-up">
          {[0, 1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className="h-1.5 rounded-full"
              style={{
                width: s === step ? '32px' : '12px',
                background: s <= step
                  ? 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))'
                  : 'var(--overlay)',
                border: s > step ? '1px solid var(--border)' : 'none',
                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            />
          ))}
        </div>

        {/* Step 0: Language */}
        {step === 0 && (
          <div className="animate-fade-up text-center">
            <div
              className="w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center overflow-hidden"
              style={{
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
              }}
            >
              <img 
                src={theme === 'dark' ? '/assets/clavi-icon-dark.svg' : '/assets/clavi-icon-light.svg'} 
                alt="Clavi Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-2" style={{ color: 'var(--text-primary)' }}>
              {t('onboarding.lang_title')}
            </h1>
            <p className="text-sm mb-8" style={{ color: 'var(--text-tertiary)' }}>
              {t('onboarding.lang_subtitle')}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto mb-8">
              <button
                onClick={() => { setLanguage('en'); setStep(1); }}
                className="p-6 rounded-2xl surface-elevated border border-white/5 hover:border-accent-primary transition-all group"
              >
                <span className="text-2xl mb-2 block group-hover:scale-110 transition-transform">🇺🇸</span>
                <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>English</span>
              </button>
              <button
                onClick={() => { setLanguage('zh-TW'); setStep(1); }}
                className="p-6 rounded-2xl surface-elevated border border-white/5 hover:border-accent-primary transition-all group"
              >
                <span className="text-2xl mb-2 block group-hover:scale-110 transition-transform">🇭🇰</span>
                <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>繁體中文</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 1: Name */}
        {step === 1 && (
          <div className="animate-fade-up text-center">
            <button
              onClick={() => setStep(0)}
              className="flex items-center gap-2 mb-6 text-sm font-medium"
              style={{ color: 'var(--text-tertiary)' }}
            >
              <ArrowLeft size={16} /> {t('common.back')}
            </button>
            <div
              className="w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center overflow-hidden"
              style={{
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
              }}
            >
              <img 
                src={theme === 'dark' ? '/assets/clavi-icon-dark.svg' : '/assets/clavi-icon-light.svg'} 
                alt="Clavi Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-2" style={{ color: 'var(--text-primary)' }}>
              {t('onboarding.step1_title')}
            </h1>
            <p className="text-sm mb-8" style={{ color: 'var(--text-tertiary)' }}>
              {t('onboarding.step1_subtitle')}
            </p>

            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={t('onboarding.step1_placeholder')}
              className="input-minimal w-full text-center text-lg py-4 mb-6 max-w-sm mx-auto"
            />

            <button
              onClick={() => setStep(2)}
              className="btn-apple-primary w-full max-w-sm mx-auto py-4 text-base block"
            >
              {t('common.continue')}
            </button>
          </div>
        )}

        {/* Step 2: Wallet & Currency */}
        {step === 2 && (
          <div className="animate-fade-up text-center">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-2 mb-6 text-sm font-medium"
              style={{ color: 'var(--text-tertiary)' }}
            >
              <ArrowLeft size={16} /> {t('common.back')}
            </button>
            <div
              className="w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center bg-accent-primary/10 text-accent-primary"
              style={{
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              }}
            >
              <Sparkles size={32} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-2" style={{ color: 'var(--text-primary)' }}>
              {t('onboarding.wallet_title')}
            </h1>
            <p className="text-sm mb-8 px-4" style={{ color: 'var(--text-tertiary)' }}>
              {t('onboarding.wallet_subtitle')}
            </p>

            <div className="space-y-4 max-w-sm mx-auto mb-8 text-left">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 px-1" style={{ color: 'var(--text-tertiary)' }}>
                  {t('onboarding.account_name')}
                </label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="e.g. Daily Account"
                  className="input-minimal w-full"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest mb-2 px-1" style={{ color: 'var(--text-tertiary)' }}>
                  {t('onboarding.currency')}
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="input-minimal w-full"
                >
                  {['HKD', 'USD', 'EUR', 'GBP', 'JPY', 'CNY', 'MYR', 'SGD', 'TWD', 'KRW', 'AUD', 'CAD'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={() => setStep(3)}
              className="btn-apple-primary w-full max-w-sm mx-auto py-4 text-base block"
            >
              {t('common.continue')}
            </button>
          </div>
        )}

        {/* Step 3: Persona */}
        {step === 3 && (
          <div className="animate-fade-up">
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-2 mb-6 text-sm font-medium"
              style={{ color: 'var(--text-tertiary)' }}
            >
              <ArrowLeft size={16} /> {t('common.back')}
            </button>

            <h1 className="text-3xl font-bold tracking-tight mb-2 text-center" style={{ color: 'var(--text-primary)' }}>
              {t('onboarding.step2_title')}
            </h1>
            <p className="text-sm text-center mb-8" style={{ color: 'var(--text-tertiary)' }}>
              {t('onboarding.step2_subtitle')}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {PERSONA_PRESETS.map((persona) => (
                <button
                  key={persona.id}
                  onClick={() => {
                    setSelectedPersona(persona.id)
                    setStep(4)
                  }}
                  className="p-5 rounded-2xl text-center"
                  style={{
                    background: selectedPersona === persona.id ? 'rgba(59,130,246,0.1)' : 'var(--overlay)',
                    border: `1px solid ${selectedPersona === persona.id ? 'var(--accent-primary)' : 'var(--border)'}`,
                    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  <div className="text-4xl mb-3">{persona.icon}</div>
                  <h3 className="font-semibold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>
                    {t(persona.label as any)}
                  </h3>
                  <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    {t(persona.description as any)}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Ready */}
        {step === 4 && (
          <div className="animate-fade-up text-center">
            <button
              onClick={() => setStep(3)}
              className="flex items-center gap-2 mb-6 text-sm font-medium"
              style={{ color: 'var(--text-tertiary)' }}
            >
              <ArrowLeft size={16} /> {t('common.back')}
            </button>

            <div
              className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
              style={{ background: 'var(--success-bg)' }}
            >
              <Check size={40} style={{ color: 'var(--success)' }} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-2" style={{ color: 'var(--text-primary)' }}>
              {t('onboarding.step3_title')}
            </h1>
            <p className="text-sm mb-8" style={{ color: 'var(--text-tertiary)' }}>
              {t('onboarding.step3_subtitle')}
            </p>

            <button
              onClick={handleComplete}
              disabled={loading}
              className="btn-apple-primary w-full max-w-sm mx-auto py-4 text-base flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                t('onboarding.step3_button')
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
