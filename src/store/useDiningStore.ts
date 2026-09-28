import { create } from 'zustand'
import type { DiningTransaction } from '@/types'
import { getDiningTransactions, setDiningTransactions } from '@/data/db'
import { createId } from '@/utils/id'

interface DiningStore {
  transactions: DiningTransaction[]
  isLoaded: boolean
  hydrate: () => Promise<void>
  add: (input: Omit<DiningTransaction, 'id'>) => Promise<void>
  update: (id: string, patch: Partial<Omit<DiningTransaction, 'id'>>) => Promise<void>
  remove: (id: string) => Promise<void>
  bulkReplace: (transactions: DiningTransaction[]) => Promise<void>
  bulkAdd: (transactions: DiningTransaction[]) => Promise<void>
}

export const useDiningStore = create<DiningStore>((set, get) => ({
  transactions: [],
  isLoaded: false,

  hydrate: async () => {
    const transactions = (await getDiningTransactions()) ?? []
    set({ transactions, isLoaded: true })
  },

  add: async (input) => {
    const transaction: DiningTransaction = {
      ...input,
      id: createId(),
    }
    const transactions = [transaction, ...get().transactions]
    set({ transactions })
    await setDiningTransactions(transactions)
  },

  update: async (id, patch) => {
    const transactions = get().transactions.map((t) =>
      t.id === id
        ? {
            ...t,
            ...patch,
          }
        : t,
    )
    set({ transactions })
    await setDiningTransactions(transactions)
  },

  remove: async (id) => {
    const transactions = get().transactions.filter((t) => t.id !== id)
    set({ transactions })
    await setDiningTransactions(transactions)
  },

  bulkReplace: async (transactions) => {
    set({ transactions })
    await setDiningTransactions(transactions)
  },

  bulkAdd: async (newTransactions) => {
    const updatedTransactions = [...newTransactions, ...get().transactions]
    set({ transactions: updatedTransactions })
    await setDiningTransactions(updatedTransactions)
  },
}))
