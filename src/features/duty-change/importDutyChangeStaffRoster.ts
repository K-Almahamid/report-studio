import { db } from '../../database/db'
import type { StaffRosterImportRow } from '../staff/staffRosterImport'

export interface DutyChangeStaffImportSummary {
  created: number
  updated: number
  skipped: number
}

export async function importDutyChangeStaffRosterRows(
  rows: StaffRosterImportRow[],
): Promise<DutyChangeStaffImportSummary> {
  let created = 0
  let updated = 0
  let skipped = 0

  await db.transaction('rw', db.dutyChangeEmployees, async () => {
    for (const row of rows) {
      const staffName = row.name.trim()
      const staffNumber = row.staffNumber.trim()
      const existing = await db.dutyChangeEmployees.where('staffNumber').equals(staffNumber).first()
      if (!existing) {
        await db.dutyChangeEmployees.add({ staffName, staffNumber })
        created += 1
        continue
      }
      if (existing.staffName === staffName) {
        skipped += 1
        continue
      }
      await db.dutyChangeEmployees.update(existing.id!, { staffName })
      updated += 1
    }
  })

  return { created, updated, skipped }
}
