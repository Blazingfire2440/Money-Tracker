import { useRef, useState } from 'react'
import { Plus } from 'lucide-react'
import { Card } from '@/components/common/Card'
import { Input } from '@/components/common/Input'
import { Button } from '@/components/common/Button'
import { useDiningStore } from '@/store/useDiningStore'

function nowLocalDateTime(): string {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`
}

export function QuickEntryDining() {
  const add = useDiningStore((s) => s.add)
  const locationRef = useRef<HTMLInputElement>(null)

  const [date, setDate] = useState(nowLocalDateTime)
  const [location, setLocation] = useState('')
  const [amount, setAmount] = useState('')
  const [account, setAccount] = useState('First Year Limited PCV')
  const [notes, setNotes] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const parsedAmount = parseFloat(amount)
    if (!location.trim() || Number.isNaN(parsedAmount)) return

    void add({
      date,
      location: location.trim(),
      amount: parsedAmount,
      account: account.trim(),
      notes: notes.trim() || undefined,
    })

    setDate(nowLocalDateTime())
    setLocation('')
    setAmount('')
    setNotes('')
    locationRef.current?.focus()
  }

  return (
    <Card>
      <h3 className="mb-3 text-sm font-semibold text-slate-700">Quick Add — Dining Dollars</h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-5">
        <Input
          type="text"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          placeholder="YYYY-MM-DD HH:mm"
          aria-label="Date and time"
        />
        <Input
          ref={locationRef}
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Location (e.g. Chick-fil-A)"
          aria-label="Location"
          autoFocus
          required
        />
        <Input
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount (positive for spending)"
          aria-label="Amount, positive for spending and negative for refunds"
          required
        />
        <Input
          type="text"
          value={account}
          onChange={(e) => setAccount(e.target.value)}
          placeholder="Account"
          aria-label="Account"
        />
        <Input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes (optional)"
          aria-label="Notes"
        />
        <Button type="submit" className="sm:col-span-5 sm:w-fit">
          <Plus size={16} />
          Add Transaction
        </Button>
      </form>
    </Card>
  )
}
