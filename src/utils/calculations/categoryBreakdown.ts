import { CREDIT_CARD_CATEGORIES, type CreditCardCategory, type CreditCardTransaction } from '@/types'
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
  const totalCharges = transactionsInMonth.reduce((sum, t) => sum + t.amount, 0)

  const stats = CREDIT_CARD_CATEGORIES.map((category) => {
    const matching = transactionsInMonth.filter((t) => t.category === category)
    const total = matching.reduce((sum, t) => sum + t.amount, 0)
    return {
      category,
      total,
      percentOfTotal: totalCharges > 0 ? (total / totalCharges) * 100 : 0,
      color: CATEGORY_COLORS[category],
      count: matching.length,
    }
  })

  return stats.sort((a, b) => b.total - a.total)
}

export function categoryBreakdownForChart(stats: CategoryStat[]): CategoryStat[] {
  return stats.filter((s) => s.total > 0)
}
