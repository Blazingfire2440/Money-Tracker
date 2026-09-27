import type { HTMLAttributes } from 'react'
import clsx from 'clsx'

type Tone = 'good' | 'warn' | 'bad' | 'neutral'

const toneClasses: Record<Tone, string> = {
  good: 'bg-good-50 text-good-700 ring-good-600/20',
  warn: 'bg-warn-50 text-warn-700 ring-warn-600/20',
  bad: 'bg-bad-50 text-bad-700 ring-bad-600/20',
  neutral: 'bg-slate-100 text-slate-700 ring-slate-500/20',
}

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone
}

export function Badge({ tone = 'neutral', className, ...props }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  )
}
