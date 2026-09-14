import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from 'react'
import { createTranslator } from './index'
import type { Language, TranslateParams, TranslationKey } from './types'

interface I18nContextValue {
  language: Language
  t: (key: TranslationKey, params?: TranslateParams) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

export function I18nProvider({
  language,
  children,
}: {
  language: Language
  children: ReactNode
}) {
  const t = useMemo(() => createTranslator(language), [language])
  const value = useMemo(() => ({ language, t }), [language, t])
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider')
  }
  return context
}
