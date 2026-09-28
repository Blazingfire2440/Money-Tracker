import { useMemo, useState } from 'react'

export interface SortState {
  key: string | null
  direction: 'asc' | 'desc'
}

export function useSortableFilterable<T>(
  rows: T[],
  getSearchableText: (row: T) => string,
  getSortValue: (row: T, key: string) => string | number,
) {
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortState>({ key: null, direction: 'asc' })

  function toggleSort(key: string) {
    setSort((prev) => {
      if (prev.key !== key) return { key, direction: 'asc' }
      if (prev.direction === 'asc') return { key, direction: 'desc' }
      return { key: null, direction: 'asc' }
    })
  }

  const filteredAndSorted = useMemo(() => {
    const term = search.trim().toLowerCase()
    let result = rows
    if (term) {
      result = result.filter((row) => getSearchableText(row).toLowerCase().includes(term))
    }
    if (sort.key) {
      const key = sort.key
      result = [...result].sort((a, b) => {
        const av = getSortValue(a, key)
        const bv = getSortValue(b, key)
        if (av < bv) return sort.direction === 'asc' ? -1 : 1
        if (av > bv) return sort.direction === 'asc' ? 1 : -1
        return 0
      })
    }
    return result
  }, [rows, search, sort, getSearchableText, getSortValue])

  return { search, setSearch, sort, toggleSort, filteredAndSorted }
}
