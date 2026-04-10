'use client'

import Link from 'next/link'
import { Shield, Mail, FileText, Scale, Github } from 'lucide-react'

export function BunordenFooter() {
  return (
    <footer
      className="w-full mt-16 pt-8"
      style={{ borderTop: '1px solid var(--border)' }}
    >
      {/* Links */}
      <div className="max-w-4xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <Link
            href="/privacy"
            className="flex items-center gap-2 text-sm font-medium"
            style={{ color: 'var(--text-secondary)', transition: 'color 0.2s' }}
          >
            <Shield size={16} />
            Privacy Policy
          </Link>
          <Link
            href="/terms"
            className="flex items-center gap-2 text-sm font-medium"
            style={{ color: 'var(--text-secondary)', transition: 'color 0.2s' }}
          >
            <Scale size={16} />
            Terms of Use
          </Link>
          <Link
            href="/contact"
            className="flex items-center gap-2 text-sm font-medium"
            style={{ color: 'var(--text-secondary)', transition: 'color 0.2s' }}
          >
            <Mail size={16} />
            Contact Us
          </Link>
          <a
            href="https://github.com/kkkkja-co/money.bunorden.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm font-medium"
            style={{ color: 'var(--text-secondary)', transition: 'color 0.2s' }}
          >
            <Github size={16} />
            Open Source
          </a>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          <span
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold"
            style={{
              background: 'var(--overlay)',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
            }}
          >
            <Shield size={14} /> Privacy-First
          </span>
          <span
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold"
            style={{
              background: 'var(--overlay)',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
            }}
          >
            <FileText size={14} /> 100% Open Source
          </span>
        </div>

        {/* Privacy notice */}
        <div className="text-center pb-8 max-w-xl mx-auto">
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
            <strong style={{ color: 'var(--text-secondary)' }}>Your data is yours.</strong>{' '}
            Clavi does not sell, share, or use your financial data for advertising.
            All data is encrypted and protected by Row Level Security.
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Powered by</span>
            <a
              href="https://bunorden.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold"
              style={{ color: 'var(--text-secondary)', transition: 'color 0.2s' }}
            >
              Bunorden
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
