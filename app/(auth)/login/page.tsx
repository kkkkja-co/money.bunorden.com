'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { Eye, EyeOff, LogIn } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetMode, setResetMode] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
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

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="text-center mb-10 animate-fade-up">
          <div
            className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold"
            style={{
              background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
              boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)',
            }}
          >
            L
          </div>
          <h1
            className="text-3xl font-bold tracking-tight mb-2"
            style={{ color: 'var(--text-primary)' }}
          >
            {resetMode ? 'Reset password' : 'Welcome back'}
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
            {resetMode 
              ? 'We\'ll send a link to your email to reset your password' 
              : 'Sign in to your Ledger account'}
          </p>
        </div>

        {resetSent ? (
          <div className="glass-card p-6 text-center animate-scale-in">
            <div className="w-12 h-12 rounded-full bg-success-bg flex items-center justify-center mx-auto mb-4 text-success">
              <LogIn size={20} />
            </div>
            <h3 className="font-bold mb-2">Check your email</h3>
            <p className="text-sm mb-6" style={{ color: 'var(--text-tertiary)' }}>
              We&apos;ve sent a password reset link to <span className="text-white">{email}</span>.
            </p>
            <button
              onClick={() => { setResetSent(false); setResetMode(false) }}
              className="text-sm font-semibold"
              style={{ color: 'var(--accent-primary)' }}
            >
              Back to Sign in
            </button>
          </div>
        ) : (
          <form onSubmit={resetMode ? handlePasswordReset : handleLogin} className="space-y-4 mb-6">
            <div className="animate-fade-up delay-1">
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Email
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
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setResetMode(true)}
                    className="text-xs font-semibold"
                    style={{ color: 'var(--accent-primary)' }}
                  >
                    Forgot?
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
              className="btn-primary-gradient w-full py-4 flex items-center justify-center gap-2 text-base animate-fade-up delay-3"
            >
              {loading ? (
                <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <>{resetMode ? <LogIn size={18} /> : <LogIn size={18} />} {resetMode ? 'Send reset link' : 'Sign in'}</>
              )}
            </button>

            {resetMode && (
              <button
                type="button"
                onClick={() => setResetMode(false)}
                className="w-full text-center text-sm font-medium"
                style={{ color: 'var(--text-tertiary)' }}
              >
                Back to Sign in
              </button>
            )}
          </form>
        )}

        <div className="text-center animate-fade-up delay-4">
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-semibold" style={{ color: 'var(--accent-primary)' }}>
              Create one
            </Link>
          </p>
        </div>

        {/* Footer links */}
        <div className="flex items-center justify-center gap-4 mt-8 animate-fade-up delay-5">
          <Link href="/privacy" className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Privacy</Link>
          <span style={{ color: 'var(--text-tertiary)' }}>·</span>
          <Link href="/terms" className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Terms</Link>
          <span style={{ color: 'var(--text-tertiary)' }}>·</span>
          <a href="https://bunorden.com" target="_blank" rel="noopener noreferrer" className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            Bunorden
          </a>
        </div>
      </div>
    </div>
  )
}
