import { db } from './db'

const SAMPLE_EMPLOYEES = [
  { name: 'Ahmed Ali', employeeId: 'EMP001' },
  { name: 'Mohammad Hassan', employeeId: 'EMP002' },
  { name: 'Omar Khaled', employeeId: 'EMP003' },
] as const

const SEED_FLAG = 'employeesSeeded'

export async function seedDatabaseIfNeeded(): Promise<void> {
  const flag = await db.settings.get(SEED_FLAG)
  if (flag?.value === 'true') {
    return
  }

  const count = await db.employees.count()
  if (count === 0) {
    await db.employees.bulkAdd([...SAMPLE_EMPLOYEES])
  }

  await db.settings.put({ key: SEED_FLAG, value: 'true' })
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
