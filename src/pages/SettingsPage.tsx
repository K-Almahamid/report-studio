import { LogOut } from 'lucide-react'
import { useAccessGate } from '../auth/AccessGateProvider'
import { Button } from '../components/ui/Button'
import { Card, PageHeader } from '../components/ui/PagePrimitives'
import { useI18n } from '../i18n/I18nProvider'

export function SettingsPage() {
  const { t } = useI18n()
  const { logout } = useAccessGate()

  return (
    <>
      <PageHeader title={t('settings.title')} description={t('settings.description')} />

      <div className="grid w-full gap-4">
        <Card>
          <h2 className="text-sm font-semibold text-foreground">{t('settings.accessTitle')}</h2>
          <p className="mt-2 text-sm text-muted">{t('settings.accessBody')}</p>
          <Button variant="secondary" className="mt-4" onClick={logout}>
            <LogOut className="h-4 w-4" />
            {t('settings.logout')}
          </Button>
        </Card>
        <Card>
          <h2 className="text-sm font-semibold text-foreground">{t('settings.storageTitle')}</h2>
          <p className="mt-2 text-sm text-muted">{t('settings.storageBody')}</p>
        </Card>
        <Card>
          <h2 className="text-sm font-semibold text-foreground">{t('settings.offlineTitle')}</h2>
          <p className="mt-2 text-sm text-muted">{t('settings.offlineBody')}</p>
        </Card>
        <Card>
          <h2 className="text-sm font-semibold text-foreground">{t('settings.templatesTitle')}</h2>
          <p className="mt-2 text-sm text-muted">{t('settings.templatesBody')}</p>
        </Card>
      </div>
    </>
  )
}
