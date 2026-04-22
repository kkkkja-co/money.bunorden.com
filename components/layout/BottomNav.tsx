'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Home, ArrowLeftRight, PlusCircle, BarChart3, Settings, Target, PieChart, ChevronUp, CreditCard, Calendar, BookOpen, Users } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from '@/app/providers'
import { NotificationPanel } from '@/components/ui/NotificationPanel'

export function BottomNav() {
  const { t } = useTranslation()
  const pathname = usePathname()
  const router = useRouter()
  const [showAnalysisMenu, setShowAnalysisMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

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
    { id: 'analysis', icon: PieChart, label: t('nav.more'), isMenu: true, hasBadge: !hasSeenNewFeature },
    { href: '/settings', icon: Settings, label: t('nav.settings') },
  ]

  const analysisItems = [
    { href: '/bills', icon: CreditCard, label: t('bills.title') || 'Bills', desc: t('bills.active') || 'Active' },
    { href: '/calendar', icon: Calendar, label: t('calendar.title') || 'Calendar', desc: t('calendar.today') || 'Today' },
    { href: '/budgets', icon: Target, label: t('budgets.title'), desc: t('settings.budgets_subtitle') },
    { href: '/reports', icon: BarChart3, label: t('reports.title'), desc: t('reports.no_data_subtitle').split('.')[0] },
    { href: '/notes', icon: BookOpen, label: t('notes.title') || 'Notes', desc: t('notes.subtitle') || 'Financial notes' },
    { href: '/split', icon: Users, label: t('split.title') || 'Split', desc: t('split.subtitle') || 'Group expenses' },
  ]

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden overflow-visible"
      style={{
        background: 'var(--bg-secondary)',
        backdropFilter: 'blur(32px)',
        borderTop: '1px solid var(--border)',
        paddingBottom: 'env(safe-area-inset-bottom, 8px)',
        WebkitBackdropFilter: 'blur(32px)',
      }}
    >
      <AnimatePresence>
        {showAnalysisMenu && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-full left-4 right-4 mb-6 p-4 rounded-[32px] shadow-2xl border border-white/10"
            style={{ background: 'var(--bg-elevated)', backdropFilter: 'blur(32px)' }}
          >
            <p className="text-[10px] font-black uppercase tracking-[0.2em] px-2 mb-3 opacity-40 text-secondary">
              {t('nav.more')}
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {analysisItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-col gap-2 p-3.5 rounded-2xl transition-all active:scale-95 bg-white/5 hover:bg-white/10"
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]">
                    <item.icon size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm tracking-tight text-primary truncate">{item.label}</p>
                    <p className="text-[9px] font-bold text-secondary uppercase tracking-widest truncate opacity-80 mt-0.5">{item.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-around items-center max-w-lg mx-auto h-16 px-2">
        {tabs.map((tab) => {
          const isActive = tab.href ? pathname.startsWith(tab.href) : (tab.id === 'analysis' && (pathname.startsWith('/budgets') || pathname.startsWith('/reports') || pathname.startsWith('/notes') || pathname.startsWith('/split')))
          const Icon = tab.icon

          if (tab.isSpecial) {
            return (
              <Link key={tab.href} href={tab.href!} className="relative w-14 h-14 flex items-center justify-center mb-6">
                <div 
                  className="absolute inset-0 rounded-[24px] shadow-2xl flex items-center justify-center transform active:scale-95 transition-transform"
                  style={{ 
                    background: 'var(--accent-gradient)',
                    boxShadow: '0 8px 32px rgba(175, 82, 222, 0.4), inset 0 2px 0 rgba(255,255,255,0.2)'
                  }}
                >
                  <Icon size={24} color="#fff" strokeWidth={2.5} />
                </div>
              </Link>
            )
          }

          // Settings tab: render side-by-side with NotificationPanel bell
          if (tab.href === '/settings') {
            return (
              <div key="settings-notif" className="flex items-center gap-1">
                <div
                  className="flex flex-col items-center justify-center gap-1 cursor-pointer transition-all active:scale-90 px-1"
                  onClick={() => router.push('/settings')}
                >
                  <Icon
                    size={20}
                    strokeWidth={isActive ? 3 : 2}
                    className={`transition-colors ${isActive ? 'text-accent-primary' : 'text-secondary'}`}
                  />
                  <span className={`text-[9px] font-black uppercase tracking-widest transition-colors opacity-70 ${isActive ? 'text-accent-primary' : 'text-secondary'}`}>
                    {tab.label}
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center pb-1">
                  <NotificationPanel />
                </div>
              </div>
            )
          }

          return (
            <div
              key={tab.id || tab.href}
              className="flex-1 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all active:scale-90"
              onClick={() => {
                if (tab.isMenu) {
                  setShowAnalysisMenu(!showAnalysisMenu)
                  if (tab.hasBadge) markFeatureSeen()
                } else if (tab.href) {
                  router.push(tab.href)
                }
              }}
            >
              <div className="relative">
                <Icon
                  size={20}
                  strokeWidth={isActive ? 3 : 2}
                  className={`transition-colors ${isActive ? 'text-accent-primary' : 'text-secondary'}`}
                />
                {tab.hasBadge && (
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-primary"></span>
                  </span>
                )}
              </div>
              <span className={`text-[9px] font-black uppercase tracking-widest transition-colors opacity-70 ${isActive ? 'text-accent-primary' : 'text-secondary'}`}>
                {tab.label}
              </span>
            </div>
          )
        })}
      </div>
    </nav>
  )
}
