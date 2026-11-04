import type {
  AppSettings,
  BudgetExpense,
  CreditCardTransaction,
  DebitCardTransaction,
  DiningTransaction,
} from '@/types'
import type { GiftCard } from '@/types/giftCard'
import type { PiggyBankState } from '@/types/piggyBank'
import { SCHEMA_VERSION } from '@/data/defaults'

export interface BackupPayload {
  version: number
  exportedAt: string
  settings: AppSettings
  diningTransactions: DiningTransaction[]
  creditCardTransactions: CreditCardTransaction[]
  debitCardTransactions: DebitCardTransaction[]
  budgetExpenses: BudgetExpense[]
  piggyBank?: PiggyBankState
  giftCards?: GiftCard[]
}

export function buildBackupPayload(
  settings: AppSettings,
  diningTransactions: DiningTransaction[],
  creditCardTransactions: CreditCardTransaction[],
  debitCardTransactions: DebitCardTransaction[],
  budgetExpenses: BudgetExpense[],
  piggyBank: PiggyBankState,
  giftCards: GiftCard[],
): BackupPayload {
  return {
    version: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    settings,
    diningTransactions,
    creditCardTransactions,
    debitCardTransactions,
    budgetExpenses,
    piggyBank,
    giftCards,
  }
}

export function parseBackupPayload(text: string): BackupPayload {
  const data = JSON.parse(text)
  if (
    typeof data !== 'object' ||
    data === null ||
    !data.settings ||
    !Array.isArray(data.diningTransactions) ||
    !Array.isArray(data.creditCardTransactions)
  ) {
    throw new Error('Invalid backup file format')
  }
  if (data.debitCardTransactions !== undefined && !Array.isArray(data.debitCardTransactions)) {
    throw new Error('Invalid backup file format')
  }
  if (data.debitCardTransactions === undefined) data.debitCardTransactions = []
  if (data.budgetExpenses !== undefined && !Array.isArray(data.budgetExpenses)) {
    throw new Error('Invalid backup file format')
  }
  if (data.budgetExpenses === undefined) data.budgetExpenses = []
  if (
    data.piggyBank !== undefined &&
    (typeof data.piggyBank !== 'object' ||
      data.piggyBank === null ||
      typeof data.piggyBank.counts !== 'object' ||
      data.piggyBank.counts === null ||
      !Array.isArray(data.piggyBank.history))
  ) {
    throw new Error('Invalid backup file format')
  }
  if (data.giftCards !== undefined && !Array.isArray(data.giftCards)) {
    throw new Error('Invalid backup file format')
  }
  return data as BackupPayload
}

export function downloadFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
