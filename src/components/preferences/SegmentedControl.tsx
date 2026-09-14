import type { ReactNode } from 'react'

export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
}: {
  value: T
  options: { value: T; label: ReactNode }[]
  onChange: (value: T) => void
  ariaLabel: string
}) {
  return (
    <div
      className="inline-flex rounded-lg border border-border bg-surface-muted p-1"
      role="group"
      aria-label={ariaLabel}
    >
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              active
                ? 'bg-primary text-primary-fg shadow-sm'
                : 'text-muted hover:bg-surface-hover hover:text-foreground'
            }`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
