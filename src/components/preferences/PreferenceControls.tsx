import { Languages, Moon, Sun } from 'lucide-react'
import { useI18n } from '../../i18n/I18nProvider'
import { usePreferences } from '../../theme/PreferencesProvider'
import type { Language } from '../../i18n/types'
import type { ThemeMode } from '../../theme/preferences'
import { Button } from '../ui/Button'
import { SegmentedControl } from './SegmentedControl'

export function ThemeToggleButton({ compact = false }: { compact?: boolean }) {
  const { theme, setTheme } = usePreferences()
  const { t } = useI18n()

  const nextTheme: ThemeMode = theme === 'dark' ? 'light' : 'dark'
  const Icon = theme === 'dark' ? Sun : Moon

  return (
    <Button
      variant="secondary"
      size={compact ? 'sm' : 'md'}
      aria-label={t('preferences.toggleTheme')}
      onClick={() => setTheme(nextTheme)}
    >
      <Icon className="h-4 w-4" />
      {!compact ? (
        <span>{theme === 'dark' ? t('preferences.themeDark') : t('preferences.themeLight')}</span>
      ) : null}
    </Button>
  )
}

export function LanguageToggleButton({ compact = false }: { compact?: boolean }) {
  const { language, setLanguage } = usePreferences()
  const { t } = useI18n()

  const nextLanguage: Language = language === 'en' ? 'ar' : 'en'

  return (
    <Button
      variant="secondary"
      size={compact ? 'sm' : 'md'}
      aria-label={t('preferences.toggleLanguage')}
      onClick={() => setLanguage(nextLanguage)}
    >
      <Languages className="h-4 w-4" />
      {!compact ? (
        <span>{language === 'en' ? t('preferences.languageAr') : t('preferences.languageEn')}</span>
      ) : null}
    </Button>
  )
}

export function AppHeaderControls({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <ThemeToggleButton compact={compact} />
      <LanguageToggleButton compact={compact} />
    </div>
  )
}

export function AppearanceSettings() {
  const { theme, setTheme, language, setLanguage } = usePreferences()
  const { t } = useI18n()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-semibold text-foreground">{t('settings.appearance')}</h2>
        <p className="mt-1 text-sm text-muted">{t('preferences.theme')}</p>
        <div className="mt-3">
          <SegmentedControl
            ariaLabel={t('preferences.theme')}
            value={theme}
            onChange={setTheme}
            options={[
              { value: 'dark', label: t('preferences.themeDark') },
              { value: 'light', label: t('preferences.themeLight') },
            ]}
          />
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-foreground">{t('settings.languageSection')}</h2>
        <p className="mt-1 text-sm text-muted">{t('preferences.language')}</p>
        <div className="mt-3">
          <SegmentedControl
            ariaLabel={t('preferences.language')}
            value={language}
            onChange={setLanguage}
            options={[
              { value: 'en', label: t('preferences.languageEn') },
              { value: 'ar', label: t('preferences.languageAr') },
            ]}
          />
        </div>
      </div>
    </div>
  )
}
