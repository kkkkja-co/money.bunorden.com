export function formatCurrency(amount: number, currency: string = 'HKD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d)
}

export function formatMonth(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
  }).format(d)
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function groupByMonth(
  transactions: Array<{ date: string; amount: number }>,
): Record<string, number> {
  const grouped: Record<string, number> = {}
  transactions.forEach(({ date, amount }) => {
    const month = date.slice(0, 7) // YYYY-MM
    grouped[month] = (grouped[month] || 0) + amount
  })
  return grouped
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function parseSafeAmount(value: any): number {
  if (value === null || value === undefined) return 0
  if (typeof value === 'number') return value
  
  // Convert to string and clean up
  const str = value.toString()
  // Remove anything that isn't a digit, dot, or minus sign
  const cleaned = str.replace(/[^0-9.-]/g, '')
  const num = parseFloat(cleaned)
  
  return isNaN(num) ? 0 : num
}
