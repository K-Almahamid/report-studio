export interface DutyChangeEmployee {
  id?: number
  staffName: string
  staffNumber: string
}

export type DutyChangeEmployeeInput = Omit<DutyChangeEmployee, 'id'>

export interface DutyChangeRequestRecord {
  id?: number
  createdAt: string
  requestingStaffId: number
  requestingStaffName: string
  requestingStaffNumber: string
  assignedDutyArea: string
  assignedDutyTime?: string
  assignedDutyDate?: string
  changedDutyArea: string
  changedDutyTime?: string
  changedDutyDate?: string
  reasonForChange: string
  partnerStaffId: number
  partnerStaffName: string
  partnerStaffNumber: string
}

export interface DutyChangeFormState {
  assignedDutyArea: string
  assignedDutyTime: string
  assignedDutyDate: string
  changedDutyArea: string
  changedDutyTime: string
  changedDutyDate: string
  reasonForChange: string
  partnerStaffId: number
}

export function createEmptyDutyChangeFormState(): DutyChangeFormState {
  return {
    assignedDutyArea: '',
    assignedDutyTime: '',
    assignedDutyDate: '',
    changedDutyArea: '',
    changedDutyTime: '',
    changedDutyDate: '',
    reasonForChange: 'Personal',
    partnerStaffId: 0,
  }
}
