import { db } from '../database/db'
import type { Language } from '../i18n/types'

export type ThemeMode = 'dark' | 'light'

export interface AppPreferences {
  theme: ThemeMode
  language: Language
}

export const THEME_SETTING_KEY = 'theme'
export const LANGUAGE_SETTING_KEY = 'language'

export const LOCAL_THEME_KEY = 'report-studio:theme'
export const LOCAL_LANGUAGE_KEY = 'report-studio:language'

export const DEFAULT_PREFERENCES: AppPreferences = {
  theme: 'dark',
  language: 'en',
}

export function applyPreferencesToDocument(preferences: AppPreferences): void {
  const root = document.documentElement
  root.classList.remove('light', 'dark')
  root.classList.add(preferences.theme)
  root.lang = preferences.language
  root.dir = preferences.language === 'ar' ? 'rtl' : 'ltr'
}

export function readCachedPreferences(): AppPreferences {
  try {
    const theme = localStorage.getItem(LOCAL_THEME_KEY)
    const language = localStorage.getItem(LOCAL_LANGUAGE_KEY)
    return {
      theme: theme === 'light' ? 'light' : 'dark',
      language: language === 'ar' ? 'ar' : 'en',
    }
  } catch {
    return DEFAULT_PREFERENCES
  }
}

export function cachePreferences(preferences: AppPreferences): void {
  try {
    localStorage.setItem(LOCAL_THEME_KEY, preferences.theme)
    localStorage.setItem(LOCAL_LANGUAGE_KEY, preferences.language)
  } catch {
    // Ignore storage failures in private mode.
  }
  applyPreferencesToDocument(preferences)
}

export async function loadPreferencesFromDatabase(): Promise<AppPreferences> {
  const [themeRow, languageRow] = await Promise.all([
    db.settings.get(THEME_SETTING_KEY),
    db.settings.get(LANGUAGE_SETTING_KEY),
  ])

  return {
    theme: themeRow?.value === 'light' ? 'light' : DEFAULT_PREFERENCES.theme,
    language: languageRow?.value === 'ar' ? 'ar' : DEFAULT_PREFERENCES.language,
  }
}

export async function savePreferencesToDatabase(preferences: AppPreferences): Promise<void> {
  await db.settings.bulkPut([
    { key: THEME_SETTING_KEY, value: preferences.theme },
    { key: LANGUAGE_SETTING_KEY, value: preferences.language },
  ])
  cachePreferences(preferences)
}

export async function initializePreferences(): Promise<AppPreferences> {
  const cached = readCachedPreferences()
  applyPreferencesToDocument(cached)

  const stored = await loadPreferencesFromDatabase()
  const hasStoredTheme = Boolean(await db.settings.get(THEME_SETTING_KEY))
  const hasStoredLanguage = Boolean(await db.settings.get(LANGUAGE_SETTING_KEY))

  const merged: AppPreferences = {
    theme: hasStoredTheme ? stored.theme : DEFAULT_PREFERENCES.theme,
    language: hasStoredLanguage ? stored.language : DEFAULT_PREFERENCES.language,
  }

  if (!hasStoredTheme || !hasStoredLanguage) {
    await savePreferencesToDatabase(merged)
  } else if (
    merged.theme !== cached.theme ||
    merged.language !== cached.language
  ) {
    cachePreferences(merged)
  }

  return merged
}
