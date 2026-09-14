import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { registerSW } from 'virtual:pwa-register'
import { AccessGateProvider } from './auth/AccessGateProvider.tsx'
import App from './App.tsx'
import { db } from './database/db.ts'
import { seedDatabaseIfNeeded } from './database/seed.ts'
import { ToastProvider } from './hooks/useToast.tsx'
import { PreferencesProvider } from './theme/PreferencesProvider.tsx'
import { getRouterBasename } from './utils/routerBasename.ts'
import './index.css'
import { RouteNavigationEffects } from './routing/RouteNavigationEffects.tsx'

if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual'
}

async function bootstrap() {
  await db.open()
  await seedDatabaseIfNeeded()

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <BrowserRouter basename={getRouterBasename()}>
        <RouteNavigationEffects />
        <PreferencesProvider>
          <ToastProvider>
            <AccessGateProvider>
              <App />
            </AccessGateProvider>
          </ToastProvider>
        </PreferencesProvider>
      </BrowserRouter>
    </StrictMode>,
  )

  registerSW({ immediate: true })
}

void bootstrap()
