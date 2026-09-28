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

function normalizeTransactions(transactions: DiningTransaction[]): DiningTransaction[] {
  return transactions.map((transaction) => ({
    ...transaction,
    amount: Math.abs(transaction.amount),
  }))
}

export const useDiningStore = create<DiningStore>((set, get) => ({
  transactions: [],
  isLoaded: false,

  hydrate: async () => {
    const storedTransactions = (await getDiningTransactions()) ?? []
    const transactions = normalizeTransactions(storedTransactions)
    set({ transactions, isLoaded: true })
    if (transactions.some((transaction, index) => transaction.amount !== storedTransactions[index].amount)) {
      await setDiningTransactions(transactions)
    }
  },

  add: async (input) => {
    const transaction: DiningTransaction = {
      ...input,
      amount: Math.abs(input.amount),
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
            amount: patch.amount === undefined ? t.amount : Math.abs(patch.amount),
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
    const normalizedTransactions = normalizeTransactions(transactions)
    set({ transactions: normalizedTransactions })
    await setDiningTransactions(normalizedTransactions)
  },

  bulkAdd: async (newTransactions) => {
    const transactions = [...normalizeTransactions(newTransactions), ...get().transactions]
    set({ transactions })
    await setDiningTransactions(transactions)
  },
}))
