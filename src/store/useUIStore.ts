import { create } from 'zustand'
import { getMonthKey } from '@/utils/calculations/creditCardBudget'
import { getDebitStatementMonthKey } from '@/utils/calculations/debitCardStatements'

export type TabKey =
  | 'dining'
  | 'creditCard'
  | 'debitCard'
  | 'budget'
  | 'settings'
  | 'importExport'

interface UIStore {
  activeTab: TabKey
  setActiveTab: (tab: TabKey) => void
  selectedMonth: string // YYYY-MM
  setSelectedMonth: (month: string) => void
  selectedDebitStatementMonth: string // YYYY-MM, month containing the statement ending on the 16th
  setSelectedDebitStatementMonth: (month: string) => void
}

function initialTab(): TabKey {
  const hash = window.location.hash.replace('#', '')
  if (
    hash === 'dining' ||
    hash === 'creditCard' ||
    hash === 'debitCard' ||
    hash === 'budget' ||
    hash === 'settings' ||
    hash === 'importExport'
  ) {
    return hash
  }
  return 'dining'
}

export const useUIStore = create<UIStore>((set) => ({
  activeTab: initialTab(),
  setActiveTab: (tab) => {
    window.location.hash = tab
    set({ activeTab: tab })
  },
  selectedMonth: getMonthKey(new Date()),
  setSelectedMonth: (month) => set({ selectedMonth: month }),
  selectedDebitStatementMonth: getDebitStatementMonthKey(new Date()),
  setSelectedDebitStatementMonth: (month) => set({ selectedDebitStatementMonth: month }),
}))
