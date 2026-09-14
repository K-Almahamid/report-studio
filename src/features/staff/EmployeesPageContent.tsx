import { useMemo, useRef, useState } from 'react'
import { FileDown, FileUp, Pencil, Plus, Trash2 } from 'lucide-react'
import { db } from '../../database/db'
import { useStaffPermissions } from '../../auth/permissions'
import type { Employee } from '../../types/employee'
import { useEmployees } from '../../hooks/useEmployees'
import { useToast } from '../../hooks/useToast'
import { useI18n } from '../../i18n/I18nProvider'
import type { TranslationKey } from '../../i18n/types'
import { Button } from '../../components/ui/Button'
import { ExpandableSearchField } from '../../components/ui/ExpandableSearchMenu'
import { Field, Input } from '../../components/ui/Field'
import { ConfirmDialog, Modal } from '../../components/ui/Modal'
import { EmptyState, LoadingBlock, PageHeader } from '../../components/ui/PagePrimitives'
import { Reveal } from '../../motion/Reveal'
import { downloadBlob } from '../../utils/download'
import { exportStaffToExcel } from './exportStaffExcel'
import { importStaffRosterRows } from './importStaffRoster'
import { parseStaffRosterWorkbook } from './staffRosterImport'

interface StaffFormState {
  name: string
  employeeId: string
}

type StaffFormErrors = Partial<Record<keyof StaffFormState, TranslationKey>>

function validateStaffForm(
  form: StaffFormState,
  existing: Employee[],
  editingId?: number,
): StaffFormErrors {
  const errors: StaffFormErrors = {}
  if (!form.name.trim()) {
    errors.name = 'employees.validation.nameRequired'
  }
  if (!form.employeeId.trim()) {
    errors.employeeId = 'employees.validation.employeeIdRequired'
  } else {
    const duplicate = existing.some(
      (row) =>
        row.employeeId.toLowerCase() === form.employeeId.trim().toLowerCase() &&
        row.id !== editingId,
    )
    if (duplicate) {
      errors.employeeId = 'employees.validation.employeeIdDuplicate'
    }
  }
  return errors
}

export function EmployeesPageContent() {
  const permissions = useStaffPermissions()
  const { employees, loading } = useEmployees()
  const { pushToast } = useToast()
  const { t } = useI18n()
  const [query, setQuery] = useState('')
  const [importing, setImporting] = useState(false)
  const [exporting, setExporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Employee | null>(null)
  const [form, setForm] = useState<StaffFormState>({ name: '', employeeId: '' })
  const [formErrors, setFormErrors] = useState<StaffFormErrors>({})
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

  const saveStaff = async () => {
    if (!permissions.canCreate && !editing) {
      return
    }
    if (!permissions.canEdit && editing) {
      return
    }

    const errors = validateStaffForm(form, employees, editing?.id)
    setFormErrors(errors)
    if (Object.keys(errors).length > 0) {
      return
    }

    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        employeeId: form.employeeId.trim(),
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
    if (!deleteTarget?.id || !permissions.canDelete) {
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

  const handleImportFile = async (file: File) => {
    if (!permissions.canImport) {
      return
    }
    setImporting(true)
    try {
      const buffer = await file.arrayBuffer()
      const parsed = await parseStaffRosterWorkbook(buffer)
      const summary = await importStaffRosterRows(parsed.rows)
      const issueCount = parsed.issues.length
      pushToast({
        variant: issueCount > 0 ? 'info' : 'success',
        title: t('employees.toastImported'),
        description: t('employees.toastImportedDescription', {
          created: summary.created,
          updated: summary.updated,
          skipped: summary.skipped,
          invalid: issueCount,
          nameColumn: parsed.nameColumn,
          numberColumn: parsed.numberColumn,
        }),
      })
    } catch (error) {
      const code = error instanceof Error ? error.message : ''
      pushToast({
        variant: 'error',
        title: t('employees.toastImportFailed'),
        description:
          code === 'MISSING_COLUMNS'
            ? t('employees.importMissingColumns')
            : t('common.tryAgain'),
      })
    } finally {
      setImporting(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleExport = async () => {
    if (!permissions.canExport) {
      return
    }
    setExporting(true)
    try {
      const rows = await db.employees.orderBy('name').toArray()
      const blob = await exportStaffToExcel(rows)
      downloadBlob(blob, 'campaign-staff-roster.xlsx')
      pushToast({ variant: 'success', title: t('employees.toastExported') })
    } catch {
      pushToast({
        variant: 'error',
        title: t('employees.toastExportFailed'),
        description: t('common.tryAgain'),
      })
    } finally {
      setExporting(false)
    }
  }

  if (!permissions.canView) {
    return (
      <EmptyState
        title={t('employees.accessDeniedTitle')}
        description={t('employees.accessDeniedDescription')}
      />
    )
  }

  return (
    <>
      <PageHeader title={t('employees.title')} description={t('employees.description')} />

      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) {
            void handleImportFile(file)
          }
        }}
      />

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:gap-4">
        <div className="min-w-0 flex-1">
          <ExpandableSearchField
            label={t('employees.searchLabel')}
            htmlFor="staff-search"
            placeholder={t('employees.searchPlaceholder')}
            value={query}
            onChange={setQuery}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {permissions.canImport ? (
            <Button
              variant="secondary"
              disabled={importing}
              onClick={() => fileInputRef.current?.click()}
            >
              <FileUp className="h-4 w-4" />
              {importing ? t('common.working') : t('employees.importExcel')}
            </Button>
          ) : null}
          {permissions.canExport ? (
            <Button variant="secondary" disabled={exporting} onClick={() => void handleExport()}>
              <FileDown className="h-4 w-4" />
              {exporting ? t('common.working') : t('employees.exportExcel')}
            </Button>
          ) : null}
          {permissions.canCreate ? (
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" />
              {t('employees.add')}
            </Button>
          ) : null}
        </div>
      </div>

      <Reveal mode="inView">
        {loading ? (
          <LoadingBlock label={t('common.loading')} />
        ) : employees.length === 0 ? (
        <EmptyState
          title={t('employees.emptyTitle')}
          description={t('employees.emptyDescription')}
          action={
            permissions.canCreate ? (
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4" />
                {t('employees.add')}
              </Button>
            ) : undefined
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
                  {t('employees.staffNumber')}
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
                      {permissions.canEdit ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          aria-label={t('employees.a11y.edit', { name: employee.name })}
                          onClick={() => openEdit(employee)}
                        >
                          <Pencil className="h-4 w-4" />
                          {t('common.edit')}
                        </Button>
                      ) : null}
                      {permissions.canDelete ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          aria-label={t('employees.a11y.delete', { name: employee.name })}
                          onClick={() => setDeleteTarget(employee)}
                        >
                          <Trash2 className="h-4 w-4 text-danger" />
                          {t('common.delete')}
                        </Button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </Reveal>

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
            <Button onClick={saveStaff} disabled={saving}>
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
            htmlFor="staff-name"
            error={formErrors.name ? t(formErrors.name) : undefined}
          >
            <Input
              id="staff-name"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              autoFocus
            />
          </Field>
          <Field
            label={t('employees.staffNumber')}
            htmlFor="staff-number"
            error={formErrors.employeeId ? t(formErrors.employeeId) : undefined}
          >
            <Input
              id="staff-number"
              value={form.employeeId}
              onChange={(event) =>
                setForm((current) => ({ ...current, employeeId: event.target.value }))
              }
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
