import { useState } from 'react'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { usePiggyBankStore } from '@/store/usePiggyBankStore'
import { DENOMINATIONS, type PiggyCounts } from '@/types/piggyBank'
import { formatCurrency, formatDate } from '@/utils/formatters'

const byKey = Object.fromEntries(DENOMINATIONS.map((d) => [d.key, d]))

function totalCents(items: PiggyCounts): number {
  return Object.entries(items).reduce((s, [k, n]) => s + (byKey[k]?.cents ?? 0) * n, 0)
}

function describe(items: PiggyCounts): string {
  return DENOMINATIONS.filter((d) => items[d.key])
    .map((d) => `${items[d.key]}× ${d.label}`)
    .join(', ')
}

export function PiggyBankPage() {
  const counts = usePiggyBankStore((s) => s.counts)
  const history = usePiggyBankStore((s) => s.history)
  const deposit = usePiggyBankStore((s) => s.deposit)
  const withdraw = usePiggyBankStore((s) => s.withdraw)
  const removeEntry = usePiggyBankStore((s) => s.removeEntry)

  const [mode, setMode] = useState<'deposit' | 'withdrawal'>('deposit')
  const [inputs, setInputs] = useState<Record<string, string>>({})
  const [note, setNote] = useState('')
  const [error, setError] = useState('')

  const pending: PiggyCounts = {}
  for (const d of DENOMINATIONS) {
    const n = Math.floor(Number(inputs[d.key]))
    if (n > 0) pending[d.key] = n
  }
  const pendingCents = totalCents(pending)
  const total = totalCents(counts)
  const billsCents = totalCents(
    Object.fromEntries(Object.entries(counts).filter(([k]) => byKey[k]?.kind === 'bill')),
  )

  const step = (key: string, delta: number) => {
    const cur = Math.max(0, Math.floor(Number(inputs[key])) || 0)
    const max = mode === 'withdrawal' ? (counts[key] ?? 0) : Infinity
    setInputs({ ...inputs, [key]: String(Math.min(max, Math.max(0, cur + delta))) })
    setError('')
  }

  const submit = async () => {
    if (pendingCents === 0) return
    if (mode === 'deposit') {
      await deposit(pending, note)
    } else if (!(await withdraw(pending, note))) {
      setError('You cannot remove more of a bill or coin than the piggy bank holds.')
      return
    }
    setInputs({})
    setNote('')
    setError('')
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <div className="text-sm text-slate-500">Total in piggy bank</div>
          <div className="text-2xl font-semibold">{formatCurrency(total / 100)}</div>
        </Card>
        <Card>
          <div className="text-sm text-slate-500">Bills</div>
          <div className="text-2xl font-semibold">{formatCurrency(billsCents / 100)}</div>
        </Card>
        <Card>
          <div className="text-sm text-slate-500">Coins</div>
          <div className="text-2xl font-semibold">{formatCurrency((total - billsCents) / 100)}</div>
        </Card>
      </div>

      <Card className="flex flex-col gap-4">
        <div className="flex gap-2">
          <Button
            variant={mode === 'deposit' ? 'primary' : 'secondary'}
            onClick={() => { setMode('deposit'); setInputs({}); setError('') }}
          >
            Add money
          </Button>
          <Button
            variant={mode === 'withdrawal' ? 'primary' : 'secondary'}
            onClick={() => { setMode('withdrawal'); setInputs({}); setError('') }}
          >
            Remove money
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500">
                <th className="py-1">Denomination</th>
                <th>In bank</th>
                <th>{mode === 'deposit' ? 'Add' : 'Remove'}</th>
                <th className="text-right">Value</th>
              </tr>
            </thead>
            <tbody>
              {DENOMINATIONS.map((d) => {
                const held = counts[d.key] ?? 0
                const disabled = mode === 'withdrawal' && held === 0
                return (
                  <tr key={d.key} className="border-t border-slate-100">
                    <td className="py-1.5">{d.label}</td>
                    <td>{held}</td>
                    <td>
                      <div className="flex items-center gap-1">
                        <Button variant="secondary" className="px-2 py-1" disabled={disabled} onClick={() => step(d.key, -1)}>−</Button>
                        <input
                          type="number"
                          min={0}
                          max={mode === 'withdrawal' ? held : undefined}
                          step={1}
                          disabled={disabled}
                          value={inputs[d.key] ?? ''}
                          placeholder="0"
                          onChange={(e) => { setInputs({ ...inputs, [d.key]: e.target.value }); setError('') }}
                          className="w-16 rounded-lg border border-slate-300 px-2 py-1 text-center disabled:bg-slate-50"
                        />
                        <Button variant="secondary" className="px-2 py-1" disabled={disabled || (mode === 'withdrawal' && (Number(inputs[d.key]) || 0) >= held)} onClick={() => step(d.key, 1)}>+</Button>
                      </div>
                    </td>
                    <td className="text-right">{formatCurrency((held * d.cents) / 100)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Note (optional)"
            className="min-w-48 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <div className="text-sm font-medium">
            {mode === 'deposit' ? '+' : '−'}{formatCurrency(pendingCents / 100)}
          </div>
          <Button onClick={submit} disabled={pendingCents === 0}>
            {mode === 'deposit' ? 'Add to piggy bank' : 'Remove from piggy bank'}
          </Button>
        </div>
        {error && <div className="text-sm text-red-600">{error}</div>}
      </Card>

      <Card>
        <h2 className="mb-2 text-sm font-semibold">History</h2>
        {history.length === 0 ? (
          <div className="text-sm text-slate-400">No activity yet.</div>
        ) : (
          <ul className="divide-y divide-slate-100 text-sm">
            {history.map((e) => (
              <li key={e.id} className="flex items-start justify-between gap-3 py-2">
                <div>
                  <div className="font-medium">
                    {e.type === 'deposit' ? '+' : '−'}{formatCurrency(totalCents(e.items) / 100)}
                    <span className="ml-2 font-normal text-slate-500">{formatDate(e.date)}</span>
                  </div>
                  <div className="text-slate-500">{describe(e.items)}{e.note ? ` — ${e.note}` : ''}</div>
                </div>
                <Button variant="ghost" onClick={() => void removeEntry(e.id)}>Undo</Button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
