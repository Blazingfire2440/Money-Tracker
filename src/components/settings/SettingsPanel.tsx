import { useState } from 'react'
import { Card } from '@/components/common/Card'
import { Input } from '@/components/common/Input'
import { Button } from '@/components/common/Button'
import { useSettingsStore } from '@/store/useSettingsStore'

export function SettingsPanel() {
  const settings = useSettingsStore((s) => s.settings)
  const update = useSettingsStore((s) => s.update)

  const [diningPlanTotal, setDiningPlanTotal] = useState(String(settings.diningPlanTotal))
  const [semesterStartDate, setSemesterStartDate] = useState(settings.semesterStartDate)
  const [semesterEndDate, setSemesterEndDate] = useState(settings.semesterEndDate)
  const [monthlyCreditCardBudget, setMonthlyCreditCardBudget] = useState(
    String(settings.monthlyCreditCardBudget),
  )
  const [saved, setSaved] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    void update({
      diningPlanTotal: parseFloat(diningPlanTotal) || 0,
      semesterStartDate,
      semesterEndDate,
      monthlyCreditCardBudget: parseFloat(monthlyCreditCardBudget) || 0,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <Card className="max-w-lg">
      <h3 className="mb-4 text-sm font-semibold text-slate-700">Plan Configuration</h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm text-slate-600">
          Dining Plan Total
          <Input
            type="number"
            step="0.01"
            value={diningPlanTotal}
            onChange={(e) => setDiningPlanTotal(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-slate-600">
          Semester Start Date
          <Input
            type="date"
            value={semesterStartDate}
            onChange={(e) => setSemesterStartDate(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-slate-600">
          Semester End Date
          <Input
            type="date"
            value={semesterEndDate}
            onChange={(e) => setSemesterEndDate(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-slate-600">
          Monthly Credit Card Budget
          <Input
            type="number"
            step="0.01"
            value={monthlyCreditCardBudget}
            onChange={(e) => setMonthlyCreditCardBudget(e.target.value)}
          />
        </label>
        <div className="flex items-center gap-3">
          <Button type="submit">Save Settings</Button>
          {saved && <span className="text-sm text-good-700">Saved</span>}
        </div>
      </form>
    </Card>
  )
}
