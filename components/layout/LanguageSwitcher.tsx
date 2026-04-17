'use client'

import React from 'react'
import { useLanguage } from '@/app/providers'
import { motion } from 'framer-motion'

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()

  const languages = [
    { id: 'en', label: 'EN' },
    { id: 'zh-TW', label: '繁' }
  ]

  return (
    <div className="flex bg-[rgba(150,150,150,0.1)] rounded-full p-1 shadow-inner backdrop-blur-md border border-white/5 items-center">
      {languages.map((lang) => {
        const isActive = language === lang.id
        return (
          <button
            key={lang.id}
            onClick={() => setLanguage(lang.id as any)}
            className="relative px-2 py-[2px] sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold tracking-wider transition-colors z-10"
            style={{
              color: isActive ? '#ffffff' : 'var(--text-tertiary)'
            }}
          >
            {isActive && (
              <motion.div
                layoutId="lang-active"
                className="absolute inset-0 rounded-full bg-[var(--accent-primary)] shadow-[0_2px_8px_rgba(0,0,0,0.2)] -z-10"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            {lang.label}
          </button>
        )
      })}
    </div>
  )
}
