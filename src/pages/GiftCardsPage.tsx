import { useState } from 'react'
import { Plus, Trash2, Pencil } from 'lucide-react'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Select } from '@/components/common/Select'
import { Modal } from '@/components/common/Modal'
import { useGiftCardStore } from '@/store/useGiftCardStore'
import type { GiftCard, GiftCardExpiration, GiftCardInput } from '@/types/giftCard'
import { formatCurrency, formatDate } from '@/utils/formatters'

interface FormState {
  purpose: string
  cardNumber: string
  expirationType: GiftCardExpiration
  expirationDate: string
  otherInfo: string
  total: string
  remaining: string
}

const EMPTY: FormState = {
  purpose: '',
  cardNumber: '',
  expirationType: 'unknown',
  expirationDate: '',
  otherInfo: '',
  total: '',
  remaining: '',
}

function toInput(f: FormState): GiftCardInput | null {
  const isNA = /^n\/?a$/i.test(f.total.trim())
  const total = isNA ? null : Number(f.total)
  // Remaining defaults to the full amount for a new card; with an NA total it must be given
  const remaining = f.remaining === '' ? total : Number(f.remaining)
  if (total !== null && (f.total.trim() === '' || !Number.isFinite(total) || total < 0)) return null
  if (remaining === null || !Number.isFinite(remaining) || remaining < 0) return null
  if (!f.purpose.trim()) return null
  if (f.expirationType === 'date' && !f.expirationDate) return null
  return {
    purpose: f.purpose.trim(),
    cardNumber: f.cardNumber.trim(),
    expirationType: f.expirationType,
    expirationDate: f.expirationType === 'date' ? f.expirationDate : '',
    otherInfo: f.otherInfo.trim(),
    total,
    remaining,
  }
}

function GiftCardFields({ form, setForm }: { form: FormState; setForm: (f: FormState) => void }) {
  const set = (patch: Partial<FormState>) => setForm({ ...form, ...patch })
  return (
    <>
      <Input value={form.purpose} onChange={(e) => set({ purpose: e.target.value })} placeholder="What it's for (e.g. Target)" aria-label="Purpose" required />
      <Input value={form.cardNumber} onChange={(e) => set({ cardNumber: e.target.value })} placeholder="Card number" aria-label="Card number" />
      <div className="flex gap-2">
        <Select value={form.expirationType} onChange={(e) => set({ expirationType: e.target.value as GiftCardExpiration })} aria-label="Expiration type">
          <option value="unknown">Unknown</option>
          <option value="never">Never</option>
          <option value="date">Date…</option>
        </Select>
        {form.expirationType === 'date' && (
          <Input type="date" value={form.expirationDate} onChange={(e) => set({ expirationDate: e.target.value })} aria-label="Expiration date" required />
        )}
      </div>
      <Input value={form.otherInfo} onChange={(e) => set({ otherInfo: e.target.value })} placeholder="PIN / CVC / other info" aria-label="Other info" />
      <Input type="text" inputMode="decimal" pattern="^\s*(\d+(\.\d+)?|\.\d+|[Nn]/?[Aa])\s*$" title="A number, or NA" value={form.total} onChange={(e) => set({ total: e.target.value })} placeholder="Total amount (or NA)" aria-label="Total amount" required />
      <Input type="number" min="0" step="0.01" value={form.remaining} onChange={(e) => set({ remaining: e.target.value })} placeholder="Remaining (defaults to total)" aria-label="Remaining amount" />
    </>
  )
}

function expirationLabel(c: GiftCard): string {
  if (c.expirationType === 'never') return 'Never'
  if (c.expirationType === 'unknown') return 'Unknown'
  return formatDate(c.expirationDate)
}

function isExpired(c: GiftCard): boolean {
  return c.expirationType === 'date' && c.expirationDate < new Date().toISOString().slice(0, 10)
}

export function GiftCardsPage() {
  const cards = useGiftCardStore((s) => s.cards)
  const add = useGiftCardStore((s) => s.add)
  const update = useGiftCardStore((s) => s.update)
  const remove = useGiftCardStore((s) => s.remove)

  const [quick, setQuick] = useState<FormState>(EMPTY)
  const [editing, setEditing] = useState<{ id: string; form: FormState } | null>(null)
  const [showAll, setShowAll] = useState(false)

  const active = cards.filter((c) => c.remaining > 0 && !isExpired(c))
  const visible = showAll ? cards : active
  const totalRemaining = active.reduce((s, c) => s + c.remaining, 0)

  function submitQuick(e: React.FormEvent) {
    e.preventDefault()
    const input = toInput(quick)
    if (!input) return
    void add(input)
    setQuick(EMPTY)
  }

  function submitEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editing) return
    const input = toInput(editing.form)
    if (!input) return
    void update(editing.id, input)
    setEditing(null)
  }

  function startEdit(c: GiftCard) {
    setEditing({
      id: c.id,
      form: {
        purpose: c.purpose,
        cardNumber: c.cardNumber,
        expirationType: c.expirationType,
        expirationDate: c.expirationDate,
        otherInfo: c.otherInfo,
        total: c.total === null ? 'NA' : String(c.total),
        remaining: String(c.remaining),
      },
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <div className="text-sm text-slate-500">Available balance</div>
          <div className="text-2xl font-semibold">{formatCurrency(totalRemaining)}</div>
        </Card>
        <Card>
          <div className="text-sm text-slate-500">Active cards</div>
          <div className="text-2xl font-semibold">{active.length}</div>
        </Card>
        <Card>
          <div className="text-sm text-slate-500">Total cards</div>
          <div className="text-2xl font-semibold">{cards.length}</div>
        </Card>
      </div>

      <Card>
        <h3 className="mb-3 text-sm font-semibold text-slate-700">Quick Add — Gift Card</h3>
        <form onSubmit={submitQuick} className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <GiftCardFields form={quick} setForm={setQuick} />
          <div className="sm:col-span-3">
            <Button type="submit">
              <Plus size={16} />
              Add gift card
            </Button>
          </div>
        </form>
      </Card>

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Gift cards</h2>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} />
            Show used / expired
          </label>
        </div>
        {visible.length === 0 ? (
          <div className="text-sm text-slate-400">No gift cards.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500">
                  <th className="py-1">For</th>
                  <th>Card number</th>
                  <th>Expires</th>
                  <th>Other info</th>
                  <th className="text-right">Total</th>
                  <th className="text-right">Left</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {visible.map((c) => (
                  <tr key={c.id} className="border-t border-slate-100">
                    <td className="py-1.5 font-medium">{c.purpose}</td>
                    <td>{c.cardNumber || '—'}</td>
                    <td className={isExpired(c) ? 'text-red-600' : ''}>{expirationLabel(c)}{isExpired(c) ? ' (expired)' : ''}</td>
                    <td>{c.otherInfo || '—'}</td>
                    <td className="text-right">{c.total === null ? 'NA' : formatCurrency(c.total)}</td>
                    <td className="text-right font-medium">{formatCurrency(c.remaining)}</td>
                    <td className="whitespace-nowrap text-right">
                      <Button variant="ghost" className="px-2 py-1" aria-label="Edit" onClick={() => startEdit(c)}><Pencil size={14} /></Button>
                      <Button variant="ghost" className="px-2 py-1" aria-label="Delete" onClick={() => { if (window.confirm(`Delete gift card "${c.purpose}"?`)) void remove(c.id) }}><Trash2 size={14} /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {editing && (
        <Modal title="Edit gift card" onClose={() => setEditing(null)}>
          <form onSubmit={submitEdit} className="flex flex-col gap-3">
            <GiftCardFields form={editing.form} setForm={(form) => setEditing({ ...editing, form })} />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
