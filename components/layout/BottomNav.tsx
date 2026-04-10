'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ArrowLeftRight, PlusCircle, BarChart3, Settings } from 'lucide-react'

const tabs = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/transactions', icon: ArrowLeftRight, label: 'History' },
  { href: '/add', icon: PlusCircle, label: 'Add' },
  { href: '/reports', icon: BarChart3, label: 'Reports' },
  { href: '/settings', icon: Settings, label: 'Settings' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
      style={{
        background: 'var(--bg-glass-strong)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderTop: '1px solid var(--border)',
      }}
    >
      <div className="flex justify-around items-end max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = pathname.startsWith(tab.href)
          const isAdd = tab.href === '/add'
          const Icon = tab.icon

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 relative group"
              style={{
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              {isAdd ? (
                <div
                  className="flex items-center justify-center w-12 h-12 -mt-5 rounded-full shadow-lg"
                  style={{
                    background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                    boxShadow: '0 4px 20px rgba(59, 130, 246, 0.4)',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  <Icon size={22} color="#fff" strokeWidth={2.5} />
                </div>
              ) : (
                <>
                  <Icon
                    size={22}
                    strokeWidth={isActive ? 2.5 : 1.8}
                    style={{
                      color: isActive ? 'var(--accent-primary)' : 'var(--text-tertiary)',
                      transition: 'all 0.3s ease',
                      transform: isActive ? 'scale(1.1)' : 'scale(1)',
                    }}
                  />
                  <span
                    className="text-[10px] font-medium"
                    style={{
                      color: isActive ? 'var(--accent-primary)' : 'var(--text-tertiary)',
                      transition: 'color 0.3s ease',
                    }}
                  >
                    {tab.label}
                  </span>
                  {isActive && (
                    <div
                      className="absolute bottom-0 w-6 h-[3px] rounded-t-full"
                      style={{
                        background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))',
                      }}
                    />
                  )}
                </>
              )}
            </Link>
          )
        })}
      </div>
      <div style={{ height: 'env(safe-area-inset-bottom)' }} />
    </nav>
  )
}
