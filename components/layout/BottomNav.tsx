'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { href: '/dashboard', icon: '📊', label: 'Dashboard' },
  { href: '/transactions', icon: '📋', label: 'Transactions' },
  { href: '/add', icon: '➕', label: 'Add' },
  { href: '/reports', icon: '📈', label: 'Reports' },
  { href: '/settings', icon: '⚙️', label: 'Settings' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 md:hidden bg-white dark:bg-[#1C1C1E] border-t border-[#E5E5EA] dark:border-[#38383A] safe-bottom">
      <div className="flex justify-around">
        {tabs.map((tab) => {
          const isActive = pathname.startsWith(tab.href)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex-1 flex flex-col items-center justify-center py-3 text-xs gap-1 transition-colors ${
                isActive
                  ? 'text-[#007AFF]'
                  : 'text-[#636366] dark:text-[#8E8E93]'
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span>{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
