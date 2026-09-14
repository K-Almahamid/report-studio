import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react'

interface FieldProps {
  label: string
  htmlFor: string
  error?: string
  hint?: string
  children: ReactNode
}

export function Field({ label, htmlFor, error, hint, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
      {hint && !error ? <p className="text-xs text-muted">{hint}</p> : null}
      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </div>
  )
}

export function Input({
  className = '',
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded-lg border border-input-border bg-input-bg px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted focus:border-focus-ring focus:outline-none focus:ring-2 focus:ring-focus-ring disabled:bg-surface-muted ${className}`}
      {...props}
    />
  )
}

export function Select({
  className = '',
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`w-full rounded-lg border border-input-border bg-input-bg px-3 py-2 text-sm text-foreground shadow-sm focus:border-focus-ring focus:outline-none focus:ring-2 focus:ring-focus-ring disabled:bg-surface-muted ${className}`}
      {...props}
    >
      {children}
    </select>
  )
}
