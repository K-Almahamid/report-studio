import Dexie, { type Table } from 'dexie'
import type { Employee } from '../types/employee'

export interface AppSetting {
  key: string
  value: string
}

export class ReportStudioDB extends Dexie {
  employees!: Table<Employee, number>
  settings!: Table<AppSetting, string>

  constructor() {
    super('ReportStudioDB')
    this.version(1).stores({
      employees: '++id, name, employeeId',
      settings: 'key',
    })
  }
}

export const db = new ReportStudioDB()
