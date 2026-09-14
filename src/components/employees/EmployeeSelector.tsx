import { useMemo } from 'react'
import { Field, Input } from '../ui/Field'
import { SearchableDropdown } from '../ui/ExpandableSearchMenu'
import { useEmployees } from '../../hooks/useEmployees'
import { useI18n } from '../../i18n/I18nProvider'
import type { Employee } from '../../types/employee'
import { LoadingBlock } from '../ui/PagePrimitives'

interface EmployeeSelectorProps {
  value: number | ''
  onChange: (employee: Employee | null) => void
  error?: string
}

export function EmployeeSelector({ value, onChange, error }: EmployeeSelectorProps) {
  const { employees, loading } = useEmployees()
  const { t } = useI18n()

  const options = useMemo(
    () =>
      employees
        .filter((employee): employee is Employee & { id: number } => employee.id != null)
        .map((employee) => ({
          value: employee.id,
          label: `${employee.name} — ${employee.employeeId}`,
        })),
    [employees],
  )

  if (loading) {
    return <LoadingBlock label={t('employees.loadingEmployees')} />
  }

  return (
    <SearchableDropdown
      id="employeeId"
      label={t('employees.employeeField')}
      placeholder={t('employees.selectPlaceholder')}
      searchPlaceholder={t('employees.searchPlaceholder')}
      options={options}
      value={value}
      onChange={(id) => {
        const employee = employees.find((row) => row.id === id) ?? null
        onChange(employee)
      }}
      error={error}
      noResultsLabel={t('employees.noMatchesTitle')}
    />
  )
}

interface EmployeeIdDisplayProps {
  employeeId: string
}

export function EmployeeIdDisplay({ employeeId }: EmployeeIdDisplayProps) {
  const { t } = useI18n()

  return (
    <Field label={t('employees.employeeId')} htmlFor="employeeIdDisplay">
      <Input id="employeeIdDisplay" value={employeeId} readOnly aria-readonly="true" />
    </Field>
  )
}

interface EmployeeNameDisplayProps {
  employeeName: string
}

export function EmployeeNameDisplay({ employeeName }: EmployeeNameDisplayProps) {
  const { t } = useI18n()

  return (
    <Field label={t('employees.employeeName')} htmlFor="employeeNameDisplay">
      <Input id="employeeNameDisplay" value={employeeName} readOnly aria-readonly="true" />
    </Field>
  )
}
