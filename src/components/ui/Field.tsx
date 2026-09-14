import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react'

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
      {label ? (
        <label htmlFor={htmlFor} className="block text-sm font-medium text-foreground">
          {label}
        </label>
      ) : null}
      {children}
      {hint && !error ? <p className="text-xs text-muted">{hint}</p> : null}
      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </div>
  )
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className = '', ...props }, ref) {
    return (
      <input
        ref={ref}
        className={`w-full rounded-lg border border-input-border bg-input-bg px-3 py-2 text-base text-foreground shadow-sm placeholder:text-muted focus:border-focus-ring focus:outline-none focus:ring-2 focus:ring-focus-ring disabled:bg-surface-muted sm:text-sm ${className}`}
        {...props}
      />
    )
  },
)

export function Select({
  className = '',
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`w-full rounded-lg border border-input-border bg-input-bg px-3 py-2 text-base text-foreground shadow-sm focus:border-focus-ring focus:outline-none focus:ring-2 focus:ring-focus-ring disabled:bg-surface-muted sm:text-sm ${className}`}
      {...props}
    >
      {children}
    </select>
  )
}

export function Textarea({
  className = '',
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`min-h-[5rem] w-full rounded-lg border border-input-border bg-input-bg px-3 py-2 text-base text-foreground shadow-sm placeholder:text-muted focus:border-focus-ring focus:outline-none focus:ring-2 focus:ring-focus-ring disabled:bg-surface-muted sm:text-sm ${className}`}
      {...props}
    />
  )
}
