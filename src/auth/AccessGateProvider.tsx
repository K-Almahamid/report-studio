import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { PasswordGateScreen } from '../components/auth/PasswordGateScreen'
import {
  grantAccess,
  readAccessGranted,
  revokeAccess,
  verifyAccessPassword,
} from './accessGate'

interface AccessGateContextValue {
  logout: () => void
}

const AccessGateContext = createContext<AccessGateContextValue | null>(null)

export function AccessGateProvider({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState(readAccessGranted)

  const handleSuccess = useCallback(() => {
    grantAccess()
    setUnlocked(true)
  }, [])

  const logout = useCallback(() => {
    revokeAccess()
    setUnlocked(false)
  }, [])

  const value = useMemo(() => ({ logout }), [logout])

  if (!unlocked) {
    return <PasswordGateScreen onSuccess={handleSuccess} verify={verifyAccessPassword} />
  }

  return (
    <AccessGateContext.Provider value={value}>{children}</AccessGateContext.Provider>
  )
}

export function useAccessGate() {
  const context = useContext(AccessGateContext)
  if (!context) {
    throw new Error('useAccessGate must be used within AccessGateProvider after unlock')
  }
  return context
}
