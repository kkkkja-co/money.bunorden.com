'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { Eye, EyeOff, LogIn, Shield, ArrowLeft, Mail } from 'lucide-react'
import { useTranslation, useTheme, useLanguage } from '@/app/providers'
import { TurnstileWidget } from '../TurnstileWidget'
import { SocialAuth } from '@/components/auth/SocialAuth'

const TURNSTILE_SITE_KEY = '0x4AAAAAAC58QEXTzEw4Mr-A'

type AuthStep = 'login' | 'mfa'

export default function LoginPage() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const { language, setLanguage } = useLanguage()

  // Form state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetMode, setResetMode] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [captchaToken, setCaptchaToken] = useState('')
  const [captchaResetSignal, setCaptchaResetSignal] = useState(0)
  const [magicLinkSent, setMagicLinkSent] = useState(false)

  // MFA state — using a single step to avoid race conditions
  const [step, setStep] = useState<AuthStep>('login')
  const [mfaCode, setMfaCode] = useState('')
  const [mfaFactorId, setMfaFactorId] = useState<string | null>(null)

  // Prevent onAuthStateChange from interfering while we handle MFA ourselves
  const handlingMfaRef = useRef(false)

  const router = useRouter()
  const searchParams = useSearchParams()

  // Show error from auth callback failures (e.g. expired magic link)
  useEffect(() => {
    const cbError = searchParams.get('error')
    if (cbError === 'auth_callback_failed') {
      setError('The sign-in link has expired or is invalid. Please try again.')
    }
  }, [searchParams])

  // ─── Check existing session on mount (only) ──────────────────────────────
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      // If a session already exists and assurance is already aal2 (or no MFA)
      const { data: mfaData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
      if (!mfaData || mfaData.currentLevel === mfaData.nextLevel) {
        router.replace('/dashboard')
      }
      // Otherwise, leave on login page — user needs to re-authenticate
    }
    checkSession()
  }, [router])

  // ─── Handle Magic Link ────────────────────────────────────────────────────
  const handleMagicLink = async () => {
    if (!email) {
      setError('Please enter your email first.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
        },
      })
      if (error) throw error
      setMagicLinkSent(true)
    } catch (err: any) {
      setError(err.message || 'Failed to send magic link')
    } finally {
      setLoading(false)
    }
  }

  // ─── Handle Password Login ────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!captchaToken) {
      setError('Please complete Turnstile verification.')
      return
    }

    setLoading(true)

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: { captchaToken },
      })

      if (signInError) throw signInError

      // Check MFA assurance level — this is authoritative.
      const { data: mfaData, error: mfaLevelError } =
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel()

      if (mfaLevelError) throw mfaLevelError

      if (mfaData && mfaData.nextLevel === 'aal2' && mfaData.currentLevel !== 'aal2') {
        // User has MFA enrolled — find a verified TOTP factor
        const { data: factorsData, error: factorsError } =
          await supabase.auth.mfa.listFactors()

        if (factorsError) throw factorsError

        // Only use factors that are verified (status === 'verified')
        const verifiedFactor = factorsData?.totp?.find(
          (f) => f.factor_type === 'totp' && f.status === 'verified'
        ) ?? factorsData?.all?.find(
          (f) => f.status === 'verified'
        )

        if (verifiedFactor) {
          handlingMfaRef.current = true
          setMfaFactorId(verifiedFactor.id)
          setStep('mfa')
          setLoading(false)
          return
        }
      }

      // No MFA required — proceed to dashboard
      router.replace('/dashboard')
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Login failed')
      setCaptchaToken('')
      setCaptchaResetSignal((c) => c + 1)
      setLoading(false)
    }
  }

  // ─── Handle MFA Verification ──────────────────────────────────────────────
  const handleMfaVerify = async (e: React.FormEvent) => {
    e.preventDefault()

    if (mfaCode.length !== 6 || !mfaFactorId) return

    setError('')
    setLoading(true)

    try {
      // Step 1: Create a challenge
      const { data: challengeData, error: challengeError } =
        await supabase.auth.mfa.challenge({ factorId: mfaFactorId })

      if (challengeError) throw challengeError

      // Step 2: Verify with the code
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: mfaFactorId,
        challengeId: challengeData.id,
        code: mfaCode,
      })

      if (verifyError) throw verifyError

      // Success — navigate to dashboard
      router.replace('/dashboard')
    } catch (err: any) {
      setLoading(false)
      setError(err?.message || 'MFA verification failed')
      setMfaCode('')
    }
  }

  // ─── Handle MFA Back (cancel MFA, sign out) ───────────────────────────────
  const handleMfaBack = async () => {
    handlingMfaRef.current = false
    // Sign out to clear the aal1 session — don't leave a partial session
    await supabase.auth.signOut()
    setStep('login')
    setMfaCode('')
    setMfaFactorId(null)
    setError('')
    setCaptchaToken('')
    setCaptchaResetSignal((c) => c + 1)
  }

  // ─── Handle Password Reset ────────────────────────────────────────────────
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

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-8 overflow-y-auto">
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

      <div className="w-full max-w-sm relative z-10 flex flex-col my-auto">
        {/* Logo */}
        <div className="text-center mb-10 animate-slide-up">
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
            {step === 'mfa' ? t('auth.mfa_title') : resetMode ? t('common.settings') : t('common.welcome')}
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
            {step === 'mfa' ? t('auth.mfa_subtitle') : t('auth.signin_subtitle')}
          </p>
        </div>

        {/* ── Email Sent States ── */}
        {(resetSent || magicLinkSent) ? (
          <div className="surface-elevated p-6 text-center animate-scale-in">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-success" style={{ background: 'rgba(52, 199, 89, 0.1)' }}>
              <Mail size={20} />
            </div>
            <h3 className="font-bold mb-2">{t('auth.check_email')}</h3>
            <p className="text-sm mb-6" style={{ color: 'var(--text-tertiary)' }}>
              {magicLinkSent ? t('auth.magic_link_sent') : t('auth.reset_link_sent').replace('{email}', email)}
            </p>
            <button
              onClick={() => { setResetSent(false); setResetMode(false); setMagicLinkSent(false) }}
              className="text-sm font-semibold"
              style={{ color: 'var(--accent-primary)' }}
            >
              {t('auth.back_to_signin')}
            </button>
          </div>

        ) : step === 'mfa' ? (
          /* ── MFA Step ── */
          <form onSubmit={handleMfaVerify} className="space-y-6 animate-slide-up">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center"
                style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-primary)' }}>
                <Shield size={32} />
              </div>

              <div className="flex justify-center max-w-[280px] mx-auto">
                <input
                  type="text"
                  maxLength={6}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder={t('auth.mfa_code_placeholder')}
                  className="input-minimal text-center text-3xl font-black tracking-[0.3em] py-8 w-full"
                  required
                  autoFocus
                  autoComplete="one-time-code"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  disabled={loading}
                />
              </div>
            </div>

            {error && (
              <div
                className="p-3 rounded-xl text-sm font-medium animate-scale-in"
                style={{ background: 'rgba(255, 59, 48, 0.1)', color: 'var(--danger)', border: '1px solid rgba(255,59,48,0.2)' }}
              >
                {error}
              </div>
            )}

            <div className="space-y-3">
              <button
                type="submit"
                disabled={loading || mfaCode.length !== 6}
                className="btn-apple-primary w-full py-4 flex items-center justify-center gap-2 text-base"
              >
                {loading ? (
                  <span className="animate-pulse font-bold tracking-[0.2em] text-[10px] uppercase opacity-60">Verifying...</span>
                ) : (
                  <>{t('auth.verify_button')}</>
                )}
              </button>

              <button
                type="button"
                onClick={handleMfaBack}
                disabled={loading}
                className="w-full py-3 text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ color: 'var(--text-tertiary)' }}
              >
                <ArrowLeft size={16} /> {t('common.back')}
              </button>
            </div>
          </form>

        ) : (
          /* ── Login / Reset Step ── */
          <>
            <form onSubmit={resetMode ? handlePasswordReset : handleLogin} className="space-y-4 mb-6">
              <div className="animate-slide-up delay-1">
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  {t('settings.email')}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ghost@example.com"
                  className="input-minimal w-full"
                  required
                  autoFocus
                />
              </div>

              {!resetMode && (
                <div className="animate-slide-up delay-2">
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
                      className="input-minimal w-full pr-12"
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
                <div className="animate-slide-up delay-3">
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
                  style={{ background: 'rgba(255, 59, 48, 0.1)', color: 'var(--danger)', border: '1px solid rgba(255,59,48,0.2)' }}
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-apple-primary w-full py-4 flex items-center justify-center gap-2 text-base animate-slide-up delay-4"
              >
                {loading ? (
                  <span className="animate-pulse font-bold tracking-[0.2em] text-[10px] uppercase opacity-60">Working...</span>
                ) : (
                  <><LogIn size={18} /> {resetMode ? t('auth.send_reset_link') : t('auth.signin')}</>
                )}
              </button>

              {!resetMode && (
                <button
                  type="button"
                  onClick={handleMagicLink}
                  disabled={loading}
                  className="w-full py-3 text-sm font-semibold transition-all hover:opacity-80 flex items-center justify-center gap-2"
                  style={{ color: 'var(--accent-primary)' }}
                >
                  <Mail size={16} />
                  {t('auth.send_magic_link')}
                </button>
              )}

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

            <div className="animate-slide-up delay-4 mb-8">
              <SocialAuth />
            </div>
          </>
        )}

        {step === 'login' && (
          <div className="text-center animate-slide-up delay-4">
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
              {t('auth.no_account')}{' '}
              <Link href="/signup" className="font-semibold" style={{ color: 'var(--accent-primary)' }}>
                {t('auth.create_one')}
              </Link>
            </p>
          </div>
        )}

        {/* Footer links */}
        <div className="flex items-center justify-center gap-4 mt-8 animate-slide-up delay-5">
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
