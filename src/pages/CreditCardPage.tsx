import { QuickEntryCreditCard } from '@/components/creditCard/QuickEntryCreditCard'
import { CreditCardDashboard } from '@/components/creditCard/CreditCardDashboard'
import { CreditCardTransactionTable } from '@/components/creditCard/CreditCardTransactionTable'

export function CreditCardPage() {
  return (
    <div className="flex flex-col gap-6">
      <QuickEntryCreditCard />
      <CreditCardDashboard />
      <CreditCardTransactionTable />
    </div>
  )
}
