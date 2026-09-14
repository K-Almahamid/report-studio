import { useI18n } from '../../../i18n/I18nProvider'
import { bloodDonationChecklistItems } from '../../../reports/blood-donation/checklist'
import type { BloodDonationChecklistEntry } from '../../../reports/blood-donation/types'
import { Field, Input } from '../../ui/Field'

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

      <ul className="divide-y divide-border-subtle rounded-lg border border-border">
        {bloodDonationChecklistItems.map((definition) => {
          const entry = checklist.find((row) => row.itemId === definition.id)
          const checked = entry?.checked ?? false
          return (
            <li
              key={definition.id}
              className="flex flex-wrap items-center gap-3 px-4 py-3 sm:flex-nowrap"
            >
              <label className="flex min-w-0 flex-1 items-center gap-3 text-start">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(event) => updateEntry(definition.id, { checked: event.target.checked })}
                  className="h-4 w-4 rounded border-input-border text-primary focus:ring-focus-ring"
                />
                <span className="text-sm text-foreground">{t(definition.labelKey)}</span>
              </label>
              {definition.allowQuantity ? (
                <div className="w-full sm:w-28">
                  <Field
                    label={t('reports.bloodDonation.form.checklistQty')}
                    htmlFor={`qty-${definition.id}`}
                  >
                    <Input
                      id={`qty-${definition.id}`}
                      type="number"
                      min={0}
                      value={entry?.quantity ?? ''}
                      onChange={(event) =>
                        updateEntry(definition.id, {
                          quantity: Number.parseInt(event.target.value, 10) || undefined,
                        })
                      }
                    />
                  </Field>
                </div>
              ) : null}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
