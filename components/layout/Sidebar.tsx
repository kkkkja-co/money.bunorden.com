'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme, useTranslation } from '@/app/providers'
import { Home, ArrowLeftRight, PlusCircle, BarChart3, Settings, Target } from 'lucide-react'

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
      <Link href="/dashboard" className="flex items-center gap-4 px-8 py-10 transition-transform active:scale-95">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-accent-primary transform rotate-12 shadow-xl shadow-accent-primary/20">
           <img src={logoSrc} alt="Clavi" className="w-6 h-6 -rotate-12 transition-all duration-300" />
        </div>
        <span className="font-black text-2xl tracking-tighter text-primary">Clavi</span>
      </Link>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-4 px-6 py-4 rounded-3xl font-bold text-sm transition-all active:scale-95 relative overflow-hidden"
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
