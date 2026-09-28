import { Card } from '@/components/common/Card'
import { Badge } from '@/components/common/Badge'
import { ProgressBar } from '@/components/common/ProgressBar'
import type { PacingStats } from '@/utils/calculations/diningPacing'
import { formatCurrency, formatPercent } from '@/utils/formatters'

interface OnTrackPacingPanelProps {
  stats: PacingStats
}

export function OnTrackPacingPanel({ stats }: OnTrackPacingPanelProps) {
  const {
    percentElapsed,
    percentSpent,
    targetSpentByToday,
    pace,
    isAheadOfPace,
    projectedLeftover,
  } = stats

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">On-Track Pacing</h3>
        <Badge tone={isAheadOfPace ? 'warn' : 'good'}>
          {isAheadOfPace ? 'Ahead of pace' : 'Under budget'}
        </Badge>
      </div>

      <ProgressBar
        percent={percentSpent}
        markerPercent={percentElapsed}
        colorScheme={isAheadOfPace ? 'warn' : 'good'}
        className="mb-4"
      />

      <dl className="grid grid-cols-2 gap-y-3 sm:grid-cols-4">
        <div>
          <dt className="text-xs text-slate-500">% Semester Elapsed</dt>
          <dd className="text-base font-semibold tabular-nums">{formatPercent(percentElapsed)}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">% Spent</dt>
          <dd className="text-base font-semibold tabular-nums">{formatPercent(percentSpent)}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Target Spent by Today</dt>
          <dd className="text-base font-semibold tabular-nums">{formatCurrency(targetSpentByToday)}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Pace</dt>
          <dd
            className={`text-base font-semibold tabular-nums ${isAheadOfPace ? 'text-warn-700' : 'text-good-700'}`}
          >
            {pace > 0 ? '+' : ''}
            {formatCurrency(pace)}
          </dd>
        </div>
      </dl>

      <div className="mt-4 border-t border-slate-100 pt-3">
        <div className="text-xs text-slate-500">Projected Leftover at Current Pace</div>
        <div
          className={`text-lg font-semibold tabular-nums ${
            projectedLeftover === null
              ? 'text-slate-400'
              : projectedLeftover >= 0
                ? 'text-good-700'
                : 'text-bad-700'
          }`}
        >
          {projectedLeftover === null ? 'Not enough data yet' : formatCurrency(projectedLeftover)}
        </div>
      </div>
    </Card>
  )
}
