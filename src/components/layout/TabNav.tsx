import { UtensilsCrossed, CreditCard, Settings, ArrowLeftRight } from 'lucide-react'
import type { TabKey } from '@/store/useUIStore'
import clsx from 'clsx'

const TABS: { key: TabKey; label: string; icon: typeof UtensilsCrossed }[] = [
  { key: 'dining', label: 'Dining Dollars', icon: UtensilsCrossed },
  { key: 'creditCard', label: 'Credit Card', icon: CreditCard },
  { key: 'importExport', label: 'Import / Export', icon: ArrowLeftRight },
  { key: 'settings', label: 'Settings', icon: Settings },
]

interface TabNavProps {
  activeTab: TabKey
  onChange: (tab: TabKey) => void
}

export function TabNav({ activeTab, onChange }: TabNavProps) {
  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-slate-200 px-4 sm:px-6">
      {TABS.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={clsx(
            'flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors',
            activeTab === key
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-700',
          )}
        >
          <Icon size={16} />
          {label}
        </button>
      ))}
    </nav>
  )
}
