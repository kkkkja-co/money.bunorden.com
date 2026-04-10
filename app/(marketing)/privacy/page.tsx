'use client'

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 lg:py-20">
      <div
        className="glass-card p-8 lg:p-12 animate-fade-up"
        style={{ animationDelay: '0.1s' }}
      >
        <h1
          className="text-3xl lg:text-4xl font-bold text-center mb-2 tracking-tight"
          style={{
            background: 'linear-gradient(to right, var(--text-primary), var(--text-tertiary))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Privacy Policy
        </h1>
        <p className="text-center text-sm mb-10" style={{ color: 'var(--text-tertiary)' }}>
          Effective Date: April 2026
        </p>

        <div className="space-y-8">
          <Section title="Our Commitment">
            <p>
              Ledger is built with one principle: <strong>your financial data is yours</strong>.
              We do not sell it, share it, or use it to target you with advertising — ever.
            </p>
          </Section>

          <Section title="What We Collect">
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
          </Section>

          <Section title="What We Do Not Do">
            <ul className="list-disc list-inside space-y-2">
              <li>We do not sell your data to any third party.</li>
              <li>We do not serve advertisements.</li>
              <li>We do not use third-party analytics (no Google Analytics, Mixpanel, or equivalent).</li>
              <li>We do not share your data with anyone except as required by law.</li>
            </ul>
          </Section>

          <Section title="Data Storage & Security">
            <p>
              Your data is stored in Supabase (PostgreSQL) hosted on AWS infrastructure. All data is encrypted
              in transit (TLS 1.2+) and at rest. Row Level Security (RLS) ensures only you can access your records.
            </p>
          </Section>

          <Section title="Your Rights">
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Export</strong>: Download all your data (JSON + CSV) at any time from Settings.</li>
              <li><strong>Deletion</strong>: Permanently delete your account and all data from Settings. Deletion is immediate and irreversible.</li>
              <li><strong>Correction</strong>: Edit any data at any time within the app.</li>
            </ul>
          </Section>

          <Section title="Open Source">
            <p>
              Ledger&apos;s source code is publicly available. You can audit exactly how your data is handled.
            </p>
          </Section>

          <Section title="Contact">
            <p>
              For privacy questions: <a href="mailto:privacy@bunorden.com" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>privacy@bunorden.com</a>
            </p>
            <p>
              Or use our <a href="/contact" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>Contact Form</a>.
            </p>
          </Section>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-bold mb-3 flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
        <div className="w-6 h-1 rounded-full" style={{ background: 'var(--accent-primary)' }} />
        {title}
      </h2>
      <div className="text-sm leading-relaxed space-y-3" style={{ color: 'var(--text-secondary)' }}>
        {children}
      </div>
    </section>
  )
}
