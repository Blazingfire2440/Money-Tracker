import { Badge } from '@/components/common/Badge'
import { Card } from '@/components/common/Card'
import { formatCurrency } from '@/utils/formatters'

interface RolloverTargetPanelProps {
  remaining: number
}

export function RolloverTargetPanel({ remaining }: RolloverTargetPanelProps) {
  const isBelowZero = remaining < 0
  const isAboveRolloverCap = remaining > 500
  const tone = isBelowZero ? 'bad' : isAboveRolloverCap ? 'warn' : 'good'
  const status = isBelowZero
    ? 'Below $0'
    : isAboveRolloverCap
      ? 'Above the rollover cap'
      : 'In the target range'

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-700">Semester-End Rollover Goal</h3>
          <p className="mt-1 text-sm text-slate-600">
            Aim to finish with <span className="font-semibold">$0–$500</span> remaining; at most
            $500 rolls over.
          </p>
        </div>
        <Badge tone={tone}>{status}</Badge>
      </div>

      <p className="mt-3 text-xs text-slate-500">
        Current remaining balance: {formatCurrency(remaining)}.
        {isAboveRolloverCap
          ? ` Plan to spend at least ${formatCurrency(remaining - 500)} more before the semester ends to stay within the rollover limit.`
          : isBelowZero
            ? ` The plan is overspent by ${formatCurrency(Math.abs(remaining))}.`
            : ' Your current balance is within the rollover target.'}
      </p>
    </Card>
  )
}
