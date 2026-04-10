'use client'

import Image from 'next/image'
import Link from 'next/link'

export function BunordenFooter() {
  return (
    <footer className="w-full flex items-center justify-center gap-2 py-4 text-xs text-[#636366] dark:text-[#8E8E93]">
      <span>Powered by</span>
      <Link
        href="https://bunorden.com"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 hover:opacity-70 transition-opacity"
      >
        <Image
          src="/assets/bunorden-logo.png"
          alt="Bunorden"
          width={20}
          height={20}
          className="rounded-sm"
          onError={(e) => {
            // Fallback to SVG if PNG not found
            const img = e.target as HTMLImageElement
            img.src = '/assets/bunorden-logo.svg'
          }}
          priority
        />
        <span className="font-medium text-[#1C1C1E] dark:text-white">Bunorden</span>
      </Link>
    </footer>
  )
}
