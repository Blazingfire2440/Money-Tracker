import { DEFAULT_SETTINGS, SCHEMA_VERSION } from './defaults'
import { migrateLegacyBudgetExpenses } from '@/utils/calculations/legacyBudgetExpenses'
import {
  getCreditCardTransactions,
  getBudgetExpenses,
  getDebitCardTransactions,
  getDiningTransactions,
  getSchemaVersion,
  getSettings,
  setCreditCardTransactions,
  setBudgetExpenses,
  setDebitCardTransactions,
  setDiningTransactions,
  setSchemaVersion,
  setSettings,
} from './db'

export async function bootstrap() {
  const [
    settings,
    diningTransactions,
    rawCreditCardTransactions,
    debitCardTransactions,
    storedBudgetExpenses,
    schemaVersion,
  ] =
    await Promise.all([
      getSettings(),
      getDiningTransactions(),
      getCreditCardTransactions(),
      getDebitCardTransactions(),
      getBudgetExpenses(),
      getSchemaVersion(),
    ])

  const creditCardTransactions = rawCreditCardTransactions ?? []
  const budgetExpenses = storedBudgetExpenses ?? []
  const shouldMigrateLegacyExpenses = schemaVersion === undefined || schemaVersion < 4
  const migratedData = shouldMigrateLegacyExpenses
    ? migrateLegacyBudgetExpenses(creditCardTransactions, budgetExpenses)
    : { creditCardTransactions, budgetExpenses }

  await Promise.all([
    settings === undefined ? setSettings(DEFAULT_SETTINGS) : Promise.resolve(),
    diningTransactions === undefined
      ? setDiningTransactions([])
      : schemaVersion !== undefined && schemaVersion < 2
        ? setDiningTransactions(
            diningTransactions.map((transaction) => ({
              ...transaction,
              amount: -transaction.amount,
            })),
          )
        : Promise.resolve(),
    rawCreditCardTransactions === undefined
      ? setCreditCardTransactions([])
      : migratedData.creditCardTransactions.length !== creditCardTransactions.length
        ? setCreditCardTransactions(migratedData.creditCardTransactions)
        : Promise.resolve(),
    debitCardTransactions === undefined
      ? setDebitCardTransactions([])
      : Promise.resolve(),
    storedBudgetExpenses === undefined ||
    migratedData.budgetExpenses.length !== budgetExpenses.length
      ? setBudgetExpenses(migratedData.budgetExpenses)
      : Promise.resolve(),
  ])

  if (schemaVersion === undefined || schemaVersion < SCHEMA_VERSION) {
    await setSchemaVersion(SCHEMA_VERSION)
  }
}
