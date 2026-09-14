const STORAGE_KEY = 'report-studio-access-v1'
const GRANTED_VALUE = 'granted'

function expectedPassword(): string {
  return import.meta.env.VITE_APP_PASSWORD ?? ''
}

export function readAccessGranted(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === GRANTED_VALUE
  } catch {
    return false
  }
}

export function grantAccess(): void {
  try {
    localStorage.setItem(STORAGE_KEY, GRANTED_VALUE)
  } catch {
    /* ignore quota / private mode */
  }
}

export function revokeAccess(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
}

export function verifyAccessPassword(input: string): boolean {
  const expected = expectedPassword()
  if (!expected) {
    return false
  }
  const a = input
  const b = expected
  if (a.length !== b.length) {
    return false
  }
  let mismatch = 0
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return mismatch === 0
}
