import { useRef, useState } from 'react'
import { Upload } from 'lucide-react'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { useDiningStore } from '@/store/useDiningStore'
import { useCreditCardStore } from '@/store/useCreditCardStore'
import { useDebitCardStore } from '@/store/useDebitCardStore'
import { useBudgetExpenseStore } from '@/store/useBudgetExpenseStore'
import { useSettingsStore } from '@/store/useSettingsStore'
import { parseBackupPayload } from '@/utils/csv/backupExportImport'
import { migrateLegacyBudgetExpenses } from '@/utils/calculations/legacyBudgetExpenses'
import { ExportButtons } from './ExportButtons'
import { CsvImportWizard } from './CsvImportWizard'
import { PastedTransactionImport } from './PastedTransactionImport'

export function ImportExportPanel() {
  const bulkReplaceDining = useDiningStore((s) => s.bulkReplace)
  const bulkReplaceCreditCard = useCreditCardStore((s) => s.bulkReplace)
  const bulkReplaceDebitCard = useDebitCardStore((s) => s.bulkReplace)
  const bulkReplaceBudgetExpenses = useBudgetExpenseStore((s) => s.bulkReplace)
  const updateSettings = useSettingsStore((s) => s.update)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleRestore(file: File) {
    setError(null)
    try {
      const text = await file.text()
      const payload = parseBackupPayload(text)
      const confirmed = window.confirm(
        'Restoring a backup will overwrite all current dining, credit card, and debit card transactions and settings. Continue?',
      )
      if (!confirmed) return

      const diningTransactions =
        payload.version < 2
          ? payload.diningTransactions.map((transaction) => ({
              ...transaction,
              amount: -transaction.amount,
            }))
          : payload.diningTransactions
      const migratedBudgetData =
        payload.version < 4
          ? migrateLegacyBudgetExpenses(
              payload.creditCardTransactions,
              payload.budgetExpenses,
            )
          : {
              creditCardTransactions: payload.creditCardTransactions,
              budgetExpenses: payload.budgetExpenses,
            }

      await Promise.all([
        bulkReplaceDining(diningTransactions),
        bulkReplaceCreditCard(migratedBudgetData.creditCardTransactions),
        bulkReplaceDebitCard(payload.debitCardTransactions),
        bulkReplaceBudgetExpenses(migratedBudgetData.budgetExpenses),
        updateSettings(payload.settings),
      ])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to restore backup')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <ExportButtons />

      <Card>
        <h3 className="mb-3 text-sm font-semibold text-slate-700">Restore Full Backup (JSON)</h3>
        <p className="mb-3 text-xs text-slate-500">
          Restoring overwrites all current data with the contents of the backup file. Older
          backups are converted to positive spending amounts.
        </p>
        <Button
          variant="secondary"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload size={16} />
          Choose Backup File
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) void handleRestore(file)
          }}
        />
        {error && <p className="mt-2 text-sm text-bad-600">{error}</p>}
      </Card>

      <PastedTransactionImport />
      <CsvImportWizard />
    </div>
  )
}
