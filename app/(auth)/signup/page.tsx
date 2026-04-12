'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { Eye, EyeOff, UserPlus, Languages } from 'lucide-react'
import { useTheme, useTranslation, useLanguage } from '@/app/providers'
import { TurnstileWidget } from '../TurnstileWidget'
import { SocialAuth } from '@/components/auth/SocialAuth'

const TURNSTILE_SITE_KEY = '0x4AAAAAAC58QEXTzEw4Mr-A'

export default function SignupPage() {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const { language, setLanguage } = useLanguage()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [captchaToken, setCaptchaToken] = useState('')
  const [captchaResetSignal, setCaptchaResetSignal] = useState(0)
  const router = useRouter()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    if (!captchaToken) {
      setError('Please complete Turnstile verification.')
      return
    }

    if (password !== confirmPassword) {
      setError(t('auth.pass_match_error'))
      return
    }
    
    // Password validation logic
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumber = /[0-9]/.test(password)
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password)
    const isLongEnough = password.length >= 8

    if (!isLongEnough || !hasUpperCase || !hasLowerCase || !hasNumber || !hasSymbol) {
      setError(t('auth.pass_requirements_error'))
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          captchaToken,
        }
      })
      
      if (error) throw error
      
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed')
      setCaptchaToken('')
      setCaptchaResetSignal((current) => current + 1)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      {/* Background */}
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
              className="w-full h-full object-cover text-white"
            />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2" style={{ color: 'var(--text-primary)' }}>
            {t('auth.signup')}
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
            {t('auth.signup_slogan')}
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4 mb-6">
          {!success && (
            <>
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

              <div className="animate-slide-up delay-2">
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  {t('auth.password')}
                </label>
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
                
                {/* Requirements indicator */}
                <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 px-1 py-1">
                  {[
                    { label: t('auth.pass_8_chars'), met: password.length >= 8 },
                    { label: t('auth.pass_upper'), met: /[A-Z]/.test(password) },
                    { label: t('auth.pass_lower'), met: /[a-z]/.test(password) },
                    { label: t('auth.pass_digit_symbol'), met: /[0-9]/.test(password) && /[!@#$%^&*(),.?":{}|<>]/.test(password) },
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

              <div className="animate-slide-up delay-3">
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  {t('auth.confirm_password')}
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-minimal w-full"
                  required
                />
              </div>

              <div className="animate-slide-up delay-4">
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
            </>
          )}

          {error && (
            <div
              className="p-3 rounded-xl text-sm font-medium animate-scale-in"
              style={{ background: 'rgba(255, 59, 48, 0.1)', color: 'var(--danger)', border: '1px solid rgba(255,59,48,0.2)' }}
            >
              {error}
            </div>
          )}

          {success ? (
            <div
              className="p-6 rounded-2xl text-center space-y-4 animate-scale-in"
              style={{ background: 'rgba(52, 199, 89, 0.1)', border: '1px solid rgba(52, 199, 89, 0.2)' }}
            >
              <div className="w-12 h-12 bg-green-500 rounded-full mx-auto flex items-center justify-center text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{t('auth.check_email')}</h2>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {t('auth.reset_link_sent').replace('{email}', email)} 
                {t('auth.activation_sent')}
              </p>
              <button
                type="button"
                onClick={() => setSuccess(false)}
                className="text-xs font-semibold underline"
                style={{ color: 'var(--accent-primary)' }}
              >
                {t('auth.use_another_email')}
              </button>
            </div>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="btn-apple-primary w-full py-4 flex items-center justify-center gap-2 text-base animate-slide-up delay-5"
            >
              {loading ? (
                <span className="animate-pulse font-bold tracking-[0.2em] text-[10px] uppercase opacity-60">Working...</span>
              ) : (
                <><UserPlus size={18} /> {t('auth.signup')}</>
              )}
            </button>
          )}
        </form>

        {!success && (
          <div className="animate-slide-up delay-5 mb-8">
            <SocialAuth />
          </div>
        )}
        <div className="text-center animate-slide-up delay-5">
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
            {t('auth.have_account')}{' '}
            <Link href="/login" className="font-semibold" style={{ color: 'var(--accent-primary)' }}>
              {t('auth.signin')}
            </Link>
          </p>
        </div>

        {/* Footer links */}
        <div className="flex items-center justify-center gap-4 mt-8 animate-slide-up delay-6">
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
