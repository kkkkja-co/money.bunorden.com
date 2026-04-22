'use client'

import { BottomNav } from '@/components/layout/BottomNav'
import { Sidebar } from '@/components/layout/Sidebar'
import { ProductTour } from '@/components/ui/ProductTour'
import { NewFeaturePopup } from '@/components/ui/NewFeaturePopup'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <ProductTour />
      <NewFeaturePopup />
      <Sidebar />
      <main className="lg:ml-64 min-h-screen pb-24 lg:pb-0">
        {children}
      </main>
      <BottomNav />
    </>
  )
}
