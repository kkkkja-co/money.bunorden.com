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
    <div className={`${maxWidthClass} mx-auto px-4 py-12 lg:py-20`}>
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-semibold"
          style={{ color: 'var(--text-secondary)' }}
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>
      </div>

      <div className="glass-card p-8 lg:p-12 animate-fade-up" style={{ animationDelay: '0.1s' }}>
        <div className="flex justify-center mb-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(124,58,237,0.15))',
              border: '1px solid var(--border)',
              color: 'var(--accent-primary)',
            }}
          >
            <Icon size={22} />
          </div>
        </div>

        <h1
          className="text-3xl lg:text-4xl font-bold text-center mb-2 tracking-tight"
          style={{
            background: 'linear-gradient(to right, var(--text-primary), var(--text-tertiary))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {title}
        </h1>

        <p className="text-center text-sm mb-10" style={{ color: 'var(--text-tertiary)' }}>
          {subtitle}
        </p>

        {children}
      </div>
    </div>
  )
}

export function MarketingSection({ title, children }: { title: string; children: React.ReactNode }) {
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
