import { Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AppHeaderControls } from '../preferences/PreferenceControls'
import { useI18n } from '../../i18n/I18nProvider'
import { PageMotion } from '../../motion/PageMotion'
import { SidebarNav } from './SidebarNav'
import { ToastViewport } from '../ui/ToastViewport'

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const { t } = useI18n()

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  return (
    <div className="min-h-dvh lg:flex">
      <aside className="hidden w-64 shrink-0 border-e border-border bg-surface lg:block">
        <div className="sticky top-0 flex h-dvh flex-col">
          <div className="border-b border-border-subtle px-5 py-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">
              {t('app.internalTools')}
            </p>
            <h1 className="mt-1 text-lg font-semibold text-foreground">{t('app.title')}</h1>
            <p className="mt-1 text-xs text-muted">{t('app.tagline')}</p>
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-4">
            <SidebarNav />
          </div>
        </div>
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 z-0 bg-overlay"
            aria-label={t('a11y.closeMenu')}
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 start-0 z-10 w-[min(100%,20rem)] bg-surface shadow-xl">
            <div className="flex items-center justify-between border-b border-border-subtle px-4 py-4">
              <div className="min-w-0 text-start">
                <p className="text-sm font-semibold text-foreground">{t('app.title')}</p>
                <p className="text-xs text-muted">{t('app.navigation')}</p>
              </div>
              <button
                type="button"
                className="rounded-lg p-2 hover:bg-surface-hover"
                onClick={() => setMobileOpen(false)}
                aria-label={t('a11y.closeNavigation')}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-3 py-4">
              <SidebarNav />
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-border bg-surface/90 backdrop-blur">
          <div className="flex items-center gap-3 px-4 py-3 lg:px-8">
            <button
              type="button"
              className="rounded-lg border border-border p-2 lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label={t('a11y.openNavigation')}
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0 flex-1 text-start lg:hidden">
              <p className="text-sm font-semibold text-foreground">{t('app.title')}</p>
              <p className="text-xs text-muted">{t('app.taglineShort')}</p>
            </div>
            <div className="ms-auto">
              <AppHeaderControls compact />
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <PageMotion>
            <Outlet />
          </PageMotion>
        </main>
      </div>

      <ToastViewport />
    </div>
  )
}
