import type { AppSettings, CreditCardTransaction, DiningTransaction } from '@/types'
import { SCHEMA_VERSION } from '@/data/defaults'

export interface BackupPayload {
  version: number
  exportedAt: string
  settings: AppSettings
  diningTransactions: DiningTransaction[]
  creditCardTransactions: CreditCardTransaction[]
}

export function buildBackupPayload(
  settings: AppSettings,
  diningTransactions: DiningTransaction[],
  creditCardTransactions: CreditCardTransaction[],
): BackupPayload {
  return {
    version: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    settings,
    diningTransactions,
    creditCardTransactions,
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
