'use client'

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 lg:py-20">
      <div className="glass-card p-8 lg:p-12 animate-fade-up" style={{ animationDelay: '0.1s' }}>
        <h1
          className="text-3xl lg:text-4xl font-bold text-center mb-2 tracking-tight"
          style={{
            background: 'linear-gradient(to right, var(--text-primary), var(--text-tertiary))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Terms of Use
        </h1>
        <p className="text-center text-sm mb-10" style={{ color: 'var(--text-tertiary)' }}>
          Effective Date: April 2026
        </p>

        <div className="space-y-8">
          <Section title="1. Acceptance of Terms">
            <p>
              By accessing and using Ledger (&quot;the Service&quot;), provided by Bunorden, you agree to be bound
              by these Terms of Use. If you do not agree, please do not use the Service.
            </p>
          </Section>

          <Section title="2. Service Description">
            <p>
              Ledger is a privacy-first personal finance application that allows you to track income, expenses,
              and transfers. The Service is provided &quot;as is&quot; without warranty of any kind.
            </p>
          </Section>

          <Section title="3. User Accounts">
            <ul className="list-disc list-inside space-y-2">
              <li>You must provide a valid email address to create an account.</li>
              <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
              <li>You must be at least 13 years of age to use this Service.</li>
              <li>One person may not maintain more than one account.</li>
            </ul>
          </Section>

          <Section title="4. Acceptable Use">
            <p>You agree not to:</p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>Use the Service for any unlawful purpose.</li>
              <li>Attempt to gain unauthorised access to the Service or its systems.</li>
              <li>Transmit any malicious code, viruses, or harmful data.</li>
              <li>Impersonate any person or entity.</li>
              <li>Use automated tools to scrape or extract data from the Service.</li>
            </ul>
          </Section>

          <Section title="5. Data & Privacy">
            <p>
              Your use of the Service is also governed by our{' '}
              <a href="/privacy" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>Privacy Policy</a>.
              We are committed to protecting your data and do not sell, share, or monetise your financial information.
            </p>
          </Section>

          <Section title="6. Data Ownership">
            <p>
              You retain full ownership of all data you enter into Ledger. You may export or delete
              your data at any time through the Settings page. Upon account deletion, all your data
              is permanently removed from our systems.
            </p>
          </Section>

          <Section title="7. Service Availability">
            <p>
              We strive to maintain high availability but do not guarantee uninterrupted access. We reserve
              the right to modify, suspend, or discontinue the Service at any time with reasonable notice.
            </p>
          </Section>

          <Section title="8. Limitation of Liability">
            <p>
              Ledger is a tool to assist with personal financial tracking. It is not financial advice.
              Bunorden shall not be liable for any indirect, incidental, or consequential damages arising
              from your use of the Service.
            </p>
          </Section>

          <Section title="9. Open Source">
            <p>
              Ledger is open-source software released under the MIT License. You may review, fork, and
              contribute to the source code. The open-source license applies to the code, not to the data
              you store within the Service.
            </p>
          </Section>

          <Section title="10. Changes to Terms">
            <p>
              We may update these Terms from time to time. Continued use of the Service after changes
              constitutes acceptance. We will make reasonable efforts to notify users of material changes.
            </p>
          </Section>

          <Section title="11. Contact">
            <p>
              For questions about these Terms, contact us at{' '}
              <a href="mailto:contact@bunorden.com" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>
                contact@bunorden.com
              </a>{' '}
              or via our <a href="/contact" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>Contact Form</a>.
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
