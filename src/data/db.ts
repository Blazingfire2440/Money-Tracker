import { createStore, get, set } from 'idb-keyval'
import type { AppSettings, CreditCardTransaction, DiningTransaction } from '@/types'
import { STORAGE_KEYS } from './storageKeys'

const store = createStore('money-tracker-db', 'keyval')

export function getSettings() {
  return get<AppSettings>(STORAGE_KEYS.settings, store)
}

export function setSettings(settings: AppSettings) {
  return set(STORAGE_KEYS.settings, settings, store)
}

export function getDiningTransactions() {
  return get<DiningTransaction[]>(STORAGE_KEYS.diningTransactions, store)
}

export function setDiningTransactions(transactions: DiningTransaction[]) {
  return set(STORAGE_KEYS.diningTransactions, transactions, store)
}

export function getCreditCardTransactions() {
  return get<CreditCardTransaction[]>(STORAGE_KEYS.creditCardTransactions, store)
}

export function setCreditCardTransactions(transactions: CreditCardTransaction[]) {
  return set(STORAGE_KEYS.creditCardTransactions, transactions, store)
}

export function getSchemaVersion() {
  return get<number>(STORAGE_KEYS.schemaVersion, store)
}

export function setSchemaVersion(version: number) {
  return set(STORAGE_KEYS.schemaVersion, version, store)
}
