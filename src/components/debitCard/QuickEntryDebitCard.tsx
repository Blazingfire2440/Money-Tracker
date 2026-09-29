import { useRef, useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { Input } from '@/components/common/Input'
import { Select } from '@/components/common/Select'
import { useDebitCardStore } from '@/store/useDebitCardStore'
import type { ReimbursementStatus } from '@/types'

function todayLocalDate(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate(),
  ).padStart(2, '0')}`
}

export function QuickEntryDebitCard() {
  const add = useDebitCardStore((state) => state.add)
  const descriptionRef = useRef<HTMLInputElement>(null)
  const [date, setDate] = useState(todayLocalDate)
  const [checkNumber, setCheckNumber] = useState('')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [endingBalance, setEndingBalance] = useState('')
  const [reason, setReason] = useState('')
  const [reimbursementStatus, setReimbursementStatus] =
    useState<ReimbursementStatus>('Not reimbursable')

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const parsedAmount = Number(amount)
    const parsedBalance = Number(endingBalance)
    if (
      !description.trim() ||
      !Number.isFinite(parsedAmount) ||
      !Number.isFinite(parsedBalance) ||
      parsedBalance < 0
    ) {
      return
    }

    void add({
      date,
      checkNumber: checkNumber.trim(),
      description: description.trim(),
      amount: parsedAmount,
      endingBalance: parsedBalance,
      reason: reason.trim(),
      reimbursementStatus,
    })
    setDate(todayLocalDate())
    setCheckNumber('')
    setDescription('')
    setAmount('')
    setEndingBalance('')
    setReason('')
    setReimbursementStatus('Not reimbursable')
    descriptionRef.current?.focus()
  }

  return (
    <Card>
      <h3 className="mb-3 text-sm font-semibold text-slate-700">Quick Add — Debit Card</h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} aria-label="Date" />
        <Input
          ref={descriptionRef}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Description"
          aria-label="Description"
          required
        />
        <Input
          value={checkNumber}
          onChange={(event) => setCheckNumber(event.target.value)}
          placeholder="Check number"
          aria-label="Check number"
        />
        <Input
          type="number"
          step="0.01"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          placeholder="Amount (+ deposit, − withdrawal)"
          aria-label="Amount, positive for deposit and negative for withdrawal"
          required
        />
        <Input
          type="number"
          min="0"
          step="0.01"
          value={endingBalance}
          onChange={(event) => setEndingBalance(event.target.value)}
          placeholder="Ending daily balance"
          aria-label="Ending daily balance"
          required
        />
        <Input
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Reason"
          aria-label="Reason"
        />
        <Select
          value={reimbursementStatus}
          onChange={(event) =>
            setReimbursementStatus(event.target.value as ReimbursementStatus)
          }
          aria-label="Reimbursement status"
        >
          <option value="Not reimbursable">Not reimbursable</option>
          <option value="Reimbursable">Reimbursable</option>
        </Select>
        <Button type="submit">
          <Plus size={16} />
          Add Transaction
        </Button>
      </form>
    </Card>
  )
}
