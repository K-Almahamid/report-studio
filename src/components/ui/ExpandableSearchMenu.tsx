import { type ReactNode, useEffect, useId, useMemo, useRef, useState } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import { Field, Input } from './Field'

export const panelMotion =
  'duration-200 ease-out motion-reduce:transition-none motion-reduce:duration-0'

export function CollapsiblePanel({
  open,
  children,
  className = '',
}: {
  open: boolean
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={`grid transition-[grid-template-rows] ${panelMotion} ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'} ${className}`}
      aria-hidden={!open}
    >
      <div className="overflow-hidden">
        <div
          className={`transition-[opacity,transform] ${panelMotion} ${open ? 'translate-y-0 opacity-100' : '-translate-y-1 opacity-0'}`}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

interface ExpandableSearchFieldProps {
  label: string
  htmlFor: string
  placeholder: string
  value: string
  onChange: (value: string) => void
}

export function ExpandableSearchField({
  label,
  htmlFor,
  placeholder,
  value,
  onChange,
}: ExpandableSearchFieldProps) {
  const [open, setOpen] = useState(() => value.length > 0)

  useEffect(() => {
    if (value.length > 0) {
      setOpen(true)
    }
  }, [value])

  return (
    <Field label={label} htmlFor={htmlFor}>
      <button
        type="button"
        className={`flex w-full items-center gap-2 rounded-lg border border-input-border bg-input-bg px-3 py-2 text-sm shadow-sm transition-colors ${panelMotion} hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring`}
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
      >
        <Search className="h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
        <span className={`min-w-0 flex-1 truncate text-start ${value ? 'text-foreground' : 'text-muted'}`}>
          {value || placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted transition-transform ${panelMotion} ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>
      <CollapsiblePanel open={open}>
        <div className="pt-2">
          <div className="relative">
            <Search
              className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
            <Input
              id={htmlFor}
              className="ps-9"
              placeholder={placeholder}
              value={value}
              onChange={(event) => onChange(event.target.value)}
            />
          </div>
        </div>
      </CollapsiblePanel>
    </Field>
  )
}

export interface SearchableDropdownOption {
  value: number
  label: string
  disabled?: boolean
}

interface SearchableDropdownProps {
  id: string
  label?: string
  placeholder: string
  searchPlaceholder: string
  options: SearchableDropdownOption[]
  value: number | ''
  onChange: (value: number) => void
  error?: string
  disabled?: boolean
  noResultsLabel?: string
  /** When true, omits the outer Field wrapper (use inside an existing Field). */
  embedded?: boolean
}

function matchesQuery(label: string, query: string) {
  const normalized = query.trim().toLowerCase()
  if (!normalized) {
    return true
  }
  return label.toLowerCase().includes(normalized)
}

export function SearchableDropdown({
  id,
  label,
  placeholder,
  searchPlaceholder,
  options,
  value,
  onChange,
  error,
  disabled = false,
  noResultsLabel = '',
  embedded = false,
}: SearchableDropdownProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const rootRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const listboxId = useId()

  const selectedLabel = useMemo(() => {
    if (!value) {
      return ''
    }
    return options.find((option) => option.value === value)?.label ?? ''
  }, [options, value])

  const filtered = useMemo(
    () => options.filter((option) => matchesQuery(option.label, query)),
    [options, query],
  )

  useEffect(() => {
    if (!open) {
      return
    }
    const handlePointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [open])

  useEffect(() => {
    if (!open) {
      setQuery('')
    }
  }, [open])

  useEffect(() => {
    if (!open || disabled) {
      return
    }
    searchInputRef.current?.focus()
  }, [open, disabled])

  const selectValue = (next: number) => {
    onChange(next)
    setOpen(false)
  }

  const menu = (
    <>
      <button
        type="button"
        id={id}
        disabled={disabled}
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-input-border bg-input-bg px-3 py-2 text-start text-sm text-foreground shadow-sm transition-colors duration-200 ease-out hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring disabled:bg-surface-muted disabled:opacity-50 motion-reduce:transition-none"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        onClick={() => setOpen((current) => !current)}
      >
        <span className={`min-w-0 truncate ${selectedLabel ? 'text-foreground' : 'text-muted'}`}>
          {selectedLabel || placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted transition-transform ${panelMotion} ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>
      <CollapsiblePanel open={open}>
        <div className="pt-1.5">
          <div className="rounded-lg border border-border bg-surface p-2 shadow-sm">
            <div className="relative mb-2">
              <Search
                className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                aria-hidden="true"
              />
              <Input
                ref={searchInputRef}
                className="ps-9"
                placeholder={searchPlaceholder}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                disabled={disabled}
                aria-label={searchPlaceholder}
              />
            </div>
            <ul
              id={listboxId}
              role="listbox"
              aria-labelledby={id}
              className="max-h-48 space-y-0.5 overflow-y-auto"
            >
              {filtered.length === 0 ? (
                <li className="px-2 py-2 text-sm text-muted">{noResultsLabel || placeholder}</li>
              ) : (
                filtered.map((option) => (
                  <li key={option.value} role="presentation">
                    <button
                      type="button"
                      role="option"
                      aria-selected={value === option.value}
                      disabled={option.disabled}
                      className={`w-full rounded-md px-2 py-2 text-start text-sm transition-colors ${panelMotion} ${
                        value === option.value
                          ? 'bg-nav-active-bg text-nav-active-fg'
                          : 'text-foreground hover:bg-nav-hover-bg'
                      } disabled:cursor-not-allowed disabled:opacity-50`}
                      onClick={() => selectValue(option.value)}
                    >
                      {option.label}
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </CollapsiblePanel>
    </>
  )

  if (embedded) {
    return <div ref={rootRef}>{menu}</div>
  }

  return (
    <div ref={rootRef} className="space-y-0">
      <Field label={label ?? ''} htmlFor={id} error={error}>
        {menu}
      </Field>
    </div>
  )
}
