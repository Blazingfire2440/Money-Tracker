import { ChevronLeft, ChevronRight } from 'lucide-react'
import { formatMonthLabel } from '@/utils/formatters'

interface MonthSelectorProps {
  monthKey: string
  onChange: (monthKey: string) => void
}

function shiftMonth(monthKey: string, delta: number): string {
  const [y, m] = monthKey.split('-').map(Number)
  const date = new Date(y, m - 1 + delta, 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export function MonthSelector({ monthKey, onChange }: MonthSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onChange(shiftMonth(monthKey, -1))}
        className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
        aria-label="Previous month"
      >
        <ChevronLeft size={18} />
      </button>
      <span className="min-w-[10rem] text-center text-sm font-semibold text-slate-900">
        {formatMonthLabel(monthKey)}
      </span>
      <button
        onClick={() => onChange(shiftMonth(monthKey, 1))}
        className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
        aria-label="Next month"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  )
}
