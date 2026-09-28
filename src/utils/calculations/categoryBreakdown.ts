import {
  getCreditCardCategories,
  type CreditCardCategory,
  type CreditCardTransaction,
} from '@/types'
import { CATEGORY_COLORS } from '@/constants/categories'

export interface CategoryStat {
  category: CreditCardCategory
  total: number
  percentOfTotal: number
  color: string
  count: number
}

export function computeCategoryBreakdown(
  transactionsInMonth: CreditCardTransaction[],
): CategoryStat[] {
  const charges = transactionsInMonth.filter((transaction) => transaction.category !== 'Payment')
  const totalCharges = charges.reduce((sum, transaction) => sum + transaction.amount, 0)

  const categories = getCreditCardCategories(
    transactionsInMonth.map((transaction) => transaction.category),
  )
  const stats = categories.map((category) => {
    const matching =
      category === 'Payment'
        ? []
        : charges.filter((transaction) => transaction.category === category)
    const total = matching.reduce((sum, t) => sum + t.amount, 0)
    return {
      category,
      total,
      percentOfTotal: totalCharges > 0 ? (total / totalCharges) * 100 : 0,
      color: CATEGORY_COLORS[category] ?? '#64748b',
      count: matching.length,
    }
  })

  return stats.sort((a, b) => b.total - a.total)
}

export function categoryBreakdownForChart(stats: CategoryStat[]): CategoryStat[] {
  return stats.filter((s) => s.total > 0)
}
