import type { Metadata } from 'next'
import { Providers } from './providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'Ledger — Privacy-First Personal Finance',
  description: 'Your financial data is yours. No ads, no tracking, no data selling.',
  viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Ledger',
  },
  icons: {
    apple: '/assets/icon-192.png',
  },
  themeColor: '#007AFF',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#007AFF" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Ledger" />
        <link rel="apple-touch-icon" href="/assets/icon-192.png" />
        <meta name="description" content="Your financial data is yours. No ads, no tracking, no data selling." />
      </head>
      <body className="bg-white dark:bg-black text-[#1C1C1E] dark:text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
