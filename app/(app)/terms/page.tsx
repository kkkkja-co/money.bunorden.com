'use client'

import { Scale, ArrowLeft } from 'lucide-react'
import { MarketingSection } from '@/components/layout/MarketingPageShell'
import { useTranslation } from '@/app/providers'
import { BunordenFooter } from '@/components/layout/BunordenFooter'
import Link from 'next/link'

export default function TermsPage() {
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
               <Scale size={20} />
             </div>
             <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
               {t('terms.title')}
             </h1>
          </div>
        </header>

        <div className="space-y-12 animate-fade-up delay-1">
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
      </div>
      <BunordenFooter />
    </div>
  )
}
