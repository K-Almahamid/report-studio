import type { ReportDefinition } from '../types'
import {
  buildBloodDonationExportBasename,
  generateBloodDonationExcel,
  generateBloodDonationPdf,
} from './generators'
import type { BloodDonationReportData } from './types'

export const bloodDonationReportDefinition: ReportDefinition<BloodDonationReportData> = {
  id: 'blood-donation',
  name: 'Blood Donation Campaign',
  description: 'Field blood donation campaign with team and preparation checklist.',
  route: '/reports/blood-donation',
  generateExcel: generateBloodDonationExcel,
  generatePdf: generateBloodDonationPdf,
  buildExportBasename: buildBloodDonationExportBasename,
}
