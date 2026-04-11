'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useTranslation } from '@/app/providers'
import { ArrowLeft, Shield, Check, X, Smartphone, AlertTriangle, Loader2 } from 'lucide-react'

export default function SecurityPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const [factors, setFactors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [disabling, setDisabling] = useState(false)
  const [error, setError] = useState('')

  const fetchMFA = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.auth.mfa.listFactors()
    if (!error) {
      setFactors(data?.all || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchMFA()
  }, [fetchMFA])

  const handleDisableMFA = async (factorId: string) => {
    if (!confirm('Are you absolutely sure? Disabling 2FA will make your vault significantly less secure.')) return
    
    setDisabling(true)
    setError('')
    try {
      const { error } = await supabase.auth.mfa.unenroll({ factorId })
      if (error) throw error
      await fetchMFA()
    } catch (err: any) {
      setError(err.message || 'Failed to disable MFA')
    } finally {
      setDisabling(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 max-w-xl mx-auto w-full px-5 py-8 md:py-12">
        <header className="flex items-center gap-4 mb-10 animate-slide-up">
          <button 
            onClick={() => router.back()} 
            className="w-10 h-10 rounded-xl bg-primary/5 border border-border flex items-center justify-center text-primary active:scale-95 transition-transform"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-primary">{t('settings.mfa_title')}</h1>
            <p className="text-[10px] font-black uppercase tracking-widest text-secondary mt-1">Vault Security Protocols</p>
          </div>
        </header>

        <section className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          {loading ? (
            <div className="surface-elevated p-12 text-center animate-pulse-slow">
              <span className="font-black text-[10px] tracking-[0.3em] uppercase opacity-40">Scanning Vault...</span>
            </div>
          ) : (
            <div className="surface-elevated p-8 text-center mb-8 relative overflow-hidden">
               {/* Background Glow */}
               <div className="absolute top-0 right-0 w-32 h-32 bg-accent-primary/5 blur-3xl -mr-16 -mt-16 pointer-events-none" />
               
              <div className="w-16 h-16 rounded-3xl bg-accent-primary/10 text-accent-primary flex items-center justify-center mx-auto mb-6">
                <Shield size={32} />
              </div>
              <h2 className="text-xl font-bold mb-2 text-primary">
                {factors.length > 0 ? 'MFA Protection Active' : 'Vault Exposure Detected'}
              </h2>
              <p className="text-sm text-secondary max-w-xs mx-auto mb-10">
                {factors.length > 0 
                  ? 'Your financial vault is locked with dual-layer encryption.' 
                  : 'Add an extra layer of security to your account. Without MFA, your vault relies solely on a password.'}
              </p>

              {factors.length > 0 ? (
                <div className="space-y-6">
                  <div className="list-wrapper text-left">
                    {factors.map(f => (
                      <div key={f.id} className="list-item">
                        <Smartphone size={18} className="text-accent-primary" />
                        <div className="flex-1">
                          <p className="text-sm font-bold text-primary">{f.friendly_name || 'Authenticator'}</p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-success">Secured</p>
                        </div>
                        <Check size={16} className="text-success" />
                      </div>
                    ))}
                  </div>

                  <div className="pt-6 border-t border-border">
                    <div className="flex items-start gap-3 p-4 rounded-2xl bg-danger/5 border border-danger/10 mb-6 text-left">
                      <AlertTriangle size={18} className="text-danger flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-danger uppercase tracking-wider mb-1">Security Warning</p>
                        <p className="text-[11px] text-danger/80 leading-relaxed">
                          Disabling Multi-Factor Authentication is <strong>strongly discouraged</strong>. It significantly increases the risk of unauthorized access to your private financial data.
                        </p>
                      </div>
                    </div>

                    <button 
                      className="w-full py-4 text-xs font-black uppercase tracking-[0.2em] text-danger hover:bg-danger/5 rounded-2xl transition-all disabled:opacity-50"
                      onClick={() => handleDisableMFA(factors[0].id)}
                      disabled={disabling}
                    >
                      {disabling ? 'Deactivating...' : 'Disable Vault Protection'}
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  className="btn-apple-primary w-full py-4 text-sm font-bold"
                  onClick={() => router.push('/settings/security/setup')}
                >
                  Configure Security Key
                </button>
              )}

              {error && (
                <div className="mt-4 p-3 rounded-xl bg-danger/10 text-danger text-xs font-bold border border-danger/10">
                  {error}
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
