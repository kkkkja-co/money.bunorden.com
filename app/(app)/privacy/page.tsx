'use client'

import { Shield, ArrowLeft } from 'lucide-react'
import { MarketingSection } from '@/components/layout/MarketingPageShell'
import { useTranslation } from '@/app/providers'
import { BunordenFooter } from '@/components/layout/BunordenFooter'
import Link from 'next/link'

export default function PrivacyPage() {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 px-4 lg:px-8 py-6 lg:py-8 max-w-3xl mx-auto w-full">
        <header className="flex items-center gap-4 mb-8 animate-fade-up">
          <Link href="/settings" className="p-2 -ml-2 rounded-full hover:bg-white/5 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-accent-primary/10 flex items-center justify-center text-accent-primary">
               <Shield size={20} />
             </div>
             <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
               {t('privacy.title')}
             </h1>
          </div>
        </header>

        <div className="space-y-12 animate-fade-up delay-1">
          <MarketingSection title={t('privacy.commitment')}>
              <p className="text-lg" style={{ color: 'var(--text-primary)' }}>
                <strong>Clavi</strong> — {t('common.clavi_name_meaning')}
              </p>
              <p className="mt-4">
                {t('common.clavi_principle')}
              </p>
              <p className="mt-4">
                {t('common.clavi_vision_subtitle')}
              </p>
          </MarketingSection>

          <MarketingSection title={t('privacy.what_we_collect')}>
              <p className="mb-6">
                {t('privacy.no_pii_collect')}
              </p>
              <div className="overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] shadow-inner">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                      <th className="p-4 font-bold uppercase tracking-wider text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{t('privacy.data_type')}</th>
                      <th className="p-4 font-bold uppercase tracking-wider text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{t('privacy.purpose')}</th>
                      <th className="p-4 font-bold uppercase tracking-wider text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{t('privacy.storage')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5" style={{ color: 'var(--text-secondary)' }}>
                    <tr className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 font-medium text-white">{t('privacy.email')}</td>
                      <td className="p-4">{t('privacy.auth')}</td>
                      <td className="p-4 opacity-70">Supabase Auth</td>
                    </tr>
                    <tr className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 font-medium text-white">{t('privacy.display_name')}</td>
                      <td className="p-4">{t('privacy.personalization')}</td>
                      <td className="p-4 opacity-70">Secured Database</td>
                    </tr>
                    <tr className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 font-bold text-white">{t('privacy.finance_data')}</td>
                      <td className="p-4">{t('privacy.core_fn')}</td>
                      <td className="p-4 opacity-70">Secured Database</td>
                    </tr>
                    <tr className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 font-medium text-white">{t('privacy.preferences')}</td>
                      <td className="p-4">{t('privacy.ux')}</td>
                      <td className="p-4 opacity-70">Local + Database</td>
                    </tr>
                  </tbody>
                </table>
              </div>
          </MarketingSection>

          <MarketingSection title={t('privacy.guarantees')}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  t('privacy.guarantee_no_sell'),
                  t('privacy.guarantee_no_ads'),
                  t('privacy.guarantee_no_trackers'),
                  t('privacy.guarantee_encryption')
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent-primary)' }} />
                    <span className="text-sm font-medium">{item}</span>
                  </div>
                ))}
              </div>
          </MarketingSection>

          <MarketingSection title="Infrastructure & Protection Providers">
            <p>
              To keep Clavi secure and available, we use trusted infrastructure providers.
              These providers may process technical request metadata (for example IP, user-agent,
              request timestamps, and challenge outcomes) for security, delivery, and reliability.
            </p>
            <div className="overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] shadow-inner mt-4">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <th className="p-4 font-bold uppercase tracking-wider text-[10px]" style={{ color: 'var(--text-tertiary)' }}>Provider</th>
                    <th className="p-4 font-bold uppercase tracking-wider text-[10px]" style={{ color: 'var(--text-tertiary)' }}>Role</th>
                    <th className="p-4 font-bold uppercase tracking-wider text-[10px]" style={{ color: 'var(--text-tertiary)' }}>Examples / Endpoints</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5" style={{ color: 'var(--text-secondary)' }}>
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 font-medium text-white">Cloudflare</td>
                    <td className="p-4">Proxy, CDN, nameservers, DDoS and edge protection</td>
                    <td className="p-4 opacity-80">Traffic routed through Cloudflare network</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 font-medium text-white">Cloudflare Turnstile</td>
                    <td className="p-4">Bot and abuse protection on auth forms</td>
                    <td className="p-4 opacity-80">challenges.cloudflare.com</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 font-medium text-white">Cloudflare Web Analytics</td>
                    <td className="p-4">Operational analytics and performance insights</td>
                    <td className="p-4 opacity-80">static.cloudflareinsights.com tracker script</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 font-medium text-white">Vercel</td>
                    <td className="p-4">Application hosting and edge/server execution</td>
                    <td className="p-4 opacity-80">Production hosting platform for Clavi</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </MarketingSection>

          <MarketingSection title="Cloudflare Domains and Trackers">
            <p>
              Our pages may load security and analytics resources from Cloudflare domains, including:
              <strong> challenges.cloudflare.com </strong> (Turnstile challenge runtime) and
              <strong> static.cloudflareinsights.com </strong> (Cloudflare insights tracker script).
            </p>
            <p>
              These resources are used for bot protection, abuse prevention, uptime, and service quality monitoring.
            </p>
          </MarketingSection>

          <MarketingSection title={t('privacy.rights')}>
              <div className="space-y-6">
                <div className="group">
                  <h4 className="font-bold text-white mb-1 group-hover:text-primary transition-colors" style={{ color: 'var(--text-primary)' }}>{t('privacy.export_title')}</h4>
                  <p className="text-xs">{t('privacy.export_desc')}</p>
                </div>
                <div className="group">
                  <h4 className="font-bold text-white mb-1 group-hover:text-danger transition-colors" style={{ color: 'var(--text-primary)' }}>{t('privacy.forgotten_title')}</h4>
                  <p className="text-xs">{t('privacy.forgotten_desc')}</p>
                </div>
              </div>
          </MarketingSection>

          <MarketingSection title={t('privacy.touch')}>
              <div className="flex flex-wrap gap-4">
                <a 
                  href="mailto:privacy@bunorden.com" 
                  className="flex-1 min-w-[200px] p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/20 transition-all text-center group"
                >
                  <div className="text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>{t('privacy.office')}</div>
                  <div className="font-bold text-white group-hover:text-var(--accent-primary)">privacy@bunorden.com</div>
                </a>
                <a 
                  href="/contact" 
                  className="flex-1 min-w-[200px] p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/20 transition-all text-center group"
                >
                  <div className="text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>{t('privacy.help')}</div>
                  <div className="font-bold text-white group-hover:text-var(--accent-primary)">{t('privacy.contact_form')}</div>
                </a>
              </div>
          </MarketingSection>
        </div>
      </div>
      <BunordenFooter />
    </div>
  )
}
