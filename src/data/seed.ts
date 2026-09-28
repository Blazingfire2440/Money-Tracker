import { DEFAULT_SETTINGS, SCHEMA_VERSION } from './defaults'
import {
  getCreditCardTransactions,
  getDiningTransactions,
  getSchemaVersion,
  getSettings,
  setCreditCardTransactions,
  setDiningTransactions,
  setSchemaVersion,
  setSettings,
} from './db'

export async function bootstrap() {
  const [settings, diningTransactions, creditCardTransactions, schemaVersion] =
    await Promise.all([
      getSettings(),
      getDiningTransactions(),
      getCreditCardTransactions(),
      getSchemaVersion(),
    ])

  await Promise.all([
    settings === undefined ? setSettings(DEFAULT_SETTINGS) : Promise.resolve(),
    diningTransactions === undefined
      ? setDiningTransactions([])
      : schemaVersion !== undefined && schemaVersion < SCHEMA_VERSION
        ? setDiningTransactions(
            diningTransactions.map((transaction) => ({
              ...transaction,
              amount: -transaction.amount,
            })),
          )
        : Promise.resolve(),
    creditCardTransactions === undefined
      ? setCreditCardTransactions([])
      : Promise.resolve(),
  ])

  if (schemaVersion === undefined || schemaVersion < SCHEMA_VERSION) {
    await setSchemaVersion(SCHEMA_VERSION)
  }
}
