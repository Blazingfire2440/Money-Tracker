import { ChevronLeft, ChevronRight } from 'lucide-react'

interface DebitStatementSelectorProps {
  monthKey: string
  onChange: (monthKey: string) => void
}

function shiftMonth(monthKey: string, delta: number): string {
  const [year, month] = monthKey.split('-').map(Number)
  const date = new Date(year, month - 1 + delta, 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function formatPeriod(monthKey: string): string {
  const [year, month] = monthKey.split('-').map(Number)
  const start = new Date(year, month - 2, 17)
  const end = new Date(year, month - 1, 16)
  const format = (date: Date) =>
    date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return `${format(start)} – ${format(end)}, ${end.getFullYear()}`
}

export function DebitStatementSelector({ monthKey, onChange }: DebitStatementSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onChange(shiftMonth(monthKey, -1))}
        className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
        aria-label="Previous debit statement"
      >
        <ChevronLeft size={18} />
      </button>
      <span className="min-w-[12rem] text-center text-sm font-semibold text-slate-900">
        Statement: {formatPeriod(monthKey)}
      </span>
      <button
        onClick={() => onChange(shiftMonth(monthKey, 1))}
        className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
        aria-label="Next debit statement"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  )
}
