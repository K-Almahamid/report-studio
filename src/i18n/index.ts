import { arMessages } from './ar/messages'
import { enMessages } from './en/messages'
import type { Language, Messages, TranslateParams, TranslationKey } from './types'

const catalogs: Record<Language, Messages> = {
  en: enMessages,
  ar: arMessages,
}

function getNestedValue(source: unknown, path: string): string | undefined {
  const parts = path.split('.')
  let current: unknown = source
  for (const part of parts) {
    if (typeof current !== 'object' || current === null || !(part in current)) {
      return undefined
    }
    current = (current as Record<string, unknown>)[part]
  }
  return typeof current === 'string' ? current : undefined
}

function interpolate(template: string, params?: TranslateParams): string {
  if (!params) {
    return template
  }
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    const value = params[key]
    return value === undefined ? `{{${key}}}` : String(value)
  })
}

export function createTranslator(language: Language) {
  const catalog = catalogs[language]
  return function translate(key: TranslationKey, params?: TranslateParams): string {
    const value = getNestedValue(catalog, key)
    if (!value) {
      const fallback = getNestedValue(enMessages, key)
      return interpolate(fallback ?? key, params)
    }
    return interpolate(value, params)
  }
}

export { enMessages, arMessages }
