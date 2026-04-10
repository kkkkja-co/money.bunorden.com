import { BunordenFooter } from '@/components/layout/BunordenFooter'

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-white dark:bg-black flex flex-col">
      {children}
      <div className="flex-1" />
      <BunordenFooter />
    </div>
  )
}
