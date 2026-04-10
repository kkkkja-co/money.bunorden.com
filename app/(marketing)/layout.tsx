'use client'

import Link from 'next/link'
import { useTheme } from '@/app/providers'
import { BunordenFooter } from '@/components/layout/BunordenFooter'
import { Sun, Moon, ArrowLeft } from 'lucide-react'

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { theme, toggleTheme } = useTheme()

  return (
    <>
      {/* Top Nav - matches net.bunorden.com */}
      <header
        className="sticky top-0 z-50 flex items-center h-[72px] px-4 lg:px-8"
        style={{
          background: 'var(--bg-glass)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border)',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div className="flex items-center justify-between w-full max-w-5xl mx-auto">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 font-extrabold text-lg tracking-tight"
            style={{ color: 'var(--text-primary)', transition: 'opacity 0.2s' }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
              style={{
                background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
              }}
            >
              L
            </div>
            <span>
              Led<span style={{ color: 'var(--accent-primary)' }}>ger</span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-8">
              <Link
                href="/privacy"
                className="text-sm font-semibold relative py-4"
                style={{ color: 'var(--text-secondary)', transition: 'color 0.3s' }}
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-sm font-semibold relative py-4"
                style={{ color: 'var(--text-secondary)', transition: 'color 0.3s' }}
              >
                Terms of Use
              </Link>
              <Link
                href="/contact"
                className="text-sm font-semibold relative py-4"
                style={{ color: 'var(--text-secondary)', transition: 'color 0.3s' }}
              >
                Contact Us
              </Link>
            </nav>

            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                transition: 'all 0.3s',
              }}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <Link
              href="https://bunorden.com"
              target="_blank"
              className="hidden md:inline-flex px-4 py-2 rounded-full text-sm font-bold text-white"
              style={{
                background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
                transition: 'all 0.3s',
              }}
            >
              Bunorden Main
            </Link>
          </div>
        </div>
      </header>

      <main className="min-h-screen">
        {children}
      </main>

      <BunordenFooter />
    </>
  )
}
