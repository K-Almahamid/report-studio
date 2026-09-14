const CURRENT_STAFF_KEY = 'report-studio:duty-change-current-staff-id'

export function readCurrentDutyChangeStaffId(): number | null {
  try {
    const raw = localStorage.getItem(CURRENT_STAFF_KEY)
    if (!raw) {
      return null
    }
    const id = Number.parseInt(raw, 10)
    return Number.isFinite(id) && id > 0 ? id : null
  } catch {
    return null
  }
}

export function writeCurrentDutyChangeStaffId(staffId: number): void {
  try {
    localStorage.setItem(CURRENT_STAFF_KEY, String(staffId))
  } catch {
    /* ignore */
  }
}

export function clearCurrentDutyChangeStaffId(): void {
  try {
    localStorage.removeItem(CURRENT_STAFF_KEY)
  } catch {
    /* ignore */
  }
}
