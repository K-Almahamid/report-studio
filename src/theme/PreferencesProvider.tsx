import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { I18nProvider } from '../i18n/I18nProvider'
import type { Language } from '../i18n/types'
import {
  cachePreferences,
  initializePreferences,
  savePreferencesToDatabase,
  type AppPreferences,
  type ThemeMode,
} from './preferences'

interface PreferencesContextValue {
  theme: ThemeMode
  language: Language
  setTheme: (theme: ThemeMode) => void
  setLanguage: (language: Language) => void
  ready: boolean
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null)

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<AppPreferences | null>(null)

  useEffect(() => {
    let active = true
    initializePreferences().then((loaded) => {
      if (active) {
        setPreferences(loaded)
      }
    })
    return () => {
      active = false
    }
  }, [])

  const persist = useCallback(async (next: AppPreferences) => {
    setPreferences(next)
    cachePreferences(next)
    await savePreferencesToDatabase(next)
  }, [])

  const setTheme = useCallback(
    (theme: ThemeMode) => {
      setPreferences((current) => {
        if (!current) {
          return current
        }
        const next = { ...current, theme }
        void persist(next)
        return next
      })
    },
    [persist],
  )

  const setLanguage = useCallback(
    (language: Language) => {
      setPreferences((current) => {
        if (!current) {
          return current
        }
        const next = { ...current, language }
        void persist(next)
        return next
      })
    },
    [persist],
  )

  const value = useMemo<PreferencesContextValue>(
    () => ({
      theme: preferences?.theme ?? 'dark',
      language: preferences?.language ?? 'en',
      setTheme,
      setLanguage,
      ready: preferences !== null,
    }),
    [preferences, setTheme, setLanguage],
  )

  if (!preferences) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-app-bg text-muted">
        <div className="flex items-center gap-3 text-sm">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-border border-t-foreground" />
        </div>
      </div>
    )
  }

  return (
    <PreferencesContext.Provider value={value}>
      <I18nProvider language={preferences.language}>{children}</I18nProvider>
    </PreferencesContext.Provider>
  )
}

export function usePreferences() {
  const context = useContext(PreferencesContext)
  if (!context) {
    throw new Error('usePreferences must be used within PreferencesProvider')
  }
  return context
}
