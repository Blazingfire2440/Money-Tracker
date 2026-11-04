import type { GiftCard, GiftCardExpiration } from '@/types/giftCard'
import { createId } from '@/utils/id'

const num = (v: unknown) => {
  const n = Number(String(v ?? '').replace(/[$,]/g, ''))
  return Number.isFinite(n) ? n : 0
}

// Coerces untrusted data (backup JSON, CSV rows) into valid gift cards.
export function normalizeGiftCards(raw: unknown[]): GiftCard[] {
  return raw
    .filter((r): r is Record<string, unknown> => typeof r === 'object' && r !== null)
    .map((r) => {
      const date = String(r.expirationDate ?? '').trim()
      let type = String(r.expirationType ?? '').trim().toLowerCase()
      if (type !== 'date' && type !== 'unknown' && type !== 'never') {
        type = /^\d{4}-\d{2}-\d{2}$/.test(date) ? 'date' : 'unknown'
      }
      if (type === 'date' && !/^\d{4}-\d{2}-\d{2}$/.test(date)) type = 'unknown'
      return {
        id: typeof r.id === 'string' && r.id ? r.id : createId(),
        purpose: String(r.purpose ?? '').trim(),
        cardNumber: String(r.cardNumber ?? '').trim(),
        expirationType: type as GiftCardExpiration,
        expirationDate: type === 'date' ? date : '',
        otherInfo: String(r.otherInfo ?? '').trim(),
        total: num(r.total),
        remaining: num(r.remaining),
      }
    })
}
