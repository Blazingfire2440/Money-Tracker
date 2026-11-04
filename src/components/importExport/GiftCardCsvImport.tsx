import { useRef, useState } from 'react'
import { Upload } from 'lucide-react'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { useGiftCardStore } from '@/store/useGiftCardStore'
import { parseCsv } from '@/utils/csv/csvParser'
import { normalizeGiftCards } from '@/utils/giftCards'

export function GiftCardCsvImport() {
  const bulkReplace = useGiftCardStore((s) => s.bulkReplace)
  const cards = useGiftCardStore((s) => s.cards)
  const inputRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState<string | null>(null)

  async function handleFile(file: File) {
    setMessage(null)
    const { rows } = parseCsv(await file.text())
    const imported = normalizeGiftCards(rows)
    if (imported.length === 0) {
      setMessage('No gift cards found in that file.')
      return
    }
    // Cards with an id already present are replaced; others are added.
    const ids = new Set(imported.map((c) => c.id))
    await bulkReplace([...imported, ...cards.filter((c) => !ids.has(c.id))])
    setMessage(`Imported ${imported.length} gift card${imported.length === 1 ? '' : 's'}.`)
  }

  return (
    <Card>
      <h3 className="mb-3 text-sm font-semibold text-slate-700">Import Gift Cards (CSV)</h3>
      <p className="mb-3 text-xs text-slate-500">
        Use a file from “Gift Cards CSV” export (columns: id, purpose, cardNumber, expirationType,
        expirationDate, otherInfo, total, remaining). Existing cards with the same id are updated.
      </p>
      <Button variant="secondary" onClick={() => inputRef.current?.click()}>
        <Upload size={16} />
        Choose Gift Cards CSV
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) void handleFile(file)
          e.target.value = ''
        }}
      />
      {message && <p className="mt-2 text-sm text-slate-600">{message}</p>}
    </Card>
  )
}
