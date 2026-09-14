import Dexie, { type Table } from 'dexie'
import type { DutyChangeEmployee, DutyChangeRequestRecord } from '../types/dutyChange'
import type { Employee } from '../types/employee'

export interface AppSetting {
  key: string
  value: string
}

export class ReportStudioDB extends Dexie {
  /** Campaign staff roster. */
  employees!: Table<Employee, number>
  /** Duty of change staff roster (separate from campaign staff). */
  dutyChangeEmployees!: Table<DutyChangeEmployee, number>
  dutyChangeRequests!: Table<DutyChangeRequestRecord, number>
  settings!: Table<AppSetting, string>

  constructor() {
    super('ReportStudioDB')
    this.version(1).stores({
      employees: '++id, name, employeeId',
      settings: 'key',
    })
    this.version(2).stores({
      employees: '++id, name, employeeId',
      settings: 'key',
      dutyChangeEmployees: '++id, staffName, staffNumber',
      dutyChangeRequests: '++id, createdAt, requestingStaffId',
    })
    this.version(3).stores({
      employees: '++id, name, &employeeId, active',
      settings: 'key',
      dutyChangeEmployees: '++id, staffName, staffNumber',
      dutyChangeRequests: '++id, createdAt, requestingStaffId',
    })
    this.version(4).stores({
      employees: '++id, name, &employeeId, active',
      settings: 'key',
      dutyChangeRequests: '++id, createdAt, requestingStaffId',
    }).upgrade(async (tx) => {
      const legacy = tx.table('dutyChangeEmployees')
      const staff = tx.table('employees')
      const legacyRows = await legacy.toArray()
      for (const row of legacyRows) {
        const number = String(row.staffNumber ?? '').trim()
        const name = String(row.staffName ?? '').trim()
        if (!number || !name) {
          continue
        }
        const existing = await staff.where('employeeId').equals(number).first()
        if (!existing) {
          await staff.add({ name, employeeId: number, active: true })
        }
      }
      await legacy.clear()
    })
    this.version(5).stores({
      employees: '++id, name, &employeeId',
      dutyChangeEmployees: '++id, staffName, &staffNumber',
      settings: 'key',
      dutyChangeRequests: '++id, createdAt, requestingStaffId',
    })
  }
}

export const db = new ReportStudioDB()
