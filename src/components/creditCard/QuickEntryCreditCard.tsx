import { useRef, useState } from 'react'
import { Plus } from 'lucide-react'
import { Card } from '@/components/common/Card'
import { Input } from '@/components/common/Input'
import { Select } from '@/components/common/Select'
import { Button } from '@/components/common/Button'
import { useCreditCardStore } from '@/store/useCreditCardStore'
import {
  CREDIT_CARD_PAYMENT_METHOD,
  getCreditCardCategories,
  type ReimbursementStatus,
  type CreditCardCategory,
} from '@/types'

function todayLocalDate(): string {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

export function QuickEntryCreditCard() {
  const add = useCreditCardStore((s) => s.add)
  const transactions = useCreditCardStore((s) => s.transactions)
  const categories = getCreditCardCategories(
    transactions
      .map((transaction) => transaction.category)
      .filter((existingCategory) => existingCategory !== 'N/A'),
  )
  const locationRef = useRef<HTMLInputElement>(null)

  const [date, setDate] = useState(todayLocalDate)
  const [location, setLocation] = useState('')
  const [category, setCategory] = useState<CreditCardCategory>('Dining')
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')
  const [reimbursementStatus, setReimbursementStatus] =
    useState<ReimbursementStatus>('Not reimbursable')
  const [paymentMethod, setPaymentMethod] = useState(CREDIT_CARD_PAYMENT_METHOD)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const parsedAmount = parseFloat(amount)
    if (!location.trim() || !Number.isFinite(parsedAmount)) return

    void add({
      date,
      location: location.trim(),
      category,
      amount: parsedAmount,
      reason: reason.trim(),
      reimbursementStatus,
      paymentMethod: paymentMethod.trim(),
    })

    setDate(todayLocalDate())
    setLocation('')
    setAmount('')
    setReason('')
    setReimbursementStatus('Not reimbursable')
    setPaymentMethod(CREDIT_CARD_PAYMENT_METHOD)
    locationRef.current?.focus()
  }

  return (
    <Card>
      <h3 className="mb-3 text-sm font-semibold text-slate-700">Quick Add — Credit Card</h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-6">
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          aria-label="Date"
        />
        <Input
          ref={locationRef}
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Merchant"
          aria-label="Location"
          autoFocus
          required
        />
        <Select
          value={category}
          onChange={(e) => setCategory(e.target.value as CreditCardCategory)}
          aria-label="Category"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
        <Input
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
          aria-label="Amount"
          required
        />
        <Input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason / description"
          aria-label="Reason"
        />
        <Input
          type="text"
          value={paymentMethod}
          onChange={(event) => setPaymentMethod(event.target.value)}
          placeholder="Payment method"
          aria-label="Payment method"
        />
        <div className="sm:col-span-6 flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-slate-600">
            Reimbursement
            <Select
              value={reimbursementStatus}
              onChange={(e) => setReimbursementStatus(e.target.value as ReimbursementStatus)}
              aria-label="Reimbursement status"
            >
              <option value="Not reimbursable">Not reimbursable</option>
              <option value="Reimbursable">Reimbursable</option>
            </Select>
          </label>
          <Button type="submit">
            <Plus size={16} />
            Add Transaction
          </Button>
        </div>
      </form>
    </Card>
  )
}
