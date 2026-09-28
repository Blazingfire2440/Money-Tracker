import { createId } from '@/utils/id'
import type { CreditCardCategory, CreditCardTransaction } from '@/types'
import { parseCurrencyAmount } from './currencyParser'

export interface CreditCardImportRowResult {
  transaction: CreditCardTransaction | null
  error: string | null
  isDuplicate: boolean
}

const MONTHS: Record<string, number> = {
  jan: 1,
  feb: 2,
  mar: 3,
  apr: 4,
  may: 5,
  jun: 6,
  jul: 7,
  aug: 8,
  sep: 9,
  oct: 10,
  nov: 11,
  dec: 12,
}

function parseMonthDay(monthText: string, dayText: string, year: number): string | null {
  const month = MONTHS[monthText.slice(0, 3).toLowerCase()]
  const day = Number(dayText)
  if (!month || !Number.isInteger(day)) return null

  const date = new Date(year, month - 1, day)
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null
  }

  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function makeResult(
  date: string | null,
  location: string,
  rawAmount: string,
  existing: CreditCardTransaction[],
  category: CreditCardCategory = 'Dining',
  paymentMethod = 'Credit Card',
): CreditCardImportRowResult {
  const amount = parseCurrencyAmount(rawAmount)

  if (!date || !location || amount === null) {
    return {
      transaction: null,
      error: 'Could not parse date, merchant, or amount for this row',
      isDuplicate: false,
    }
  }

  const isDuplicate = existing.some(
    (transaction) =>
      transaction.date === date &&
      transaction.location === location &&
      transaction.amount === amount,
  )

  return {
    transaction: {
      id: createId(),
      date,
      location,
      category,
      amount,
      reason: '',
      reimbursementStatus: 'Not reimbursable',
      paymentMethod,
    },
    error: null,
    isDuplicate,
  }
}

export function parseCreditCardPaste(
  text: string,
  existing: CreditCardTransaction[],
  year = new Date().getFullYear(),
): CreditCardImportRowResult[] {
  const lines = text
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)
    .map((line) => line.trim())

  if (lines.some((line) => /^[A-Za-z]{3,9}\s+\d{1,2}$/.test(line))) {
    const results: CreditCardImportRowResult[] = []

    for (let index = 0; index < lines.length; index += 5) {
      const [rawDate = '', rawLocation = '', rawCategory = '', rawPaymentMethod = '', rawAmount = ''] =
        lines.slice(index, index + 5)
      const dateMatch = rawDate.match(/^([A-Za-z]{3,9})\s+(\d{1,2})$/)
      const category = rawCategory || null

      if (!dateMatch || !category || index + 5 > lines.length) {
        results.push({
          transaction: null,
          error: 'Could not parse dates, merchant, or amount for this row',
          isDuplicate: false,
        })
        continue
      }

      results.push(
        makeResult(
          parseMonthDay(dateMatch[1], dateMatch[2], year),
          rawLocation,
          rawAmount,
          existing,
          category,
          rawPaymentMethod,
        ),
      )
    }
    return results
  }

  return lines.map((line) => {
    const match = line.match(
      /^([A-Za-z]{3,9})\s+(\d{1,2})\s+([A-Za-z]{3,9})\s+(\d{1,2})\s+(.+?)\s+(-?\s*\$?\s*[\d,]+(?:\.\d{1,2})?)$/,
    )

    if (!match) {
      return {
        transaction: null,
        error: 'Could not parse dates, merchant, or amount for this row',
        isDuplicate: false,
      }
    }

    const [, firstMonth, firstDay, , , rawLocation, rawAmount] = match
    return makeResult(parseMonthDay(firstMonth, firstDay, year), rawLocation.trim(), rawAmount, existing)
  })
}
