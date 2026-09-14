import { Plus, Trash2 } from 'lucide-react'
import { useMemo } from 'react'
import { useEmployees } from '../../../hooks/useEmployees'
import { useI18n } from '../../../i18n/I18nProvider'
import type { BloodDonationTeamMember } from '../../../reports/blood-donation/types'
import { Button } from '../../ui/Button'
import { SearchableDropdown } from '../../ui/ExpandableSearchMenu'
import { Field } from '../../ui/Field'
import { LoadingBlock } from '../../ui/PagePrimitives'

interface TeamMembersEditorProps {
  members: BloodDonationTeamMember[]
  onChange: (members: BloodDonationTeamMember[]) => void
  error?: string
  memberErrors?: Record<string, string>
}

export function TeamMembersEditor({
  members,
  onChange,
  error,
  memberErrors,
}: TeamMembersEditorProps) {
  const { employees, loading } = useEmployees()
  const { t } = useI18n()

  const usedEmployeeIds = useMemo(
    () => new Set(members.map((member) => member.employeeDbId).filter(Boolean)),
    [members],
  )

  if (loading) {
    return <LoadingBlock label={t('employees.loadingEmployees')} />
  }

  const updateMember = (rowId: string, employeeDbId: number) => {
    const employee = employees.find((row) => row.id === employeeDbId) ?? null
    onChange(
      members.map((member) =>
        member.id === rowId
          ? {
              ...member,
              employeeDbId: employee?.id ?? 0,
              employeeName: employee?.name ?? '',
              employeeId: employee?.employeeId ?? '',
            }
          : member,
      ),
    )
  }

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-start">
          <h2 className="text-sm font-semibold text-foreground">
            {t('reports.bloodDonation.form.teamTitle')}
          </h2>
          <p className="text-xs text-muted">{t('reports.bloodDonation.form.teamHint')}</p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() =>
            onChange([
              ...members,
              {
                id: crypto.randomUUID(),
                employeeDbId: 0,
                employeeName: '',
                employeeId: '',
              },
            ])
          }
        >
          <Plus className="h-4 w-4" />
          {t('reports.bloodDonation.form.addTeamMember')}
        </Button>
      </div>

      {error ? <p className="text-xs text-danger">{error}</p> : null}

      <div className="space-y-3">
        {members.map((member, index) => (
          <div
            key={member.id}
            className="grid gap-3 rounded-lg border border-border p-4 md:grid-cols-[1fr_1fr_1fr_auto]"
          >
            <Field
              label={t('reports.bloodDonation.form.teamMember', { index: index + 1 })}
              htmlFor={`team-member-${member.id}`}
              error={memberErrors?.[member.id]}
            >
              <SearchableDropdown
                embedded
                id={`team-member-${member.id}`}
                placeholder={t('employees.selectPlaceholder')}
                searchPlaceholder={t('employees.searchPlaceholder')}
                options={employees
                  .filter((employee) => employee.id != null)
                  .map((employee) => ({
                    value: employee.id as number,
                    label: `${employee.name} — ${employee.employeeId}`,
                    disabled:
                      usedEmployeeIds.has(employee.id ?? 0) &&
                      employee.id !== member.employeeDbId,
                  }))}
                value={member.employeeDbId || ''}
                onChange={(employeeDbId) => updateMember(member.id, employeeDbId)}
                noResultsLabel={t('employees.noMatchesTitle')}
              />
            </Field>
            <Field label={t('employees.employeeName')} htmlFor={`team-name-${member.id}`}>
              <input
                id={`team-name-${member.id}`}
                readOnly
                value={member.employeeName}
                className="w-full rounded-lg border border-input-border bg-surface-muted px-3 py-2 text-sm text-foreground"
              />
            </Field>
            <Field label={t('employees.employeeId')} htmlFor={`team-code-${member.id}`}>
              <input
                id={`team-code-${member.id}`}
                readOnly
                value={member.employeeId}
                className="w-full rounded-lg border border-input-border bg-surface-muted px-3 py-2 text-sm text-foreground"
              />
            </Field>
            <div className="flex items-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onChange(members.filter((row) => row.id !== member.id))}
                disabled={members.length === 1}
                aria-label={t('reports.bloodDonation.form.removeTeamMember', { index: index + 1 })}
              >
                <Trash2 className="h-4 w-4 text-danger" />
                {t('common.remove')}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
