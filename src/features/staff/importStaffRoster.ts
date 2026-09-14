import { db } from '../../database/db'
import type { StaffRosterImportRow } from './staffRosterImport'
import { staffRosterRowToSeedRow } from './staffRosterImport'
import { staffMasterRowToEmployeeInput } from '../../database/staffMasterSeed'

export interface StaffImportSummary {
  created: number
  updated: number
  skipped: number
}

export async function importStaffRosterRows(rows: StaffRosterImportRow[]): Promise<StaffImportSummary> {
  let created = 0
  let updated = 0
  let skipped = 0

  await db.transaction('rw', db.employees, async () => {
    for (const row of rows) {
      const payload = staffMasterRowToEmployeeInput(staffRosterRowToSeedRow(row))
      const existing = await db.employees.where('employeeId').equals(payload.employeeId).first()
      if (!existing) {
        await db.employees.add(payload)
        created += 1
        continue
      }
      if (existing.name === payload.name) {
        skipped += 1
        continue
      }
      await db.employees.update(existing.id!, { name: payload.name })
      updated += 1
    }
  })

  return { created, updated, skipped }
}
