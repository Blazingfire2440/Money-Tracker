import { useMemo, useState } from 'react'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { Checkbox } from '@/components/common/Checkbox'
import { Select } from '@/components/common/Select'
import { useCreditCardStore } from '@/store/useCreditCardStore'
import { useDebitCardStore } from '@/store/useDebitCardStore'
import { useDiningStore } from '@/store/useDiningStore'
import { applyImportMapping, parseDiningPasteRows } from '@/utils/csv/diningImport'
import { parseCreditCardPaste } from '@/utils/csv/creditCardImport'
import { parseDebitCardPaste } from '@/utils/csv/debitCardImport'
import { formatCurrency } from '@/utils/formatters'

type PasteKind = 'dining' | 'credit-card' | 'debit-card'

const DINING_PASTE_MAPPING = {
  account: 'account',
  date: 'date',
  location: 'location',
  amount: 'amount',
}

function getTransactionDescription(transaction: {
  description?: string
  location?: string
}): string {
  return transaction.description ?? transaction.location ?? ''
}

export function PastedTransactionImport() {
  const diningTransactions = useDiningStore((state) => state.transactions)
  const bulkAddDining = useDiningStore((state) => state.bulkAdd)
  const creditCardTransactions = useCreditCardStore((state) => state.transactions)
  const bulkAddCreditCard = useCreditCardStore((state) => state.bulkAdd)
  const debitCardTransactions = useDebitCardStore((state) => state.transactions)
  const bulkAddDebitCard = useDebitCardStore((state) => state.bulkAdd)

  const [kind, setKind] = useState<PasteKind>('dining')
  const [text, setText] = useState('')
  const [previewKind, setPreviewKind] = useState<PasteKind | null>(null)
  const [diningRows, setDiningRows] = useState<Record<string, string>[]>([])
  const [skipDuplicates, setSkipDuplicates] = useState(true)
  const [openingBalance, setOpeningBalance] = useState('')
  const [error, setError] = useState<string | null>(null)

  const diningResults = useMemo(
    () =>
      previewKind === 'dining'
        ? applyImportMapping(diningRows, { mapping: DINING_PASTE_MAPPING }, diningTransactions)
        : [],
    [previewKind, diningRows, diningTransactions],
  )

  const creditCardResults = useMemo(
    () =>
      previewKind === 'credit-card' ? parseCreditCardPaste(text, creditCardTransactions) : [],
    [previewKind, text, creditCardTransactions],
  )

  const debitOpeningBalance =
    openingBalance.trim() === '' ? null : Number(openingBalance.replace(/[$,]/g, ''))
  const debitCardResults = useMemo(
    () =>
      previewKind === 'debit-card' &&
      (debitOpeningBalance === null || Number.isFinite(debitOpeningBalance))
        ? parseDebitCardPaste(
            text,
            debitCardTransactions,
            new Date().getFullYear(),
            debitOpeningBalance,
          )
        : [],
    [previewKind, text, debitCardTransactions, debitOpeningBalance],
  )

  const results =
    previewKind === 'credit-card'
      ? creditCardResults
      : previewKind === 'debit-card'
        ? debitCardResults
        : diningResults
  const validResults = results.filter(
    (result) => result.transaction && !(skipDuplicates && result.isDuplicate),
  )
  const duplicateCount = results.filter((result) => result.isDuplicate).length
  const errorCount = results.filter((result) => result.error).length

  function resetPreview() {
    setPreviewKind(null)
    setError(null)
  }

  function handlePreview() {
    setError(null)
    if (
      kind === 'debit-card' &&
      debitOpeningBalance !== null &&
      (!Number.isFinite(debitOpeningBalance) || debitOpeningBalance < 0)
    ) {
      setError('Opening balance must be a non-negative amount.')
      return
    }
    if (kind === 'dining') setDiningRows(parseDiningPasteRows(text))
    setPreviewKind(kind)
  }

  async function handleConfirm() {
    try {
      if (previewKind === 'credit-card') {
        const transactions = creditCardResults.flatMap((result) =>
          result.transaction && !(skipDuplicates && result.isDuplicate)
            ? [result.transaction]
            : [],
        )
        await bulkAddCreditCard(transactions)
      } else if (previewKind === 'debit-card') {
        const transactions = debitCardResults.flatMap((result) =>
          result.transaction && !(skipDuplicates && result.isDuplicate)
            ? [result.transaction]
            : [],
        )
        await bulkAddDebitCard(transactions)
      } else if (previewKind === 'dining') {
        const transactions = diningResults.flatMap((result) =>
          result.transaction && !(skipDuplicates && result.isDuplicate)
            ? [result.transaction]
            : [],
        )
        await bulkAddDining(transactions)
      }
      setText('')
      setDiningRows([])
      setOpeningBalance('')
      resetPreview()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to import transactions')
    }
  }

  return (
    <Card>
      <h3 className="mb-2 text-sm font-semibold text-slate-700">Paste Transactions</h3>
      <p className="mb-3 text-xs text-slate-500">
        Paste copied rows from Dining Dollars, a credit-card statement, or a debit-card statement.
        Debit deposits and withdrawals are classified using the ending balance change.
      </p>

      <div className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm text-slate-600">
          Format
          <Select
            value={kind}
            onChange={(event) => {
              setKind(event.target.value as PasteKind)
              resetPreview()
            }}
            disabled={previewKind !== null}
          >
            <option value="dining">Dining Dollars (tab-delimited)</option>
            <option value="credit-card">Credit card statement</option>
            <option value="debit-card">Debit card statement</option>
          </Select>
        </label>

        <label className="flex flex-col gap-1 text-sm text-slate-600">
          Pasted rows
          <textarea
            className="min-h-32 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            value={text}
            onChange={(event) => {
              setText(event.target.value)
              resetPreview()
            }}
            placeholder={
              kind === 'dining'
                ? 'Account\\tDate and time\\tLocation\\tAmount'
                : kind === 'credit-card'
                  ? 'Sep 24\\nAmtrak\\nOther Travel\\nTanner V. ...8483\\n$63.75'
                  : '8/18 Purchase authorized on 08/17 Merchant City\\n4.00 450.52'
            }
            aria-label="Pasted transaction rows"
          />
        </label>

        {kind === 'debit-card' && (
          <label className="flex max-w-xs flex-col gap-1 text-sm text-slate-600">
            Opening balance (optional if included in pasted rows)
            <input
              type="number"
              min="0"
              step="0.01"
              value={openingBalance}
              onChange={(event) => {
                setOpeningBalance(event.target.value)
                resetPreview()
              }}
              disabled={previewKind !== null}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            />
          </label>
        )}

        {previewKind === null ? (
          <Button onClick={handlePreview} disabled={!text.trim()}>
            Preview Paste
          </Button>
        ) : (
          <>
            <Checkbox
              label="Skip likely duplicates"
              checked={skipDuplicates}
              onChange={(event) => setSkipDuplicates(event.target.checked)}
            />

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
              <div className="mb-2 flex flex-wrap gap-2">
                <Badge tone="good">{validResults.length} rows ready</Badge>
                {duplicateCount > 0 && <Badge tone="warn">{duplicateCount} duplicates</Badge>}
                {errorCount > 0 && <Badge tone="bad">{errorCount} unparseable</Badge>}
              </div>
              <div className="max-h-40 overflow-y-auto text-xs text-slate-600">
                {results.slice(0, 5).map((result, index) => (
                  <div key={index} className="border-t border-slate-200 py-1 first:border-t-0">
                    {result.transaction
                      ? `${result.transaction.date} — ${getTransactionDescription(result.transaction)} — ${formatCurrency(result.transaction.amount)}${result.isDuplicate ? ' — duplicate' : ''}`
                      : `Row ${index + 1}: ${result.error}`}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => void handleConfirm()} disabled={validResults.length === 0}>
                Import {validResults.length} Transactions
              </Button>
              <Button variant="secondary" onClick={resetPreview}>
                Edit Paste
              </Button>
            </div>
          </>
        )}

        {error && <p className="text-sm text-bad-600">{error}</p>}
      </div>
    </Card>
  )
}
