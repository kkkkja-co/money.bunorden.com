'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { Eye, EyeOff, UserPlus } from 'lucide-react'
import { useTheme } from '@/app/providers'

export default function SignupPage() {
  const { theme } = useTheme()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    // Password validation logic
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumber = /[0-9]/.test(password)
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password)
    const isLongEnough = password.length >= 8

    if (!isLongEnough || !hasUpperCase || !hasLowerCase || !hasNumber || !hasSymbol) {
      setError('Password does not meet the security requirements')
      return
    }

    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      })
      
      if (error) throw error
      
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed')
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
              className="w-full h-full object-cover text-white"
            />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2" style={{ color: 'var(--text-primary)' }}>
            Create account
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
            Join Clavi — your privacy is our priority
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4 mb-6">
          {!success && (
            <>
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

              <div className="animate-fade-up delay-2">
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Password
                </label>
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
                
                {/* Requirements indicator */}
                <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 px-1 py-1">
                  {[
                    { label: '8+ Characters', met: password.length >= 8 },
                    { label: 'Uppercase', met: /[A-Z]/.test(password) },
                    { label: 'Lowercase', met: /[a-z]/.test(password) },
                    { label: 'Digit & Symbol', met: /[0-9]/.test(password) && /[!@#$%^&*(),.?":{}|<>]/.test(password) },
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

              <div className="animate-fade-up delay-3">
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Confirm password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-glass"
                  required
                />
              </div>
            </>
          )}

          {error && (
            <div
              className="p-3 rounded-xl text-sm font-medium animate-scale-in"
              style={{ background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid rgba(255,59,48,0.2)' }}
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
              <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Check your email</h2>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                We&apos;ve sent a confirmation link to <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{email}</span>. 
                Please click it to activate your account.
              </p>
              <button
                type="button"
                onClick={() => setSuccess(false)}
                className="text-xs font-semibold underline"
                style={{ color: 'var(--accent-primary)' }}
              >
                Use another email
              </button>
            </div>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="btn-primary-gradient w-full py-4 flex items-center justify-center gap-2 text-base animate-fade-up delay-4"
            >
              {loading ? (
                <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <><UserPlus size={18} /> Create account</>
              )}
            </button>
          )}
        </form>
        <div className="text-center animate-fade-up delay-5">
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
            Already have an account?{' '}
            <Link href="/login" className="font-semibold" style={{ color: 'var(--accent-primary)' }}>
              Sign in
            </Link>
          </p>
        </div>

        {/* Footer links */}
        <div className="flex items-center justify-center gap-4 mt-8 animate-fade-up delay-6">
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
