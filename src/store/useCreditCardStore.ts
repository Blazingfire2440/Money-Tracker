import { create } from 'zustand'
import type { CreditCardTransaction } from '@/types'
import { CREDIT_CARD_PAYMENT_METHOD } from '@/types'
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

type StoredCreditCardTransaction = Omit<CreditCardTransaction, 'reimbursementStatus'> & {
  reimbursementStatus?: CreditCardTransaction['reimbursementStatus'] | boolean
  isReimbursable?: boolean
}

function normalizeTransaction(transaction: StoredCreditCardTransaction): CreditCardTransaction {
  const { isReimbursable, ...storedTransaction } = transaction
  const wasLegacyExpense = transaction.paymentMethod === 'Expense'
  const reimbursementStatus =
    transaction.reimbursementStatus === 'Reimbursable' ||
    transaction.reimbursementStatus === true ||
    isReimbursable === true
      ? 'Reimbursable'
      : 'Not reimbursable'

  return {
    ...storedTransaction,
    category: transaction.category === 'N/A' ? 'Other' : transaction.category,
    paymentMethod: wasLegacyExpense
      ? CREDIT_CARD_PAYMENT_METHOD
      : transaction.paymentMethod ?? CREDIT_CARD_PAYMENT_METHOD,
    reimbursementStatus,
  }
}

export const useCreditCardStore = create<CreditCardStore>((set, get) => ({
  transactions: [],
  isLoaded: false,

  hydrate: async () => {
    const storedTransactions =
      ((await getCreditCardTransactions()) ?? []) as StoredCreditCardTransaction[]
    const transactions = storedTransactions.map(normalizeTransaction)
    set({ transactions, isLoaded: true })
    if (JSON.stringify(transactions) !== JSON.stringify(storedTransactions)) {
      await setCreditCardTransactions(transactions)
    }
  },

  add: async (input) => {
    const transaction = normalizeTransaction({ ...input, id: createId() })
    const transactions = [transaction, ...get().transactions]
    set({ transactions })
    await setCreditCardTransactions(transactions)
  },

  update: async (id, patch) => {
    const transactions = get().transactions.map((t) =>
      t.id === id ? normalizeTransaction({ ...t, ...patch }) : t,
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
    const normalizedTransactions = transactions.map(normalizeTransaction)
    set({ transactions: normalizedTransactions })
    await setCreditCardTransactions(normalizedTransactions)
  },

  bulkAdd: async (newTransactions) => {
    const transactions = [
      ...newTransactions.map(normalizeTransaction),
      ...get().transactions,
    ]
    set({ transactions })
    await setCreditCardTransactions(transactions)
  },
}))
