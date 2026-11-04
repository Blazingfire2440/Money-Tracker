import { create } from 'zustand'
import type { GiftCard, GiftCardInput } from '@/types/giftCard'
import { getGiftCards, setGiftCards } from '@/data/db'
import { createId } from '@/utils/id'
import { normalizeGiftCards } from '@/utils/giftCards'

interface GiftCardStore {
  cards: GiftCard[]
  hydrate: () => Promise<void>
  add: (input: GiftCardInput) => Promise<void>
  update: (id: string, input: GiftCardInput) => Promise<void>
  remove: (id: string) => Promise<void>
  bulkReplace: (cards: GiftCard[]) => Promise<void>
}

export const useGiftCardStore = create<GiftCardStore>((set, get) => {
  const persist = async (cards: GiftCard[]) => {
    set({ cards })
    await setGiftCards(cards)
  }

  return {
    cards: [],
    hydrate: async () => set({ cards: normalizeGiftCards((await getGiftCards()) ?? []) }),
    add: (input) => persist([{ ...input, id: createId() }, ...get().cards]),
    update: (id, input) => persist(get().cards.map((c) => (c.id === id ? { ...input, id } : c))),
    remove: (id) => persist(get().cards.filter((c) => c.id !== id)),
    bulkReplace: (cards) => persist(normalizeGiftCards(cards)),
  }
})
