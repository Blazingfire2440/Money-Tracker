import { useRef, useState } from 'react'
import { Plus } from 'lucide-react'
import { Card } from '@/components/common/Card'
import { Input } from '@/components/common/Input'
import { Select } from '@/components/common/Select'
import { Checkbox } from '@/components/common/Checkbox'
import { Button } from '@/components/common/Button'
import { useCreditCardStore } from '@/store/useCreditCardStore'
import { CREDIT_CARD_CATEGORIES, type CreditCardCategory } from '@/types'

function todayLocalDate(): string {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

export function QuickEntryCreditCard() {
  const add = useCreditCardStore((s) => s.add)
  const locationRef = useRef<HTMLInputElement>(null)

  const [date, setDate] = useState(todayLocalDate)
  const [location, setLocation] = useState('')
  const [category, setCategory] = useState<CreditCardCategory>('Dining')
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')
  const [isReimbursable, setIsReimbursable] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('Credit Card')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const parsedAmount = parseFloat(amount)
    if (!location.trim() || Number.isNaN(parsedAmount)) return

    void add({
      date,
      location: location.trim(),
      category,
      amount: parsedAmount,
      reason: reason.trim(),
      isReimbursable,
      paymentMethod: paymentMethod.trim(),
    })

    setDate(todayLocalDate())
    setLocation('')
    setAmount('')
    setReason('')
    setIsReimbursable(false)
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
          {CREDIT_CARD_CATEGORIES.map((c) => (
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
          onChange={(e) => setPaymentMethod(e.target.value)}
          placeholder="Payment method"
          aria-label="Payment method"
        />
        <div className="sm:col-span-6 flex items-center justify-between">
          <Checkbox
            label="Reimbursable"
            checked={isReimbursable}
            onChange={(e) => setIsReimbursable(e.target.checked)}
          />
          <Button type="submit">
            <Plus size={16} />
            Add Transaction
          </Button>
        </div>
      </form>
    </Card>
  )
}
