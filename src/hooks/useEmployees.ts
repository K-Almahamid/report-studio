import { liveQuery } from 'dexie'
import { useEffect, useState } from 'react'
import { db } from '../database/db'
import type { Employee } from '../types/employee'

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const subscription = liveQuery(() =>
      db.employees.orderBy('name').toArray(),
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

export function useEmployeeCount() {
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const subscription = liveQuery(() => db.employees.count()).subscribe({
      next: (value) => {
        setCount(value)
        setLoading(false)
      },
      error: () => setLoading(false),
    })
    return () => subscription.unsubscribe()
  }, [])

  return { count, loading }
}

export function useReportsGeneratedCount() {
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const subscription = liveQuery(async () => {
      const row = await db.settings.get('reportsGenerated')
      return row ? Number.parseInt(row.value, 10) || 0 : 0
    }).subscribe({
      next: (value) => {
        setCount(value)
        setLoading(false)
      },
      error: () => setLoading(false),
    })
    return () => subscription.unsubscribe()
  }, [])

  return { count, loading }
}
