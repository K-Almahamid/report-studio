import {
  bloodDonationChecklistItems,
  type BloodDonationCampaignType,
} from './checklist'

export interface BloodDonationTeamMember {
  id: string
  employeeDbId: number
  employeeName: string
  employeeId: string
}

export interface BloodDonationChecklistEntry {
  itemId: string
  checked: boolean
  quantity?: number
}

export interface BloodDonationReportData {
  campaignName: string
  date: string
  location: string
  campaignType: BloodDonationCampaignType | ''
  teamMembers: BloodDonationTeamMember[]
  checklist: BloodDonationChecklistEntry[]
}

export function createEmptyTeamMember(): BloodDonationTeamMember {
  return {
    id: crypto.randomUUID(),
    employeeDbId: 0,
    employeeName: '',
    employeeId: '',
  }
}

export function createDefaultChecklistState(
  checkedOverrides: Record<string, boolean> = {},
): BloodDonationChecklistEntry[] {
  return bloodDonationChecklistItems.map((item) => ({
    itemId: item.id,
    checked: checkedOverrides[item.id] ?? true,
  }))
}

export function createSampleBloodDonationReportData(): BloodDonationReportData {
  return {
    campaignName: 'Blood Donation Campaign - University',
    date: '2026-09-14',
    location: 'Main Campus',
    campaignType: 'mobile-blood-donation',
    teamMembers: [createEmptyTeamMember(), createEmptyTeamMember()],
    checklist: createDefaultChecklistState({
      'sharps-container': false,
    }),
  }
}

export function syncTeamMembersWithEmployees(
  data: BloodDonationReportData,
  employees: { id?: number; name: string; employeeId: string }[],
): BloodDonationReportData {
  const preferredCodes = ['EMP001', 'EMP002']
  const resolved = preferredCodes
    .map((code) => employees.find((employee) => employee.employeeId === code))
    .filter(Boolean) as { id?: number; name: string; employeeId: string }[]

  if (resolved.length === 0) {
    return data
  }

  const teamMembers = resolved.map((employee) => ({
    id: crypto.randomUUID(),
    employeeDbId: employee.id ?? 0,
    employeeName: employee.name,
    employeeId: employee.employeeId,
  }))

  return { ...data, teamMembers }
}
