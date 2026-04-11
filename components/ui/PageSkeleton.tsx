'use client'

export function PageSkeleton() {
  return (
    <div className="flex-1 px-4 lg:px-8 py-6 lg:py-8 max-w-3xl mx-auto w-full animate-pulse">
      <header className="mb-8">
        <div className="skeleton h-10 w-48 mb-3" style={{ borderRadius: '12px' }} />
        <div className="skeleton h-5 w-32" style={{ borderRadius: '8px' }} />
      </header>

      <div className="space-y-6">
        {/* Large card skeleton */}
        <div className="skeleton h-40 w-full" style={{ borderRadius: '24px' }} />
        
        {/* Grid of smaller cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="skeleton h-32 w-full" style={{ borderRadius: '20px' }} />
          <div className="skeleton h-32 w-full" style={{ borderRadius: '20px' }} />
        </div>

        {/* Medium card skeleton */}
        <div className="skeleton h-48 w-full" style={{ borderRadius: '24px' }} />

        {/* List items skeleton */}
        <div className="space-y-3">
          <div className="skeleton h-8 w-40 mb-4" style={{ borderRadius: '8px' }} />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="skeleton h-16 w-full" style={{ borderRadius: '16px' }} />
          ))}
        </div>
      </div>
    </div>
  )
}
