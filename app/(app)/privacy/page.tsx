'use client'

import { Shield } from 'lucide-react'
import { MarketingPageShell, MarketingSection } from '@/components/layout/MarketingPageShell'
import { useTranslation } from '@/app/providers'

export default function PrivacyPage() {
  const { t } = useTranslation()
  return (
    <MarketingPageShell title={t('privacy.title')} subtitle={t('privacy.subtitle')} icon={Shield}>
      <div className="space-y-12">
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
            <div className="mt-6 flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/5 text-xs italic">
                <span className="text-var(--accent-primary)">ⓘ</span>
                <p>
                  {t('privacy.no_pii_collect')}
                </p>
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
    </MarketingPageShell>
  )
}
