import { useMemo, useState } from 'react'
import { Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { db } from '../../database/db'
import type { Employee } from '../../types/employee'
import { useEmployees } from '../../hooks/useEmployees'
import { useToast } from '../../hooks/useToast'
import { useI18n } from '../../i18n/I18nProvider'
import type { TranslationKey } from '../../i18n/types'
import { Button } from '../../components/ui/Button'
import { Field, Input } from '../../components/ui/Field'
import { ConfirmDialog, Modal } from '../../components/ui/Modal'
import {
  EmptyState,
  LoadingBlock,
  PageHeader,
} from '../../components/ui/PagePrimitives'

interface EmployeeFormState {
  name: string
  employeeId: string
}

function validateEmployee(
  form: EmployeeFormState,
  existing: Employee[],
  editingId?: number,
): Partial<Record<keyof EmployeeFormState, TranslationKey>> {
  const errors: Partial<Record<keyof EmployeeFormState, TranslationKey>> = {}
  if (!form.name.trim()) {
    errors.name = 'employees.validation.nameRequired'
  }
  if (!form.employeeId.trim()) {
    errors.employeeId = 'employees.validation.employeeIdRequired'
  } else {
    const duplicate = existing.some(
      (employee) =>
        employee.employeeId.toLowerCase() === form.employeeId.trim().toLowerCase() &&
        employee.id !== editingId,
    )
    if (duplicate) {
      errors.employeeId = 'employees.validation.employeeIdDuplicate'
    }
  }
  return errors
}

export function EmployeesPageContent() {
  const { employees, loading } = useEmployees()
  const { pushToast } = useToast()
  const { t } = useI18n()
  const [query, setQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Employee | null>(null)
  const [form, setForm] = useState<EmployeeFormState>({ name: '', employeeId: '' })
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof EmployeeFormState, TranslationKey>>
  >({})
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null)
  const [deleting, setDeleting] = useState(false)

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) {
      return employees
    }
    return employees.filter(
      (employee) =>
        employee.name.toLowerCase().includes(normalized) ||
        employee.employeeId.toLowerCase().includes(normalized),
    )
  }, [employees, query])

  const openCreate = () => {
    setEditing(null)
    setForm({ name: '', employeeId: '' })
    setFormErrors({})
    setModalOpen(true)
  }

  const openEdit = (employee: Employee) => {
    setEditing(employee)
    setForm({ name: employee.name, employeeId: employee.employeeId })
    setFormErrors({})
    setModalOpen(true)
  }

  const saveEmployee = async () => {
    const errors = validateEmployee(form, employees, editing?.id)
    setFormErrors(errors)
    if (Object.keys(errors).length > 0) {
      return
    }

    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        employeeId: form.employeeId.trim().toUpperCase(),
      }
      if (editing?.id) {
        await db.employees.update(editing.id, payload)
        pushToast({ variant: 'success', title: t('employees.toastUpdated') })
      } else {
        await db.employees.add(payload)
        pushToast({ variant: 'success', title: t('employees.toastAdded') })
      }
      setModalOpen(false)
    } catch {
      pushToast({
        variant: 'error',
        title: t('employees.toastSaveFailed'),
        description: t('common.tryAgain'),
      })
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget?.id) {
      return
    }
    setDeleting(true)
    try {
      await db.employees.delete(deleteTarget.id)
      pushToast({ variant: 'success', title: t('employees.toastDeleted') })
      setDeleteTarget(null)
    } catch {
      pushToast({
        variant: 'error',
        title: t('employees.toastDeleteFailed'),
        description: t('common.tryAgain'),
      })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <PageHeader
        title={t('employees.title')}
        description={t('employees.description')}
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            {t('employees.add')}
          </Button>
        }
      />

      <div className="mb-4">
        <Field label={t('employees.searchLabel')} htmlFor="employee-search">
          <div className="relative">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              id="employee-search"
              className="ps-9"
              placeholder={t('employees.searchPlaceholder')}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </Field>
      </div>

      {loading ? (
        <LoadingBlock label={t('common.loading')} />
      ) : employees.length === 0 ? (
        <EmptyState
          title={t('employees.emptyTitle')}
          description={t('employees.emptyDescription')}
          action={
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" />
              {t('employees.add')}
            </Button>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={t('employees.noMatchesTitle')}
          description={t('employees.noMatchesDescription')}
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
          <table className="min-w-full divide-y divide-border text-sm">
            <thead className="bg-surface-muted">
              <tr>
                <th scope="col" className="px-4 py-3 text-start font-medium text-muted">
                  {t('employees.name')}
                </th>
                <th scope="col" className="px-4 py-3 text-start font-medium text-muted">
                  {t('employees.employeeId')}
                </th>
                <th scope="col" className="px-4 py-3 text-end font-medium text-muted">
                  {t('employees.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {filtered.map((employee) => (
                <tr key={employee.id} className="hover:bg-surface-hover/80">
                  <td className="px-4 py-3 font-medium text-foreground">{employee.name}</td>
                  <td className="px-4 py-3 text-muted">{employee.employeeId}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label={t('employees.a11y.edit', { name: employee.name })}
                        onClick={() => openEdit(employee)}
                      >
                        <Pencil className="h-4 w-4" />
                        {t('common.edit')}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label={t('employees.a11y.delete', { name: employee.name })}
                        onClick={() => setDeleteTarget(employee)}
                      >
                        <Trash2 className="h-4 w-4 text-danger" />
                        {t('common.delete')}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={modalOpen}
        title={editing ? t('employees.editEmployee') : t('employees.addEmployee')}
        description={t('employees.modalDescription')}
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)} disabled={saving}>
              {t('common.cancel')}
            </Button>
            <Button onClick={saveEmployee} disabled={saving}>
              {saving
                ? t('common.saving')
                : editing
                  ? t('employees.saveChanges')
                  : t('employees.add')}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field
            label={t('employees.name')}
            htmlFor="employee-name"
            error={formErrors.name ? t(formErrors.name) : undefined}
          >
            <Input
              id="employee-name"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              autoFocus
            />
          </Field>
          <Field
            label={t('employees.employeeId')}
            htmlFor="employee-code"
            error={formErrors.employeeId ? t(formErrors.employeeId) : undefined}
          >
            <Input
              id="employee-code"
              value={form.employeeId}
              onChange={(event) =>
                setForm((current) => ({ ...current, employeeId: event.target.value }))
              }
              placeholder={t('employees.placeholderEmployeeId')}
            />
          </Field>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={t('employees.deleteTitle')}
        description={t('employees.deleteDescription', {
          name: deleteTarget?.name ?? t('employees.employeeField'),
        })}
        confirmLabel={t('employees.deleteConfirm')}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </>
  )
}
