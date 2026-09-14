/**
 * Generates src/database/data/staff-master.json from an Excel roster.
 *
 * Usage: node scripts/build-staff-master-json.mjs <path-to.xlsx>
 */
import { readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import ExcelJS from 'exceljs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outputPath = resolve(__dirname, '../src/database/data/staff-master.json')

function normalizeHeader(value) {
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

async function parseWorkbook(buffer) {
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(buffer)
  const sheet = workbook.worksheets[0]
  if (!sheet) {
    throw new Error('Workbook has no worksheets')
  }

  const headerRow = sheet.getRow(1)
  const headers = []
  headerRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
    const label = String(cell.text ?? cell.value ?? '').trim()
    if (label) {
      headers.push({ index: colNumber, label, normalized: normalizeHeader(label) })
    }
  })

  const nameHeader = headers.find((header) => STAFF_NAME_HEADERS.has(header.normalized))
  const numberHeader = headers.find((header) => STAFF_NUMBER_HEADERS.has(header.normalized))

  if (!nameHeader || !numberHeader) {
    throw new Error(
      `Missing staff name/number columns. Found headers: ${headers.map((h) => h.label).join(', ')}`,
    )
  }

  const rows = []
  const seen = new Set()

  sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) {
      return
    }
    const name = String(row.getCell(nameHeader.index).text ?? '').trim()
    const staffNumber = String(row.getCell(numberHeader.index).text ?? '').trim()
    if (!name || !staffNumber) {
      return
    }
    const dedupeKey = staffNumber.toLowerCase()
    if (seen.has(dedupeKey)) {
      return
    }
    seen.add(dedupeKey)
    rows.push({ name, staffNumber, active: true })
  })

  if (rows.length === 0) {
    throw new Error('No staff rows found under the detected columns')
  }

  return { rows, nameColumn: nameHeader.label, numberColumn: numberHeader.label }
}

const inputPath = process.argv[2]
if (!inputPath) {
  console.error('Usage: node scripts/build-staff-master-json.mjs <path-to.xlsx>')
  process.exit(1)
}

const buffer = await readFile(resolve(inputPath))
const { rows, nameColumn, numberColumn } = await parseWorkbook(buffer)
await writeFile(outputPath, `${JSON.stringify(rows, null, 2)}\n`, 'utf8')
console.log(
  `Wrote ${rows.length} staff records to ${outputPath} (columns: "${nameColumn}", "${numberColumn}")`,
)
