'use client'

import { Shield } from 'lucide-react'
import { MarketingPageShell, MarketingSection } from '../MarketingPageShell'

export default function PrivacyPage() {
  return (
    <MarketingPageShell title="Privacy Policy" subtitle="Effective Date: April 2026" icon={Shield}>
      <div className="space-y-8">
        <MarketingSection title="Our Commitment">
            <p>
              Ledger is built with one principle: <strong>your financial data is yours</strong>.
              We do not sell it, share it, or use it to target you with advertising — ever.
            </p>
        </MarketingSection>

        <MarketingSection title="What We Collect">
            <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid var(--border)' }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: 'var(--overlay)' }}>
                    <th className="text-left p-3 font-semibold" style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border)' }}>Data</th>
                    <th className="text-left p-3 font-semibold" style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border)' }}>Purpose</th>
                    <th className="text-left p-3 font-semibold" style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border)' }}>Storage</th>
                  </tr>
                </thead>
                <tbody style={{ color: 'var(--text-secondary)' }}>
                  <tr><td className="p-3" style={{ borderBottom: '1px solid var(--border)' }}>Email address</td><td className="p-3" style={{ borderBottom: '1px solid var(--border)' }}>Authentication</td><td className="p-3" style={{ borderBottom: '1px solid var(--border)' }}>Supabase Auth</td></tr>
                  <tr><td className="p-3" style={{ borderBottom: '1px solid var(--border)' }}>Display name</td><td className="p-3" style={{ borderBottom: '1px solid var(--border)' }}>Your profile</td><td className="p-3" style={{ borderBottom: '1px solid var(--border)' }}>Supabase DB</td></tr>
                  <tr><td className="p-3" style={{ borderBottom: '1px solid var(--border)' }}>Transaction data</td><td className="p-3" style={{ borderBottom: '1px solid var(--border)' }}>Core functionality</td><td className="p-3" style={{ borderBottom: '1px solid var(--border)' }}>Supabase DB</td></tr>
                  <tr><td className="p-3">App preferences</td><td className="p-3">Personalisation</td><td className="p-3">Supabase + localStorage</td></tr>
                </tbody>
              </table>
            </div>
            <p className="mt-4">
              We do <strong>not</strong> collect: device identifiers, IP address logs, browsing behaviour,
              location data, or any data beyond what you explicitly enter.
            </p>
        </MarketingSection>

        <MarketingSection title="What We Do Not Do">
            <ul className="list-disc list-inside space-y-2">
              <li>We do not sell your data to any third party.</li>
              <li>We do not serve advertisements.</li>
              <li>We do not use third-party analytics (no Google Analytics, Mixpanel, or equivalent).</li>
              <li>We do not share your data with anyone except as required by law.</li>
            </ul>
        </MarketingSection>

        <MarketingSection title="Data Storage & Security">
            <p>
              Your data is stored in Supabase (PostgreSQL) hosted on AWS infrastructure. All data is encrypted
              in transit (TLS 1.2+) and at rest. Row Level Security (RLS) ensures only you can access your records.
            </p>
        </MarketingSection>

        <MarketingSection title="Your Rights">
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Export</strong>: Download all your data (JSON + CSV) at any time from Settings.</li>
              <li><strong>Deletion</strong>: Permanently delete your account and all data from Settings. Deletion is immediate and irreversible.</li>
              <li><strong>Correction</strong>: Edit any data at any time within the app.</li>
            </ul>
        </MarketingSection>

        <MarketingSection title="Open Source">
            <p>
              Ledger&apos;s source code is publicly available. You can audit exactly how your data is handled.
            </p>
        </MarketingSection>

        <MarketingSection title="Contact">
            <p>
              For privacy questions: <a href="mailto:privacy@bunorden.com" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>privacy@bunorden.com</a>
            </p>
            <p>
              Or use our <a href="/contact" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>Contact Form</a>.
            </p>
        </MarketingSection>
      </div>
    </MarketingPageShell>
  )
}
