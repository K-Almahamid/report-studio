import { Link } from 'react-router-dom'
import { ArrowRight, Droplet, Users } from 'lucide-react'
import { operationalReportSummaries } from '../config/navigation'
import { reportDefinitions } from '../reports/registry'
import {
  useEmployeeCount,
  useReportsGeneratedCount,
} from '../hooks/useEmployees'
import { useI18n } from '../i18n/I18nProvider'
import { Button } from '../components/ui/Button'
import {
  Card,
  LoadingBlock,
  PageHeader,
  StatCard,
} from '../components/ui/PagePrimitives'

export function DashboardPage() {
  const { t } = useI18n()
  const { count: employeeCount, loading: employeesLoading } = useEmployeeCount()
  const { count: reportsGenerated, loading: reportsLoading } = useReportsGeneratedCount()

  const statsLoading = employeesLoading || reportsLoading

  return (
    <>
      <PageHeader
        title={t('dashboard.title')}
        description={t('dashboard.description')}
      />

      {statsLoading ? (
        <LoadingBlock label={t('dashboard.loading')} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard
            label={t('dashboard.stats.employees')}
            value={employeeCount}
            hint={t('dashboard.stats.employeesHint')}
          />
          <StatCard
            label={t('dashboard.stats.campaignReports')}
            value={reportDefinitions.length}
            hint={t('dashboard.stats.campaignReportsHint')}
          />
          <StatCard
            label={t('dashboard.stats.reportsGenerated')}
            value={reportsGenerated}
            hint={t('dashboard.stats.reportsGeneratedHint')}
          />
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <h2 className="text-base font-semibold text-foreground">
            {t('dashboard.quickActions.title')}
          </h2>
          <p className="mt-1 text-sm text-muted">{t('dashboard.quickActions.description')}</p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link to="/reports/blood-donation" className="inline-flex">
              <Button className="w-full sm:w-auto">
                <Droplet className="h-4 w-4" />
                {t('dashboard.quickActions.newBloodDonation')}
              </Button>
            </Link>
            <Link to="/employees" className="inline-flex">
              <Button variant="secondary" className="w-full sm:w-auto">
                <Users className="h-4 w-4" />
                {t('dashboard.quickActions.manageEmployees')}
              </Button>
            </Link>
            <Link to="/reports/blood-donation" className="inline-flex">
              <Button variant="ghost" className="w-full sm:w-auto">
                {t('dashboard.quickActions.viewReports')}
                <ArrowRight className="h-4 w-4 rtl:-scale-x-100" />
              </Button>
            </Link>
          </div>
        </Card>

        <Card>
          <h2 className="text-base font-semibold text-foreground">
            {t('dashboard.operationalReports.title')}
          </h2>
          <ul className="mt-4 space-y-3">
            {operationalReportSummaries.map((report) => {
              const Icon = report.icon
              return (
                <li
                  key={report.id}
                  className="flex items-start gap-3 rounded-lg border border-border-subtle p-3"
                >
                  <div className="rounded-md bg-surface-muted p-2">
                    <Icon className="h-4 w-4 text-foreground" />
                  </div>
                  <div className="min-w-0 flex-1 text-start">
                    <p className="font-medium text-foreground">{t(report.nameKey)}</p>
                    <p className="mt-1 text-xs text-muted">{t(report.descriptionKey)}</p>
                    <Link
                      to={report.route}
                      className="mt-2 inline-block text-xs font-medium text-foreground underline-offset-2 hover:underline"
                    >
                      {t('dashboard.operationalReports.open')}
                    </Link>
                  </div>
                </li>
              )
            })}
          </ul>
        </Card>
      </div>
    </>
  )
}
