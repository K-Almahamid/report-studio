import { useEffect, useMemo, useState } from 'react'
import { FileDown } from 'lucide-react'
import { db } from '../../database/db'
import {
  createEmptyDutyChangeFormState,
  type DutyChangeFormState,
  type DutyChangeRequestRecord,
} from '../../types/dutyChange'
import { useDutyChangeEmployees } from '../../hooks/useDutyChangeEmployees'
import { useToast } from '../../hooks/useToast'
import { useI18n } from '../../i18n/I18nProvider'
import type { TranslationKey } from '../../i18n/types'
import { Button } from '../../components/ui/Button'
import { Field, Input } from '../../components/ui/Field'
import { Card, LoadingBlock, PageHeader } from '../../components/ui/PagePrimitives'
import { downloadBlob } from '../../utils/download'
import {
  buildDutyChangeExportBasename,
  generateDutyChangeRequestPdf,
} from './generateDutyChangePdf'
import {
  FIXED_REQUESTING_STAFF_NAME,
  FIXED_REQUESTING_STAFF_NUMBER,
} from './fixedRequestingStaff'
import { SearchableStaffSelect } from './SearchableStaffSelect'

type FormErrors = Partial<Record<keyof DutyChangeFormState, TranslationKey>>

function validateForm(form: DutyChangeFormState): FormErrors {
  const errors: FormErrors = {}
  if (!form.assignedDutyArea.trim()) {
    errors.assignedDutyArea = 'dutyChange.validation.assignedAreaRequired'
  }
  if (!form.changedDutyArea.trim()) {
    errors.changedDutyArea = 'dutyChange.validation.changedAreaRequired'
  }
  if (!form.partnerStaffId) {
    errors.partnerStaffId = 'dutyChange.validation.partnerRequired'
  }
  if (!form.reasonForChange.trim()) {
    errors.reasonForChange = 'dutyChange.validation.reasonRequired'
  }
  return errors
}

function ReadonlyField({ label, value, id }: { label: string; value: string; id: string }) {
  return (
    <Field label={label} htmlFor={id}>
      <Input id={id} readOnly value={value} className="bg-surface-muted" tabIndex={-1} />
    </Field>
  )
}

export function DutyChangeFormPageContent() {
  const { employees, loading } = useDutyChangeEmployees()
  const { pushToast } = useToast()
  const { t } = useI18n()
  const [form, setForm] = useState<DutyChangeFormState>(() => createEmptyDutyChangeFormState())
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)

  const requestingStaff = useMemo(
    () =>
      employees.find((row) => row.staffNumber === FIXED_REQUESTING_STAFF_NUMBER) ??
      employees.find(
        (row) => row.staffName.toLowerCase() === FIXED_REQUESTING_STAFF_NAME.toLowerCase(),
      ) ??
      null,
    [employees],
  )

  useEffect(() => {
    if (loading || requestingStaff?.id) {
      return
    }
    void db.dutyChangeEmployees.add({
      staffName: FIXED_REQUESTING_STAFF_NAME,
      staffNumber: FIXED_REQUESTING_STAFF_NUMBER,
    })
  }, [loading, requestingStaff?.id])

  const acceptingStaff = useMemo(
    () => employees.find((row) => row.id === form.partnerStaffId) ?? null,
    [employees, form.partnerStaffId],
  )

  const partnerOptions = useMemo(
    () => employees.filter((row) => row.staffNumber !== FIXED_REQUESTING_STAFF_NUMBER),
    [employees],
  )

  const patchForm = (patch: Partial<DutyChangeFormState>) => {
    setForm((current) => ({ ...current, ...patch }))
  }

  const submit = async () => {
    const requester =
      requestingStaff ??
      (await db.dutyChangeEmployees
        .where('staffNumber')
        .equals(FIXED_REQUESTING_STAFF_NUMBER)
        .first())

    if (!requester?.id) {
      pushToast({
        variant: 'error',
        title: t('dutyChange.form.toastProfileRequired'),
      })
      return
    }

    const nextErrors = validateForm(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      return
    }

    if (!acceptingStaff?.id) {
      return
    }

    setSubmitting(true)
    try {
      const record: DutyChangeRequestRecord = {
        createdAt: new Date().toISOString(),
        requestingStaffId: requester.id,
        requestingStaffName: requester.staffName,
        requestingStaffNumber: requester.staffNumber,
        assignedDutyArea: form.assignedDutyArea.trim(),
        assignedDutyTime: form.assignedDutyTime.trim() || undefined,
        assignedDutyDate: form.assignedDutyDate || undefined,
        changedDutyArea: form.changedDutyArea.trim(),
        changedDutyTime: form.changedDutyTime.trim() || undefined,
        changedDutyDate: form.changedDutyDate || undefined,
        reasonForChange: form.reasonForChange.trim(),
        partnerStaffId: acceptingStaff.id,
        partnerStaffName: acceptingStaff.staffName,
        partnerStaffNumber: acceptingStaff.staffNumber,
      }

      await db.dutyChangeRequests.add(record)
      const blob = await generateDutyChangeRequestPdf(record)
      downloadBlob(blob, `${buildDutyChangeExportBasename(record)}.pdf`)

      pushToast({
        variant: 'success',
        title: t('dutyChange.form.toastSaved'),
        description: t('dutyChange.form.toastSavedDescription'),
      })
      setForm(createEmptyDutyChangeFormState())
      setErrors({})
    } catch {
      pushToast({
        variant: 'error',
        title: t('dutyChange.form.toastSaveFailed'),
        description: t('common.tryAgain'),
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <LoadingBlock label={t('common.loading')} />
  }

  return (
    <>
      <PageHeader
        title={t('dutyChange.form.title')}
        description={t('dutyChange.form.description')}
        actions={
          <Button onClick={submit} disabled={submitting}>
            <FileDown className="h-4 w-4" />
            {submitting ? t('common.working') : t('dutyChange.form.submit')}
          </Button>
        }
      />

      <div className="grid w-full gap-4 lg:grid-cols-2">
        <Card className="space-y-4 text-start">
          <h2 className="text-sm font-semibold text-foreground">
            {t('dutyChange.form.assignedSection')}
          </h2>
          <Field
            label={t('dutyChange.fields.assignedDutyArea')}
            htmlFor="assigned-area"
            error={errors.assignedDutyArea ? t(errors.assignedDutyArea) : undefined}
          >
            <Input
              id="assigned-area"
              value={form.assignedDutyArea}
              onChange={(event) => patchForm({ assignedDutyArea: event.target.value })}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t('dutyChange.fields.dutyTime')} htmlFor="assigned-time">
              <Input
                id="assigned-time"
                type="time"
                value={form.assignedDutyTime}
                onChange={(event) => patchForm({ assignedDutyTime: event.target.value })}
              />
            </Field>
            <Field label={t('dutyChange.fields.dutyDate')} htmlFor="assigned-date">
              <Input
                id="assigned-date"
                type="date"
                value={form.assignedDutyDate}
                onChange={(event) => patchForm({ assignedDutyDate: event.target.value })}
              />
            </Field>
          </div>
        </Card>

        <Card className="space-y-4 text-start">
          <h2 className="text-sm font-semibold text-foreground">
            {t('dutyChange.form.changedSection')}
          </h2>
          <Field
            label={t('dutyChange.fields.changedDutyArea')}
            htmlFor="changed-area"
            error={errors.changedDutyArea ? t(errors.changedDutyArea) : undefined}
          >
            <Input
              id="changed-area"
              value={form.changedDutyArea}
              onChange={(event) => patchForm({ changedDutyArea: event.target.value })}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t('dutyChange.fields.dutyTime')} htmlFor="changed-time">
              <Input
                id="changed-time"
                type="time"
                value={form.changedDutyTime}
                onChange={(event) => patchForm({ changedDutyTime: event.target.value })}
              />
            </Field>
            <Field label={t('dutyChange.fields.dutyDate')} htmlFor="changed-date">
              <Input
                id="changed-date"
                type="date"
                value={form.changedDutyDate}
                onChange={(event) => patchForm({ changedDutyDate: event.target.value })}
              />
            </Field>
          </div>
        </Card>

        <Card className="space-y-4 text-start lg:col-span-2">
          <Field
            label={t('dutyChange.fields.reasonForChange')}
            htmlFor="reason"
            error={errors.reasonForChange ? t(errors.reasonForChange) : undefined}
          >
            <Input
              id="reason"
              value={form.reasonForChange}
              onChange={(event) => patchForm({ reasonForChange: event.target.value })}
            />
          </Field>

          <SearchableStaffSelect
            id="partner-staff"
            label={t('dutyChange.fields.partnerStaff')}
            employees={partnerOptions}
            value={form.partnerStaffId}
            onChange={(staffId) => patchForm({ partnerStaffId: staffId })}
            error={errors.partnerStaffId ? t(errors.partnerStaffId) : undefined}
          />

          <h3 className="pt-2 text-sm font-semibold text-foreground">
            {t('dutyChange.form.acceptingSection')}
          </h3>
          <ReadonlyField
            id="accepting-name"
            label={t('dutyChange.fields.staffName')}
            value={acceptingStaff?.staffName ?? ''}
          />
          <ReadonlyField
            id="accepting-number"
            label={t('dutyChange.fields.staffNumber')}
            value={acceptingStaff?.staffNumber ?? ''}
          />
          <p className="text-xs text-muted">{t('dutyChange.form.acceptingSignatureHint')}</p>
        </Card>
      </div>
    </>
  )
}
