export interface DiningTransaction {
  id: string
  date: string // YYYY-MM-DD HH:mm
  location: string
  amount: number
  account: string
  notes?: string
}
