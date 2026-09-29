import { create } from 'zustand'
import type { BudgetExpense } from '@/types'
import { getBudgetExpenses, setBudgetExpenses } from '@/data/db'
import { createId } from '@/utils/id'

interface BudgetExpenseStore {
  expenses: BudgetExpense[]
  hydrate: () => Promise<void>
  add: (input: Omit<BudgetExpense, 'id'>) => Promise<void>
  remove: (id: string) => Promise<void>
  toggleSettled: (id: string) => Promise<void>
  bulkReplace: (expenses: BudgetExpense[]) => Promise<void>
}

export const useBudgetExpenseStore = create<BudgetExpenseStore>((set, get) => ({
  expenses: [],

  hydrate: async () => {
    set({ expenses: (await getBudgetExpenses()) ?? [] })
  },

  add: async (input) => {
    const expenses = [{ ...input, id: createId() }, ...get().expenses]
    set({ expenses })
    await setBudgetExpenses(expenses)
  },

  remove: async (id) => {
    const expenses = get().expenses.filter((expense) => expense.id !== id)
    set({ expenses })
    await setBudgetExpenses(expenses)
  },

  toggleSettled: async (id) => {
    const expenses = get().expenses.map((expense) =>
      expense.id === id
        ? {
            ...expense,
            isSettled: !expense.isSettled,
            settledDate: !expense.isSettled
              ? new Date().toISOString().slice(0, 10)
              : undefined,
          }
        : expense,
    )
    set({ expenses })
    await setBudgetExpenses(expenses)
  },

  bulkReplace: async (expenses) => {
    set({ expenses })
    await setBudgetExpenses(expenses)
  },
}))
