export type GiftCardExpiration = 'date' | 'unknown' | 'never'

export interface GiftCard {
  id: string
  purpose: string
  cardNumber: string
  expirationType: GiftCardExpiration
  expirationDate: string // YYYY-MM-DD, only meaningful when expirationType is 'date'
  otherInfo: string // PIN / CVC / etc.
  total: number
  remaining: number
}

export type GiftCardInput = Omit<GiftCard, 'id'>
