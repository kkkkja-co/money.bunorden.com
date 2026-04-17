'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTheme } from '@/app/providers'
import { Moon, Sun } from 'lucide-react'

interface Feature {
  icon: string
  title: string
  description: string
}

const features: Feature[] = [
  {
    icon: '🛡️',
    title: 'Zero Surveillance',
    description: 'No ads. No analytics. No third-party scripts. Your financial data never leaves your vault.',
  },
  {
    icon: '🏦',
    title: 'Multi-Account Vaults',
    description: 'Manage personal, business, and savings accounts all in one unified, encrypted interface.',
  },
  {
    icon: '📊',
    title: 'Insightful Reports',
    description: 'Visual spending breakdowns and monthly trends that actually help you understand your money.',
  },
  {
    icon: '🎯',
    title: 'Budget Protocols',
    description: 'Real-time budget tracking with glowing progress indicators that keep you on target.',
  },
  {
    icon: '🔑',
    title: 'Next-Gen Security',
    description: 'Native 2FA at the vault core. Built-in MFA so only you hold the key.',
  },
  {
    icon: '📤',
    title: 'Data Sovereignty',
    description: 'Export your entire vault history to JSON or CSV at any time. Your data, your rules.',
  },
]

export default function Page() {
  const { theme, toggleTheme } = useTheme()

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault()
    const href = e.currentTarget.getAttribute('href')
    if (href && href.startsWith('#')) {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="landing-root">
      {/* ── Background Orbs ─────────────────────────────── */}
      <div className="orb orb-1" aria-hidden="true" />
      <div className="orb orb-2" aria-hidden="true" />
      <div className="orb orb-3" aria-hidden="true" />

      {/* ── Navigation ──────────────────────────────────── */}
      <nav className="landing-nav animate-slide-up">
        <div className="landing-nav-inner">
          <div className="landing-logo">
            <Image src={theme === 'dark' ? "/assets/clavi-icon-dark.svg" : "/assets/clavi-icon-light.svg"} alt="Clavi logo" width={32} height={32} />
            <span className="landing-logo-name">Clavi</span>
          </div>
          <div className="landing-nav-links">
            <a href="#features" onClick={handleScroll} className="landing-nav-link">Features</a>
            <a href="#privacy" onClick={handleScroll} className="landing-nav-link">Privacy</a>
          </div>
          
          <div className="flex items-center gap-4 ml-auto">
            <button onClick={toggleTheme} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors p-1" aria-label="Toggle Theme">
              {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <Link href="/login" className="btn-apple-primary landing-nav-cta !ml-0">
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────── */}
      <main>
        <section className="landing-hero">
          <div className="landing-hero-badge animate-slide-up">
            <span className="landing-badge-dot" aria-hidden="true" />
            Privacy-First · Open Source · Self-Hostable
          </div>

          <div className="landing-hero-icon animate-slide-up delay-1">
            <div className="hero-icon-glow" aria-hidden="true" />
            <Image
              src="/assets/clavi-icon-dark.svg"
              alt="Clavi key icon"
              width={96}
              height={96}
              className="hero-icon-img"
            />
          </div>

          <h1 className="landing-title animate-slide-up delay-2">
            You Hold<br />
            <span className="landing-title-gradient">the Key.</span>
          </h1>

          <p className="landing-subtitle animate-slide-up delay-3">
            Clavi is a premium, privacy-first financial vault built for people who demand{' '}
            <em>absolute control</em> over their data. Zero trackers. Zero compromises.
          </p>

          <div className="landing-cta-group animate-slide-up delay-4">
            <Link href="/login" className="btn-apple-primary landing-cta-primary">
              Open Your Vault →
            </Link>
            <a href="#features" className="landing-cta-secondary">
              Explore Features
            </a>
          </div>

          {/* stat strip */}
          <div className="landing-stats animate-slide-up delay-5">
            <div className="landing-stat">
              <span className="landing-stat-value">0</span>
              <span className="landing-stat-label">Trackers</span>
            </div>
            <div className="landing-stat-divider" aria-hidden="true" />
            <div className="landing-stat">
              <span className="landing-stat-value">100%</span>
              <span className="landing-stat-label">Data Ownership</span>
            </div>
            <div className="landing-stat-divider" aria-hidden="true" />
            <div className="landing-stat">
              <span className="landing-stat-value">E2E</span>
              <span className="landing-stat-label">Encrypted</span>
            </div>
          </div>
        </section>

        {/* ── Features ────────────────────────────────────── */}
        <section id="features" className="landing-features-section">
          <div className="landing-section-header">
            <span className="landing-section-eyebrow">Built different</span>
            <h2 className="landing-section-title">Everything you need.<br />Nothing you don't.</h2>
          </div>

          <div className="landing-features-grid">
            {features.map((f, i) => (
              <div
                key={f.title}
                className={`landing-feature-card animate-slide-up delay-${Math.min(i + 1, 5)}`}
              >
                <div className="landing-feature-icon" aria-hidden="true">{f.icon}</div>
                <h3 className="landing-feature-title">{f.title}</h3>
                <p className="landing-feature-desc">{f.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Privacy Section ─────────────────────────────── */}
        <section id="privacy" className="landing-privacy-section">
          <div className="landing-privacy-card animate-slide-up">
            <div className="landing-privacy-icon" aria-hidden="true">🔐</div>
            <h2 className="landing-section-title" style={{ textAlign: 'center' }}>
              Financial data is a<br />
              <span className="landing-title-gradient">human right.</span>
            </h2>
            <p className="landing-privacy-body">
              Clavi was built on one belief: your money is your business. We never sell your data,
              serve ads, or run third-party analytics. Every transaction stays in your own encrypted
              Supabase vault — and when you leave, a single click erases everything permanently.
            </p>
            <div className="landing-privacy-pills">
              <span className="landing-pill">No Ads</span>
              <span className="landing-pill">No Data Selling</span>
              <span className="landing-pill">No Third-Party Scripts</span>
              <span className="landing-pill">Self-Hostable</span>
            </div>
          </div>
        </section>

        {/* ── Final CTA ───────────────────────────────────── */}
        <section className="landing-final-cta animate-slide-up">
          <h2 className="landing-final-title">Ready to take control?</h2>
          <p className="landing-final-sub">
            Create your vault in seconds. No credit card. No catch.
          </p>
          <Link href="/login" className="btn-apple-primary landing-cta-primary">
            Get Started — It&apos;s Free
          </Link>
        </section>
      </main>

      {/* ── Footer ──────────────────────────────────────── */}
      <footer className="landing-footer">
        <div className="landing-footer-logo">
          <Image src="/assets/clavi-icon-dark.svg" alt="Clavi" width={24} height={24} />
          <span>Clavi</span>
        </div>
        <p className="landing-footer-tagline">The Key is Yours. 🗝️</p>
        <p className="landing-footer-credit">
          Built with ❤️ by{' '}
          <a href="https://bunorden.com" className="landing-footer-link" target="_blank" rel="noopener noreferrer">
            Bunorden
          </a>
        </p>
      </footer>

      <style>{`
        /* ── Root & Layout ────────────────────────── */
        .landing-root {
          min-height: 100vh;
          background: var(--bg-primary);
          color: var(--text-primary);
          overflow-x: hidden;
          position: relative;
        }

        /* ── Ambient Background Orbs ──────────────── */
        .orb {
          position: fixed;
          border-radius: 50%;
          filter: blur(120px);
          pointer-events: none;
          z-index: 0;
        }
        .orb-1 {
          width: 600px; height: 600px;
          top: -200px; left: -200px;
          background: radial-gradient(circle, rgba(175, 82, 222, 0.18) 0%, transparent 70%);
          animation: orbDrift1 14s ease-in-out infinite;
        }
        .orb-2 {
          width: 500px; height: 500px;
          top: 40%; right: -150px;
          background: radial-gradient(circle, rgba(88, 86, 214, 0.15) 0%, transparent 70%);
          animation: orbDrift2 18s ease-in-out infinite;
        }
        .orb-3 {
          width: 400px; height: 400px;
          bottom: 10%; left: 20%;
          background: radial-gradient(circle, rgba(108, 99, 255, 0.12) 0%, transparent 70%);
          animation: orbDrift3 22s ease-in-out infinite;
        }
        @keyframes orbDrift1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(60px, 40px) scale(1.1); }
        }
        @keyframes orbDrift2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-40px, 60px) scale(0.95); }
        }
        @keyframes orbDrift3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -50px) scale(1.08); }
        }

        /* ── Nav ──────────────────────────────────── */
        .landing-nav {
          position: sticky;
          top: 0;
          z-index: 100;
          padding: 0.875rem 1.5rem;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(24px) saturate(180%);
          -webkit-backdrop-filter: blur(24px) saturate(180%);
          border-bottom: 1px solid var(--border);
        }
        .landing-nav-inner {
          max-width: 1100px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
        .landing-logo {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          flex-shrink: 0;
        }
        .landing-logo-name {
          font-size: 1.1rem;
          font-weight: 800;
          letter-spacing: -0.04em;
          background: linear-gradient(135deg, #af52de, #5856d6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .landing-nav-links {
          display: flex;
          gap: 1.5rem;
          margin-left: 1.5rem;
          flex: 1;
        }
        .landing-nav-link {
          font-size: 0.875rem;
          color: var(--text-secondary);
          text-decoration: none;
          transition: color 0.2s;
        }
        .landing-nav-link:hover { color: var(--text-primary); }
        .landing-nav-cta {
          margin-left: auto;
          font-size: 0.875rem;
          padding: 0.55rem 1.25rem;
          text-decoration: none;
          display: inline-block;
        }

        /* ── Hero ─────────────────────────────────── */
        .landing-hero {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 5rem 1.5rem 4rem;
          max-width: 820px;
          margin: 0 auto;
        }
        .landing-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.78rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--text-secondary);
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          border-radius: 99px;
          padding: 0.4rem 1rem;
          margin-bottom: 2rem;
        }
        .landing-badge-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--accent-primary);
          box-shadow: 0 0 8px var(--accent-primary);
          animation: pulseSlow 2.5s ease-in-out infinite;
        }
        .landing-hero-icon {
          position: relative;
          margin-bottom: 2rem;
        }
        .hero-icon-glow {
          position: absolute;
          inset: -24px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(175, 82, 222, 0.35) 0%, transparent 70%);
          animation: breathe 3s ease-in-out infinite;
        }
        .hero-icon-img {
          position: relative;
          z-index: 1;
          filter: drop-shadow(0 0 24px rgba(175, 82, 222, 0.5));
          animation: float 4s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .landing-title {
          font-size: clamp(3rem, 8vw, 5.5rem);
          font-weight: 900;
          line-height: 1.05;
          letter-spacing: -0.05em;
          margin: 0 0 1.25rem;
        }
        .landing-title-gradient {
          background: linear-gradient(135deg, #af52de 0%, #6c63ff 50%, #5856d6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .landing-subtitle {
          font-size: clamp(1rem, 2.5vw, 1.2rem);
          line-height: 1.7;
          color: var(--text-secondary);
          max-width: 600px;
          margin: 0 0 2.5rem;
        }
        .landing-subtitle em {
          font-style: normal;
          color: var(--text-primary);
          font-weight: 600;
        }
        .landing-cta-group {
          display: flex;
          gap: 1rem;
          align-items: center;
          flex-wrap: wrap;
          justify-content: center;
          margin-bottom: 3rem;
        }
        .landing-cta-primary {
          font-size: 1rem;
          padding: 0.875rem 2rem;
          text-decoration: none;
          display: inline-block;
          letter-spacing: -0.01em;
        }
        .landing-cta-secondary {
          font-size: 0.95rem;
          color: var(--text-secondary);
          text-decoration: none;
          padding: 0.875rem 1.25rem;
          border: 1px solid var(--border);
          border-radius: var(--radius-xl);
          transition: all 0.2s;
        }
        .landing-cta-secondary:hover {
          color: var(--text-primary);
          border-color: rgba(255,255,255,0.15);
          background: var(--bg-elevated);
        }
        /* Stats strip */
        .landing-stats {
          display: flex;
          align-items: center;
          gap: 2rem;
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          border-radius: var(--radius-2xl);
          padding: 1.25rem 2.5rem;
        }
        .landing-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
        }
        .landing-stat-value {
          font-size: 1.5rem;
          font-weight: 800;
          letter-spacing: -0.04em;
          background: linear-gradient(135deg, #af52de, #5856d6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .landing-stat-label {
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: var(--text-tertiary);
        }
        .landing-stat-divider {
          width: 1px; height: 32px;
          background: var(--border);
        }

        /* ── Features ─────────────────────────────── */
        .landing-features-section {
          position: relative;
          z-index: 1;
          padding: 4rem 1.5rem 5rem;
          max-width: 1100px;
          margin: 0 auto;
        }
        .landing-section-header {
          text-align: center;
          margin-bottom: 3rem;
        }
        .landing-section-eyebrow {
          display: block;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--accent-primary);
          margin-bottom: 0.75rem;
        }
        .landing-section-title {
          font-size: clamp(1.8rem, 4vw, 2.75rem);
          font-weight: 800;
          letter-spacing: -0.04em;
          line-height: 1.15;
          margin: 0;
        }
        .landing-features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.25rem;
        }
        .landing-feature-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: var(--radius-2xl);
          padding: 1.75rem;
          transition: transform 0.25s cubic-bezier(0.4,0,0.2,1), border-color 0.25s, box-shadow 0.25s;
          cursor: default;
        }
        .landing-feature-card:hover {
          transform: translateY(-4px);
          border-color: rgba(175, 82, 222, 0.35);
          box-shadow: 0 20px 40px -10px rgba(175, 82, 222, 0.15);
        }
        .landing-feature-icon {
          font-size: 2rem;
          margin-bottom: 1rem;
          display: block;
        }
        .landing-feature-title {
          font-size: 1.05rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          margin: 0 0 0.5rem;
        }
        .landing-feature-desc {
          font-size: 0.875rem;
          line-height: 1.65;
          color: var(--text-secondary);
          margin: 0;
        }

        /* ── Privacy ──────────────────────────────── */
        .landing-privacy-section {
          position: relative;
          z-index: 1;
          padding: 2rem 1.5rem 5rem;
          max-width: 860px;
          margin: 0 auto;
        }
        .landing-privacy-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: var(--radius-3xl);
          padding: 3rem 2.5rem;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .landing-privacy-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at top, rgba(175, 82, 222, 0.06) 0%, transparent 70%);
          pointer-events: none;
        }
        .landing-privacy-icon {
          font-size: 3rem;
          margin-bottom: 1.5rem;
          display: block;
        }
        .landing-privacy-body {
          font-size: 1rem;
          line-height: 1.75;
          color: var(--text-secondary);
          max-width: 560px;
          margin: 1.25rem auto 1.75rem;
        }
        .landing-privacy-pills {
          display: flex;
          gap: 0.625rem;
          flex-wrap: wrap;
          justify-content: center;
        }
        .landing-pill {
          font-size: 0.78rem;
          font-weight: 600;
          padding: 0.375rem 0.875rem;
          background: rgba(175, 82, 222, 0.1);
          border: 1px solid rgba(175, 82, 222, 0.25);
          border-radius: 99px;
          color: #af52de;
          letter-spacing: 0.02em;
        }

        /* ── Final CTA ────────────────────────────── */
        .landing-final-cta {
          position: relative;
          z-index: 1;
          text-align: center;
          padding: 3rem 1.5rem 6rem;
          max-width: 600px;
          margin: 0 auto;
        }
        .landing-final-title {
          font-size: clamp(1.8rem, 4vw, 2.5rem);
          font-weight: 800;
          letter-spacing: -0.04em;
          margin: 0 0 0.75rem;
        }
        .landing-final-sub {
          color: var(--text-secondary);
          font-size: 1rem;
          margin: 0 0 2rem;
        }

        /* ── Footer ───────────────────────────────── */
        .landing-footer {
          position: relative;
          z-index: 1;
          border-top: 1px solid var(--border);
          padding: 2.5rem 1.5rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }
        .landing-footer-logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 700;
          font-size: 0.95rem;
          letter-spacing: -0.02em;
          margin-bottom: 0.25rem;
        }
        .landing-footer-tagline {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin: 0;
        }
        .landing-footer-credit {
          font-size: 0.78rem;
          color: var(--text-tertiary);
          margin: 0;
        }
        .landing-footer-link {
          color: var(--accent-primary);
          text-decoration: none;
        }
        .landing-footer-link:hover { text-decoration: underline; }

        /* ── Responsive ───────────────────────────── */
        @media (max-width: 640px) {
          .landing-nav-links { display: none; }
          .landing-hero { padding: 3.5rem 1.25rem 3rem; }
          .landing-stats {
            gap: 1.25rem;
            padding: 1rem 1.5rem;
          }
          .landing-stat-value { font-size: 1.2rem; }
          .landing-privacy-card { padding: 2rem 1.25rem; }
        }
      `}</style>
    </div>
  )
}
