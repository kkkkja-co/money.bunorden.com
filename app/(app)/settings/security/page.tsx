'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useTranslation } from '@/app/providers'
import { ArrowLeft, Shield, Check, X, Smartphone } from 'lucide-react'

export default function SecurityPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const [factors, setFactors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMFA = async () => {
      const { data } = await supabase.auth.mfa.listFactors()
      setFactors(data?.all || [])
      setLoading(false)
    }
    fetchMFA()
  }, [])

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 max-w-xl mx-auto w-full px-5 py-8 md:py-12">
        <header className="flex items-center gap-4 mb-10 animate-fade-up">
          <button 
            onClick={() => router.back()} 
            className="w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center text-primary active:scale-95 transition-transform"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-primary">{t('settings.mfa_title')}</h1>
            <p className="text-[10px] font-black uppercase tracking-widest text-secondary mt-1">Multi-Factor Authentication</p>
          </div>
        </header>

        <section className="animate-fade-up delay-1">
          <div className="surface-elevated p-8 text-center mb-8">
            <div className="w-16 h-16 rounded-3xl bg-accent-primary/10 text-accent-primary flex items-center justify-center mx-auto mb-6">
              <Shield size={32} />
            </div>
            <h2 className="text-xl font-bold mb-2">
              {factors.length > 0 ? 'MFA is Enabled' : 'MFA is Disabled'}
            </h2>
            <p className="text-sm text-secondary max-w-xs mx-auto mb-8">
              {factors.length > 0 
                ? 'Your account is secured with a secondary verification layer.' 
                : 'Add an extra layer of security to your account. Only you can access your vault.'}
            </p>

            {factors.length > 0 ? (
              <div className="list-wrapper text-left bg-black/20">
                {factors.map(f => (
                  <div key={f.id} className="list-item">
                    <Smartphone size={18} className="text-accent-primary" />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-primary">{f.friendly_name || 'Authenticator App'}</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-secondary opacity-50">Active</p>
                    </div>
                    <Check size={16} className="text-success" />
                  </div>
                ))}
              </div>
            ) : (
              <button 
                className="btn-apple-primary w-full py-4 text-sm"
                onClick={() => {}} // Integration for setup would go here
              >
                Setup Authenticator
              </button>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
