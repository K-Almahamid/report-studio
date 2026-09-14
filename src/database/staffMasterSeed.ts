import type { EmployeeInput } from '../types/employee'
import staffMasterJson from './data/staff-master.json'

export interface StaffMasterSeedRow {
  name: string
  staffNumber: string
  active?: boolean
}

export const STAFF_MASTER_DATA_VERSION = '3'

function isStaffMasterSeedRow(row: unknown): row is StaffMasterSeedRow {
  if (typeof row !== 'object' || row === null) {
    return false
  }
  const candidate = row as StaffMasterSeedRow
  return (
    typeof candidate.name === 'string' &&
    typeof candidate.staffNumber === 'string' &&
    candidate.name.trim().length > 0 &&
    candidate.staffNumber.trim().length > 0
  )
}

function parseStaffMasterSeedRows(): StaffMasterSeedRow[] {
  const raw = staffMasterJson as unknown
  if (!Array.isArray(raw)) {
    return []
  }
  return raw.filter(isStaffMasterSeedRow)
}

export const staffMasterSeedRows = parseStaffMasterSeedRows()

export function staffMasterRowToEmployeeInput(row: StaffMasterSeedRow): EmployeeInput {
  return {
    name: row.name.trim(),
    employeeId: row.staffNumber.trim(),
  }
}
