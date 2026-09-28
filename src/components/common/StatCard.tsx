import clsx from 'clsx'
import { Card } from './Card'

type Tone = 'good' | 'warn' | 'bad' | 'neutral'

const toneClasses: Record<Tone, string> = {
  good: 'text-good-700',
  warn: 'text-warn-700',
  bad: 'text-bad-700',
  neutral: 'text-slate-900',
}

interface StatCardProps {
  label: string
  value: string
  subLabel?: string
  tone?: Tone
}

export function StatCard({ label, value, subLabel, tone = 'neutral' }: StatCardProps) {
  return (
    <Card>
      <div className="text-sm font-medium text-slate-500">{label}</div>
      <div className={clsx('mt-1 text-2xl font-semibold tabular-nums', toneClasses[tone])}>
        {value}
      </div>
      {subLabel && <div className="mt-1 text-xs text-slate-400">{subLabel}</div>}
    </Card>
  )
}
