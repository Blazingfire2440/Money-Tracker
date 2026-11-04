import { create } from 'zustand'
import type { PiggyBankEntry, PiggyBankState, PiggyCounts } from '@/types/piggyBank'
import { getPiggyBank, setPiggyBank } from '@/data/db'
import { createId } from '@/utils/id'

interface PiggyBankStore {
  counts: PiggyCounts
  history: PiggyBankEntry[]
  hydrate: () => Promise<void>
  deposit: (items: PiggyCounts, note: string) => Promise<void>
  withdraw: (items: PiggyCounts, note: string) => Promise<boolean>
  removeEntry: (id: string) => Promise<void>
  bulkReplace: (state: PiggyBankState) => Promise<void>
}

function clean(items: PiggyCounts): PiggyCounts {
  const out: PiggyCounts = {}
  for (const [k, v] of Object.entries(items)) {
    if (Number.isInteger(v) && v > 0) out[k] = v
  }
  return out
}

export const usePiggyBankStore = create<PiggyBankStore>((set, get) => {
  const persist = async (counts: PiggyCounts, history: PiggyBankEntry[]) => {
    set({ counts, history })
    await setPiggyBank({ counts, history })
  }

  const apply = async (type: 'deposit' | 'withdrawal', raw: PiggyCounts, note: string) => {
    const items = clean(raw)
    if (Object.keys(items).length === 0) return false
    const sign = type === 'deposit' ? 1 : -1
    const counts = { ...get().counts }
    for (const [k, v] of Object.entries(items)) {
      const next = (counts[k] ?? 0) + sign * v
      if (next < 0) return false
      counts[k] = next
    }
    const entry: PiggyBankEntry = {
      id: createId(),
      date: new Date().toISOString(),
      type,
      note: note.trim(),
      items,
    }
    await persist(counts, [entry, ...get().history])
    return true
  }

  return {
    counts: {},
    history: [],

    hydrate: async () => {
      const saved = await getPiggyBank()
      set({ counts: saved?.counts ?? {}, history: saved?.history ?? [] })
    },

    deposit: async (items, note) => {
      await apply('deposit', items, note)
    },

    withdraw: (items, note) => apply('withdrawal', items, note),

    bulkReplace: async (state) => {
      await persist(clean(state.counts ?? {}), Array.isArray(state.history) ? state.history : [])
    },

    // Deleting an entry reverses its effect, only if the counts stay non-negative.
    removeEntry: async (id) => {
      const entry = get().history.find((e) => e.id === id)
      if (!entry) return
      const sign = entry.type === 'deposit' ? -1 : 1
      const counts = { ...get().counts }
      for (const [k, v] of Object.entries(entry.items)) {
        const next = (counts[k] ?? 0) + sign * v
        if (next < 0) return
        counts[k] = next
      }
      await persist(counts, get().history.filter((e) => e.id !== id))
    },
  }
})
