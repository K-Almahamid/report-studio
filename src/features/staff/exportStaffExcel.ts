import ExcelJS from 'exceljs'
import type { Employee } from '../../types/employee'

export async function exportStaffToExcel(staff: Employee[]): Promise<Blob> {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Report Studio'
  workbook.created = new Date()

  const sheet = workbook.addWorksheet('Staff', { views: [{ showGridLines: true }] })
  sheet.columns = [{ width: 36 }, { width: 16 }]

  const header = sheet.addRow(['Staff Name', 'Staff Number'])
  header.font = { bold: true }

  for (const row of staff) {
    sheet.addRow([row.name, row.employeeId])
  }

  const buffer = await workbook.xlsx.writeBuffer()
  return new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
}
