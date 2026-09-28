import { useState, type ReactNode } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown, Check, Pencil, Trash2, X } from 'lucide-react'
import { Input } from '@/components/common/Input'
import { Select } from '@/components/common/Select'
import { Checkbox } from '@/components/common/Checkbox'
import { EmptyState } from '@/components/common/EmptyState'
import { useSortableFilterable } from '@/hooks/useSortableFilterable'

export interface Column<T> {
  key: string
  label: string
  render?: (row: T) => ReactNode
  editable?: boolean
  inputType?: 'text' | 'number' | 'date' | 'select' | 'checkbox'
  options?: string[]
  sortValue?: (row: T) => string | number
  className?: string
}

interface DataTableProps<T extends object> {
  columns: Column<T>[]
  rows: T[]
  getRowId: (row: T) => string
  onEditRow: (id: string, patch: Partial<T>) => void
  onDeleteRow: (id: string) => void
  getSearchableText: (row: T) => string
  emptyTitle?: string
  emptyDescription?: string
}

export function DataTable<T extends object>({
  columns,
  rows,
  getRowId,
  onEditRow,
  onDeleteRow,
  getSearchableText,
  emptyTitle = 'No transactions yet',
  emptyDescription,
}: DataTableProps<T>) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<Partial<T>>({})

  const getSortValue = (row: T, key: string) => {
    const column = columns.find((c) => c.key === key)
    if (column?.sortValue) return column.sortValue(row)
    return (row as Record<string, unknown>)[key] as string | number
  }

  const { search, setSearch, sort, toggleSort, filteredAndSorted } =
    useSortableFilterable(rows, getSearchableText, getSortValue)

  function startEdit(row: T) {
    setEditingId(getRowId(row))
    setDraft({ ...row })
  }

  function cancelEdit() {
    setEditingId(null)
    setDraft({})
  }

  function saveEdit(id: string) {
    onEditRow(id, draft)
    setEditingId(null)
    setDraft({})
  }

  return (
    <div>
      <div className="mb-3">
        <Input
          type="search"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
      </div>

      {rows.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                {columns.map((column) => (
                  <th key={column.key} className="px-3 py-2 font-medium">
                    <button
                      className="flex items-center gap-1 hover:text-slate-700"
                      onClick={() => toggleSort(column.key)}
                    >
                      {column.label}
                      {sort.key === column.key ? (
                        sort.direction === 'asc' ? (
                          <ArrowUp size={12} />
                        ) : (
                          <ArrowDown size={12} />
                        )
                      ) : (
                        <ArrowUpDown size={12} className="text-slate-300" />
                      )}
                    </button>
                  </th>
                ))}
                <th className="px-3 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAndSorted.map((row) => {
                const id = getRowId(row)
                const isEditing = editingId === id

                return (
                  <tr key={id} className="transaction-row">
                    {columns.map((column) => (
                      <td key={column.key} className={`px-3 py-2 ${column.className ?? ''}`}>
                        {isEditing && column.editable ? (
                          <EditableCell
                            column={column}
                            value={(draft as Record<string, unknown>)[column.key]}
                            onChange={(value) =>
                              setDraft((d) => ({ ...d, [column.key]: value }))
                            }
                          />
                        ) : column.render ? (
                          column.render(row)
                        ) : (
                          String((row as Record<string, unknown>)[column.key] ?? '')
                        )}
                      </td>
                    ))}
                    <td className="px-3 py-2">
                      {isEditing ? (
                        <div className="flex gap-1">
                          <button
                            onClick={() => saveEdit(id)}
                            className="rounded p-1 text-good-600 hover:bg-good-50"
                            aria-label="Save"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="rounded p-1 text-slate-400 hover:bg-slate-100"
                            aria-label="Cancel"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-1">
                          <button
                            onClick={() => startEdit(row)}
                            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                            aria-label="Edit"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => onDeleteRow(id)}
                            className="rounded p-1 text-slate-400 hover:bg-bad-50 hover:text-bad-600"
                            aria-label="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function EditableCell<T>({
  column,
  value,
  onChange,
}: {
  column: Column<T>
  value: unknown
  onChange: (value: unknown) => void
}) {
  if (column.inputType === 'checkbox') {
    return (
      <Checkbox
        label=""
        checked={Boolean(value)}
        onChange={(e) => onChange(e.target.checked)}
      />
    )
  }

  if (column.inputType === 'select' && column.options) {
    return (
      <Select value={String(value ?? '')} onChange={(e) => onChange(e.target.value)}>
        {column.options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </Select>
    )
  }

  return (
    <Input
      type={column.inputType === 'number' ? 'number' : column.inputType === 'date' ? 'date' : 'text'}
      step={column.inputType === 'number' ? '0.01' : undefined}
      value={String(value ?? '')}
      onChange={(e) =>
        onChange(column.inputType === 'number' ? parseFloat(e.target.value) : e.target.value)
      }
    />
  )
}
