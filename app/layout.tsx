import type { Metadata, Viewport } from 'next'
import { Providers } from './providers'
import './globals.css'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#09090b',
}

export const metadata: Metadata = {
  title: 'Clavi — Privacy-First Finance',
  description: 'Your financial data is yours. Only you hold the key. Privacy-first, open-source personal finance by Bunorden.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Clavi',
  },
  icons: {
    icon: [
      { url: '/assets/clavi-icon-light.svg', media: '(prefers-color-scheme: light)' },
      { url: '/assets/clavi-icon-dark.svg', media: '(prefers-color-scheme: dark)' },
    ],
    apple: '/assets/clavi-icon-dark.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Clavi" />
        <link rel="apple-touch-icon" href="/assets/icon-192.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
