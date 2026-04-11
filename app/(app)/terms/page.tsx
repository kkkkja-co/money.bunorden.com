'use client'

import { Scale, ArrowLeft, Heart, Zap, Globe } from 'lucide-react'
import { MarketingSection } from '@/components/layout/MarketingPageShell'
import { useTranslation } from '@/app/providers'
import { BunordenFooter } from '@/components/layout/BunordenFooter'
import Link from 'next/link'

export default function TermsPage() {
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
               <Scale size={20} />
             </div>
             <div>
               <h1 className="text-2xl font-bold tracking-tight text-primary">Terms of Service</h1>
               <p className="text-[10px] font-black uppercase tracking-widest text-secondary">The Clavi User Agreement</p>
             </div>
          </div>
        </header>

        <div className="space-y-16 animate-slide-up delay-1">
          <MarketingSection title="The Key Principle">
              <p className="text-sm leading-relaxed text-secondary mb-4 italic">
                By entering the Clavi vault, you agree to these fundamental tenets of our service.
              </p>
              <p className="text-sm text-secondary leading-relaxed">
                Clavi is a financial management platform designed as a "Self-Custodial Vault." We provide the 
                infrastructure to visualize and manage your wealth, but <strong>you hold the key.</strong> 
                We do not have the technical ability to view your sensitive financial records without your 
                authenticated session.
              </p>
          </MarketingSection>

          <MarketingSection title="User Responsibilities">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl bg-primary/5 border border-border">
                <Zap size={20} className="mb-3 text-accent-primary" />
                <h4 className="font-bold text-sm mb-1 text-primary">Absolute Accuracy</h4>
                <p className="text-xs text-secondary leading-normal">You are responsible for the accuracy of the data you enter into the vault. Clavi is a visualization tool, not a financial advisor.</p>
              </div>
              <div className="p-6 rounded-2xl bg-primary/5 border border-border">
                <Lock size={20} className="mb-3 text-accent-primary" />
                <h4 className="font-bold text-sm mb-1 text-primary">Vault Security</h4>
                <p className="text-xs text-secondary leading-normal">You are solely responsible for maintaining the security of your account credentials and MFA keys.</p>
              </div>
            </div>
          </MarketingSection>

          <MarketingSection title="Data Governance">
              <p className="text-sm text-secondary mb-6">
                You retain 100% ownership of any data you upload or enter. 
                Clavi does not claim any intellectual property rights over your financial records. 
                We facilitate the processing of this data only to provide the service as requested by you.
              </p>
              <div className="p-5 rounded-2xl bg-success/5 border border-success/10 flex items-start gap-4">
                <Heart size={20} className="text-success shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-success mb-1">Human-First Support</h4>
                  <p className="text-xs text-success/80 leading-relaxed font-medium">We do not sell your data. We do not run ads. Our growth is fueled by users who value a high-performance, private digital experience.</p>
                </div>
              </div>
          </MarketingSection>

          <MarketingSection title="Infrastructure Acknowledgment">
              <p className="text-sm text-secondary mb-4">
                To provide a globally available and secure experience, we utilize trusted infrastructure:
              </p>
              <ul className="space-y-3">
                <li className="flex gap-3 text-xs text-secondary">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent-primary mt-1.5 shrink-0" />
                  <span><strong>Supabase:</strong> For industrial-grade data integrity and authenticated sessions.</span>
                </li>
                <li className="flex gap-3 text-xs text-secondary">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent-primary mt-1.5 shrink-0" />
                  <span><strong>Vercel:</strong> For the global delivery and execution of the Unified Fluid Surface.</span>
                </li>
                <li className="flex gap-3 text-xs text-secondary">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent-primary mt-1.5 shrink-0" />
                  <span><strong>SF Pro Typography:</strong> We use local system fonts to avoid third-party font tracking.</span>
                </li>
              </ul>
          </MarketingSection>

          <MarketingSection title="Modifications">
              <p className="text-sm text-secondary leading-relaxed">
                We reserve the right to evolve the Clavi vault. Substantial changes to these terms 
                will be communicated across our communication channels. Continued use of the vault 
                constitutes acceptance of any updated protocols.
              </p>
          </MarketingSection>
        </div>
      </div>
      <BunordenFooter />
    </div>
  )
}
