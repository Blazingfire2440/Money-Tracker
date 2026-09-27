import clsx from 'clsx'

type ColorScheme = 'good' | 'warn' | 'bad'

const fillClasses: Record<ColorScheme, string> = {
  good: 'bg-good-500',
  warn: 'bg-warn-500',
  bad: 'bg-bad-500',
}

interface ProgressBarProps {
  percent: number
  colorScheme: ColorScheme
  markerPercent?: number
  className?: string
}

export function ProgressBar({
  percent,
  colorScheme,
  markerPercent,
  className,
}: ProgressBarProps) {
  const clampedFill = Math.min(Math.max(percent, 0), 100)
  const clampedMarker =
    markerPercent === undefined
      ? undefined
      : Math.min(Math.max(markerPercent, 0), 100)

  return (
    <div className={clsx('relative h-2.5 w-full rounded-full bg-slate-100', className)}>
      <div
        className={clsx('h-full rounded-full transition-all', fillClasses[colorScheme])}
        style={{ width: `${clampedFill}%` }}
      />
      {clampedMarker !== undefined && (
        <div
          className="absolute top-0 h-full w-0.5 bg-slate-500"
          style={{ left: `${clampedMarker}%` }}
          title="Linear target"
        />
      )}
    </div>
  )
}
