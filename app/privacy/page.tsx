'use client'

import { Shield, ArrowLeft, Lock, Database, Globe, Eye, Server, Fingerprint } from 'lucide-react'
import { useTranslation } from '@/app/providers'
import Link from 'next/link'
import Image from 'next/image'

export default function PrivacyPage() {
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
            <Shield size={28} style={{ color: 'var(--accent-primary)' }} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2" style={{ color: 'var(--text-primary)' }}>
            {isZh ? '隱私權政策' : 'Privacy Policy'}
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
            {isZh ? '最後更新：2026 年 4 月' : 'Last updated: April 2026'}
          </p>
        </header>

        <div className="space-y-12 animate-slide-up delay-1">
          {/* Intro */}
          <section>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {isZh
                ? 'Clavi（由 Bunorden 開發）是一款以隱私為核心的個人財務管理工具。本政策說明我們如何處理您的資料。簡而言之：您的財務資料完全屬於您，我們不會將其出售、分享或用於廣告用途。'
                : 'Clavi (developed by Bunorden) is a privacy-first personal finance application. This policy explains how we handle your data. In short: your financial data belongs entirely to you. We do not sell, share, or use it for advertising.'}
            </p>
          </section>

          {/* What We Collect */}
          <section>
            <SectionTitle icon={Database} title={isZh ? '我們收集的資料' : 'Data We Collect'} />
            <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)]">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-[var(--border)]" style={{ background: 'var(--overlay)' }}>
                    <th className="p-4 font-bold uppercase tracking-wider text-[10px]" style={{ color: 'var(--text-secondary)' }}>{isZh ? '資料類型' : 'Data Type'}</th>
                    <th className="p-4 font-bold uppercase tracking-wider text-[10px]" style={{ color: 'var(--text-secondary)' }}>{isZh ? '用途' : 'Purpose'}</th>
                    <th className="p-4 font-bold uppercase tracking-wider text-[10px]" style={{ color: 'var(--text-secondary)' }}>{isZh ? '儲存位置' : 'Storage'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]" style={{ color: 'var(--text-secondary)' }}>
                  <tr><td className="p-4 font-semibold" style={{ color: 'var(--text-primary)' }}>{isZh ? '電子郵件地址' : 'Email address'}</td><td className="p-4">{isZh ? '身份驗證' : 'Authentication'}</td><td className="p-4">{isZh ? '加密金庫' : 'Encrypted vault'}</td></tr>
                  <tr><td className="p-4 font-semibold" style={{ color: 'var(--text-primary)' }}>{isZh ? '顯示名稱' : 'Display name'}</td><td className="p-4">{isZh ? '個性化體驗' : 'Personalization'}</td><td className="p-4">{isZh ? '加密金庫' : 'Encrypted vault'}</td></tr>
                  <tr><td className="p-4 font-semibold" style={{ color: 'var(--text-primary)' }}>{isZh ? '交易紀錄' : 'Transactions'}</td><td className="p-4">{isZh ? '核心功能' : 'Core functionality'}</td><td className="p-4">PostgreSQL (RLS)</td></tr>
                  <tr><td className="p-4 font-semibold" style={{ color: 'var(--text-primary)' }}>{isZh ? '主題 / 語言偏好' : 'Theme / language'}</td><td className="p-4">{isZh ? '用戶體驗' : 'UX preferences'}</td><td className="p-4">{isZh ? '瀏覽器本地儲存' : 'Browser localStorage'}</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* What We Don't Collect */}
          <section>
            <SectionTitle icon={Eye} title={isZh ? '我們不收集的資料' : 'What We Do NOT Collect'} />
            <div className="p-5 rounded-2xl border border-[var(--border)]" style={{ background: 'rgba(52, 199, 89, 0.05)' }}>
              <ul className="space-y-2.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                {(isZh
                  ? ['設備識別碼或瀏覽器指紋', 'IP 地址日誌', '地理位置資料', '瀏覽行為或使用模式', '第三方 cookie 或追蹤像素']
                  : ['Device identifiers or browser fingerprints', 'IP address logs', 'Geolocation data', 'Browsing behavior or usage patterns', 'Third-party cookies or tracking pixels']
                ).map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: 'var(--success)' }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Zero-Tracker Architecture */}
          <section>
            <SectionTitle icon={Globe} title={isZh ? '零追蹤架構' : 'Zero-Tracker Architecture'} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InfoCard icon={Globe} title={isZh ? '無外部字體' : 'No External Fonts'} desc={isZh ? '使用系統原生 SF Pro 字體。Google 永遠不會收到您的 IP 地址。' : 'Native SF Pro system fonts. Google never receives your IP address or request metadata.'} />
              <InfoCard icon={Shield} title={isZh ? '無分析追蹤' : 'No Analytics Trackers'} desc={isZh ? '不使用 Google Analytics、Hotjar 或 Mixpanel。僅透過邊緣伺服器日誌監控系統健康。' : 'No Google Analytics, Hotjar, or Mixpanel. System health is monitored via anonymous edge-level server logs only.'} />
            </div>
          </section>

          {/* Data Storage */}
          <section>
            <SectionTitle icon={Server} title={isZh ? '資料儲存與加密' : 'Data Storage & Encryption'} />
            <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
              {isZh
                ? '您的資料儲存於我們安全的 Supabase 基礎設施中您自己的金庫區段。我們使用工業級 PostgreSQL 搭配資料列級安全性 (RLS)，確保只有您的認證金鑰才能存取您的紀錄。'
                : 'Your data is stored within your own vault segments on our secure Supabase infrastructure. We use industrial-grade PostgreSQL with Row-Level Security (RLS) to ensure that only your authenticated key can unlock your records.'}
            </p>
          </section>

          {/* Your Rights */}
          <section>
            <SectionTitle icon={Fingerprint} title={isZh ? '您的權利' : 'Your Rights'} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InfoCard icon={Database} title={isZh ? '完整資料匯出' : 'Full Data Export'} desc={isZh ? '隨時以 JSON 或 CSV 格式下載您的所有紀錄。您永遠不會被鎖定在 Clavi。' : 'Download all your records in JSON or CSV format at any time. You are never locked into Clavi.'} />
              <InfoCard icon={Lock} title={isZh ? '即時刪除' : 'Instant Deletion'} desc={isZh ? '刪除帳戶時，我們會從資料庫中永久移除所有關聯紀錄。沒有「軟刪除」期。' : 'When you delete your account, we physically remove all associated records. No "soft delete" period — once purged, data is gone forever.'} />
            </div>
          </section>

          {/* Guarantees */}
          <section>
            <SectionTitle icon={Shield} title={isZh ? '隱私保證' : 'Our Guarantees'} />
            <div className="p-6 rounded-2xl border border-[var(--border)]" style={{ background: 'var(--bg-secondary)' }}>
              <div className="grid grid-cols-2 gap-4">
                {(isZh
                  ? ['絕不出售用戶資料', '零第三方廣告', '無分析追蹤器', '端到端資料加密']
                  : ['No selling of user data', 'Zero third-party advertising', 'No analytics trackers', 'End-to-end data encryption']
                ).map((g) => (
                  <div key={g} className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(52, 199, 89, 0.15)' }}>
                      <Lock size={10} style={{ color: 'var(--success)' }} />
                    </div>
                    <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>{g}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Contact */}
          <section className="text-center pb-8">
            <p className="text-xs italic mb-4" style={{ color: 'var(--text-tertiary)' }}>
              {isZh ? '「我們相信隱私是一項基本人權，而非一個功能。」' : '"We believe privacy is a human right, not a feature."'}
            </p>
            <a
              href="mailto:privacy@bunorden.com"
              className="inline-block px-8 py-3 rounded-full text-white text-xs font-bold uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
              style={{ background: 'var(--accent-primary)', boxShadow: '0 8px 24px rgba(175, 82, 222, 0.3)' }}
            >
              {isZh ? '聯絡隱私辦公室' : 'Contact Privacy Officer'}
            </a>
          </section>
        </div>
      </main>

      {/* Footer */}
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

function InfoCard({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="p-5 rounded-2xl border border-[var(--border)]" style={{ background: 'var(--overlay)' }}>
      <Icon size={18} className="mb-3" style={{ color: 'var(--accent-primary)' }} />
      <h4 className="font-bold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>{title}</h4>
      <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
    </div>
  )
}
