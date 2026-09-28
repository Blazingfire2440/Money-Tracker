import { QuickEntryDining } from '@/components/dining/QuickEntryDining'
import { DiningDashboard } from '@/components/dining/DiningDashboard'
import { DiningTransactionTable } from '@/components/dining/DiningTransactionTable'

export function DiningPage() {
  return (
    <div className="flex flex-col gap-6">
      <QuickEntryDining />
      <DiningDashboard />
      <DiningTransactionTable />
    </div>
  )
}
