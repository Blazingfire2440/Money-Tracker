import { createId } from '@/utils/id'
import type { CreditCardTransaction } from '@/types'
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

export function parseCreditCardPaste(
  text: string,
  existing: CreditCardTransaction[],
  year = new Date().getFullYear(),
): CreditCardImportRowResult[] {
  return text
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)
    .map((line) => {
      const match = line.trim().match(
        /^([A-Za-z]{3,9})\s+(\d{1,2})\s+([A-Za-z]{3,9})\s+(\d{1,2})\s+(.+?)\s+(-?\s*\$?\s*[\d,]+(?:\.\d{1,2})?)$/,
      )

      if (!match) {
        return {
          transaction: null,
          error: 'Could not parse dates, merchant, or amount for this row',
          isDuplicate: false,
        }
      }

      const [, firstMonth, firstDay, secondMonth, secondDay, rawLocation, rawAmount] = match
      const date = parseMonthDay(firstMonth, firstDay, year)
      const secondDate = parseMonthDay(secondMonth, secondDay, year)
      const amount = parseCurrencyAmount(rawAmount)
      const location = rawLocation.trim()

      if (!date || !secondDate || !location || amount === null) {
        return {
          transaction: null,
          error: 'Could not parse dates, merchant, or amount for this row',
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
          category: 'Dining',
          amount,
          reason: '',
          isReimbursable: false,
          paymentMethod: 'Credit Card',
        },
        error: null,
        isDuplicate,
      }
    })
}
