import { useState, type FormEvent } from 'react'
import {
  LanguageToggleButton,
  ThemeToggleButton,
} from '../preferences/PreferenceControls'
import { Button } from '../ui/Button'
import { Input } from '../ui/Field'
import { useI18n } from '../../i18n/I18nProvider'

interface PasswordGateScreenProps {
  verify: (password: string) => boolean
  onSuccess: () => void
}

export function PasswordGateScreen({ verify, onSuccess }: PasswordGateScreenProps) {
  const { t } = useI18n()
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    setError(false)
    const ok = verify(password)
    if (ok) {
      setPassword('')
      onSuccess()
    } else {
      setError(true)
      setPassword('')
    }
    setSubmitting(false)
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-app-bg px-4 py-10 sm:px-6">
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-surface p-8 shadow-lg sm:p-10">
        <div className="absolute end-6 top-6 flex items-center gap-2 sm:end-8 sm:top-8">
          <ThemeToggleButton compact />
          <LanguageToggleButton compact />
        </div>

        <div className="pe-24 text-start sm:pe-28">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            {t('app.internalTools')}
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {t('app.title')}
          </h1>
          <p className="mt-3 text-base text-muted">{t('accessGate.description')}</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label htmlFor="access-password" className="block text-sm font-medium text-foreground">
              {t('accessGate.passwordLabel')}
            </label>
            <Input
              id="access-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value)
                if (error) {
                  setError(false)
                }
              }}
              className="py-3 text-base"
            />
            {error ? (
              <p className="text-sm text-danger" role="alert">
                {t('accessGate.error')}
              </p>
            ) : null}
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={submitting || password.length === 0}
          >
            {t('accessGate.submit')}
          </Button>
        </form>
      </div>
    </div>
  )
}
