import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { FileDown, FileSpreadsheet, Pencil } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card, PageHeader } from '../components/ui/PagePrimitives'
import { incrementReportsGenerated } from '../database/seed'
import { useToast } from '../hooks/useToast'
import { useI18n } from '../i18n/I18nProvider'
import {
  bloodDonationCampaignTypes,
  getChecklistDefinitionById,
} from '../reports/blood-donation/checklist'
import { bloodDonationReportDefinition } from '../reports/blood-donation/definition'
import type { BloodDonationReportData } from '../reports/blood-donation/types'
import { downloadBlob, formatDisplayDate, formatLongDisplayDate } from '../utils/download'

interface PreviewLocationState {
  report?: BloodDonationReportData
}

export function BloodDonationReportPreviewPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { pushToast } = useToast()
  const { t, language } = useI18n()
  const [exporting, setExporting] = useState<'excel' | 'pdf' | null>(null)

  const report = (location.state as PreviewLocationState | null)?.report

  if (!report) {
    return <Navigate to="/reports/blood-donation" replace />
  }

  const campaignTypeLabel =
    bloodDonationCampaignTypes.find((option) => option.value === report.campaignType)?.labelKey ??
    null

  const formattedDate =
    language === 'en' ? formatLongDisplayDate(report.date) : formatDisplayDate(report.date)

  const handleExport = async (type: 'excel' | 'pdf') => {
    setExporting(type)
    try {
      const basename = bloodDonationReportDefinition.buildExportBasename(report)
      if (type === 'excel') {
        const blob = await bloodDonationReportDefinition.generateExcel(report)
        downloadBlob(blob, `${basename}.xlsx`)
      } else {
        const blob = await bloodDonationReportDefinition.generatePdf(report)
        downloadBlob(blob, `${basename}.pdf`)
      }
      await incrementReportsGenerated()
      pushToast({
        variant: 'success',
        title:
          type === 'excel'
            ? t('reports.bloodDonation.preview.toastExcel')
            : t('reports.bloodDonation.preview.toastPdf'),
        description: t('reports.bloodDonation.preview.toastExportDescription'),
      })
    } catch {
      pushToast({
        variant: 'error',
        title: t('reports.bloodDonation.preview.toastExportFailed'),
        description: t('common.tryAgain'),
      })
    } finally {
      setExporting(null)
    }
  }

  return (
    <>
      <PageHeader
        title={t('reports.bloodDonation.preview.title')}
        description={t('reports.bloodDonation.preview.description')}
        actions={
          <>
            <Button
              variant="secondary"
              onClick={() => navigate('/reports/blood-donation', { state: { report } })}
            >
              <Pencil className="h-4 w-4" />
              {t('reports.bloodDonation.preview.edit')}
            </Button>
            <Button
              variant="secondary"
              onClick={() => handleExport('excel')}
              disabled={exporting !== null}
            >
              <FileSpreadsheet className="h-4 w-4" />
              {exporting === 'excel'
                ? t('reports.bloodDonation.preview.exportingExcel')
                : t('reports.bloodDonation.preview.exportExcel')}
            </Button>
            <Button onClick={() => handleExport('pdf')} disabled={exporting !== null}>
              <FileDown className="h-4 w-4" />
              {exporting === 'pdf'
                ? t('reports.bloodDonation.preview.exportingPdf')
                : t('reports.bloodDonation.preview.exportPdf')}
            </Button>
          </>
        }
      />

      <Card className="mx-auto max-w-3xl text-start">
        <div className="border-b border-border-subtle pb-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            {t('reports.bloodDonation.preview.reportLabel')}
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-foreground">{report.campaignName}</h2>
        </div>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted">
              {t('reports.bloodDonation.form.date')}
            </dt>
            <dd className="mt-1 text-base font-medium text-foreground">{formattedDate}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted">
              {t('reports.bloodDonation.form.location')}
            </dt>
            <dd className="mt-1 text-base font-medium text-foreground">{report.location}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs font-medium uppercase tracking-wide text-muted">
              {t('reports.bloodDonation.form.campaignType')}
            </dt>
            <dd className="mt-1 text-base font-medium text-foreground">
              {campaignTypeLabel ? t(campaignTypeLabel) : report.campaignType}
            </dd>
          </div>
        </dl>

        <div className="mt-8">
          <h3 className="text-sm font-semibold text-foreground">
            {t('reports.bloodDonation.preview.team')}
          </h3>
          <ul className="mt-3 space-y-2">
            {report.teamMembers.map((member) => (
              <li key={member.id} className="text-sm text-foreground">
                {member.employeeName} — {member.employeeId}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8">
          <h3 className="text-sm font-semibold text-foreground">
            {t('reports.bloodDonation.preview.checklist')}
          </h3>
          <ul className="mt-3 space-y-2">
            {report.checklist.map((entry) => {
              const definition = getChecklistDefinitionById(entry.itemId)
              const label = definition ? t(definition.labelKey) : entry.itemId
              return (
                <li key={entry.itemId} className="flex items-center gap-2 text-sm text-foreground">
                  <span aria-hidden="true">{entry.checked ? '✓' : '✗'}</span>
                  <span>{label}</span>
                </li>
              )
            })}
          </ul>
          <p className="mt-4 text-xs text-muted">
            {t('reports.bloodDonation.preview.completionStatus', {
              complete: report.checklist.filter((entry) => entry.checked).length,
              total: report.checklist.length,
            })}
          </p>
        </div>

        <p className="mt-8 text-xs text-muted">{t('reports.bloodDonation.preview.footnote')}</p>
      </Card>
    </>
  )
}
