'use client'

import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string
          callback: (token: string) => void
          'expired-callback': () => void
          'error-callback': () => void
          theme: 'auto' | 'light' | 'dark'
        }
      ) => string
      reset: (widgetId: string) => void
      remove: (widgetId: string) => void
    }
  }
}

type TurnstileWidgetProps = {
  siteKey: string
  onVerify: (token: string) => void
  onExpire: () => void
  resetSignal?: number
}

export function TurnstileWidget({ siteKey, onVerify, onExpire, resetSignal = 0 }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const widgetIdRef = useRef<string | null>(null)
  const onVerifyRef = useRef(onVerify)
  const onExpireRef = useRef(onExpire)

  useEffect(() => {
    onVerifyRef.current = onVerify
    onExpireRef.current = onExpire
  }, [onVerify, onExpire])

  useEffect(() => {
    const renderWidget = () => {
      if (!window.turnstile || !containerRef.current) return
      if (widgetIdRef.current) {
        window.turnstile.remove(widgetIdRef.current)
      }
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: (token) => onVerifyRef.current(token),
        'expired-callback': () => onExpireRef.current(),
        'error-callback': () => onExpireRef.current(),
        theme: 'auto',
      })
    }

    if (window.turnstile) {
      renderWidget()
    } else {
      const existing = document.getElementById('cf-turnstile-script')
      if (existing) {
        existing.addEventListener('load', renderWidget, { once: true })
      } else {
        const script = document.createElement('script')
        script.id = 'cf-turnstile-script'
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
        script.async = true
        script.defer = true
        script.onload = renderWidget
        document.head.appendChild(script)
      }
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current)
        widgetIdRef.current = null
      }
    }
  }, [siteKey])

  useEffect(() => {
    if (resetSignal > 0 && widgetIdRef.current && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current)
    }
  }, [resetSignal])

  return <div ref={containerRef} />
}
