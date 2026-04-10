'use client'

import Link from 'next/link'
import { ArrowLeft, LucideIcon } from 'lucide-react'

type MarketingPageShellProps = {
  title: string
  subtitle: string
  icon: LucideIcon
  children: React.ReactNode
  maxWidthClass?: string
}

export function MarketingPageShell({
  title,
  subtitle,
  icon: Icon,
  children,
  maxWidthClass = 'max-w-3xl',
}: MarketingPageShellProps) {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Dynamic Background Orbs */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 10% 10%, rgba(59, 130, 246, 0.05) 0%, transparent 40%),
            radial-gradient(circle at 90% 90%, rgba(139, 92, 246, 0.05) 0%, transparent 40%),
            radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.02) 0%, transparent 60%)
          `,
        }}
      />

      <div className={`${maxWidthClass} mx-auto px-4 py-12 lg:py-20 relative z-10`}>
        <div className="mb-8 animate-fade-in delay-1">
          <Link
            href="/dashboard"
            className="group inline-flex items-center gap-2 text-sm font-semibold transition-all hover:translate-x-[-4px]"
            style={{ color: 'var(--text-tertiary)' }}
          >
            <div className="p-1.5 rounded-lg bg-white/5 border border-white/5 group-hover:border-white/10 group-hover:bg-white/10 transition-colors">
              <ArrowLeft size={16} />
            </div>
            Back to Dashboard
          </Link>
        </div>

        <div className="glass-card !p-8 lg:!p-16 animate-fade-up shadow-[0_32px_80px_rgba(0,0,0,0.4)]" style={{ animationDelay: '0.1s', borderRadius: '32px' }}>
          <div className="flex justify-center mb-6">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
              style={{
                background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.1))',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'var(--accent-primary)',
              }}
            >
              <Icon size={32} />
            </div>
          </div>

          <h1
            className="text-4xl lg:text-5xl font-extrabold text-center mb-3 tracking-tight"
            style={{
              background: 'linear-gradient(to bottom, var(--text-primary) 30%, var(--text-tertiary))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {title}
          </h1>

          <p className="text-center text-base mb-12 max-w-lg mx-auto" style={{ color: 'var(--text-tertiary)' }}>
            {subtitle}
          </p>

          <div className="w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent mb-12" />

          <div className="marketing-content-wrapper">
            {children}
          </div>
        </div>

        <div className="mt-12 text-center animate-fade-in delay-6">
          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            &copy; {new Date().getFullYear()} Bunorden. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}

export function MarketingSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-12 last:mb-0">
      <div className="flex items-center gap-4 mb-5">
        <div className="flex-none w-8 h-px bg-gradient-to-r from-var(--accent-primary) to-transparent opacity-50" />
        <h2 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          {title}
        </h2>
        <div className="flex-grow h-px bg-white/5" />
      </div>
      <div className="text-sm lg:text-base leading-relaxed space-y-4 pl-0 sm:pl-12" style={{ color: 'var(--text-secondary)' }}>
        {children}
      </div>
    </section>
  )
}
