'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme, useTranslation } from '@/app/providers'
import { Home, ArrowLeftRight, PlusCircle, BarChart3, Settings, Target, CreditCard, Calendar, BookOpen, Users } from 'lucide-react'

export function Sidebar() {
  const { t } = useTranslation()
  const pathname = usePathname()
  const { theme } = useTheme()

  const navItems = [
    { href: '/dashboard', icon: Home, label: t('nav.home') },
    { href: '/transactions', icon: ArrowLeftRight, label: t('nav.history') },
    { href: '/add', icon: PlusCircle, label: t('nav.add') },
    { href: '/reports', icon: BarChart3, label: t('nav.reports') },
    { href: '/budgets', icon: Target, label: t('nav.budgets') },
    { href: '/bills', icon: CreditCard, label: t('bills.title') || 'Bills' },
    { href: '/calendar', icon: Calendar, label: t('calendar.title') || 'Calendar' },
    { href: '/notes', icon: BookOpen, label: t('notes.title') || 'Notes' },
    { href: '/split', icon: Users, label: t('split.title') || 'Split' },
    { href: '/settings', icon: Settings, label: t('nav.settings') },
  ]

  const logoSrc = theme === 'light' ? '/assets/clavi-icon-light.svg' : '/assets/clavi-icon-dark.svg'

  return (
    <aside
      className="hidden lg:flex flex-col w-64 h-screen fixed left-0 top-0 z-40"
      style={{
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border)',
      }}
    >
      <Link href="/dashboard" className="flex items-center gap-3 px-6 py-10 transition-transform active:scale-95">
        <img src={logoSrc} alt="Clavi" className="w-8 h-8 object-contain" />
        <span className="font-bold text-xl tracking-tight text-primary">Clavi</span>
      </Link>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 px-4 py-3 rounded-2xl font-bold transition-all active:scale-95 relative overflow-hidden ${isActive ? 'shadow-lg shadow-accent-primary/20' : ''}`}
              style={{
                background: isActive ? 'var(--accent-primary)' : 'transparent',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = 'var(--text-primary)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = 'var(--text-secondary)'
                }
              }}
            >
              <Icon size={20} strokeWidth={isActive ? 3 : 2} />
              <span className="uppercase tracking-widest text-[10px]">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="px-8 py-8 border-t border-border">
        <Link
          href="https://bunorden.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[9px] font-black uppercase tracking-[0.3em] text-secondary/30 hover:text-secondary transition-colors"
        >
          {t('footer.powered_by')} Bunorden
        </Link>
      </div>
    </aside>
  )
}
