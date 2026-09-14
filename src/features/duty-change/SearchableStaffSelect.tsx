import { useMemo } from 'react'
import type { DutyChangeEmployee } from '../../types/dutyChange'
import { useI18n } from '../../i18n/I18nProvider'
import { SearchableDropdown } from '../../components/ui/ExpandableSearchMenu'

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

  const options = useMemo(
    () =>
      employees
        .filter((employee) => !excludeStaffId || employee.id !== excludeStaffId)
        .filter((employee) => employee.id != null)
        .map((employee) => ({
          value: employee.id as number,
          label: `${employee.staffName} — ${employee.staffNumber}`,
        })),
    [employees, excludeStaffId],
  )

  return (
    <SearchableDropdown
      id={id}
      label={label}
      placeholder={t('dutyChange.selectStaffPlaceholder')}
      searchPlaceholder={t('dutyChange.searchStaffPlaceholder')}
      options={options}
      value={value || ''}
      onChange={onChange}
      error={error}
      disabled={disabled}
      noResultsLabel={t('employees.noMatchesTitle')}
    />
  )
}
