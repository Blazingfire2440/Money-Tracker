import { Wallet } from 'lucide-react'

export function Header() {
  return (
    <header className="flex items-center gap-2 px-4 py-4 sm:px-6">
      <Wallet className="text-slate-900" size={22} />
      <span className="text-lg font-semibold text-slate-900">Money Tracker</span>
    </header>
  )
}
