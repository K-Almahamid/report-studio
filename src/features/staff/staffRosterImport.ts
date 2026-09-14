import ExcelJS from 'exceljs'
import type { StaffMasterSeedRow } from '../../database/staffMasterSeed'

function normalizeHeader(value: unknown): string {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
}

const STAFF_NAME_HEADERS = new Set([
  'staff name',
  'name of staff',
  'name',
  'employee name',
  'staff',
  'full name',
  'employee',
])

const STAFF_NUMBER_HEADERS = new Set([
  'staff number',
  'staff id',
  'staff no',
  'staff no.',
  'employee id',
  'employee number',
  'id',
  'staff #',
  'emp id',
  'emp no',
])

export interface StaffRosterImportRow {
  name: string
  staffNumber: string
}

export interface StaffRosterImportIssue {
  row: number
  message: string
}

export interface StaffRosterParseResult {
  rows: StaffRosterImportRow[]
  nameColumn: string
  numberColumn: string
  issues: StaffRosterImportIssue[]
}

export async function parseStaffRosterWorkbook(buffer: ArrayBuffer): Promise<StaffRosterParseResult> {
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(buffer)
  const sheet = workbook.worksheets[0]
  if (!sheet) {
    throw new Error('NO_SHEET')
  }

  const headerRow = sheet.getRow(1)
  const headers: { index: number; label: string; normalized: string }[] = []
  headerRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
    const label = String(cell.text ?? cell.value ?? '').trim()
    if (label) {
      headers.push({ index: colNumber, label, normalized: normalizeHeader(label) })
    }
  })

  if (headers.length === 0) {
    throw new Error('NO_HEADERS')
  }

  const nameHeader = headers.find((header) => STAFF_NAME_HEADERS.has(header.normalized))
  const numberHeader = headers.find((header) => STAFF_NUMBER_HEADERS.has(header.normalized))

  if (!nameHeader || !numberHeader) {
    throw new Error('MISSING_COLUMNS')
  }

  const rows: StaffRosterImportRow[] = []
  const issues: StaffRosterImportIssue[] = []
  const seenNumbers = new Set<string>()

  sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) {
      return
    }
    const name = String(row.getCell(nameHeader.index).text ?? '').trim()
    const staffNumber = String(row.getCell(numberHeader.index).text ?? '').trim()
    if (!name && !staffNumber) {
      return
    }
    if (!name) {
      issues.push({ row: rowNumber, message: 'MISSING_NAME' })
      return
    }
    if (!staffNumber) {
      issues.push({ row: rowNumber, message: 'MISSING_NUMBER' })
      return
    }
    const dedupeKey = staffNumber.toLowerCase()
    if (seenNumbers.has(dedupeKey)) {
      issues.push({ row: rowNumber, message: 'DUPLICATE_IN_FILE' })
      return
    }
    seenNumbers.add(dedupeKey)
    rows.push({ name, staffNumber })
  })

  if (rows.length === 0 && issues.length === 0) {
    throw new Error('NO_ROWS')
  }

  return {
    rows,
    nameColumn: nameHeader.label,
    numberColumn: numberHeader.label,
    issues,
  }
}

export function staffRosterRowToSeedRow(row: StaffRosterImportRow): StaffMasterSeedRow {
  return { name: row.name, staffNumber: row.staffNumber }
}
