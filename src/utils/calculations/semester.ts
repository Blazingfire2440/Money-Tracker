import { differenceInCalendarDays, parseISO, startOfDay } from 'date-fns'

export interface SemesterStats {
  totalDays: number
  daysElapsed: number
  daysRemaining: number
  overallDailyBudget: number
  dailyBudgetRemaining: number | null
  weeklyBudgetAllowance: number | null
  isMisconfigured: boolean
}

export function getToday(): Date {
  return startOfDay(new Date())
}

export function computeSemesterStats(
  startDate: string,
  endDate: string,
  planTotal: number,
  remainingBalance: number,
  today: Date = getToday(),
): SemesterStats {
  const start = startOfDay(parseISO(startDate))
  const end = startOfDay(parseISO(endDate))

  if (end <= start) {
    return {
      totalDays: 0,
      daysElapsed: 0,
      daysRemaining: 0,
      overallDailyBudget: 0,
      dailyBudgetRemaining: null,
      weeklyBudgetAllowance: null,
      isMisconfigured: true,
    }
  }

  const totalDays = differenceInCalendarDays(end, start) + 1

  let daysElapsed: number
  if (today < start) {
    daysElapsed = 0
  } else if (today > end) {
    daysElapsed = totalDays
  } else {
    daysElapsed = differenceInCalendarDays(today, start) + 1
  }

  const daysRemaining = Math.max(totalDays - daysElapsed, 0)
  const overallDailyBudget = totalDays > 0 ? planTotal / totalDays : 0
  const dailyBudgetRemaining =
    daysRemaining === 0 ? null : remainingBalance / daysRemaining
  const weeklyBudgetAllowance =
    dailyBudgetRemaining === null ? null : dailyBudgetRemaining * 7

  return {
    totalDays,
    daysElapsed,
    daysRemaining,
    overallDailyBudget,
    dailyBudgetRemaining,
    weeklyBudgetAllowance,
    isMisconfigured: false,
  }
}
