import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { registerSW } from 'virtual:pwa-register'
import App from './App.tsx'
import { seedDatabaseIfNeeded } from './database/seed.ts'
import { ToastProvider } from './hooks/useToast.tsx'
import { PreferencesProvider } from './theme/PreferencesProvider.tsx'
import { getRouterBasename } from './utils/routerBasename.ts'
import './index.css'

await seedDatabaseIfNeeded()

registerSW({ immediate: true, scope: import.meta.env.BASE_URL })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={getRouterBasename()}>
      <PreferencesProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </PreferencesProvider>
    </BrowserRouter>
  </StrictMode>,
)
