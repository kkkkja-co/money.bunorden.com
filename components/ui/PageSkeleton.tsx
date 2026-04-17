'use client'

import { useTheme } from '@/app/providers'

export function PageSkeleton() {
  return (
    <div className="flex-1 max-w-4xl mx-auto w-full px-5 py-8 md:py-12 animate-fade-in">
      {/* Header shimmer */}
      <div className="mb-10">
        <div className="skeleton h-3 w-32 mb-3" />
        <div className="skeleton h-8 w-48" />
      </div>

      {/* Balance card shimmer */}
      <div className="text-center mb-10">
        <div className="skeleton h-3 w-40 mx-auto mb-4" />
        <div className="skeleton h-12 w-56 mx-auto mb-8 rounded-2xl" />
        <div className="skeleton h-12 w-48 mx-auto rounded-2xl" />
      </div>

      {/* Stats grid shimmer */}
      <div className="surface-elevated overflow-hidden mb-10">
        <div className="grid grid-cols-2 divide-x divide-[var(--border)]">
          <div className="px-6 py-5 flex flex-col items-center gap-2">
            <div className="skeleton h-2.5 w-16" />
            <div className="skeleton h-5 w-24" />
          </div>
          <div className="px-6 py-5 flex flex-col items-center gap-2">
            <div className="skeleton h-2.5 w-16" />
            <div className="skeleton h-5 w-24" />
          </div>
        </div>
        <div className="border-t border-[var(--border)] px-6 py-6">
          <div className="skeleton h-2.5 w-28 mb-4" />
          <div className="skeleton h-2 w-full rounded-full mb-3" />
          <div className="flex gap-4">
            <div className="skeleton h-2 w-16" />
            <div className="skeleton h-2 w-16" />
            <div className="skeleton h-2 w-16" />
          </div>
        </div>
      </div>

      {/* Transaction list shimmer */}
      <div className="mb-6">
        <div className="skeleton h-2.5 w-32 mb-4" />
      </div>
      <div className="list-wrapper">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="list-item">
            <div className="skeleton w-10 h-10 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-3.5 w-24" />
              <div className="skeleton h-2 w-16" />
            </div>
            <div className="skeleton h-3.5 w-16" />
          </div>
        ))}
      </div>
    </div>
  )
}
