'use client'

import { useTheme } from '@/app/providers'

export function PageSkeleton() {
  const { theme } = useTheme()
  const logoSrc = theme === 'light' ? '/assets/clavi-icon-light.svg' : '/assets/clavi-icon-dark.svg'

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] max-w-3xl mx-auto w-full">
      <div 
        className="w-16 h-16 rounded-3xl flex items-center justify-center mb-6 animate-breathe"
        style={{
          background: 'var(--bg-elevated)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          border: '1px solid var(--border)'
        }}
      >
        <img 
          src={logoSrc} 
          alt="Loading..." 
          className="w-8 h-8 object-cover"
        />
      </div>
      <div className="animate-pulse-slow">
        <span className="font-black text-[10px] tracking-[0.3em] uppercase text-secondary">
          Loading Data...
        </span>
      </div>
    </div>
  )
}
