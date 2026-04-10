'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { BunordenFooter } from '@/components/layout/BunordenFooter'
import { PERSONA_PRESETS } from '@/lib/presets'

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [selectedPersona, setSelectedPersona] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleComplete = async () => {
    setLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error('Not authenticated')

      // Update profile to mark onboarding as done
      const { error } = await supabase
        .from('profiles')
        .update({ onboarding_done: true })
        .eq('id', user.id)

      if (error) throw error

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
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-black px-4">
      <div className="w-full max-w-2xl">
        {step === 1 && (
          <div>
            <h1 className="text-3xl font-bold text-[#1C1C1E] dark:text-white mb-2 text-center">
              Which best describes you?
            </h1>
            <p className="text-[#636366] dark:text-[#8E8E93] text-center mb-8">
              We&apos;ll pre-populate some categories to get you started
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {PERSONA_PRESETS.map((persona) => (
                <button
                  key={persona.id}
                  onClick={() => {
                    setSelectedPersona(persona.id)
                    setStep(2)
                  }}
                  className={`p-6 rounded-[16px] border-2 transition-all text-center ${
                    selectedPersona === persona.id
                      ? 'border-[#007AFF] bg-[#007AFF]/5'
                      : 'border-[#E5E5EA] dark:border-[#38383A] hover:border-[#007AFF]'
                  }`}
                >
                  <div className="text-4xl mb-3">{persona.icon}</div>
                  <h3 className="font-semibold text-[#1C1C1E] dark:text-white mb-1">
                    {persona.label}
                  </h3>
                  <p className="text-xs text-[#636366] dark:text-[#8E8E93]">
                    {persona.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h1 className="text-3xl font-bold text-[#1C1C1E] dark:text-white mb-2 text-center">
              Ready to go!
            </h1>
            <p className="text-[#636366] dark:text-[#8E8E93] text-center mb-8">
              Your account is set up. Start tracking your finances now.
            </p>

            <button onClick={handleComplete} disabled={loading} className="btn-primary w-full mb-4">
              {loading ? 'Setting up...' : 'Get started'}
            </button>
          </div>
        )}
      </div>

      <div className="mt-auto pt-8">
        <BunordenFooter />
      </div>
    </div>
  )
}
