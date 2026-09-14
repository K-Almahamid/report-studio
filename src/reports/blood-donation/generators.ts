import ExcelJS from 'exceljs'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { getChecklistDefinitionById } from './checklist'
import type { BloodDonationReportData } from './types'
import { formatDisplayDate, formatLongDisplayDate } from '../../utils/download'

export async function generateBloodDonationExcel(data: BloodDonationReportData): Promise<Blob> {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Report Studio'
  workbook.created = new Date()

  const sheet = workbook.addWorksheet('Blood Donation Campaign', {
    views: [{ showGridLines: true }],
  })

  sheet.columns = [{ width: 28 }, { width: 36 }, { width: 14 }]

  const titleRow = sheet.addRow(['Blood Donation Campaign Report (Demo Export)'])
  titleRow.font = { bold: true, size: 14 }
  sheet.mergeCells('A1:C1')
  sheet.addRow([])

  const infoRows: [string, string][] = [
    ['Campaign', data.campaignName],
    ['Date', formatDisplayDate(data.date)],
    ['Location', data.location],
    ['Campaign Type', data.campaignType],
  ]

  for (const [label, value] of infoRows) {
    const row = sheet.addRow([label, value])
    row.getCell(1).font = { bold: true }
  }

  sheet.addRow([])
  sheet.addRow(['Team Members', 'Employee ID']).font = { bold: true }
  for (const member of data.teamMembers) {
    sheet.addRow([member.employeeName, member.employeeId])
  }

  sheet.addRow([])
  sheet.addRow(['Preparation Checklist', 'Prepared', 'Qty']).font = { bold: true }
  for (const entry of data.checklist) {
    const definition = getChecklistDefinitionById(entry.itemId)
    sheet.addRow([
      definition?.id ?? entry.itemId,
      entry.checked ? 'Yes' : 'No',
      entry.quantity ?? '',
    ])
  }

  sheet.addRow([])
  sheet.addRow([
    'Note',
    'Administrative field-operation report only. Replace with the official Excel template.',
  ])

  const buffer = await workbook.xlsx.writeBuffer()
  return new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
}

export async function generateBloodDonationPdf(data: BloodDonationReportData): Promise<Blob> {
  const pdf = await PDFDocument.create()
  const page = pdf.addPage([595, 842])
  const font = await pdf.embedFont(StandardFonts.Helvetica)
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold)

  let y = 780
  const margin = 50
  const lineHeight = 16

  const drawLine = (text: string, bold = false, size = 11) => {
    page.drawText(text, {
      x: margin,
      y,
      size: bold ? 13 : size,
      font: bold ? fontBold : font,
      color: rgb(0.08, 0.1, 0.15),
      maxWidth: 495,
    })
    y -= lineHeight + (bold ? 4 : 0)
  }

  drawLine('Blood Donation Campaign Report (Demo Export)', true)
  y -= 6
  drawLine(`Campaign: ${data.campaignName}`)
  drawLine(`Date: ${formatLongDisplayDate(data.date)}`)
  drawLine(`Location: ${data.location}`)
  drawLine(`Campaign Type: ${data.campaignType}`)
  y -= 6
  drawLine('Team', true)
  for (const member of data.teamMembers) {
    drawLine(`• ${member.employeeName} — ${member.employeeId}`)
  }
  y -= 6
  drawLine('Preparation Checklist', true)
  for (const entry of data.checklist) {
    const definition = getChecklistDefinitionById(entry.itemId)
    const mark = entry.checked ? '✓' : '✗'
    drawLine(`${mark} ${definition?.id ?? entry.itemId}`)
  }

  y -= 6
  drawLine('Placeholder PDF — replace via ReportDefinition.generatePdf().', false, 9)

  const bytes = await pdf.save()
  return new Blob([Uint8Array.from(bytes)], { type: 'application/pdf' })
}

export function buildBloodDonationExportBasename(data: BloodDonationReportData): string {
  const slug = data.campaignName.trim().toLowerCase().replace(/\s+/g, '-').slice(0, 40)
  return `blood-donation-${slug || 'campaign'}-${data.date}`
}
