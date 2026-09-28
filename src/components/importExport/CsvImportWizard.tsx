import { useMemo, useState } from 'react'
import { Upload } from 'lucide-react'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Select } from '@/components/common/Select'
import { Checkbox } from '@/components/common/Checkbox'
import { Badge } from '@/components/common/Badge'
import { useDiningStore } from '@/store/useDiningStore'
import { parseCsv, type ParsedCsv } from '@/utils/csv/csvParser'
import { detectColumnMapping, type DiningField } from '@/utils/csv/columnDetection'
import { applyImportMapping, type ImportOptions } from '@/utils/csv/diningImport'
import { formatCurrency } from '@/utils/formatters'

const FIELDS: { key: DiningField; label: string; required: boolean }[] = [
  { key: 'date', label: 'Date', required: true },
  { key: 'location', label: 'Location', required: true },
  { key: 'amount', label: 'Amount', required: true },
  { key: 'account', label: 'Account', required: false },
  { key: 'notes', label: 'Notes', required: false },
]

type Step = 'upload' | 'map' | 'confirm'

export function CsvImportWizard() {
  const transactions = useDiningStore((s) => s.transactions)
  const bulkAdd = useDiningStore((s) => s.bulkAdd)

  const [step, setStep] = useState<Step>('upload')
  const [parsed, setParsed] = useState<ParsedCsv | null>(null)
  const [mapping, setMapping] = useState<Partial<Record<DiningField, string>>>({})
  const [fixedAccount, setFixedAccount] = useState('')
  const [skipDuplicates, setSkipDuplicates] = useState(true)

  async function handleFile(file: File) {
    const text = await file.text()
    const result = parseCsv(text)
    setParsed(result)
    setMapping(detectColumnMapping(result.headers))
    setStep('map')
  }

  const importOptions: ImportOptions = useMemo(
    () => ({ mapping, fixedAccount: fixedAccount || undefined }),
    [mapping, fixedAccount],
  )

  const results = useMemo(() => {
    if (!parsed) return []
    return applyImportMapping(parsed.rows, importOptions, transactions)
  }, [parsed, importOptions, transactions])

  const validResults = results.filter((r) => r.transaction && !(skipDuplicates && r.isDuplicate))
  const errorCount = results.filter((r) => r.error).length
  const duplicateCount = results.filter((r) => r.isDuplicate).length

  function reset() {
    setStep('upload')
    setParsed(null)
    setMapping({})
    setFixedAccount('')
  }

  function handleConfirm() {
    const toImport = validResults
      .map((r) => r.transaction)
      .filter((t): t is NonNullable<typeof t> => t !== null)
    void bulkAdd(toImport)
    reset()
  }

  return (
    <Card>
      <h3 className="mb-3 text-sm font-semibold text-slate-700">
        Import Dining Dollars (GET Portal CSV)
      </h3>
      <p className="mb-3 text-xs text-slate-500">
        Debit amounts are automatically counted as positive spending.
      </p>

      {step === 'upload' && (
        <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-slate-300 px-4 py-8 text-sm text-slate-500 hover:border-slate-400">
          <Upload size={24} />
          Choose a CSV file to import
          <input
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) void handleFile(file)
            }}
          />
        </label>
      )}

      {step === 'map' && parsed && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {FIELDS.map(({ key, label, required }) => (
              <label key={key} className="flex flex-col gap-1 text-sm text-slate-600">
                {label}
                {required ? '' : ' (optional)'}
                <Select
                  value={mapping[key] ?? ''}
                  onChange={(e) =>
                    setMapping((m) => ({ ...m, [key]: e.target.value || undefined }))
                  }
                >
                  <option value="">— none —</option>
                  {parsed.headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </Select>
              </label>
            ))}
          </div>

          {!mapping.account && (
            <label className="flex flex-col gap-1 text-sm text-slate-600">
              Fixed account (no account column found)
              <Input
                type="text"
                value={fixedAccount}
                onChange={(e) => setFixedAccount(e.target.value)}
                placeholder="e.g. First Year Limited PCV"
              />
            </label>
          )}

          <Checkbox
            label="Skip likely duplicates"
            checked={skipDuplicates}
            onChange={(e) => setSkipDuplicates(e.target.checked)}
          />

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
            <div className="mb-2 flex flex-wrap gap-2">
              <Badge tone="good">{validResults.length} rows ready</Badge>
              {duplicateCount > 0 && <Badge tone="warn">{duplicateCount} duplicates</Badge>}
              {errorCount > 0 && <Badge tone="bad">{errorCount} unparseable</Badge>}
            </div>
            <div className="max-h-40 overflow-y-auto text-xs text-slate-600">
              {results.slice(0, 5).map((r, i) => (
                <div key={i} className="border-t border-slate-200 py-1 first:border-t-0">
                  {r.transaction
                    ? `${r.transaction.date} — ${r.transaction.location} — ${formatCurrency(r.transaction.amount)}`
                    : `Row ${i + 1}: ${r.error}`}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleConfirm} disabled={validResults.length === 0}>
              Import {validResults.length} Transactions
            </Button>
            <Button variant="secondary" onClick={reset}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}
