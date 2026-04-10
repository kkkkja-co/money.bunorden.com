'use client'

import { useState } from 'react'
import { Mail, Send, CheckCircle } from 'lucide-react'
import { MarketingPageShell, MarketingSection } from '../MarketingPageShell'

export default function ContactPage() {
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
    <MarketingPageShell
      title="Contact Support"
      subtitle="Have a question, feedback, or need to make a request? Our team is here to help."
      icon={Mail}
      maxWidthClass="max-w-2xl"
    >
      <MarketingSection title="Reach Out">
        <div className="grid grid-cols-1 gap-6">
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            We typically respond to all inquiries within 24 hours. Whether it's a technical issue, a feature suggestion, or a data request, we're all ears.
          </p>
          <div
            className="rounded-2xl p-6 text-center group transition-all hover:bg-white/[0.04]"
            style={{ background: 'var(--overlay)', border: '1px solid var(--border)' }}
          >
            <span className="text-[10px] font-bold uppercase tracking-widest block mb-2" style={{ color: 'var(--text-tertiary)' }}>
              Direct Support Channel
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

      <MarketingSection title="Service Desk">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Request type */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-tertiary)' }}>
              Inquiry Category
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'general', label: 'General Support', icon: '💬' },
                { id: 'deletion', label: 'Data Deletion', icon: '🗑️' },
                { id: 'data', label: 'Data Export', icon: '📦' },
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
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="input-glass"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-tertiary)' }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                className="input-glass"
                required
              />
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-tertiary)' }}>
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={
                requestType === 'deletion'
                  ? 'Request for Account & Data Deletion'
                  : requestType === 'data'
                  ? 'Request for Personal Data Archive'
                  : 'How can we help?'
              }
              className="input-glass"
              required
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-tertiary)' }}>
              Inquiry Details
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                requestType === 'deletion'
                  ? 'Please confirm the email associated with your account. Note that deletion is irreversible.'
                  : 'Please provide as much detail as possible...'
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
              <><CheckCircle size={20} /> Email Client Opened</>
            ) : (
              <><Send size={18} /> Open Email Client</>
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
            <strong>Security Notice:</strong> You can perform a self-service account deletion immediately from your <a href="/settings" className="font-bold underline hover:opacity-80 transition-opacity">Settings</a> panel. This will permanently purge all your financial records and profile data from our servers.
          </div>
        </div>
      )}
    </MarketingPageShell>
  )
}
