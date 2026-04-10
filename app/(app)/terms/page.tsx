'use client'

import { Scale } from 'lucide-react'
import { MarketingPageShell, MarketingSection } from '@/components/layout/MarketingPageShell'

export default function TermsPage() {
  return (
    <MarketingPageShell title="Terms of Use" subtitle="Clear, simple, and fair. Your rights matter." icon={Scale}>
      <div className="space-y-12">
        <MarketingSection title="1. Overview">
            <p className="text-lg" style={{ color: 'var(--text-primary)' }}>
              By accessing and using Ledger (&quot;the Service&quot;), provided by Bunorden, you agree to be bound by these Terms of Use.
            </p>
            <p>
              If you do not agree with any part of these terms, you should immediately discontinue use of the Service. We believe in simplicity and clarity, so we&apos;ve kept these terms as straightforward as possible.
            </p>
        </MarketingSection>

        <MarketingSection title="2. The Service">
            <p>
              Ledger is a privacy-first personal finance application that allows you to track income, expenses, and transfers. The Service is provided &quot;as is&quot; and &quot;as available&quot;. While we strive for 100% uptime and accuracy, we do not provide legal or financial warranties.
            </p>
        </MarketingSection>

        <MarketingSection title="3. Your Account">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                "Unique, personal account",
                "Minimum age of 13",
                "Valid email address required",
                "Full security responsibility"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent-primary)' }} />
                  <span className="text-sm font-medium">{item}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs">
              You are responsible for all activity that occurs under your account. Please keep your credentials secure.
            </p>
        </MarketingSection>

        <MarketingSection title="4. Prohibited Actions">
            <div className="space-y-4">
              <p>To ensure a safe environment for everyone, you agree not to:</p>
              <div className="grid grid-cols-1 gap-2">
                {[
                  "Use the service for unlawful activities",
                  "Attempt to bypass security or gain unauthorized access",
                  "Automate data extraction (scraping) without permission",
                  "Impersonate other users or entities"
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-red-400 font-bold">×</span>
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
        </MarketingSection>

        <MarketingSection title="5. Data Ownership">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/5">
                <h4 className="font-bold text-white mb-2" style={{ color: 'var(--text-primary)' }}>You own your data. Period.</h4>
                <p className="text-sm">
                  All financial information entered into Ledger remains your property. You have the right to export your data or delete your account at any time. We do not claim any rights to your financial records.
                </p>
            </div>
        </MarketingSection>

        <MarketingSection title="6. Governance">
            <p>
              These terms are governed by the internal logic of the Service and applicable local regulations. We reserve the right to modify these terms as the Service evolves. Continued use after updates signifies acceptance.
            </p>
        </MarketingSection>

        <MarketingSection title="Questions?">
            <div className="flex flex-wrap gap-4">
              <a 
                href="mailto:contact@bunorden.com" 
                className="flex-1 min-w-[200px] p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/20 transition-all text-center group"
              >
                <div className="text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>General Inquiry</div>
                <div className="font-bold text-white group-hover:text-var(--accent-primary)">contact@bunorden.com</div>
              </a>
              <a 
                href="/contact" 
                className="flex-1 min-w-[200px] p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/20 transition-all text-center group"
              >
                <div className="text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>Resolution</div>
                <div className="font-bold text-white group-hover:text-var(--accent-primary)">Support Ticket</div>
              </a>
            </div>
        </MarketingSection>
      </div>
    </MarketingPageShell>
  )
}
