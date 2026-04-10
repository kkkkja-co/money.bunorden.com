'use client'

import { Scale } from 'lucide-react'
import { MarketingPageShell, MarketingSection } from '@/components/layout/MarketingPageShell'
import { useTranslation } from '@/app/providers'

export default function TermsPage() {
  const { t } = useTranslation()
  return (
    <MarketingPageShell title={t('terms.title')} subtitle={t('terms.subtitle')} icon={Scale}>
      <div className="space-y-12">
        <MarketingSection title={t('terms.accounts')}>
            <p className="text-lg" style={{ color: 'var(--text-primary)' }}>
              {t('terms.accounts_desc')}
            </p>
        </MarketingSection>

        <MarketingSection title={t('terms.limitations')}>
            <p>
              {t('terms.limitations_desc')}
            </p>
        </MarketingSection>

        <MarketingSection title={t('terms.accounts')}>
            <p>{t('terms.accounts_desc')}</p>
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

        <MarketingSection title={t('terms.data')}>
            <div className="p-6 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/5">
                <h4 className="font-bold text-white mb-2" style={{ color: 'var(--text-primary)' }}>{t('terms.data')}</h4>
                <p className="text-sm">
                  {t('terms.data_desc')}
                </p>
            </div>
        </MarketingSection>

        <MarketingSection title={t('terms.updates')}>
            <p>
              {t('terms.updates_desc')}
            </p>
        </MarketingSection>

        <MarketingSection title={t('privacy.touch')}>
            <div className="flex flex-wrap gap-4">
              <a 
                href="mailto:contact@bunorden.com" 
                className="flex-1 min-w-[200px] p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/20 transition-all text-center group"
              >
                <div className="text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>{t('privacy.office')}</div>
                <div className="font-bold text-white group-hover:text-var(--accent-primary)">contact@bunorden.com</div>
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
    </MarketingPageShell>
  )
}
