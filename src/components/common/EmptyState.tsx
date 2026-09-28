import type { LucideIcon } from 'lucide-react'
import { Inbox } from 'lucide-react'

interface EmptyStateProps {
  title: string
  description?: string
  icon?: LucideIcon
}

export function EmptyState({ title, description, icon: Icon = Inbox }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
      <Icon className="text-slate-300" size={32} />
      <div className="text-sm font-medium text-slate-500">{title}</div>
      {description && <div className="text-xs text-slate-400">{description}</div>}
    </div>
  )
}
