'use client'

import { Scale } from 'lucide-react'
import { MarketingPageShell, MarketingSection } from '../MarketingPageShell'

export default function TermsPage() {
  return (
    <MarketingPageShell title="Terms of Use" subtitle="Effective Date: April 2026" icon={Scale}>
      <div className="space-y-8">
        <MarketingSection title="1. Acceptance of Terms">
            <p>
              By accessing and using Ledger (&quot;the Service&quot;), provided by Bunorden, you agree to be bound
              by these Terms of Use. If you do not agree, please do not use the Service.
            </p>
        </MarketingSection>

        <MarketingSection title="2. Service Description">
            <p>
              Ledger is a privacy-first personal finance application that allows you to track income, expenses,
              and transfers. The Service is provided &quot;as is&quot; without warranty of any kind.
            </p>
        </MarketingSection>

        <MarketingSection title="3. User Accounts">
            <ul className="list-disc list-inside space-y-2">
              <li>You must provide a valid email address to create an account.</li>
              <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
              <li>You must be at least 13 years of age to use this Service.</li>
              <li>One person may not maintain more than one account.</li>
            </ul>
        </MarketingSection>

        <MarketingSection title="4. Acceptable Use">
            <p>You agree not to:</p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>Use the Service for any unlawful purpose.</li>
              <li>Attempt to gain unauthorised access to the Service or its systems.</li>
              <li>Transmit any malicious code, viruses, or harmful data.</li>
              <li>Impersonate any person or entity.</li>
              <li>Use automated tools to scrape or extract data from the Service.</li>
            </ul>
        </MarketingSection>

        <MarketingSection title="5. Data & Privacy">
            <p>
              Your use of the Service is also governed by our{' '}
              <a href="/privacy" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>Privacy Policy</a>.
              We are committed to protecting your data and do not sell, share, or monetise your financial information.
            </p>
        </MarketingSection>

        <MarketingSection title="6. Data Ownership">
            <p>
              You retain full ownership of all data you enter into Ledger. You may export or delete
              your data at any time through the Settings page. Upon account deletion, all your data
              is permanently removed from our systems.
            </p>
        </MarketingSection>

        <MarketingSection title="7. Service Availability">
            <p>
              We strive to maintain high availability but do not guarantee uninterrupted access. We reserve
              the right to modify, suspend, or discontinue the Service at any time with reasonable notice.
            </p>
        </MarketingSection>

        <MarketingSection title="8. Limitation of Liability">
            <p>
              Ledger is a tool to assist with personal financial tracking. It is not financial advice.
              Bunorden shall not be liable for any indirect, incidental, or consequential damages arising
              from your use of the Service.
            </p>
        </MarketingSection>

        <MarketingSection title="9. Open Source">
            <p>
              Ledger is open-source software released under the MIT License. You may review, fork, and
              contribute to the source code. The open-source license applies to the code, not to the data
              you store within the Service.
            </p>
        </MarketingSection>

        <MarketingSection title="10. Changes to Terms">
            <p>
              We may update these Terms from time to time. Continued use of the Service after changes
              constitutes acceptance. We will make reasonable efforts to notify users of material changes.
            </p>
        </MarketingSection>

        <MarketingSection title="11. Contact">
            <p>
              For questions about these Terms, contact us at{' '}
              <a href="mailto:contact@bunorden.com" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>
                contact@bunorden.com
              </a>{' '}
              or via our <a href="/contact" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>Contact Form</a>.
            </p>
        </MarketingSection>
      </div>
    </MarketingPageShell>
  )
}
