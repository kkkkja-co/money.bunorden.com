'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCcw, ExternalLink, ShieldAlert } from 'lucide-react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service if needed
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#000000]">
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-2xl animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col items-center text-center space-y-8">
          <div className="relative">
             <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-3xl shadow-2xl">
                <AlertTriangle className="text-red-500 w-12 h-12" />
             </div>
             <div className="absolute -top-2 -right-2 px-3 py-1 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                System Error
             </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
              An unexpected error <br/> occurred in the Vault.
            </h1>
            <p className="text-zinc-400 max-w-md mx-auto text-sm leading-relaxed">
              We encountered a server-side exception while processing your request. Your financial data remains secure.
            </p>
          </div>

          {/* Vercel Style Error Info Board */}
          <div className="w-full bg-white/[0.03] border border-white/10 rounded-3xl overflow-hidden backdrop-blur-xl">
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Vault Diagnostics</span>
               </div>
               <span className="text-[9px] font-mono text-zinc-500 uppercase">Region: {process.env.NEXT_PUBLIC_VERCEL_REGION || 'Global'}</span>
            </div>
            
            <div className="p-6 text-left space-y-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Execution Error</label>
                  <div className="p-4 rounded-2xl bg-black/40 border border-white/5 font-mono text-xs text-red-400 leading-relaxed overflow-x-auto">
                    {error.message || 'Unknown application error'}
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Digest Code</label>
                    <p className="font-mono text-[11px] text-zinc-400">{error.digest || 'no_digest_provided'}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Service Status</label>
                    <p className="text-[11px] text-zinc-400 flex items-center gap-1.5 font-bold">
                       <ShieldAlert className="w-3 h-3 text-red-500" />
                       Interrupted
                    </p>
                  </div>
               </div>
            </div>
            
            <div className="px-6 py-4 bg-white/[0.02] border-t border-white/5 flex flex-wrap items-center justify-between gap-4">
               <a 
                href="https://vercel.com/support" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[10px] font-bold text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-widest"
               >
                 Vercel Support <ExternalLink size={10} />
               </a>
               <span className="text-[9px] font-medium text-zinc-600">Runtime: Node.js (Vercel Origin)</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-sm">
            <button
              onClick={reset}
              className="w-full h-14 rounded-2xl bg-white text-black font-bold text-sm flex items-center justify-center gap-2 hover:bg-zinc-200 active:scale-[0.98] transition-all"
            >
              <RefreshCcw size={18} />
              Reload Component
            </button>
            <Link 
              href="/"
              className="w-full h-14 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-sm flex items-center justify-center hover:bg-white/10 transition-all"
            >
              Return Home
            </Link>
          </div>

          <p className="text-[10px] text-zinc-600 font-medium">
            If this issue persists, please contact our system administrator via Bunorden Support.
          </p>
        </div>
      </div>
    </div>
  )
}
