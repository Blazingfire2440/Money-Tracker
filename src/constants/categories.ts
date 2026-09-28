import type { CreditCardCategory } from '@/types'

export const CATEGORY_COLORS: Partial<Record<CreditCardCategory, string>> = {
  Dining: '#f59e0b',
  Grocery: '#22c55e',
  Merchandise: '#8b5cf6',
  'Gas/Automotive': '#ef4444',
  'Other Travel': '#0ea5e9',
  'Other Services': '#14b8a6',
  Internet: '#6366f1',
  Payment: '#64748b',
  Other: '#64748b',
}
