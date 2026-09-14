import type { TranslationKey } from '../../i18n/types'

export interface BloodDonationChecklistDefinitionItem {
  id: string
  labelKey: TranslationKey
  allowQuantity?: boolean
}

/** Replace this list with the organization's official preparation checklist later. */
export const bloodDonationChecklistItems: BloodDonationChecklistDefinitionItem[] = [
  { id: 'gloves', labelKey: 'reports.bloodDonation.checklist.items.gloves' },
  { id: 'blood-collection-bags', labelKey: 'reports.bloodDonation.checklist.items.bloodCollectionBags' },
  { id: 'needles', labelKey: 'reports.bloodDonation.checklist.items.needles' },
  { id: 'alcohol-swabs', labelKey: 'reports.bloodDonation.checklist.items.alcoholSwabs' },
  { id: 'tubes', labelKey: 'reports.bloodDonation.checklist.items.tubes' },
  { id: 'labels', labelKey: 'reports.bloodDonation.checklist.items.labels' },
  { id: 'sharps-container', labelKey: 'reports.bloodDonation.checklist.items.sharpsContainer' },
  { id: 'hand-sanitizer', labelKey: 'reports.bloodDonation.checklist.items.handSanitizer' },
  { id: 'first-aid', labelKey: 'reports.bloodDonation.checklist.items.firstAid' },
  { id: 'cool-box', labelKey: 'reports.bloodDonation.checklist.items.coolBox' },
  { id: 'blood-pressure-monitor', labelKey: 'reports.bloodDonation.checklist.items.bloodPressureMonitor' },
  { id: 'weighing-scale', labelKey: 'reports.bloodDonation.checklist.items.weighingScale' },
  { id: 'examination-supplies', labelKey: 'reports.bloodDonation.checklist.items.examinationSupplies' },
]

export const bloodDonationCampaignTypes = [
  { value: 'mobile-blood-donation', labelKey: 'reports.bloodDonation.campaignTypes.mobile' },
  { value: 'field-activity', labelKey: 'reports.bloodDonation.campaignTypes.fieldActivity' },
  { value: 'mobile-collection-unit', labelKey: 'reports.bloodDonation.campaignTypes.mobileUnit' },
] as const

export type BloodDonationCampaignType = (typeof bloodDonationCampaignTypes)[number]['value']

export function getChecklistDefinitionById(itemId: string) {
  return bloodDonationChecklistItems.find((item) => item.id === itemId)
}
