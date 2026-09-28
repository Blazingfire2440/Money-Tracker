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
    diningTransactions === undefined ? setDiningTransactions([]) : Promise.resolve(),
    creditCardTransactions === undefined
      ? setCreditCardTransactions([])
      : Promise.resolve(),
    schemaVersion === undefined ? setSchemaVersion(SCHEMA_VERSION) : Promise.resolve(),
  ])
}
