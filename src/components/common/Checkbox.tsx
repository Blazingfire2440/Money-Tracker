import type { InputHTMLAttributes } from 'react'
import clsx from 'clsx'

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
}

export function Checkbox({ label, className, id, ...props }: CheckboxProps) {
  const checkboxId = id ?? label.replace(/\s+/g, '-').toLowerCase()
  return (
    <div className="flex items-center gap-2">
      <input
        id={checkboxId}
        type="checkbox"
        className={clsx(
          'h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500',
          className,
        )}
        {...props}
      />
      <label htmlFor={checkboxId} className="text-sm text-slate-700">
        {label}
      </label>
    </div>
  )
}
