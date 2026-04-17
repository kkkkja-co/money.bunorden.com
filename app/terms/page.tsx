'use client'

import { Scale, ArrowLeft, Heart, Zap, Shield, Globe, Server, AlertTriangle } from 'lucide-react'
import { useTranslation } from '@/app/providers'
import Link from 'next/link'
import Image from 'next/image'

export default function TermsPage() {
  const { t, language } = useTranslation()
  const isZh = language === 'zh-TW'

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-gradient)', backgroundAttachment: 'fixed' }}>
      {/* Minimal nav */}
      <nav className="sticky top-0 z-50 px-4 py-3 backdrop-blur-xl bg-[var(--bg-primary)]/60 border-b border-[var(--border)]">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Link
            href="/settings"
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-[var(--overlay)] border border-[var(--border)] text-[var(--text-primary)] transition-all hover:scale-105 active:scale-95"
            aria-label={t('common.back')}
          >
            <ArrowLeft size={16} />
          </Link>
          <Image src="/assets/clavi-icon-dark.svg" alt="Clavi" width={20} height={20} />
          <span className="text-sm font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Clavi</span>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-5 py-12">
        {/* Header */}
        <header className="mb-16 animate-slide-up">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6" style={{ background: 'rgba(175, 82, 222, 0.1)', border: '1px solid rgba(175, 82, 222, 0.2)' }}>
            <Scale size={28} style={{ color: 'var(--accent-primary)' }} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2" style={{ color: 'var(--text-primary)' }}>
            {isZh ? '服務條款' : 'Terms of Service'}
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
            {isZh ? '最後更新：2026 年 4 月' : 'Last updated: April 2026'}
          </p>
        </header>

        <div className="space-y-12 animate-slide-up delay-1">
          {/* Acceptance */}
          <Section
            icon={Scale}
            title={isZh ? '條款接受' : 'Acceptance of Terms'}
            body={isZh
              ? '使用 Clavi 即表示您同意本服務條款。Clavi 是一個「自主保管金庫」— 我們提供可視化和管理您財務資料的基礎設施，但您持有金鑰。我們在技術上無法在沒有您的認證會話期間查看您的敏感財務紀錄。'
              : 'By using Clavi, you agree to these Terms of Service. Clavi is a "Self-Custodial Vault" — we provide the infrastructure to visualize and manage your finances, but you hold the key. We do not have the technical ability to view your sensitive financial records without your authenticated session.'}
          />

          {/* User Responsibilities */}
          <section>
            <SectionTitle icon={Zap} title={isZh ? '用戶責任' : 'User Responsibilities'} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InfoCard icon={Zap} title={isZh ? '資料準確性' : 'Data Accuracy'} desc={isZh ? '您對輸入金庫的資料之準確性負責。Clavi 是可視化工具，非財務顧問。' : 'You are responsible for the accuracy of data you enter. Clavi is a visualization tool, not a financial advisor.'} />
              <InfoCard icon={Shield} title={isZh ? '金庫安全' : 'Vault Security'} desc={isZh ? '您對維護帳戶憑證和 MFA 金鑰的安全負有全部責任。' : 'You are solely responsible for maintaining the security of your account credentials and MFA keys.'} />
            </div>
          </section>

          {/* Data Ownership */}
          <section>
            <SectionTitle icon={Heart} title={isZh ? '資料所有權' : 'Data Ownership'} />
            <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
              {isZh
                ? '您保有對輸入 Clavi 的所有資料 100% 的所有權。Clavi 不會對您的財務紀錄主張任何智慧財產權。我們僅在您要求的服務範圍內處理這些資料。'
                : 'You retain 100% ownership of all data you input into Clavi. We do not claim any intellectual property rights over your financial records. We process this data solely to provide the service you have requested.'}
            </p>
            <div className="p-5 rounded-2xl border flex items-start gap-4" style={{ background: 'rgba(52, 199, 89, 0.05)', borderColor: 'rgba(52, 199, 89, 0.15)' }}>
              <Heart size={20} className="shrink-0 mt-0.5" style={{ color: 'var(--success)' }} />
              <div>
                <h4 className="font-bold text-sm mb-1" style={{ color: 'var(--success)' }}>{isZh ? '以人為先的支持' : 'Human-First Support'}</h4>
                <p className="text-xs leading-relaxed font-medium" style={{ color: 'var(--text-secondary)' }}>
                  {isZh
                    ? '我們不出售您的資料。我們不投放廣告。我們的成長來自重視高性能、私密數位體驗的用戶。'
                    : 'We do not sell your data. We do not run ads. Our growth is fueled by users who value a high-performance, private digital experience.'}
                </p>
              </div>
            </div>
          </section>

          {/* Infrastructure */}
          <section>
            <SectionTitle icon={Server} title={isZh ? '基礎設施' : 'Infrastructure'} />
            <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
              {isZh ? '為提供全球可用且安全的體驗，我們使用以下受信任的基礎設施：' : 'To provide a globally available and secure experience, we utilize trusted infrastructure:'}
            </p>
            <ul className="space-y-3">
              {(isZh
                ? [['Supabase', '工業級資料完整性和認證會話。'], ['Vercel', '全球交付和執行統一流體介面。'], ['SF Pro 字體', '使用本地系統字體，避免第三方字體追蹤。']]
                : [['Supabase', 'Industrial-grade data integrity and authenticated sessions.'], ['Vercel', 'Global delivery and execution of the Unified Fluid Surface.'], ['SF Pro Typography', 'Local system fonts to avoid third-party font tracking.']]
              ).map(([name, desc]) => (
                <li key={name} className="flex gap-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: 'var(--accent-primary)' }} />
                  <span><strong style={{ color: 'var(--text-primary)' }}>{name}:</strong> {desc}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Limitations */}
          <section>
            <SectionTitle icon={AlertTriangle} title={isZh ? '責任限制' : 'Limitation of Liability'} />
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {isZh
                ? '本服務按「原樣」提供，不附帶任何明示或暗示的保證。Clavi 不對您基於應用程式中的資料做出的任何財務決策負責。我們不保證服務的不間斷或無錯誤運行。'
                : 'The service is provided "as is" without warranties of any kind, either express or implied. Clavi is not liable for any financial decisions made based on data in the app. We do not guarantee uninterrupted or error-free operation of the service.'}
            </p>
          </section>

          {/* Modifications */}
          <section>
            <SectionTitle icon={Globe} title={isZh ? '條款修改' : 'Modifications'} />
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {isZh
                ? '我們保留更新 Clavi 金庫的權利。實質性的條款變更將透過我們的通訊渠道通知。繼續使用金庫即表示接受任何更新的協議。'
                : 'We reserve the right to evolve the Clavi vault. Substantial changes to these terms will be communicated across our channels. Continued use of the vault constitutes acceptance of any updated protocols.'}
            </p>
          </section>

          {/* Contact */}
          <section className="text-center pb-8">
            <a
              href="mailto:legal@bunorden.com"
              className="inline-block px-8 py-3 rounded-full text-white text-xs font-bold uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
              style={{ background: 'var(--accent-primary)', boxShadow: '0 8px 24px rgba(175, 82, 222, 0.3)' }}
            >
              {isZh ? '聯絡法律部門' : 'Contact Legal Team'}
            </a>
          </section>
        </div>
      </main>

      <footer className="border-t border-[var(--border)] py-6 text-center">
        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
          &copy; {new Date().getFullYear()} Bunorden. {isZh ? '保留所有權利。' : 'All rights reserved.'}
        </p>
      </footer>
    </div>
  )
}

function SectionTitle({ icon: Icon, title }: { icon: any; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-1 h-5 rounded-full" style={{ background: 'var(--accent-primary)' }} />
      <h2 className="text-lg font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>{title}</h2>
    </div>
  )
}

function Section({ icon, title, body }: { icon: any; title: string; body: string }) {
  return (
    <section>
      <SectionTitle icon={icon} title={title} />
      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{body}</p>
    </section>
  )
}

function InfoCard({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="p-5 rounded-2xl border border-[var(--border)]" style={{ background: 'var(--overlay)' }}>
      <Icon size={18} className="mb-3" style={{ color: 'var(--accent-primary)' }} />
      <h4 className="font-bold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>{title}</h4>
      <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
    </div>
  )
}
