import { createId } from '@/utils/id'
import type { DiningTransaction } from '@/types'
import type { DiningField } from './columnDetection'

export interface ImportOptions {
  mapping: Partial<Record<DiningField, string>>
  fixedAccount?: string
  invertAmount?: boolean
}

export interface ImportRowResult {
  transaction: DiningTransaction | null
  error: string | null
  isDuplicate: boolean
}

const DATE_PATTERNS: RegExp[] = [
  /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?/, // YYYY-MM-DD[ HH:mm]
  /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[ T](\d{1,2}):(\d{2}))?/, // M/D/YYYY[ H:mm]
]

function tryParseDate(raw: string): string | null {
  const trimmed = raw.trim()

  const isoMatch = trimmed.match(DATE_PATTERNS[0])
  if (isoMatch) {
    const [, y, m, d, h, min] = isoMatch
    return `${y}-${m}-${d} ${h ?? '00'}:${min ?? '00'}`
  }

  const usMatch = trimmed.match(DATE_PATTERNS[1])
  if (usMatch) {
    const [, m, d, y, h, min] = usMatch
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')} ${(h ?? '00').padStart(2, '0')}:${min ?? '00'}`
  }

  return null
}

export function applyImportMapping(
  rows: Record<string, string>[],
  options: ImportOptions,
  existing: DiningTransaction[],
): ImportRowResult[] {
  const { mapping, fixedAccount, invertAmount } = options

  return rows.map((row) => {
    const rawDate = mapping.date ? row[mapping.date] : undefined
    const rawLocation = mapping.location ? row[mapping.location] : undefined
    const rawAmount = mapping.amount ? row[mapping.amount] : undefined
    const rawAccount = mapping.account ? row[mapping.account] : undefined
    const rawNotes = mapping.notes ? row[mapping.notes] : undefined

    const date = rawDate ? tryParseDate(rawDate) : null
    let amount = rawAmount ? parseFloat(rawAmount.replace(/[^0-9.-]/g, '')) : NaN
    if (invertAmount && !Number.isNaN(amount)) amount = -amount

    if (!date || !rawLocation?.trim() || Number.isNaN(amount)) {
      return {
        transaction: null,
        error: 'Could not parse date, location, or amount for this row',
        isDuplicate: false,
      }
    }

    const account = (rawAccount?.trim() || fixedAccount || '').trim()

    const isDuplicate = existing.some(
      (t) => t.date === date && t.location === rawLocation.trim() && t.amount === amount,
    )

    return {
      transaction: {
        id: createId(),
        date,
        location: rawLocation.trim(),
        amount,
        account,
        notes: rawNotes?.trim() || undefined,
      },
      error: null,
      isDuplicate,
    }
  })
}
