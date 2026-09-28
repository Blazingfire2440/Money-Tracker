import { useMemo } from 'react'
import { DiningOverviewCards } from './DiningOverviewCards'
import { TodaysNumbersPanel } from './TodaysNumbersPanel'
import { OnTrackPacingPanel } from './OnTrackPacingPanel'
import { DiningPacingChart } from './DiningPacingChart'
import { useDiningStore } from '@/store/useDiningStore'
import { useSettingsStore } from '@/store/useSettingsStore'
import { computeSemesterStats, getToday } from '@/utils/calculations/semester'
import { computePacingStats, computeDailySeries } from '@/utils/calculations/diningPacing'
import { DINING_BALANCE_ACCOUNT } from '@/types'

export function DiningDashboard() {
  const transactions = useDiningStore((s) => s.transactions)
  const settings = useSettingsStore((s) => s.settings)

  const today = useMemo(() => getToday(), [])
  const balanceTransactions = useMemo(
    () => transactions.filter((transaction) => transaction.account.trim() === DINING_BALANCE_ACCOUNT),
    [transactions],
  )

  const spent = useMemo(
    () => balanceTransactions.reduce((sum, transaction) => sum - transaction.amount, 0),
    [balanceTransactions],
  )
  const remaining = settings.diningPlanTotal - spent

  const semesterStats = useMemo(
    () =>
      computeSemesterStats(
        settings.semesterStartDate,
        settings.semesterEndDate,
        settings.diningPlanTotal,
        remaining,
        today,
      ),
    [settings.semesterStartDate, settings.semesterEndDate, settings.diningPlanTotal, remaining, today],
  )

  const pacingStats = useMemo(
    () => computePacingStats(semesterStats, settings.diningPlanTotal, spent),
    [semesterStats, settings.diningPlanTotal, spent],
  )

  const dailySeries = useMemo(
    () =>
      computeDailySeries(
        balanceTransactions,
        settings.semesterStartDate,
        settings.semesterEndDate,
        settings.diningPlanTotal,
        today,
      ),
    [balanceTransactions, settings.semesterStartDate, settings.semesterEndDate, settings.diningPlanTotal, today],
  )

  return (
    <div className="flex flex-col gap-4">
      <DiningOverviewCards
        planTotal={settings.diningPlanTotal}
        spent={spent}
        remaining={remaining}
      />
      <TodaysNumbersPanel stats={semesterStats} />
      <OnTrackPacingPanel stats={pacingStats} />
      <DiningPacingChart dailySeries={dailySeries} />
    </div>
  )
}
