'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ArrowLeftRight, PlusCircle, BarChart3, Settings, Target, PieChart, ChevronUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

import { useTranslation } from '@/app/providers'

export function BottomNav() {
  const { t } = useTranslation()
  const pathname = usePathname()
  const [showAnalysisMenu, setShowAnalysisMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu on navigation or click outside
  useEffect(() => {
    setShowAnalysisMenu(false)
  }, [pathname])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowAnalysisMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const [hasSeenNewFeature, setHasSeenNewFeature] = useState(true)

  useEffect(() => {
    const seen = localStorage.getItem('clavi-feature-budgets-seen')
    if (!seen) setHasSeenNewFeature(false)
  }, [])

  const markFeatureSeen = () => {
    localStorage.setItem('clavi-feature-budgets-seen', 'true')
    setHasSeenNewFeature(true)
  }

  const tabs = [
    { href: '/dashboard', icon: Home, label: t('nav.home') },
    { href: '/transactions', icon: ArrowLeftRight, label: t('nav.history') },
    { href: '/add', icon: PlusCircle, label: t('nav.add'), isSpecial: true },
    { 
      id: 'analysis', 
      icon: PieChart, 
      label: t('nav.budgets'),
      isMenu: true,
      hasBadge: !hasSeenNewFeature 
    },
    { href: '/settings', icon: Settings, label: t('nav.settings') },
  ]

  const analysisItems = [
    { href: '/budgets', icon: Target, label: t('budgets.title'), desc: t('settings.budgets_subtitle') },
    { href: '/reports', icon: BarChart3, label: t('reports.title'), desc: t('reports.no_data_subtitle').split('.')[0] },
  ]

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
      {/* Second Level Menu */}
      <AnimatePresence>
        {showAnalysisMenu && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute bottom-full left-4 right-4 mb-4 p-3 rounded-3xl shadow-2xl overflow-hidden border border-white/10"
            style={{
              background: 'var(--bg-glass-strong)',
              backdropFilter: 'blur(32px)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            }}
          >
            <div className="flex flex-col gap-2">
              <p className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 mb-1 opacity-50" style={{ color: 'var(--text-primary)' }}>
                {t('reports.title')} & {t('budgets.title')}
              </p>
              {analysisItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-4 p-3 rounded-2xl transition-all active:scale-95"
                  style={{ background: 'rgba(255,255,255,0.03)' }}
                >
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-primary)' }}
                  >
                    <item.icon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{item.label}</p>
                    <p className="text-[10px] truncate opacity-60" style={{ color: 'var(--text-tertiary)' }}>{item.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-around items-end max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = tab.href ? pathname.startsWith(tab.href) : (tab.id === 'analysis' && (pathname.startsWith('/budgets') || pathname.startsWith('/reports')))
          const Icon = tab.icon

          if (tab.isSpecial) {
            return (
              <Link
                key={tab.href}
                href={tab.href!}
                className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 relative group"
              >
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
              </Link>
            )
          }

          const content = (
            <div
              className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 relative group cursor-pointer"
              style={{ transition: 'all 0.3s ease' }}
              onClick={() => {
                if (tab.isMenu) {
                  setShowAnalysisMenu(!showAnalysisMenu)
                  if (tab.hasBadge) markFeatureSeen()
                }
              }}
            >
              <div className="relative">
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  style={{
                    color: isActive ? 'var(--accent-primary)' : 'var(--text-tertiary)',
                    transition: 'all 0.3s ease',
                    transform: isActive ? 'scale(1.1)' : 'scale(1)',
                  }}
                />
                {tab.hasBadge && (
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-primary"></span>
                  </span>
                )}
                {tab.isMenu && (
                  <div className="absolute -top-1 -right-1">
                    {!tab.hasBadge && <ChevronUp size={10} style={{ color: showAnalysisMenu ? 'var(--accent-primary)' : 'var(--text-tertiary)' }} />}
                  </div>
                )}
              </div>
              <span
                className="text-[10px] font-medium"
                style={{
                  color: isActive ? 'var(--accent-primary)' : 'var(--text-tertiary)',
                  transition: 'color 0.3s ease',
                }}
              >
                {tab.isMenu ? t('reports.title') : tab.label}
              </span>
              {isActive && (
                <div
                  className="absolute bottom-0 w-6 h-[3px] rounded-t-full"
                  style={{
                    background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))',
                  }}
                />
              )}
            </div>
          )

          return tab.href ? (
            <Link key={tab.href} href={tab.href} className="flex-1 flex flex-col items-center">
              {content}
            </Link>
          ) : (
            <div key={tab.id} className="flex-1">
              {content}
            </div>
          )
        })}
      </div>
      <div style={{ height: 'env(safe-area-inset-bottom)' }} />
    </nav>
  )
}
