import { create } from 'zustand'
import type { CreditCardTransaction } from '@/types'
import { getCreditCardTransactions, setCreditCardTransactions } from '@/data/db'
import { createId } from '@/utils/id'

interface CreditCardStore {
  transactions: CreditCardTransaction[]
  isLoaded: boolean
  hydrate: () => Promise<void>
  add: (input: Omit<CreditCardTransaction, 'id'>) => Promise<void>
  update: (
    id: string,
    patch: Partial<Omit<CreditCardTransaction, 'id'>>,
  ) => Promise<void>
  remove: (id: string) => Promise<void>
  toggleSettled: (id: string) => Promise<void>
  bulkReplace: (transactions: CreditCardTransaction[]) => Promise<void>
  bulkAdd: (transactions: CreditCardTransaction[]) => Promise<void>
}

export const useCreditCardStore = create<CreditCardStore>((set, get) => ({
  transactions: [],
  isLoaded: false,

  hydrate: async () => {
    const transactions = (await getCreditCardTransactions()) ?? []
    set({ transactions, isLoaded: true })
  },

  add: async (input) => {
    const transaction: CreditCardTransaction = { ...input, id: createId() }
    const transactions = [transaction, ...get().transactions]
    set({ transactions })
    await setCreditCardTransactions(transactions)
  },

  update: async (id, patch) => {
    const transactions = get().transactions.map((t) =>
      t.id === id ? { ...t, ...patch } : t,
    )
    set({ transactions })
    await setCreditCardTransactions(transactions)
  },

  remove: async (id) => {
    const transactions = get().transactions.filter((t) => t.id !== id)
    set({ transactions })
    await setCreditCardTransactions(transactions)
  },

  toggleSettled: async (id) => {
    const transactions = get().transactions.map((t) =>
      t.id === id
        ? {
            ...t,
            isSettled: !t.isSettled,
            settledDate: !t.isSettled
              ? new Date().toISOString().slice(0, 10)
              : undefined,
          }
        : t,
    )
    set({ transactions })
    await setCreditCardTransactions(transactions)
  },

  bulkReplace: async (transactions) => {
    set({ transactions })
    await setCreditCardTransactions(transactions)
  },

  bulkAdd: async (newTransactions) => {
    const transactions = [...newTransactions, ...get().transactions]
    set({ transactions })
    await setCreditCardTransactions(transactions)
  },
}))
