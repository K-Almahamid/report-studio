import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import type { DutyChangeEmployee } from '../../types/dutyChange'
import { useI18n } from '../../i18n/I18nProvider'
import { Field, Input, Select } from '../../components/ui/Field'

interface SearchableStaffSelectProps {
  id: string
  label: string
  employees: DutyChangeEmployee[]
  value: number
  onChange: (staffId: number) => void
  excludeStaffId?: number | null
  error?: string
  disabled?: boolean
}

export function SearchableStaffSelect({
  id,
  label,
  employees,
  value,
  onChange,
  excludeStaffId,
  error,
  disabled = false,
}: SearchableStaffSelectProps) {
  const { t } = useI18n()
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return employees.filter((employee) => {
      if (excludeStaffId && employee.id === excludeStaffId) {
        return false
      }
      if (!normalized) {
        return true
      }
      return (
        employee.staffName.toLowerCase().includes(normalized) ||
        employee.staffNumber.toLowerCase().includes(normalized)
      )
    })
  }, [employees, excludeStaffId, query])

  return (
    <div className="space-y-2">
      <Field label={label} htmlFor={id} error={error}>
        <div className="relative mb-2">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            id={`${id}-search`}
            className="ps-9"
            placeholder={t('dutyChange.searchStaffPlaceholder')}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            disabled={disabled}
          />
        </div>
        <Select
          id={id}
          value={value || ''}
          onChange={(event) => onChange(Number.parseInt(event.target.value, 10) || 0)}
          disabled={disabled}
        >
          <option value="">{t('dutyChange.selectStaffPlaceholder')}</option>
          {filtered.map((employee) => (
            <option key={employee.id} value={employee.id}>
              {employee.staffName} — {employee.staffNumber}
            </option>
          ))}
        </Select>
      </Field>
    </div>
  )
}
