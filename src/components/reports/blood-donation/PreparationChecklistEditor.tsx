import { useI18n } from '../../../i18n/I18nProvider'
import { bloodDonationChecklistItems } from '../../../reports/blood-donation/checklist'
import type { BloodDonationChecklistEntry } from '../../../reports/blood-donation/types'
import { Input } from '../../ui/Field'

interface PreparationChecklistEditorProps {
  checklist: BloodDonationChecklistEntry[]
  onChange: (checklist: BloodDonationChecklistEntry[]) => void
}

export function PreparationChecklistEditor({
  checklist,
  onChange,
}: PreparationChecklistEditorProps) {
  const { t } = useI18n()

  const updateEntry = (itemId: string, patch: Partial<BloodDonationChecklistEntry>) => {
    onChange(
      checklist.map((entry) => (entry.itemId === itemId ? { ...entry, ...patch } : entry)),
    )
  }

  return (
    <section className="space-y-3">
      <div className="text-start">
        <h2 className="text-sm font-semibold text-foreground">
          {t('reports.bloodDonation.form.checklistTitle')}
        </h2>
        <p className="text-xs text-muted">{t('reports.bloodDonation.form.checklistHint')}</p>
      </div>

      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {bloodDonationChecklistItems.map((definition) => {
          const entry = checklist.find((row) => row.itemId === definition.id)
          const checked = entry?.checked ?? false
          return (
            <li
              key={definition.id}
              className={`rounded-lg border px-2.5 py-2 text-start ${
                checked
                  ? 'border-primary/30 bg-nav-active-bg/40'
                  : 'border-border-subtle bg-surface-muted/20'
              }`}
            >
              <label className="flex cursor-pointer items-start gap-2">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(event) => updateEntry(definition.id, { checked: event.target.checked })}
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded border-input-border text-primary focus:ring-focus-ring"
                />
                <span className="min-w-0 text-xs leading-snug text-foreground">
                  {t(definition.labelKey)}
                </span>
              </label>
              {definition.allowQuantity ? (
                <div className="mt-1.5 ps-5">
                  <Input
                    id={`qty-${definition.id}`}
                    type="number"
                    min={0}
                    aria-label={t('reports.bloodDonation.form.checklistQty')}
                    className="py-1 text-xs"
                    value={entry?.quantity ?? ''}
                    onChange={(event) =>
                      updateEntry(definition.id, {
                        quantity: Number.parseInt(event.target.value, 10) || undefined,
                      })
                    }
                  />
                </div>
              ) : null}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
