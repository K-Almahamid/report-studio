import { bloodDonationReportDefinition } from './blood-donation/definition'

export const reportDefinitions = [bloodDonationReportDefinition] as const

export function getReportDefinitionById(id: string) {
  return reportDefinitions.find((report) => report.id === id)
}

export { bloodDonationReportDefinition }
export type { BloodDonationReportData } from './blood-donation/types'
