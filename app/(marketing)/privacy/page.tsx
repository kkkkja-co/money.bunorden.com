import { BunordenFooter } from '@/components/layout/BunordenFooter'

export default function PrivacyPage() {
  const buildDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <article className="max-w-2xl mx-auto px-4 py-16 prose prose-invert">
        <h1 className="text-4xl font-bold text-[#1C1C1E] dark:text-white mb-2">
          Privacy Policy
        </h1>
        <p className="text-[#636366] dark:text-[#8E8E93] mb-8">
          Last updated: {buildDate}
        </p>

        <div className="space-y-8 text-[#1C1C1E] dark:text-[#F5F5F7]">
          <section>
            <h2 className="text-2xl font-bold mb-4">Our commitment</h2>
            <p>
              Ledger is built with one principle: <strong>your financial data is yours</strong>. We do not sell it,
              share it, or use it to target you with advertising — ever.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">What we collect</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-[#E5E5EA] dark:border-[#38383A]">
                <thead className="bg-[#F2F2F7] dark:bg-[#1C1C1E]">
                  <tr>
                    <th className="border border-[#E5E5EA] dark:border-[#38383A] p-3 text-left">Data</th>
                    <th className="border border-[#E5E5EA] dark:border-[#38383A] p-3 text-left">Why</th>
                    <th className="border border-[#E5E5EA] dark:border-[#38383A] p-3 text-left">Stored</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-[#E5E5EA] dark:border-[#38383A] p-3">Email address</td>
                    <td className="border border-[#E5E5EA] dark:border-[#38383A] p-3">Authentication</td>
                    <td className="border border-[#E5E5EA] dark:border-[#38383A] p-3">Supabase Auth</td>
                  </tr>
                  <tr>
                    <td className="border border-[#E5E5EA] dark:border-[#38383A] p-3">Display name & avatar</td>
                    <td className="border border-[#E5E5EA] dark:border-[#38383A] p-3">Your profile</td>
                    <td className="border border-[#E5E5EA] dark:border-[#38383A] p-3">Supabase DB</td>
                  </tr>
                  <tr>
                    <td className="border border-[#E5E5EA] dark:border-[#38383A] p-3">Transaction data you enter</td>
                    <td className="border border-[#E5E5EA] dark:border-[#38383A] p-3">Core app functionality</td>
                    <td className="border border-[#E5E5EA] dark:border-[#38383A] p-3">Supabase DB</td>
                  </tr>
                  <tr>
                    <td className="border border-[#E5E5EA] dark:border-[#38383A] p-3">App preferences</td>
                    <td className="border border-[#E5E5EA] dark:border-[#38383A] p-3">Personalisation</td>
                    <td className="border border-[#E5E5EA] dark:border-[#38383A] p-3">Supabase DB + localStorage</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-4">
              We do <strong>not</strong> collect: device identifiers, IP address logs, browsing behaviour, location
              data, or any data beyond what you explicitly enter.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">What we do not do</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>We do not sell your data to any third party.</li>
              <li>We do not serve advertisements.</li>
              <li>We do not use third-party analytics (no Google Analytics, Mixpanel, Hotjar, or equivalent).</li>
              <li>We do not share your data with anyone except as required by law.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Data storage & security</h2>
            <p>
              Your data is stored in Supabase (PostgreSQL) hosted on AWS infrastructure. All data is encrypted in
              transit (TLS 1.2+) and at rest. Row Level Security ensures only you can access your records.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Your rights</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong>Export</strong>: Download all your data (JSON + CSV) at any time from Settings.
              </li>
              <li>
                <strong>Deletion</strong>: Permanently delete your account and all associated data from Settings.
                Deletion is immediate and irreversible.
              </li>
              <li>
                <strong>Correction</strong>: Edit any data at any time within the app.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Open source</h2>
            <p>
              Ledger&apos;s source code is publicly available. You can audit exactly how your data is handled.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Contact</h2>
            <p>
              For privacy questions: <strong>privacy@bunorden.com</strong>
            </p>
          </section>
        </div>
      </article>

      <div className="max-w-2xl mx-auto px-4">
        <BunordenFooter />
      </div>
    </div>
  )
}
