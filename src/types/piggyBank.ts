export interface Denomination {
  key: string
  label: string
  cents: number
  kind: 'bill' | 'coin'
}

export const DENOMINATIONS: Denomination[] = [
  { key: 'b100', label: '$100 bill', cents: 10000, kind: 'bill' },
  { key: 'b50', label: '$50 bill', cents: 5000, kind: 'bill' },
  { key: 'b20', label: '$20 bill', cents: 2000, kind: 'bill' },
  { key: 'b10', label: '$10 bill', cents: 1000, kind: 'bill' },
  { key: 'b5', label: '$5 bill', cents: 500, kind: 'bill' },
  { key: 'b2', label: '$2 bill', cents: 200, kind: 'bill' },
  { key: 'b1', label: '$1 bill', cents: 100, kind: 'bill' },
  { key: 'c100', label: 'Dollar coin', cents: 100, kind: 'coin' },
  { key: 'c50', label: 'Half dollar (50¢)', cents: 50, kind: 'coin' },
  { key: 'c25', label: 'Quarter (25¢)', cents: 25, kind: 'coin' },
  { key: 'c10', label: 'Dime (10¢)', cents: 10, kind: 'coin' },
  { key: 'c5', label: 'Nickel (5¢)', cents: 5, kind: 'coin' },
  { key: 'c1', label: 'Penny (1¢)', cents: 1, kind: 'coin' },
]

export type PiggyCounts = Record<string, number>

export interface PiggyBankEntry {
  id: string
  date: string // ISO timestamp
  type: 'deposit' | 'withdrawal'
  note: string
  items: PiggyCounts // denomination key -> count moved
}

export interface PiggyBankState {
  counts: PiggyCounts
  history: PiggyBankEntry[]
}
