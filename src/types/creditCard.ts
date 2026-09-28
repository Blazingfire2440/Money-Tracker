export type CreditCardCategory = string

export const CREDIT_CARD_CATEGORIES = [
  'Dining',
  'Grocery',
  'Merchandise',
  'Gas/Automotive',
  'Other Travel',
  'Other Services',
  'Internet',
  'Payment',
  'Other',
] as const

export function getCreditCardCategories(
  additionalCategories: CreditCardCategory[] = [],
): CreditCardCategory[] {
  return [...new Set([...CREDIT_CARD_CATEGORIES, ...additionalCategories])]
}

export interface CreditCardTransaction {
  id: string
  date: string // YYYY-MM-DD
  location: string
  category: CreditCardCategory
  amount: number
  reason: string
  isReimbursable: boolean
  paymentMethod: string
  isSettled?: boolean
  settledDate?: string
}
