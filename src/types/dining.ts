export const DINING_BALANCE_ACCOUNT = 'First Year Limited PCV'

export interface DiningTransaction {
  id: string
  date: string // YYYY-MM-DD HH:mm
  location: string
  /** Positive for spending, negative for refunds. */
  amount: number
  account: string
  notes?: string
}
