'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { Eye, EyeOff, LogIn, Shield, ArrowLeft, Languages } from 'lucide-react'
import { useTranslation, useTheme, useLanguage } from '@/app/providers'
import { TurnstileWidget } from '../TurnstileWidget'
import { SocialAuth } from '@/components/auth/SocialAuth'

const TURNSTILE_SITE_KEY = '0x4AAAAAAC58QEXTzEw4Mr-A'

export default function LoginPage() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const { language, setLanguage } = useLanguage()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetMode, setResetMode] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [captchaToken, setCaptchaToken] = useState('')
  const [captchaResetSignal, setCaptchaResetSignal] = useState(0)

  // MFA States
  const [showMfa, setShowMfa] = useState(false)
  const [mfaCode, setMfaCode] = useState('')
  const [mfaFactors, setMfaFactors] = useState<any[]>([])

  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push('/dashboard')
      }
    }
    checkSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        router.push('/dashboard')
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!captchaToken) {
      setError('Please complete Turnstile verification.')
      return
    }
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: { captchaToken },
      })
      if (error) throw error

      // Check for MFA factors
      const { data: factors, error: mfaError } = await supabase.auth.mfa.listFactors()
      if (mfaError) throw mfaError

      if (factors?.all?.length > 0) {
        setMfaFactors(factors.all)
        setShowMfa(true)
        setLoading(false)
      } else {
        router.push('/dashboard')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
      setCaptchaToken('')
      setCaptchaResetSignal((current) => current + 1)
    } finally {
      if (!showMfa) setLoading(false)
    }
  }

  const handleMfaVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (mfaCode.length !== 6) return
    setError('')
    setLoading(true)

    try {
      const factorId = mfaFactors[0].id
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId
      })
      if (challengeError) throw challengeError

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code: mfaCode
      })
      if (verifyError) throw verifyError

      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'MFA verification failed')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/settings`,
      })
      if (error) throw error
      setResetSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reset failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      {/* Background gradient orbs */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `
              radial-gradient(circle at 30% 20%, rgba(59, 130, 246, 0.08) 0%, transparent 50%),
              radial-gradient(circle at 70% 80%, rgba(139, 92, 246, 0.08) 0%, transparent 50%)
            `,
        }}
      />

      {/* Language Switcher */}
      <div className="fixed top-6 right-6 z-50 animate-fade-in">
        <div className="flex bg-white/5 backdrop-blur-md rounded-full p-1 border border-white/10 shadow-lg">
          {[
            { id: 'en', label: 'EN' },
            { id: 'zh-TW', label: '繁' }
          ].map((lang) => (
            <button
              key={lang.id}
              onClick={() => setLanguage(lang.id as any)}
              className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider transition-all"
              style={{
                background: language === lang.id ? 'var(--accent-primary)' : 'transparent',
                color: language === lang.id ? 'white' : 'var(--text-tertiary)'
              }}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="text-center mb-10 animate-fade-up">
          <div
            className="w-16 h-16 rounded-3xl mx-auto mb-4 flex items-center justify-center overflow-hidden"
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
          <h1
            className="text-3xl font-bold tracking-tight mb-2"
            style={{ color: 'var(--text-primary)' }}
          >
            {showMfa ? t('auth.mfa_title') : resetMode ? t('common.settings') : t('common.welcome')}
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
            {showMfa
              ? t('auth.mfa_subtitle')
              : resetMode
                ? t('auth.signin_subtitle')
                : t('auth.signin_subtitle')}
          </p>
        </div>

        {resetSent ? (
          <div className="glass-card p-6 text-center animate-scale-in">
            <div className="w-12 h-12 rounded-full bg-success-bg flex items-center justify-center mx-auto mb-4 text-success">
              <LogIn size={20} />
            </div>
            <h3 className="font-bold mb-2">{t('auth.check_email')}</h3>
            <p className="text-sm mb-6" style={{ color: 'var(--text-tertiary)' }}>
              {t('auth.reset_link_sent').replace('{email}', email)}
            </p>
            <button
              onClick={() => { setResetSent(false); setResetMode(false) }}
              className="text-sm font-semibold"
              style={{ color: 'var(--accent-primary)' }}
            >
              {t('auth.back_to_signin')}
            </button>
          </div>
        ) : showMfa ? (
          <form onSubmit={handleMfaVerify} className="space-y-6 animate-fade-up">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center"
                style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-primary)' }}>
                <Shield size={32} />
              </div>

              <div className="relative">
                <input
                  type="text"
                  maxLength={6}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder={t('auth.mfa_code_placeholder')}
                  className="input-glass text-center text-3xl font-bold tracking-[0.5em] py-6"
                  required
                  autoFocus
                  autoComplete="one-time-code"
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
              </div>
            </div>

            {error && (
              <div
                className="p-3 rounded-xl text-sm font-medium animate-scale-in"
                style={{ background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid rgba(255,59,48,0.2)' }}
              >
                {error}
              </div>
            )}

            <div className="space-y-3">
              <button
                type="submit"
                disabled={loading || mfaCode.length !== 6}
                className="btn-primary-gradient w-full py-4 flex items-center justify-center gap-2 text-base"
              >
                {loading ? (
                  <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <>{t('auth.verify_button')}</>
                )}
              </button>

              <button
                type="button"
                onClick={() => { setShowMfa(false); setMfaCode(''); }}
                className="w-full py-3 text-sm font-medium flex items-center justify-center gap-2"
                style={{ color: 'var(--text-tertiary)' }}
              >
                <ArrowLeft size={16} /> {t('common.back')}
              </button>
            </div>
          </form>
        ) : (
          <>
            <form onSubmit={resetMode ? handlePasswordReset : handleLogin} className="space-y-4 mb-6">
              <div className="animate-fade-up delay-1">
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  {t('settings.email')}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="input-glass"
                  required
                  autoFocus
                />
              </div>

              {!resetMode && (
                <div className="animate-fade-up delay-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                      {t('auth.password')}
                    </label>
                    <button
                      type="button"
                      onClick={() => setResetMode(true)}
                      className="text-xs font-semibold"
                      style={{ color: 'var(--accent-primary)' }}
                    >
                      {t('auth.forgot_password')}
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="input-glass pr-12"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                      style={{ color: 'var(--text-tertiary)' }}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              )}

              {!resetMode && (
                <div className="animate-fade-up delay-3">
                  <TurnstileWidget
                    siteKey={TURNSTILE_SITE_KEY}
                    onVerify={(token) => {
                      setCaptchaToken(token)
                      setError('')
                    }}
                    onExpire={() => setCaptchaToken('')}
                    resetSignal={captchaResetSignal}
                  />
                </div>
              )}

              {error && (
                <div
                  className="p-3 rounded-xl text-sm font-medium animate-scale-in"
                  style={{ background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid rgba(255,59,48,0.2)' }}
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary-gradient w-full py-4 flex items-center justify-center gap-2 text-base animate-fade-up delay-4"
              >
                {loading ? (
                  <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <>{resetMode ? <LogIn size={18} /> : <LogIn size={18} />} {resetMode ? t('auth.send_reset_link') : t('auth.signin')}</>
                )}
              </button>

              {resetMode && (
                <button
                  type="button"
                  onClick={() => setResetMode(false)}
                  className="w-full text-center text-sm font-medium"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  {t('auth.back_to_signin')}
                </button>
              )}
            </form>

            <div className="animate-fade-up delay-4 mb-8">
              <SocialAuth />
            </div>
          </>
        )}

        {!showMfa && (
          <div className="text-center animate-fade-up delay-4">
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
              {t('auth.no_account')}{' '}
              <Link href="/signup" className="font-semibold" style={{ color: 'var(--accent-primary)' }}>
                {t('auth.create_one')}
              </Link>
            </p>
          </div>
        )}

        {/* Footer links */}
        <div className="flex items-center justify-center gap-4 mt-8 animate-fade-up delay-5">
          <Link href="/privacy" className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{t('settings.privacy')}</Link>
          <span style={{ color: 'var(--text-tertiary)' }}>·</span>
          <Link href="/terms" className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{t('settings.terms')}</Link>
          <span style={{ color: 'var(--text-tertiary)' }}>·</span>
          <a href="https://bunorden.com" target="_blank" rel="noopener noreferrer" className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            Bunorden
          </a>
        </div>
      </div>
    </div>
  )
}
