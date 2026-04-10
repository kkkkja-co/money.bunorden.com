'use client'

import { BunordenFooter } from '@/components/layout/BunordenFooter'

export default function ReportsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black flex flex-col pb-20 md:pb-0">
      <div className="flex-1 px-4 py-8 max-w-2xl mx-auto w-full">
        <h1 className="text-3xl font-bold text-[#1C1C1E] dark:text-white mb-8">
          Reports
        </h1>

        <div className="card text-center py-12">
          <p className="text-[#636366] dark:text-[#8E8E93]">
            Reports will appear here once you add transactions
          </p>
        </div>
      </div>

      <div className="mt-auto">
        <BunordenFooter />
      </div>
    </div>
  )
}
