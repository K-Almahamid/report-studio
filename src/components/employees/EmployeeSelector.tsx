import { Field, Input, Select } from '../ui/Field'
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

  if (loading) {
    return <LoadingBlock label={t('employees.loadingEmployees')} />
  }

  return (
    <Field label={t('employees.employeeField')} htmlFor="employeeId" error={error}>
      <Select
        id="employeeId"
        value={value}
        onChange={(event) => {
          const id = Number.parseInt(event.target.value, 10)
          if (Number.isNaN(id)) {
            onChange(null)
            return
          }
          const employee = employees.find((row) => row.id === id) ?? null
          onChange(employee)
        }}
      >
        <option value="">{t('employees.selectPlaceholder')}</option>
        {employees.map((employee) => (
          <option key={employee.id} value={employee.id}>
            {employee.name} — {employee.employeeId}
          </option>
        ))}
      </Select>
    </Field>
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
