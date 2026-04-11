'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from '@/app/providers'
import { X, ChevronRight, Sparkles } from 'lucide-react'

interface TourStep {
  title: string
  description: string
  targetId?: string
}

export function ProductTour() {
  const { t } = useTranslation()
  const [currentStep, setCurrentStep] = useState(-1) // -1 is intro
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if user has seen the tour
    const hasSeenTour = localStorage.getItem('clavi-tour-seen')
    if (!hasSeenTour) {
      // Delay tour start slightly for smoother entrance
      const timer = setTimeout(() => setIsVisible(true), 2000)
      return () => clearTimeout(timer)
    }
  }, [])

  const steps: TourStep[] = [
    {
      title: t('tour.balance_title'),
      description: t('tour.balance_desc'),
      targetId: 'tour-balance'
    },
    {
      title: t('tour.analytics_title'),
      description: t('tour.analytics_desc'),
      targetId: 'tour-analytics'
    },
    {
      title: t('tour.action_title'),
      description: t('tour.action_desc'),
      targetId: 'tour-action'
    },
    {
      title: t('tour.reports_title'),
      description: t('tour.reports_desc'),
      targetId: 'tour-reports'
    },
    {
      title: t('tour.budgets_title'),
      description: t('tour.budgets_desc'),
      targetId: 'tour-budgets'
    },
    {
      title: t('tour.notifications_title'),
      description: t('tour.notifications_desc'),
      targetId: 'tour-notifications'
    }
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      finishTour()
    }
  }

  const finishTour = () => {
    setIsVisible(false)
    localStorage.setItem('clavi-tour-seen', 'true')
  }

  const skipTour = () => {
    setIsVisible(false)
    localStorage.setItem('clavi-tour-seen', 'true')
  }

  useEffect(() => {
    if (currentStep >= 0 && steps[currentStep].targetId) {
      const el = document.getElementById(steps[currentStep].targetId!)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        
        // Add a temporary highlight effect
        el.style.transition = 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
        el.style.transform = 'scale(1.02)'
        el.style.boxShadow = '0 0 0 4px var(--accent-primary-alpha, rgba(59, 130, 246, 0.2))'
        
        setTimeout(() => {
          el.style.transform = ''
          el.style.boxShadow = ''
        }, 1500)
      }
    }
  }, [currentStep])

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={skipTour}
        />

        {/* Tour Modal */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-sm surface-elevated p-8 text-center shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] border-white/10"
        >
          <button 
            onClick={skipTour}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/5 transition-colors"
          >
            <X size={16} className="text-tertiary" />
          </button>

          <div className="mb-6 mx-auto w-16 h-16 rounded-2xl bg-accent-primary/10 flex items-center justify-center text-accent-primary">
            <Sparkles size={32} />
          </div>

          {currentStep === -1 ? (
            <div className="animate-slide-up">
              <h2 className="text-2xl font-bold mb-3 text-primary">{t('tour.welcome_title')}</h2>
              <p className="text-sm text-tertiary mb-8 leading-relaxed">
                {t('tour.welcome_desc')}
              </p>
              <button 
                onClick={() => setCurrentStep(0)}
                className="btn-apple-primary w-full py-4 text-sm font-bold rounded-2xl flex items-center justify-center gap-2"
              >
                {t('tour.start')} <ChevronRight size={18} />
              </button>
            </div>
          ) : (
            <div key={currentStep} className="animate-slide-up">
              <div className="flex justify-center gap-1 mb-6">
                {steps.map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-1 rounded-full transition-all duration-300 ${i === currentStep ? 'w-8 bg-accent-primary' : 'w-2 bg-white/10'}`}
                  />
                ))}
              </div>
              <h2 className="text-xl font-bold mb-2 text-primary">{steps[currentStep].title}</h2>
              <p className="text-sm text-tertiary mb-8 leading-relaxed">
                {steps[currentStep].description}
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={skipTour}
                  className="flex-1 py-3 text-sm font-bold rounded-xl border border-white/5 hover:bg-white/5 transition-all text-tertiary"
                >
                  {t('tour.skip')}
                </button>
                <button 
                  onClick={handleNext}
                  className="flex-[2] btn-apple-primary py-3 text-sm font-bold rounded-xl flex items-center justify-center gap-2"
                >
                  {currentStep === steps.length - 1 ? t('tour.finish') : t('tour.next')} <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
