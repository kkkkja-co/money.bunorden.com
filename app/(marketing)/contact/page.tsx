'use client'

import { useState } from 'react'
import { Mail, Send, CheckCircle } from 'lucide-react'

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
    <div className="max-w-2xl mx-auto px-4 py-12 lg:py-20">
      <div className="glass-card p-8 lg:p-12 animate-fade-up" style={{ animationDelay: '0.1s' }}>
        <h1
          className="text-3xl lg:text-4xl font-bold text-center mb-2 tracking-tight"
          style={{
            background: 'linear-gradient(to right, var(--text-primary), var(--text-tertiary))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Contact Support
        </h1>
        <p className="text-center text-sm mb-8" style={{ color: 'var(--text-tertiary)' }}>
          Have a question, feedback, or need to make a request?
        </p>

        {/* Direct email */}
        <div
          className="rounded-xl p-4 text-center mb-8"
          style={{ background: 'var(--overlay)', border: '1px solid var(--border)' }}
        >
          <span className="text-xs block mb-1" style={{ color: 'var(--text-tertiary)' }}>
            Direct Email Address:
          </span>
          <a
            href="mailto:contact@bunorden.com"
            className="text-lg font-semibold"
            style={{ color: 'var(--accent-primary)' }}
          >
            contact@bunorden.com
          </a>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Request type */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Request Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'general', label: 'General', icon: '💬' },
                { id: 'deletion', label: 'Delete Data', icon: '🗑️' },
                { id: 'data', label: 'Data Request', icon: '📦' },
              ].map((rt) => (
                <button
                  key={rt.id}
                  type="button"
                  onClick={() => setRequestType(rt.id)}
                  className="flex flex-col items-center gap-1 p-3 rounded-xl text-xs font-medium"
                  style={{
                    background: requestType === rt.id ? 'rgba(59,130,246,0.1)' : 'var(--overlay)',
                    border: `1px solid ${requestType === rt.id ? 'var(--accent-primary)' : 'var(--border)'}`,
                    color: requestType === rt.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    transition: 'all 0.2s',
                  }}
                >
                  <span className="text-lg">{rt.icon}</span>
                  {rt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Your Name
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
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
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

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={
                requestType === 'deletion'
                  ? 'Request to delete my account and data'
                  : requestType === 'data'
                  ? 'Request copy of my data'
                  : 'What is this regarding?'
              }
              className="input-glass"
              required
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                requestType === 'deletion'
                  ? 'Please include the email address associated with your account...'
                  : 'Describe your inquiry...'
              }
              className="input-glass"
              style={{ minHeight: '120px', resize: 'vertical' }}
              required
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitted}
            className="w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 text-white"
            style={{
              background: submitted
                ? 'var(--success)'
                : 'linear-gradient(135deg, var(--accent-primary), #60a5fa)',
              boxShadow: submitted
                ? '0 10px 20px rgba(52, 199, 89, 0.3)'
                : '0 10px 20px rgba(59, 130, 246, 0.3)',
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {submitted ? (
              <><CheckCircle size={20} /> Email Client Opened!</>
            ) : (
              <><Send size={18} /> Send Message</>
            )}
          </button>
        </form>

        {/* Note for deletion requests */}
        {requestType === 'deletion' && (
          <div
            className="mt-6 p-4 rounded-xl text-sm"
            style={{
              background: 'var(--warning-bg)',
              border: '1px solid rgba(255, 149, 0, 0.2)',
              color: 'var(--warning)',
            }}
          >
            <strong>Note:</strong> You can also delete your account directly from{' '}
            <a href="/settings" style={{ textDecoration: 'underline' }}>Settings</a>.
            Account deletion is immediate and irreversible.
          </div>
        )}
      </div>
    </div>
  )
}
