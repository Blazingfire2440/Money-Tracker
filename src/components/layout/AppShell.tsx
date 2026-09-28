import type { ReactNode } from 'react'
import { Header } from './Header'
import { TabNav } from './TabNav'
import { useUIStore } from '@/store/useUIStore'

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const activeTab = useUIStore((s) => s.activeTab)
  const setActiveTab = useUIStore((s) => s.setActiveTab)

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
        <Header />
        <TabNav activeTab={activeTab} onChange={setActiveTab} />
      </div>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">{children}</main>
    </div>
  )
}
