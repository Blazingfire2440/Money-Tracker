import type {
  AppSettings,
  BudgetExpense,
  CreditCardTransaction,
  DebitCardTransaction,
  DiningTransaction,
} from '@/types'
import { SCHEMA_VERSION } from '@/data/defaults'

export interface BackupPayload {
  version: number
  exportedAt: string
  settings: AppSettings
  diningTransactions: DiningTransaction[]
  creditCardTransactions: CreditCardTransaction[]
  debitCardTransactions: DebitCardTransaction[]
  budgetExpenses: BudgetExpense[]
}

export function buildBackupPayload(
  settings: AppSettings,
  diningTransactions: DiningTransaction[],
  creditCardTransactions: CreditCardTransaction[],
  debitCardTransactions: DebitCardTransaction[],
  budgetExpenses: BudgetExpense[],
): BackupPayload {
  return {
    version: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    settings,
    diningTransactions,
    creditCardTransactions,
    debitCardTransactions,
    budgetExpenses,
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
