import { db } from './db'
import {
  STAFF_MASTER_DATA_VERSION,
  staffMasterRowToEmployeeInput,
  staffMasterSeedRows,
} from './staffMasterSeed'

const STAFF_MASTER_VERSION_KEY = 'staffMasterDataVersion'

export async function seedStaffMasterRecords(): Promise<void> {
  if (staffMasterSeedRows.length === 0) {
    return
  }

  const storedVersion = await db.settings.get(STAFF_MASTER_VERSION_KEY)
  const campaignStaffCount = await db.employees.count()
  const shouldBulkSeed =
    campaignStaffCount === 0 ||
    storedVersion?.value !== STAFF_MASTER_DATA_VERSION

  if (shouldBulkSeed && campaignStaffCount === 0) {
    await db.employees.bulkAdd(
      staffMasterSeedRows.map((row) => staffMasterRowToEmployeeInput(row)),
    )
  } else {
    for (const row of staffMasterSeedRows) {
      const payload = staffMasterRowToEmployeeInput(row)
      const existing = await db.employees.where('employeeId').equals(payload.employeeId).first()
      if (!existing) {
        await db.employees.add(payload)
        continue
      }
      if (existing.name !== payload.name) {
        await db.employees.update(existing.id!, { name: payload.name })
      }
    }
  }

  await db.settings.put({ key: STAFF_MASTER_VERSION_KEY, value: STAFF_MASTER_DATA_VERSION })
}

export async function seedDatabaseIfNeeded(): Promise<void> {
  await seedStaffMasterRecords()
}

export const REPORTS_GENERATED_KEY = 'reportsGenerated'

export async function getReportsGeneratedCount(): Promise<number> {
  const row = await db.settings.get(REPORTS_GENERATED_KEY)
  return row ? Number.parseInt(row.value, 10) || 0 : 0
}

export async function incrementReportsGenerated(): Promise<number> {
  const current = await getReportsGeneratedCount()
  const next = current + 1
  await db.settings.put({ key: REPORTS_GENERATED_KEY, value: String(next) })
  return next
}
