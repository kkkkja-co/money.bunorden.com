'use client'

import { useState } from 'react'
import { Mail, Send, CheckCircle, ArrowLeft } from 'lucide-react'
import { MarketingSection } from '@/components/layout/MarketingPageShell'
import { useTranslation } from '@/app/providers'
import { BunordenFooter } from '@/components/layout/BunordenFooter'
import Link from 'next/link'

export default function ContactPage() {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [requestType, setRequestType] = useState('general')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Build mailto link
    const subjectLine = requestType === 'deletion'
      ? `[Account Deletion Request] ${subject}`
      : requestType === 'data'
      ? `[Data Request] ${subject}`
      : subject

    const body = `Name: ${name}\nEmail: ${email}\nRequest Type: ${requestType}\n\nMessage:\n${message}`
    const mailto = `mailto:contact@bunorden.com?subject=${encodeURIComponent(subjectLine)}&body=${encodeURIComponent(body)}`

    window.open(mailto, '_blank')
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setName('')
      setEmail('')
      setSubject('')
      setMessage('')
      setRequestType('general')
    }, 4000)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 px-4 lg:px-8 py-6 lg:py-8 max-w-3xl mx-auto w-full">
        <header className="flex items-center gap-4 mb-8 animate-fade-up">
          <Link href="/settings" className="p-2 -ml-2 rounded-full hover:bg-white/5 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-accent-primary/10 flex items-center justify-center text-accent-primary">
               <Mail size={20} />
             </div>
             <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
               {t('contact.title')}
             </h1>
          </div>
        </header>

        <MarketingSection title={t('privacy.touch')}>
          <div className="grid grid-cols-1 gap-6">
            <div
              className="rounded-2xl p-6 text-center group transition-all hover:bg-white/[0.04]"
              style={{ background: 'var(--overlay)', border: '1px solid var(--border)' }}
            >
              <span className="text-[10px] font-bold uppercase tracking-widest block mb-2" style={{ color: 'var(--text-tertiary)' }}>
                {t('contact.direct_support')}
              </span>
              <a
                href="mailto:contact@bunorden.com"
                className="text-2xl font-bold transition-colors group-hover:text-white"
                style={{ color: 'var(--accent-primary)' }}
              >
                contact@bunorden.com
              </a>
            </div>
          </div>
        </MarketingSection>

        <MarketingSection title={t('contact.title')}>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Request type */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-tertiary)' }}>
                Inquiry Category
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'general', label: t('contact.category_general'), icon: '💬' },
                  { id: 'deletion', label: t('contact.category_deletion'), icon: '🗑️' },
                  { id: 'data', label: t('contact.category_data'), icon: '📦' },
                ].map((rt) => (
                  <button
                    key={rt.id}
                    type="button"
                    onClick={() => setRequestType(rt.id)}
                    className="flex items-center gap-3 p-4 rounded-2xl text-xs font-semibold transition-all"
                    style={{
                      background: requestType === rt.id ? 'rgba(59,130,246,0.1)' : 'var(--overlay)',
                      border: `1px solid ${requestType === rt.id ? 'var(--accent-primary)' : 'var(--border)'}`,
                      color: requestType === rt.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    }}
                  >
                    <span className="text-base">{rt.icon}</span>
                    {rt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-tertiary)' }}>
                  {t('contact.form_name')}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('contact.form_placeholder_name')}
                  className="input-glass"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-tertiary)' }}>
                  {t('contact.form_email')}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('contact.form_placeholder_email')}
                  className="input-glass"
                  required
                />
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-tertiary)' }}>
                {t('contact.form_placeholder_message').split('?')[0]}
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={
                  requestType === 'deletion'
                    ? t('contact.deletion_subject')
                    : requestType === 'data'
                    ? t('contact.data_subject')
                    : t('contact.subject_placeholder')
                }
                className="input-glass"
                required
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-tertiary)' }}>
                {t('contact.form_message')}
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  requestType === 'deletion'
                    ? t('contact.deletion_message')
                    : t('contact.message_placeholder')
                }
                className="input-glass"
                style={{ minHeight: '140px', resize: 'vertical' }}
                required
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitted}
              className="btn-primary-gradient w-full py-4 text-base flex items-center justify-center gap-3"
              style={{
                background: submitted ? 'var(--success)' : undefined,
                boxShadow: submitted ? '0 10px 30px rgba(52, 199, 89, 0.3)' : undefined,
              }}
            >
              {submitted ? (
                <><CheckCircle size={20} /> {t('contact.submit_done')}</>
              ) : (
                <><Send size={18} /> {t('contact.submit_ready')}</>
              )}
            </button>
          </form>
        </MarketingSection>

        {requestType === 'deletion' && (
          <div
            className="mt-8 p-6 rounded-2xl text-sm italic relative overflow-hidden"
            style={{
              background: 'var(--warning-bg)',
              border: '1px solid rgba(255, 149, 0, 0.2)',
              color: 'var(--warning)',
            }}
          >
            <div className="relative z-10">
              <strong>{t('contact.notice_title')}</strong> {t('contact.notice_body')}
            </div>
          </div>
        )}
      </div>
      <BunordenFooter />
    </div>
  )
}
