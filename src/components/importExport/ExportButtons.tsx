import { Download } from 'lucide-react'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { useDiningStore } from '@/store/useDiningStore'
import { useCreditCardStore } from '@/store/useCreditCardStore'
import { useDebitCardStore } from '@/store/useDebitCardStore'
import { useBudgetExpenseStore } from '@/store/useBudgetExpenseStore'
import { useSettingsStore } from '@/store/useSettingsStore'
import { buildBackupPayload, downloadFile } from '@/utils/csv/backupExportImport'
import { rowsToCsv } from '@/utils/csv/csvParser'

export function ExportButtons() {
  const diningTransactions = useDiningStore((s) => s.transactions)
  const creditCardTransactions = useCreditCardStore((s) => s.transactions)
  const debitCardTransactions = useDebitCardStore((s) => s.transactions)
  const budgetExpenses = useBudgetExpenseStore((s) => s.expenses)
  const settings = useSettingsStore((s) => s.settings)

  function exportJsonBackup() {
    const payload = buildBackupPayload(
      settings,
      diningTransactions,
      creditCardTransactions,
      debitCardTransactions,
      budgetExpenses,
    )
    downloadFile(
      `money-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`,
      JSON.stringify(payload, null, 2),
      'application/json',
    )
  }

  function exportDiningCsv() {
    downloadFile(
      `dining-transactions-${new Date().toISOString().slice(0, 10)}.csv`,
      rowsToCsv(diningTransactions),
      'text/csv',
    )
  }

  function exportCreditCardCsv() {
    downloadFile(
      `credit-card-transactions-${new Date().toISOString().slice(0, 10)}.csv`,
      rowsToCsv(creditCardTransactions),
      'text/csv',
    )
  }

  function exportDebitCardCsv() {
    downloadFile(
      `debit-card-transactions-${new Date().toISOString().slice(0, 10)}.csv`,
      rowsToCsv(debitCardTransactions),
      'text/csv',
    )
  }

  return (
    <Card>
      <h3 className="mb-3 text-sm font-semibold text-slate-700">Export</h3>
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={exportJsonBackup}>
          <Download size={16} />
          Full Backup (JSON)
        </Button>
        <Button variant="secondary" onClick={exportDiningCsv}>
          <Download size={16} />
          Dining CSV
        </Button>
        <Button variant="secondary" onClick={exportCreditCardCsv}>
          <Download size={16} />
          Credit Card CSV
        </Button>
        <Button variant="secondary" onClick={exportDebitCardCsv}>
          <Download size={16} />
          Debit Card CSV
        </Button>
      </div>
    </Card>
  )
}
