import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import type { DutyChangeRequestRecord } from '../../types/dutyChange'
import { toWinAnsiSafeText } from '../../utils/pdfText'

function line(value: string | undefined): string {
  return value?.trim() ? value.trim() : '-'
}

export async function generateDutyChangeRequestPdf(
  record: DutyChangeRequestRecord,
): Promise<Blob> {
  const pdf = await PDFDocument.create()
  const page = pdf.addPage([595, 842])
  const font = await pdf.embedFont(StandardFonts.Helvetica)
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold)

  let y = 800
  const margin = 48
  const lineHeight = 14

  const draw = (text: string, bold = false, size = 10) => {
    page.drawText(toWinAnsiSafeText(text), {
      x: margin,
      y,
      size,
      font: bold ? fontBold : font,
      color: rgb(0.08, 0.1, 0.15),
      maxWidth: 499,
    })
    y -= lineHeight + (bold ? 2 : 0)
  }

  draw('Change of Duty Request Form', true, 13)
  draw('Dubai Blood Donation Center / Quality Assurance Unit (Demo Export)', false, 9)
  y -= 6

  draw(`Name of Staff: ${line(record.requestingStaffName)}`)
  draw(`Staff Number: ${line(record.requestingStaffNumber)}`)
  y -= 4
  draw('Assigned Duty', true)
  draw(`Area: ${line(record.assignedDutyArea)}`)
  draw(`Time: ${line(record.assignedDutyTime)}`)
  draw(`Date: ${line(record.assignedDutyDate)}`)
  y -= 4
  draw('Changed Duty', true)
  draw(`Area: ${line(record.changedDutyArea)}`)
  draw(`Time: ${line(record.changedDutyTime)}`)
  draw(`Date: ${line(record.changedDutyDate)}`)
  y -= 4
  draw(`Reason for Change: ${line(record.reasonForChange)}`)
  draw(
    `Staff Name and ID with whom duty is changed: ${line(record.partnerStaffName)} / ${line(record.partnerStaffNumber)}`,
  )
  y -= 4
  draw(`Name and Signature of Staff Requesting: ${line(record.requestingStaffName)} (${line(record.requestingStaffNumber)})`)
  draw(`Name and Signature of Staff Accepting: ${line(record.partnerStaffName)} (${line(record.partnerStaffNumber)})`)

  const bytes = await pdf.save()
  return new Blob([Uint8Array.from(bytes)], { type: 'application/pdf' })
}

export function buildDutyChangeExportBasename(record: DutyChangeRequestRecord): string {
  const slug = record.requestingStaffNumber.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  return `duty-change-${slug}-${record.createdAt.slice(0, 10)}`
}
