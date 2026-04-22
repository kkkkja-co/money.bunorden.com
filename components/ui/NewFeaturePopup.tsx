'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from '@/app/providers'
import { X, Sparkles, BookOpen, Users, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

const APP_VERSION = 'v0.7.0'

export function NewFeaturePopup() {
  const { t } = useTranslation()
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if user has seen this version's update
    const seenVersion = localStorage.getItem('clavi-update-seen')
    
    // Only show to users who have seen the initial tour (older users)
    const seenTour = localStorage.getItem('clavi-tour-seen')
    
    if (seenTour && seenVersion !== APP_VERSION) {
      const timer = setTimeout(() => setIsVisible(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [])

  const dismiss = () => {
    setIsVisible(false)
    localStorage.setItem('clavi-update-seen', APP_VERSION)
  }

  const explore = () => {
    dismiss()
    router.push('/notes')
  }

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
          onClick={dismiss}
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-sm surface-elevated p-8 shadow-[0_32px_96px_-12px_rgba(0,0,0,0.8)] border-white/10"
        >
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full bg-accent-primary flex items-center justify-center shadow-2xl">
            <Sparkles size={40} color="white" />
            <div className="absolute inset-0 rounded-full animate-ping bg-accent-primary opacity-20" />
          </div>

          <button 
            onClick={dismiss}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/5 transition-colors"
          >
            <X size={16} className="text-tertiary" />
          </button>

          <div className="mt-8 text-center">
            <h2 className="text-2xl font-black mb-2 tracking-tight" style={{ color: 'var(--text-primary)' }}>
              {t('tour.update_title')}
            </h2>
            <p className="text-sm leading-relaxed mb-8" style={{ color: 'var(--text-tertiary)' }}>
              {t('tour.update_desc')}
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-4 text-left p-3 rounded-2xl bg-white/5">
                <div className="w-10 h-10 rounded-xl bg-accent-primary/10 flex items-center justify-center text-accent-primary">
                  <BookOpen size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{t('notes.title')}</p>
                  <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{t('notes.subtitle')}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-left p-3 rounded-2xl bg-white/5">
                <div className="w-10 h-10 rounded-xl bg-accent-primary/10 flex items-center justify-center text-accent-primary">
                  <Users size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{t('split.title')}</p>
                  <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{t('split.subtitle')}</p>
                </div>
              </div>
            </div>

            <button 
              onClick={explore}
              className="btn-apple-primary w-full py-4 text-sm font-bold flex items-center justify-center gap-2 group"
            >
              {t('tour.update_action')} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
