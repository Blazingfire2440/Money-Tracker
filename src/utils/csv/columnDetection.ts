export type DiningField = 'date' | 'location' | 'amount' | 'account' | 'notes'

const SYNONYMS: Record<DiningField, string[]> = {
  date: ['date', 'transaction date', 'posted', 'posted date', 'time'],
  location: ['location', 'merchant', 'vendor', 'description'],
  amount: ['amount', 'charge', 'debit', 'cost'],
  account: ['account', 'plan', 'card', 'account name'],
  notes: ['memo', 'notes', 'comment', 'comments'],
}

export function detectColumnMapping(headers: string[]): Partial<Record<DiningField, string>> {
  const mapping: Partial<Record<DiningField, string>> = {}
  const normalizedHeaders = headers.map((h) => ({ raw: h, normalized: h.toLowerCase().trim() }))

  for (const field of Object.keys(SYNONYMS) as DiningField[]) {
    const synonyms = SYNONYMS[field]
    const match = normalizedHeaders.find((h) =>
      synonyms.some((syn) => h.normalized === syn || h.normalized.includes(syn)),
    )
    if (match) mapping[field] = match.raw
  }

  return mapping
}
