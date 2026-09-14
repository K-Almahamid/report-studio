import { liveQuery } from 'dexie'
import { useEffect, useState } from 'react'
import { db } from '../database/db'
import type { DutyChangeEmployee } from '../types/dutyChange'

export function useDutyChangeEmployees() {
  const [employees, setEmployees] = useState<DutyChangeEmployee[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const subscription = liveQuery(() =>
      db.dutyChangeEmployees.orderBy('staffName').toArray(),
    ).subscribe({
      next: (rows) => {
        setEmployees(rows)
        setLoading(false)
      },
      error: () => setLoading(false),
    })
    return () => subscription.unsubscribe()
  }, [])

  return { employees, loading }
}
