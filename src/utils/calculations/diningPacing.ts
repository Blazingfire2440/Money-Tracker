import { addDays, differenceInCalendarDays, parseISO, startOfDay } from 'date-fns'
import type { DiningTransaction } from '@/types'
import type { SemesterStats } from './semester'

export interface PacingStats {
  percentElapsed: number
  percentSpent: number
  targetSpentByToday: number
  pace: number
  isAheadOfPace: boolean
  projectedTotalSpend: number | null
  projectedLeftover: number | null
}

export function computePacingStats(
  semester: SemesterStats,
  planTotal: number,
  totalSpent: number,
): PacingStats {
  const { totalDays, daysElapsed } = semester

  const percentElapsed =
    totalDays > 0 ? clamp((daysElapsed / totalDays) * 100, 0, 100) : 0
  const percentSpent = planTotal > 0 ? (totalSpent / planTotal) * 100 : 0

  const targetSpentByToday = totalDays > 0 ? (daysElapsed / totalDays) * planTotal : 0
  const pace = totalSpent - targetSpentByToday
  const isAheadOfPace = pace > 0

  const projectedTotalSpend =
    daysElapsed === 0 ? null : (totalSpent / daysElapsed) * totalDays
  const projectedLeftover =
    projectedTotalSpend === null ? null : planTotal - projectedTotalSpend

  return {
    percentElapsed,
    percentSpent,
    targetSpentByToday,
    pace,
    isAheadOfPace,
    projectedTotalSpend,
    projectedLeftover,
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export interface DailySeriesPoint {
  date: string
  actualCumulative: number
  targetCumulative: number
}

export function computeDailySeries(
  transactions: DiningTransaction[],
  startDate: string,
  endDate: string,
  planTotal: number,
  today: Date,
): DailySeriesPoint[] {
  const start = startOfDay(parseISO(startDate))
  const end = startOfDay(parseISO(endDate))
  if (end <= start) return []

  const totalDays = differenceInCalendarDays(end, start) + 1
  const lastDay = today < end ? today : end
  const daysToPlot = Math.max(differenceInCalendarDays(lastDay, start) + 1, 0)

  const sortedByDate = [...transactions].sort((a, b) => a.date.localeCompare(b.date))

  const points: DailySeriesPoint[] = []
  let runningTotal = 0
  let txIndex = 0

  for (let dayIndex = 0; dayIndex < daysToPlot; dayIndex++) {
    const day = addDays(start, dayIndex)
    const dayEnd = addDays(day, 1)

    while (
      txIndex < sortedByDate.length &&
      startOfDay(parseISO(sortedByDate[txIndex].date)) < dayEnd
    ) {
      runningTotal += sortedByDate[txIndex].amount
      txIndex++
    }

    points.push({
      date: day.toISOString().slice(0, 10),
      actualCumulative: runningTotal,
      targetCumulative: (planTotal / totalDays) * (dayIndex + 1),
    })
  }

  return points
}
