import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { PreparationChecklistEditor } from '../components/reports/blood-donation/PreparationChecklistEditor'
import { TeamMembersEditor } from '../components/reports/blood-donation/TeamMembersEditor'
import { Button } from '../components/ui/Button'
import { Field, Input, Select } from '../components/ui/Field'
import { Card, PageHeader } from '../components/ui/PagePrimitives'
import { useEmployees } from '../hooks/useEmployees'
import { useI18n } from '../i18n/I18nProvider'
import type { TranslationKey } from '../i18n/types'
import { bloodDonationCampaignTypes } from '../reports/blood-donation/checklist'
import type { BloodDonationReportData } from '../reports/blood-donation/types'
import {
  createSampleBloodDonationReportData,
  syncTeamMembersWithEmployees,
} from '../reports/blood-donation/types'

interface FormErrors {
  campaignName?: TranslationKey
  date?: TranslationKey
  location?: TranslationKey
  campaignType?: TranslationKey
  team?: TranslationKey
  teamMembers?: Record<string, TranslationKey>
}

function validateForm(data: BloodDonationReportData): FormErrors {
  const errors: FormErrors = {}
  if (!data.campaignName.trim()) {
    errors.campaignName = 'reports.bloodDonation.form.validation.campaignNameRequired'
  }
  if (!data.date) {
    errors.date = 'reports.bloodDonation.form.validation.dateRequired'
  }
  if (!data.location.trim()) {
    errors.location = 'reports.bloodDonation.form.validation.locationRequired'
  }
  if (!data.campaignType) {
    errors.campaignType = 'reports.bloodDonation.form.validation.campaignTypeRequired'
  }
  if (data.teamMembers.length === 0) {
    errors.team = 'reports.bloodDonation.form.validation.teamRequired'
  }

  const teamMembers: FormErrors['teamMembers'] = {}
  for (const member of data.teamMembers) {
    if (!member.employeeDbId) {
      teamMembers[member.id] = 'reports.bloodDonation.form.validation.teamMemberRequired'
    }
  }
  if (Object.keys(teamMembers).length > 0) {
    errors.teamMembers = teamMembers
  }

  return errors
}

export function BloodDonationReportPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useI18n()
  const { employees } = useEmployees()
  const [form, setForm] = useState<BloodDonationReportData>(() =>
    createSampleBloodDonationReportData(),
  )
  const [errors, setErrors] = useState<FormErrors>({})
  const [teamSynced, setTeamSynced] = useState(false)

  useEffect(() => {
    const state = location.state as { report?: BloodDonationReportData } | null
    if (state?.report) {
      setForm(state.report)
      setTeamSynced(true)
    }
  }, [location.state])

  useEffect(() => {
    if (teamSynced || employees.length === 0) {
      return
    }
    setForm((current) => syncTeamMembersWithEmployees(current, employees))
    setTeamSynced(true)
  }, [employees, teamSynced])

  const checklistComplete = useMemo(
    () => form.checklist.filter((entry) => entry.checked).length,
    [form.checklist],
  )

  const handleReview = () => {
    const nextErrors = validateForm(form)
    setErrors(nextErrors)
    const hasErrors = Object.values(nextErrors).some((value) => {
      if (!value) {
        return false
      }
      if (typeof value === 'object') {
        return Object.keys(value).length > 0
      }
      return true
    })
    if (hasErrors) {
      return
    }
    navigate('/reports/blood-donation/preview', { state: { report: form } })
  }

  return (
    <>
      <PageHeader
        title={t('reports.bloodDonation.form.title')}
        description={t('reports.bloodDonation.form.description')}
      />

      <div className="flex w-full flex-col gap-6">
        <Card className="w-full space-y-8">
          <section className="space-y-4">
            <div className="text-start">
              <h2 className="text-sm font-semibold text-foreground">
                {t('reports.bloodDonation.form.infoTitle')}
              </h2>
              <p className="text-xs text-muted">{t('reports.bloodDonation.form.infoHint')}</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label={t('reports.bloodDonation.form.campaignName')}
                htmlFor="campaign-name"
                error={errors.campaignName ? t(errors.campaignName) : undefined}
              >
                <Input
                  id="campaign-name"
                  value={form.campaignName}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, campaignName: event.target.value }))
                  }
                />
              </Field>
              <Field
                label={t('reports.bloodDonation.form.date')}
                htmlFor="campaign-date"
                error={errors.date ? t(errors.date) : undefined}
              >
                <Input
                  id="campaign-date"
                  type="date"
                  value={form.date}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, date: event.target.value }))
                  }
                />
              </Field>
              <Field
                label={t('reports.bloodDonation.form.location')}
                htmlFor="campaign-location"
                error={errors.location ? t(errors.location) : undefined}
              >
                <Input
                  id="campaign-location"
                  value={form.location}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, location: event.target.value }))
                  }
                />
              </Field>
              <Field
                label={t('reports.bloodDonation.form.campaignType')}
                htmlFor="campaign-type"
                error={errors.campaignType ? t(errors.campaignType) : undefined}
              >
                <Select
                  id="campaign-type"
                  value={form.campaignType}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      campaignType: event.target.value as BloodDonationReportData['campaignType'],
                    }))
                  }
                >
                  <option value="">{t('reports.bloodDonation.form.campaignTypePlaceholder')}</option>
                  {bloodDonationCampaignTypes.map((option) => (
                    <option key={option.value} value={option.value}>
                      {t(option.labelKey)}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
          </section>

          <TeamMembersEditor
            members={form.teamMembers}
            onChange={(teamMembers) => setForm((current) => ({ ...current, teamMembers }))}
            error={errors.team ? t(errors.team) : undefined}
            memberErrors={
              errors.teamMembers
                ? Object.fromEntries(
                    Object.entries(errors.teamMembers).map(([key, value]) => [key, t(value)]),
                  )
                : undefined
            }
          />

          <PreparationChecklistEditor
            checklist={form.checklist}
            onChange={(checklist) => setForm((current) => ({ ...current, checklist }))}
          />

          <div className="flex justify-end border-t border-border-subtle pt-4">
            <Button onClick={handleReview}>{t('reports.bloodDonation.form.review')}</Button>
          </div>
        </Card>

        <Card className="w-full">
          <h2 className="text-sm font-semibold text-foreground">
            {t('reports.bloodDonation.form.summary')}
          </h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-muted">{t('reports.bloodDonation.form.summaryTeam')}</dt>
              <dd className="font-medium text-foreground">{form.teamMembers.length}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">{t('reports.bloodDonation.form.summaryChecklist')}</dt>
              <dd className="font-medium text-foreground">
                {checklistComplete}/{form.checklist.length}
              </dd>
            </div>
          </dl>
        </Card>
      </div>
    </>
  )
}
