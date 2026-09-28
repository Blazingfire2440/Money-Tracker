export function parseCurrencyAmount(raw: string): number | null {
  const normalized = raw.trim().replace(/[$,\s]/g, '')
  if (!/^[-+]?(?:\d+\.?\d*|\.\d+)$/.test(normalized)) return null
  const amount = Number(normalized)
  return Number.isFinite(amount) ? amount : null
}
