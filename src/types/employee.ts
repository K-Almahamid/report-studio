/** Campaign staff record (staff number stored in `employeeId`). */
export interface Employee {
  id?: number
  name: string
  /** Stable staff number from the campaign roster. */
  employeeId: string
}

export type EmployeeInput = Omit<Employee, 'id'>

/** Alias for campaign staff master records. */
export type Staff = Employee
export type StaffInput = EmployeeInput
