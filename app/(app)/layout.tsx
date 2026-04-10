'use client'

import { BottomNav } from '@/components/layout/BottomNav'
import { Sidebar } from '@/components/layout/Sidebar'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Sidebar />
      <main className="lg:ml-64 min-h-screen pb-24 lg:pb-0">
        {children}
      </main>
      <BottomNav />
    </>
  )
}
