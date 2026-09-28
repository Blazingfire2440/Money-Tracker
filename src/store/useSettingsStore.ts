import { create } from 'zustand'
import type { AppSettings } from '@/types'
import { DEFAULT_SETTINGS } from '@/data/defaults'
import { getSettings, setSettings } from '@/data/db'

interface SettingsStore {
  settings: AppSettings
  isLoaded: boolean
  hydrate: () => Promise<void>
  update: (patch: Partial<AppSettings>) => Promise<void>
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  isLoaded: false,

  hydrate: async () => {
    const settings = (await getSettings()) ?? DEFAULT_SETTINGS
    set({ settings, isLoaded: true })
  },

  update: async (patch) => {
    const settings = { ...get().settings, ...patch }
    set({ settings })
    await setSettings(settings)
  },
}))
