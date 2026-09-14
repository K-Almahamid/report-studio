import { useState, type FormEvent } from 'react'
import { AppHeaderControls } from '../preferences/PreferenceControls'
import { Button } from '../ui/Button'
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
    <div className="flex min-h-dvh flex-col bg-app-bg">
      <header className="border-b border-border bg-surface/90 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center justify-end">
          <AppHeaderControls compact />
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-sm">
          <h1 className="text-lg font-semibold text-foreground">{t('accessGate.title')}</h1>
          <p className="mt-2 text-sm text-muted">{t('accessGate.description')}</p>
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="access-password" className="text-sm font-medium text-foreground">
                {t('accessGate.passwordLabel')}
              </label>
              <input
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
                className="mt-2 w-full rounded-lg border border-border bg-app-bg px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
              />
              {error ? (
                <p className="mt-2 text-sm text-danger" role="alert">
                  {t('accessGate.error')}
                </p>
              ) : null}
            </div>
            <Button type="submit" className="w-full" disabled={submitting || password.length === 0}>
              {t('accessGate.submit')}
            </Button>
          </form>
        </div>
      </main>
    </div>
  )
}
