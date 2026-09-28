export type CreditCardCategory =
  | 'Dining'
  | 'Grocery'
  | 'Merchandise'
  | 'Gas/Automotive'
  | 'Other Travel'
  | 'Other'

export const CREDIT_CARD_CATEGORIES: CreditCardCategory[] = [
  'Dining',
  'Grocery',
  'Merchandise',
  'Gas/Automotive',
  'Other Travel',
  'Other',
]

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
