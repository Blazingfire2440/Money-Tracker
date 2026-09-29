import { useRef, useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { Input } from '@/components/common/Input'
import { useBudgetExpenseStore } from '@/store/useBudgetExpenseStore'

function todayLocalDate(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate(),
  ).padStart(2, '0')}`
}

export function QuickEntryBudgetExpense() {
  const add = useBudgetExpenseStore((state) => state.add)
  const descriptionRef = useRef<HTMLInputElement>(null)
  const [date, setDate] = useState(todayLocalDate)
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const parsedAmount = Number(amount)
    if (!description.trim() || !Number.isFinite(parsedAmount) || parsedAmount <= 0) return
    void add({ date, description: description.trim(), amount: parsedAmount, reason: reason.trim() })
    setDate(todayLocalDate())
    setDescription('')
    setAmount('')
    setReason('')
    descriptionRef.current?.focus()
  }

  return (
    <Card>
      <h3 className="mb-3 text-sm font-semibold text-slate-700">Quick Add — Payback Expense</h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} aria-label="Expense date" />
        <Input
          ref={descriptionRef}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Expense description"
          aria-label="Expense description"
          required
        />
        <Input
          type="number"
          min="0.01"
          step="0.01"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          placeholder="Amount"
          aria-label="Expense amount"
          required
        />
        <div className="flex gap-2">
          <Input
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Reason"
            aria-label="Expense reason"
          />
          <Button type="submit">
            <Plus size={16} />
            Add
          </Button>
        </div>
      </form>
      <p className="mt-2 text-xs text-slate-500">
        Expenses entered here reduce the net reimbursable balance and are not credit-card
        transactions.
      </p>
    </Card>
  )
}
