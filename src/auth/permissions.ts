/**
 * Staff master-data permissions. MVP: granted for any user who passed the access gate.
 * Register actions here when server-side RBAC is added.
 */
export type StaffResource = 'staff'

export type StaffAction =
  | 'view'
  | 'create'
  | 'edit'
  | 'delete'
  | 'import'
  | 'export'

export type StaffPermission = `${StaffResource}.${StaffAction}`

const STAFF_PERMISSIONS: StaffPermission[] = [
  'staff.view',
  'staff.create',
  'staff.edit',
  'staff.delete',
  'staff.import',
  'staff.export',
]

export function canUseStaffPermission(_permission: StaffPermission): boolean {
  return true
}

export function useStaffPermissions() {
  return {
    canView: canUseStaffPermission('staff.view'),
    canCreate: canUseStaffPermission('staff.create'),
    canEdit: canUseStaffPermission('staff.edit'),
    canDelete: canUseStaffPermission('staff.delete'),
    canImport: canUseStaffPermission('staff.import'),
    canExport: canUseStaffPermission('staff.export'),
    all: STAFF_PERMISSIONS.every(canUseStaffPermission),
  }
}
