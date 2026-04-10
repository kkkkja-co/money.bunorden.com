'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { PERSONA_PRESETS } from '@/lib/presets'
import { Check, ArrowLeft, Sparkles } from 'lucide-react'

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [selectedPersona, setSelectedPersona] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleComplete = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Update profile
      await supabase
        .from('profiles')
        .update({
          onboarding_done: true,
          display_name: displayName.trim() || null,
        })
        .eq('id', user.id)

      // Create default account
      await supabase.from('accounts').insert({
        user_id: user.id,
        name: 'Main Account',
        icon: '💳',
        is_default: true,
      })

      // Create categories based on persona
      const persona = PERSONA_PRESETS.find((p) => p.id === selectedPersona)
      if (persona && persona.id !== 'custom') {
        const categories = persona.categories.map((cat) => ({
          user_id: user.id,
          name: cat.name,
          icon: cat.icon,
          type: cat.type,
        }))
        await supabase.from('categories').insert(categories)
      }

      router.push('/dashboard')
    } catch (error) {
      console.error('Onboarding error:', error)
    } finally {
      setLoading(false)
    }
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
          {[1, 2, 3].map((s) => (
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

        {/* Step 1: Name */}
        {step === 1 && (
          <div className="animate-fade-up text-center">
            <div
              className="w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)',
              }}
            >
              <Sparkles size={36} color="#fff" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-2" style={{ color: 'var(--text-primary)' }}>
              Welcome to Ledger
            </h1>
            <p className="text-sm mb-8" style={{ color: 'var(--text-tertiary)' }}>
              Let&apos;s set up your account. What should we call you?
            </p>

            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name (optional)"
              className="input-glass text-center text-lg py-4 mb-6 max-w-sm mx-auto"
            />

            <button
              onClick={() => setStep(2)}
              className="btn-primary-gradient w-full max-w-sm mx-auto py-4 text-base block"
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 2: Persona */}
        {step === 2 && (
          <div className="animate-fade-up">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-2 mb-6 text-sm font-medium"
              style={{ color: 'var(--text-tertiary)' }}
            >
              <ArrowLeft size={16} /> Back
            </button>

            <h1 className="text-3xl font-bold tracking-tight mb-2 text-center" style={{ color: 'var(--text-primary)' }}>
              Which best describes you?
            </h1>
            <p className="text-sm text-center mb-8" style={{ color: 'var(--text-tertiary)' }}>
              We&apos;ll set up categories to get you started
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {PERSONA_PRESETS.map((persona) => (
                <button
                  key={persona.id}
                  onClick={() => {
                    setSelectedPersona(persona.id)
                    setStep(3)
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
                    {persona.label}
                  </h3>
                  <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    {persona.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Ready */}
        {step === 3 && (
          <div className="animate-fade-up text-center">
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-2 mb-6 text-sm font-medium"
              style={{ color: 'var(--text-tertiary)' }}
            >
              <ArrowLeft size={16} /> Back
            </button>

            <div
              className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
              style={{ background: 'var(--success-bg)' }}
            >
              <Check size={40} style={{ color: 'var(--success)' }} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-2" style={{ color: 'var(--text-primary)' }}>
              Ready to go!
            </h1>
            <p className="text-sm mb-8" style={{ color: 'var(--text-tertiary)' }}>
              Your account is set up. Start tracking your finances now.
            </p>

            <button
              onClick={handleComplete}
              disabled={loading}
              className="btn-primary-gradient w-full max-w-sm mx-auto py-4 text-base flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                'Get started'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
