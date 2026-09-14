import { CheckCircle2, Info, X, XCircle } from 'lucide-react'
import { useI18n } from '../../i18n/I18nProvider'
import { useToast, type ToastVariant } from '../../hooks/useToast'

const variantStyles: Record<
  ToastVariant,
  { icon: typeof Info; className: string }
> = {
  success: { icon: CheckCircle2, className: 'border-success-border bg-success-surface' },
  error: { icon: XCircle, className: 'border-error-border bg-error-surface' },
  info: { icon: Info, className: 'border-info-border bg-info-surface' },
}

export function ToastViewport() {
  const { toasts, dismissToast } = useToast()
  const { t } = useI18n()

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex flex-col items-center gap-2 px-4 sm:items-end sm:pe-6"
      aria-live="polite"
    >
      {toasts.map((toast) => {
        const style = variantStyles[toast.variant]
        const Icon = style.icon
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto w-full max-w-sm rounded-xl border p-4 shadow-lg ${style.className}`}
          >
            <div className="flex gap-3">
              <Icon className="mt-0.5 h-5 w-5 shrink-0 text-foreground" />
              <div className="min-w-0 flex-1 text-start">
                <p className="text-sm font-semibold text-foreground">{toast.title}</p>
                {toast.description ? (
                  <p className="mt-1 text-sm text-muted">{toast.description}</p>
                ) : null}
              </div>
              <button
                type="button"
                className="rounded p-1 text-muted hover:bg-surface-hover"
                onClick={() => dismissToast(toast.id)}
                aria-label={t('a11y.dismissNotification')}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
