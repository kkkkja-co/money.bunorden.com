'use client'

import { Shield, ArrowLeft, Lock, Database, Globe } from 'lucide-react'
import { MarketingSection } from '@/components/layout/MarketingPageShell'
import { useTranslation } from '@/app/providers'
import { BunordenFooter } from '@/components/layout/BunordenFooter'
import Link from 'next/link'

export default function PrivacyPage() {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 px-4 lg:px-8 py-10 max-w-3xl mx-auto w-full">
        <header className="flex items-center gap-4 mb-12 animate-slide-up">
          <Link href="/settings" className="w-10 h-10 rounded-xl bg-primary/5 border border-border flex items-center justify-center text-primary hover:bg-primary/10 transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-accent-primary/10 flex items-center justify-center text-accent-primary">
               <Shield size={20} />
             </div>
             <div>
               <h1 className="text-2xl font-bold tracking-tight text-primary">Transparency & Privacy</h1>
               <p className="text-[10px] font-black uppercase tracking-widest text-secondary">The Clavi Data Protocol</p>
             </div>
          </div>
        </header>

        <div className="space-y-16 animate-slide-up delay-1">
          <MarketingSection title="The Zero-Tracker Architecture">
              <p className="text-sm leading-relaxed text-secondary mb-6">
                Most financial apps rely on third-party marketing and analytics trackers to "improve services." 
                <strong> Clavi does not.</strong> Our application is built to be technologically invisible.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-primary/5 border border-border">
                  <Globe size={20} className="mb-3 text-accent-primary" />
                  <h4 className="font-bold text-sm mb-1 text-primary">No External Fonts</h4>
                  <p className="text-xs text-secondary leading-normal">We have removed Google Fonts. Your browser uses native SF Pro system fonts, ensuring Google never receives your IP address or request metadata.</p>
                </div>
                <div className="p-5 rounded-2xl bg-primary/5 border border-border">
                  <Shield size={20} className="mb-3 text-accent-primary" />
                  <h4 className="font-bold text-sm mb-1 text-primary">No Performance Trackers</h4>
                  <p className="text-xs text-secondary leading-normal">We do not use Google Analytics, Hotjar, or Mixpanel. We monitor system health through anonymous, edge-level server logs only.</p>
                </div>
              </div>
          </MarketingSection>

          <MarketingSection title="Data Storage Protocol">
              <p className="text-sm text-secondary mb-6">
                Your data is stored within your own vault segments on our secure Supabase infrastructure. 
                We use industrially hardened PostgreSQL with Row-Level Security (RLS) to ensure that only 
                your authenticated key can unlock your records.
              </p>
              <div className="overflow-hidden rounded-2xl border border-border bg-secondary shadow-sm">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-primary/5 border-b border-border">
                      <th className="p-4 font-bold uppercase tracking-wider text-[10px] text-secondary">Data Cluster</th>
                      <th className="p-4 font-bold uppercase tracking-wider text-[10px] text-secondary">Status</th>
                      <th className="p-4 font-bold uppercase tracking-wider text-[10px] text-secondary">Location</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-secondary">
                    <tr className="hover:bg-primary/5 transition-colors">
                      <td className="p-4 font-bold text-primary">Authentication</td>
                      <td className="p-4 italic">Email / MFA Key</td>
                      <td className="p-4">Supabase Vault (Encrypted)</td>
                    </tr>
                    <tr className="hover:bg-primary/5 transition-colors">
                      <td className="p-4 font-bold text-primary">Financial Records</td>
                      <td className="p-4 italic">Transactions / Budgets</td>
                      <td className="p-4">PostgreSQL (RLS Protected)</td>
                    </tr>
                    <tr className="hover:bg-primary/5 transition-colors">
                      <td className="p-4 font-bold text-primary">UX Preferences</td>
                      <td className="p-4 italic">Language / Theme</td>
                      <td className="p-4">Browser Storage</td>
                    </tr>
                  </tbody>
                </table>
              </div>
          </MarketingSection>

          <MarketingSection title="Right to Erasure & Portability">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-bold text-primary mb-2 flex items-center gap-2">
                    <Database size={16} /> Data Export
                  </h4>
                  <p className="text-xs text-secondary leading-relaxed">
                    You can download a full archive of your transactions in JSON or CSV format from the Settings hub at any time. You are never locked into the Clavi ecosystem.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-danger mb-2 flex items-center gap-2">
                    <Lock size={16} /> Instant Deletion
                  </h4>
                  <p className="text-xs text-secondary leading-relaxed">
                    When you delete your account, we physically remove all associated records from our database. There is no "soft delete" period; once purged, the data is gone forever.
                  </p>
                </div>
              </div>
          </MarketingSection>

          <MarketingSection title="Contact Transparency">
              <div className="p-8 rounded-[32px] bg-primary/5 border border-border text-center">
                <p className="text-sm text-secondary mb-4 italic">"We believe privacy is a human right, not a feature."</p>
                <a 
                  href="mailto:privacy@bunorden.com" 
                  className="inline-block px-8 py-3 rounded-full bg-accent-primary text-white text-xs font-bold uppercase tracking-widest shadow-lg shadow-accent-primary/20 transition-all hover:scale-105 active:scale-95"
                >
                  Contact Privacy Officer
                </a>
              </div>
          </MarketingSection>
        </div>
      </div>
      <BunordenFooter />
    </div>
  )
}
