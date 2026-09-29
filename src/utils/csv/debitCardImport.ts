import { createId } from '@/utils/id'
import type { DebitCardTransaction } from '@/types'
import { parseCurrencyAmount } from './currencyParser'

export interface DebitCardImportRowResult {
  transaction: DebitCardTransaction | null
  error: string | null
  isDuplicate: boolean
}

interface ParsedStatementRow {
  date: string
  checkNumber: string
  description: string
  amount: number
  endingBalance: number
  explicitSign: boolean
}

const MONEY_TOKEN = /(?:\(?-?\$?\s*\d[\d,]*\.\d{2}\)?)/g

function parseDate(value: string, year: number): string | null {
  const match = value.match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?$/)
  if (!match) return null
  const month = Number(match[1])
  const day = Number(match[2])
  const parsedYear = match[3]
    ? Number(match[3]) < 100
      ? 2000 + Number(match[3])
      : Number(match[3])
    : year
  const date = new Date(parsedYear, month - 1, day)
  if (
    !Number.isInteger(month) ||
    month < 1 ||
    month > 12 ||
    date.getFullYear() !== parsedYear ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null
  }
  return `${parsedYear}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function parseMoneyToken(token: string): { amount: number; explicitSign: boolean } | null {
  const cleaned = token.trim()
  const isParenthesized = cleaned.startsWith('(') && cleaned.endsWith(')')
  const hasExplicitSign = /[-+]/.test(cleaned) || isParenthesized
  const amount = parseCurrencyAmount(cleaned.replace(/[()]/g, ''))
  if (amount === null) return null
  return {
    amount: isParenthesized ? -Math.abs(amount) : amount,
    explicitSign: hasExplicitSign,
  }
}

function extractRows(text: string, year: number): {
  rows: ParsedStatementRow[]
  openingBalance: number | null
  errors: string[]
} {
  const lines = text.split(/\r?\n/)
  const rowLines: string[][] = []
  const errors: string[] = []
  let openingBalance: number | null = null

  for (const line of lines) {
    const openingMatch = line.match(/(?:beginning|opening)\s+balance[^\d$(-]*((?:\$?\s*)?[\d,]+\.\d{2})/i)
    if (openingMatch) {
      const parsed = parseCurrencyAmount(openingMatch[1])
      if (parsed !== null) openingBalance = parsed
      continue
    }

    const dateMatch = line.trim().match(/^(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)(?:\s|\t|$)/)
    if (dateMatch) {
      rowLines.push([line])
    } else if (
      rowLines.length > 0 &&
      !/^\s*(?:total|subtotal|ending balance|statement balance|account summary|page\s+\d|date\s+check\s+number)/i.test(
        line,
      )
    ) {
      rowLines[rowLines.length - 1].push(line)
    }
  }

  const rows: ParsedStatementRow[] = []
  let previousMonth: number | null = null
  let inferredYear = year
  for (const row of rowLines) {
    const raw = row.join(' ')
    const dateMatch = raw.match(/^\s*(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)/)
    const month = dateMatch ? Number(dateMatch[1].split('/')[0]) : null
    if (month !== null && previousMonth !== null) {
      if (previousMonth - month > 6) inferredYear += 1
      if (month - previousMonth > 6) inferredYear -= 1
    }
    const rowYear =
      dateMatch && dateMatch[1].split('/').length === 3
        ? year
        : inferredYear
    const date = dateMatch ? parseDate(dateMatch[1], rowYear) : null
    if (month !== null) previousMonth = month
    if (dateMatch && dateMatch[1].split('/').length === 3) {
      inferredYear = Number(date?.slice(0, 4) ?? inferredYear)
    }
    const tokens = [...raw.matchAll(MONEY_TOKEN)]
    if (!date || tokens.length < 2) {
      errors.push(`Could not parse debit transaction row: ${raw.trim()}`)
      continue
    }

    const amountToken = parseMoneyToken(tokens[tokens.length - 2][0])
    const balanceToken = parseMoneyToken(tokens[tokens.length - 1][0])
    if (!amountToken || !balanceToken || balanceToken.amount < 0) {
      errors.push(`Could not parse transaction amount or ending balance: ${raw.trim()}`)
      continue
    }

    const firstLineCells = row[0].split('\t').map((cell) => cell.trim())
    const tabCheckNumber =
      firstLineCells.length > 1 && /^\d+$/.test(firstLineCells[1]) ? firstLineCells[1] : ''
    const plainCheckNumber = raw.match(
      /^\s*\d{1,2}\/\d{1,2}(?:\/\d{2,4})?\s+(\d+)\s+\S/,
    )?.[1]
    const checkNumber = tabCheckNumber || plainCheckNumber || ''
    let descriptionText = raw.replace(/^\s*\d{1,2}\/\d{1,2}(?:\/\d{2,4})?\s*/, '')
    if (checkNumber) {
      descriptionText = descriptionText.replace(new RegExp(`^\\s*${checkNumber}\\b\\s*`), '')
    }
    const description = descriptionText
      .replace(MONEY_TOKEN, '')
      .replace(/\s+/g, ' ')
      .trim()
    rows.push({
      date,
      checkNumber,
      description,
      amount: amountToken.amount,
      endingBalance: balanceToken.amount,
      explicitSign: amountToken.explicitSign,
    })
  }
  return { rows, openingBalance, errors }
}

export function parseDebitCardPaste(
  text: string,
  existing: DebitCardTransaction[],
  year = new Date().getFullYear(),
  providedOpeningBalance: number | null = null,
): DebitCardImportRowResult[] {
  const { rows, openingBalance: statementOpeningBalance, errors } = extractRows(text, year)
  const openingBalance = providedOpeningBalance ?? statementOpeningBalance
  const results: DebitCardImportRowResult[] = errors.map((error) => ({
    transaction: null,
    error,
    isDuplicate: false,
  }))
  let previousBalance = openingBalance

  for (const row of rows) {
    let amount: number
    if (previousBalance === null) {
      if (!row.explicitSign) {
        results.push({
          transaction: null,
          error: `Opening balance is required to determine the direction of the first transaction on ${row.date}`,
          isDuplicate: false,
        })
        previousBalance = row.endingBalance
        continue
      }
      amount = row.amount
    } else {
      const balanceChange = Number((row.endingBalance - previousBalance).toFixed(2))
      if (Math.abs(balanceChange) !== Math.abs(row.amount)) {
        results.push({
          transaction: null,
          error: `Transaction amount does not match the balance change on ${row.date}`,
          isDuplicate: false,
        })
        previousBalance = row.endingBalance
        continue
      }
      amount = balanceChange
    }
    previousBalance = row.endingBalance

    const isDuplicate = existing.some(
      (transaction) =>
        transaction.date === row.date &&
        transaction.description === row.description &&
        transaction.amount === amount &&
        transaction.endingBalance === row.endingBalance,
    )
    results.push({
      transaction: {
        id: createId(),
        date: row.date,
        checkNumber: row.checkNumber,
        description: row.description,
        amount,
        endingBalance: row.endingBalance,
        reason: '',
        reimbursementStatus: 'Not reimbursable',
      },
      error: null,
      isDuplicate,
    })
  }
  return results
}
