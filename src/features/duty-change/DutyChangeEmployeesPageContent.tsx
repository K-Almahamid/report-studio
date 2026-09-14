import { useMemo, useRef, useState } from 'react'
import { FileDown, FileUp, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { db } from '../../database/db'
import { useStaffPermissions } from '../../auth/permissions'
import type { DutyChangeEmployee } from '../../types/dutyChange'
import { useDutyChangeEmployees } from '../../hooks/useDutyChangeEmployees'
import { useToast } from '../../hooks/useToast'
import { useI18n } from '../../i18n/I18nProvider'
import type { TranslationKey } from '../../i18n/types'
import { Button } from '../../components/ui/Button'
import { Field, Input } from '../../components/ui/Field'
import { ConfirmDialog, Modal } from '../../components/ui/Modal'
import { EmptyState, LoadingBlock, PageHeader } from '../../components/ui/PagePrimitives'
import { downloadBlob } from '../../utils/download'
import { parseStaffRosterWorkbook } from '../staff/staffRosterImport'
import { exportDutyChangeStaffToExcel } from './exportDutyChangeStaffExcel'
import { importDutyChangeStaffRosterRows } from './importDutyChangeStaffRoster'
import {
  clearCurrentDutyChangeStaffId,
  readCurrentDutyChangeStaffId,
} from './currentStaff'

interface StaffFormState {
  staffName: string
  staffNumber: string
}

type StaffFormErrors = Partial<Record<keyof StaffFormState, TranslationKey>>

function validateStaffForm(
  form: StaffFormState,
  existing: DutyChangeEmployee[],
  editingId?: number,
): StaffFormErrors {
  const errors: StaffFormErrors = {}
  if (!form.staffName.trim()) {
    errors.staffName = 'dutyChange.employees.validation.staffNameRequired'
  }
  if (!form.staffNumber.trim()) {
    errors.staffNumber = 'dutyChange.employees.validation.staffNumberRequired'
  } else {
    const duplicate = existing.some(
      (row) =>
        row.staffNumber.toLowerCase() === form.staffNumber.trim().toLowerCase() &&
        row.id !== editingId,
    )
    if (duplicate) {
      errors.staffNumber = 'dutyChange.employees.validation.staffNumberDuplicate'
    }
  }
  return errors
}

export function DutyChangeEmployeesPageContent() {
  const permissions = useStaffPermissions()
  const { employees, loading } = useDutyChangeEmployees()
  const { pushToast } = useToast()
  const { t } = useI18n()
  const [query, setQuery] = useState('')
  const [importing, setImporting] = useState(false)
  const [exporting, setExporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<DutyChangeEmployee | null>(null)
  const [form, setForm] = useState<StaffFormState>({ staffName: '', staffNumber: '' })
  const [formErrors, setFormErrors] = useState<StaffFormErrors>({})
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<DutyChangeEmployee | null>(null)
  const [deleting, setDeleting] = useState(false)

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) {
      return employees
    }
    return employees.filter(
      (employee) =>
        employee.staffName.toLowerCase().includes(normalized) ||
        employee.staffNumber.toLowerCase().includes(normalized),
    )
  }, [employees, query])

  const openCreate = () => {
    setEditing(null)
    setForm({ staffName: '', staffNumber: '' })
    setFormErrors({})
    setModalOpen(true)
  }

  const openEdit = (employee: DutyChangeEmployee) => {
    setEditing(employee)
    setForm({ staffName: employee.staffName, staffNumber: employee.staffNumber })
    setFormErrors({})
    setModalOpen(true)
  }

  const saveStaff = async () => {
    const errors = validateStaffForm(form, employees, editing?.id)
    setFormErrors(errors)
    if (Object.keys(errors).length > 0) {
      return
    }

    setSaving(true)
    try {
      const payload = {
        staffName: form.staffName.trim(),
        staffNumber: form.staffNumber.trim(),
      }
      if (editing?.id) {
        await db.dutyChangeEmployees.update(editing.id, payload)
        pushToast({ variant: 'success', title: t('dutyChange.employees.toastUpdated') })
      } else {
        await db.dutyChangeEmployees.add(payload)
        pushToast({ variant: 'success', title: t('dutyChange.employees.toastAdded') })
      }
      setModalOpen(false)
    } catch {
      pushToast({
        variant: 'error',
        title: t('dutyChange.employees.toastSaveFailed'),
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
      await db.dutyChangeEmployees.delete(deleteTarget.id)
      if (readCurrentDutyChangeStaffId() === deleteTarget.id) {
        clearCurrentDutyChangeStaffId()
      }
      pushToast({ variant: 'success', title: t('dutyChange.employees.toastDeleted') })
      setDeleteTarget(null)
    } catch {
      pushToast({
        variant: 'error',
        title: t('dutyChange.employees.toastDeleteFailed'),
        description: t('common.tryAgain'),
      })
    } finally {
      setDeleting(false)
    }
  }

  const handleImportFile = async (file: File) => {
    setImporting(true)
    try {
      const buffer = await file.arrayBuffer()
      const parsed = await parseStaffRosterWorkbook(buffer)
      const summary = await importDutyChangeStaffRosterRows(parsed.rows)
      const issueCount = parsed.issues.length
      pushToast({
        variant: issueCount > 0 ? 'info' : 'success',
        title: t('dutyChange.employees.toastImported'),
        description: t('dutyChange.employees.toastImportedDescription', {
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
        title: t('dutyChange.employees.toastImportFailed'),
        description:
          code === 'MISSING_COLUMNS'
            ? t('dutyChange.employees.importMissingColumns')
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
    setExporting(true)
    try {
      const rows = await db.dutyChangeEmployees.orderBy('staffName').toArray()
      const blob = await exportDutyChangeStaffToExcel(rows)
      downloadBlob(blob, 'duty-change-staff-roster.xlsx')
      pushToast({ variant: 'success', title: t('dutyChange.employees.toastExported') })
    } catch {
      pushToast({
        variant: 'error',
        title: t('dutyChange.employees.toastExportFailed'),
        description: t('common.tryAgain'),
      })
    } finally {
      setExporting(false)
    }
  }

  return (
    <>
      <PageHeader
        title={t('dutyChange.employees.title')}
        description={t('dutyChange.employees.description')}
      />

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
          <Field label={t('employees.searchLabel')} htmlFor="duty-staff-search">
            <div className="relative">
              <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <Input
                id="duty-staff-search"
                className="ps-9"
                placeholder={t('dutyChange.employees.searchPlaceholder')}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
          </Field>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {permissions.canImport ? (
            <Button
              variant="secondary"
              disabled={importing}
              onClick={() => fileInputRef.current?.click()}
            >
              <FileUp className="h-4 w-4" />
              {importing ? t('common.working') : t('dutyChange.employees.importExcel')}
            </Button>
          ) : null}
          {permissions.canExport ? (
            <Button variant="secondary" disabled={exporting} onClick={() => void handleExport()}>
              <FileDown className="h-4 w-4" />
              {exporting ? t('common.working') : t('dutyChange.employees.exportExcel')}
            </Button>
          ) : null}
          {permissions.canCreate ? (
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" />
              {t('dutyChange.employees.add')}
            </Button>
          ) : null}
        </div>
      </div>

      {loading ? (
        <LoadingBlock label={t('common.loading')} />
      ) : employees.length === 0 ? (
        <EmptyState
          title={t('dutyChange.employees.emptyTitle')}
          description={t('dutyChange.employees.emptyDescription')}
          action={
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" />
              {t('dutyChange.employees.add')}
            </Button>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={t('dutyChange.employees.noMatchesTitle')}
          description={t('dutyChange.employees.noMatchesDescription')}
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
          <table className="min-w-full divide-y divide-border text-sm">
            <thead className="bg-surface-muted">
              <tr>
                <th scope="col" className="px-4 py-3 text-start font-medium text-muted">
                  {t('dutyChange.fields.staffName')}
                </th>
                <th scope="col" className="px-4 py-3 text-start font-medium text-muted">
                  {t('dutyChange.fields.staffNumber')}
                </th>
                <th scope="col" className="px-4 py-3 text-end font-medium text-muted">
                  {t('employees.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {filtered.map((employee) => (
                <tr key={employee.id} className="hover:bg-surface-hover/80">
                  <td className="px-4 py-3 font-medium text-foreground">{employee.staffName}</td>
                  <td className="px-4 py-3 text-muted">{employee.staffNumber}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(employee)}>
                        <Pencil className="h-4 w-4" />
                        {t('common.edit')}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(employee)}>
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
        title={editing ? t('dutyChange.employees.editStaff') : t('dutyChange.employees.addStaff')}
        description={t('dutyChange.employees.modalDescription')}
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
                  ? t('dutyChange.employees.saveChanges')
                  : t('dutyChange.employees.add')}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field
            label={t('dutyChange.fields.staffName')}
            htmlFor="duty-staff-name"
            error={formErrors.staffName ? t(formErrors.staffName) : undefined}
          >
            <Input
              id="duty-staff-name"
              value={form.staffName}
              onChange={(event) =>
                setForm((current) => ({ ...current, staffName: event.target.value }))
              }
              autoFocus
            />
          </Field>
          <Field
            label={t('dutyChange.fields.staffNumber')}
            htmlFor="duty-staff-number"
            error={formErrors.staffNumber ? t(formErrors.staffNumber) : undefined}
          >
            <Input
              id="duty-staff-number"
              value={form.staffNumber}
              onChange={(event) =>
                setForm((current) => ({ ...current, staffNumber: event.target.value }))
              }
            />
          </Field>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={t('dutyChange.employees.deleteTitle')}
        description={t('dutyChange.employees.deleteDescription', {
          name: deleteTarget?.staffName ?? '',
        })}
        confirmLabel={t('dutyChange.employees.deleteConfirm')}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </>
  )
}
