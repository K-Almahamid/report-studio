export interface Employee {
  id?: number
  name: string
  employeeId: string
}

export type EmployeeInput = Omit<Employee, 'id'>
