import { create } from 'zustand'
import type { DebitCardTransaction } from '@/types'
import { getDebitCardTransactions, setDebitCardTransactions } from '@/data/db'
import { createId } from '@/utils/id'

interface DebitCardStore {
  transactions: DebitCardTransaction[]
  isLoaded: boolean
  hydrate: () => Promise<void>
  add: (input: Omit<DebitCardTransaction, 'id'>) => Promise<void>
  update: (id: string, patch: Partial<Omit<DebitCardTransaction, 'id'>>) => Promise<void>
  remove: (id: string) => Promise<void>
  toggleSettled: (id: string) => Promise<void>
  bulkReplace: (transactions: DebitCardTransaction[]) => Promise<void>
  bulkAdd: (transactions: DebitCardTransaction[]) => Promise<void>
}

type StoredDebitCardTransaction = Omit<DebitCardTransaction, 'reason' | 'reimbursementStatus'> & {
  reason?: string
  reimbursementStatus?: DebitCardTransaction['reimbursementStatus']
}

export const useDebitCardStore = create<DebitCardStore>((set, get) => ({
  transactions: [],
  isLoaded: false,

  hydrate: async () => {
    const stored = ((await getDebitCardTransactions()) ?? []) as StoredDebitCardTransaction[]
    const transactions = stored.map((transaction) => ({
      ...transaction,
      reason: transaction.reason ?? '',
      reimbursementStatus: transaction.reimbursementStatus ?? 'Not reimbursable',
    }))
    set({ transactions, isLoaded: true })
    if (JSON.stringify(transactions) !== JSON.stringify(stored)) {
      await setDebitCardTransactions(transactions)
    }
  },

  add: async (input) => {
    const transactions = [{ ...input, id: createId() }, ...get().transactions]
    set({ transactions })
    await setDebitCardTransactions(transactions)
  },

  update: async (id, patch) => {
    const transactions = get().transactions.map((transaction) =>
      transaction.id === id ? { ...transaction, ...patch } : transaction,
    )
    set({ transactions })
    await setDebitCardTransactions(transactions)
  },

  remove: async (id) => {
    const transactions = get().transactions.filter((transaction) => transaction.id !== id)
    set({ transactions })
    await setDebitCardTransactions(transactions)
  },

  toggleSettled: async (id) => {
    const transactions = get().transactions.map((transaction) =>
      transaction.id === id
        ? {
            ...transaction,
            isSettled: !transaction.isSettled,
            settledDate: !transaction.isSettled
              ? new Date().toISOString().slice(0, 10)
              : undefined,
          }
        : transaction,
    )
    set({ transactions })
    await setDebitCardTransactions(transactions)
  },

  bulkReplace: async (transactions) => {
    set({ transactions })
    await setDebitCardTransactions(transactions)
  },

  bulkAdd: async (newTransactions) => {
    const transactions = [...newTransactions, ...get().transactions]
    set({ transactions })
    await setDebitCardTransactions(transactions)
  },
}))
