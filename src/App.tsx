import { useEffect, useState } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { DiningPage } from '@/pages/DiningPage'
import { CreditCardPage } from '@/pages/CreditCardPage'
import { DebitCardPage } from '@/pages/DebitCardPage'
import { BudgetPage } from '@/pages/BudgetPage'
import { PiggyBankPage } from '@/pages/PiggyBankPage'
import { usePiggyBankStore } from '@/store/usePiggyBankStore'
import { SettingsPage } from '@/pages/SettingsPage'
import { ImportExportPage } from '@/pages/ImportExportPage'
import { useUIStore } from '@/store/useUIStore'
import { useDiningStore } from '@/store/useDiningStore'
import { useCreditCardStore } from '@/store/useCreditCardStore'
import { useDebitCardStore } from '@/store/useDebitCardStore'
import { useBudgetExpenseStore } from '@/store/useBudgetExpenseStore'
import { useSettingsStore } from '@/store/useSettingsStore'
import { bootstrap } from '@/data/seed'

function App() {
  const [isReady, setIsReady] = useState(false)
  const activeTab = useUIStore((s) => s.activeTab)

  const hydrateDining = useDiningStore((s) => s.hydrate)
  const hydrateCreditCard = useCreditCardStore((s) => s.hydrate)
  const hydrateDebitCard = useDebitCardStore((s) => s.hydrate)
  const hydrateBudgetExpenses = useBudgetExpenseStore((s) => s.hydrate)
  const hydrateSettings = useSettingsStore((s) => s.hydrate)
  const hydratePiggyBank = usePiggyBankStore((s) => s.hydrate)

  useEffect(() => {
    void (async () => {
      await bootstrap()
      await Promise.all([
        hydrateDining(),
        hydrateCreditCard(),
        hydrateDebitCard(),
        hydrateBudgetExpenses(),
        hydrateSettings(),
        hydratePiggyBank(),
      ])
      setIsReady(true)
    })()
  }, [hydrateDining, hydrateCreditCard, hydrateDebitCard, hydrateBudgetExpenses, hydrateSettings, hydratePiggyBank])

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-400">
        Loading…
      </div>
    )
  }

  return (
    <AppShell>
      {activeTab === 'dining' && <DiningPage />}
      {activeTab === 'creditCard' && <CreditCardPage />}
      {activeTab === 'debitCard' && <DebitCardPage />}
      {activeTab === 'budget' && <BudgetPage />}
      {activeTab === 'piggyBank' && <PiggyBankPage />}
      {activeTab === 'settings' && <SettingsPage />}
      {activeTab === 'importExport' && <ImportExportPage />}
    </AppShell>
  )
}

export default App
