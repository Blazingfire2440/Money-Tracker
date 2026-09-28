import { createId } from '@/utils/id'
import type { DiningTransaction } from '@/types'
import type { DiningField } from './columnDetection'
import { parseCurrencyAmount } from './currencyParser'

export interface ImportOptions {
  mapping: Partial<Record<DiningField, string>>
  fixedAccount?: string
}

export interface ImportRowResult {
  transaction: DiningTransaction | null
  error: string | null
  isDuplicate: boolean
}

function tryParseDate(raw: string): string | null {
  const trimmed = raw.trim()
  const isoMatch = trimmed.match(
    /^(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T](\d{1,2}):(\d{2})(?::\d{2})?(?:\s*(AM|PM))?)?/i,
  )
  if (isoMatch) {
    const [, year, month, day, rawHour = '00', minute = '00', meridiem] = isoMatch
    let hour = Number(rawHour)
    if (meridiem) {
      if (hour < 1 || hour > 12) return null
      hour = (hour % 12) + (meridiem.toUpperCase() === 'PM' ? 12 : 0)
    }
    return formatDateTime(Number(year), Number(month), Number(day), hour, Number(minute))
  }

  const usMatch = trimmed.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4}|\d{2})(?:[ T](\d{1,2}):(\d{2})(?::\d{2})?(?:\s*(AM|PM))?)?/i,
  )
  if (usMatch) {
    const [, month, day, rawYear, rawHour = '00', minute = '00', meridiem] = usMatch
    const year = rawYear.length === 2 ? 2000 + Number(rawYear) : Number(rawYear)
    let hour = Number(rawHour)

    if (meridiem) {
      if (hour < 1 || hour > 12) return null
      hour = (hour % 12) + (meridiem.toUpperCase() === 'PM' ? 12 : 0)
    }

    return formatDateTime(year, Number(month), Number(day), hour, Number(minute))
  }

  return null
}

function formatDateTime(year: number, month: number, day: number, hour: number, minute: number) {
  const date = new Date(year, month - 1, day)
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return null
  }

  const pad = (value: number) => String(value).padStart(2, '0')
  return `${year}-${pad(month)}-${pad(day)} ${pad(hour)}:${pad(minute)}`
}

export function parseDiningPasteRows(text: string): Record<string, string>[] {
  return text
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)
    .map((line) => {
      const [account = '', date = '', location = '', amount = ''] = line.split('\t')
      return { account, date, location, amount }
    })
}

export function applyImportMapping(
  rows: Record<string, string>[],
  options: ImportOptions,
  existing: DiningTransaction[],
): ImportRowResult[] {
  const { mapping, fixedAccount } = options

  return rows.map((row) => {
    const rawDate = mapping.date ? row[mapping.date] : undefined
    const rawLocation = mapping.location ? row[mapping.location] : undefined
    const rawAmount = mapping.amount ? row[mapping.amount] : undefined
    const rawAccount = mapping.account ? row[mapping.account] : undefined
    const rawNotes = mapping.notes ? row[mapping.notes] : undefined

    const date = rawDate ? tryParseDate(rawDate) : null
    const parsedAmount = rawAmount ? parseCurrencyAmount(rawAmount) : null
    const amount = parsedAmount === null ? NaN : Math.abs(parsedAmount)

    if (!date || !rawLocation?.trim() || !Number.isFinite(amount)) {
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
