'use client'

import { Shield } from 'lucide-react'
import { MarketingPageShell, MarketingSection } from '../MarketingPageShell'

export default function PrivacyPage() {
  return (
    <MarketingPageShell title="Privacy Policy" subtitle="Your data, your privacy. Zero compromise." icon={Shield}>
      <div className="space-y-12">
        <MarketingSection title="Our Commitment">
            <p className="text-lg" style={{ color: 'var(--text-primary)' }}>
              Ledger is built with one principle: <strong className="text-white">your financial data is yours</strong>.
            </p>
            <p>
              We do not sell it, share it, or use it to target you with advertising — ever. Your privacy isn&apos;t just a feature; it&apos;s our foundation.
            </p>
        </MarketingSection>

        <MarketingSection title="What We Collect">
            <p className="mb-6">
              We collect the minimum amount of data required to provide you with a secure, personalized experience.
            </p>
            <div className="overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] shadow-inner">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <th className="p-4 font-bold uppercase tracking-wider text-[10px]" style={{ color: 'var(--text-tertiary)' }}>Data</th>
                    <th className="p-4 font-bold uppercase tracking-wider text-[10px]" style={{ color: 'var(--text-tertiary)' }}>Purpose</th>
                    <th className="p-4 font-bold uppercase tracking-wider text-[10px]" style={{ color: 'var(--text-tertiary)' }}>Storage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5" style={{ color: 'var(--text-secondary)' }}>
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 font-medium text-white">Email address</td>
                    <td className="p-4">Secure Authentication</td>
                    <td className="p-4 opacity-70">Supabase Auth</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 font-medium text-white">Display name</td>
                    <td className="p-4">Personalization</td>
                    <td className="p-4 opacity-70">Secured Database</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 font-bold text-white">Financial Data</td>
                    <td className="p-4">Core Functionality</td>
                    <td className="p-4 opacity-70">Secured Database</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 font-medium text-white">App preferences</td>
                    <td className="p-4">User Experience</td>
                    <td className="p-4 opacity-70">Local + Database</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-6 flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/5 text-xs italic">
                <span className="text-var(--accent-primary)">ⓘ</span>
                <p>
                  We do <strong>not</strong> collect device identifiers, IP logs, browsing behavior, or location data.
                </p>
            </div>
        </MarketingSection>

        <MarketingSection title="Guarantees">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                "No selling of user data",
                "Zero third-party advertising",
                "No third-party analytics trackers",
                "End-to-end data encryption"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
                  <div className="w-1.5 h-1.5 rounded-full bg-var(--accent-primary)" />
                  <span className="text-sm font-medium">{item}</span>
                </div>
              ))}
            </div>
        </MarketingSection>

        <MarketingSection title="Your Rights">
            <div className="space-y-6">
              <div className="group">
                <h4 className="font-bold text-white mb-1 group-hover:text-var(--accent-primary) transition-colors">Full Data Export</h4>
                <p className="text-xs">Download all your records in JSON or CSV format at any time from your settings.</p>
              </div>
              <div className="group">
                <h4 className="font-bold text-white mb-1 group-hover:text-var(--danger) transition-colors">Right to be Forgotten</h4>
                <p className="text-xs">Permanently delete your account and all associated data. This action is immediate and non-recoverable.</p>
              </div>
            </div>
        </MarketingSection>

        <MarketingSection title="Get in Touch">
            <div className="flex flex-wrap gap-4">
              <a 
                href="mailto:privacy@bunorden.com" 
                className="flex-1 min-w-[200px] p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/20 transition-all text-center group"
              >
                <div className="text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>Privacy Office</div>
                <div className="font-bold text-white group-hover:text-var(--accent-primary)">privacy@bunorden.com</div>
              </a>
              <a 
                href="/contact" 
                className="flex-1 min-w-[200px] p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/20 transition-all text-center group"
              >
                <div className="text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>Help Center</div>
                <div className="font-bold text-white group-hover:text-var(--accent-primary)">Contact Form</div>
              </a>
            </div>
        </MarketingSection>
      </div>
    </MarketingPageShell>
  )
}
