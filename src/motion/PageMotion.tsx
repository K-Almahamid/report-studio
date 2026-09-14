import { type ReactNode, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'

export function PageMotion({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  const [entered, setEntered] = useState(true)
  const skipNextAnimation = useRef(true)

  useEffect(() => {
    if (skipNextAnimation.current) {
      skipNextAnimation.current = false
      return
    }
    setEntered(false)
    const frame = requestAnimationFrame(() => setEntered(true))
    return () => cancelAnimationFrame(frame)
  }, [pathname])

  return (
    <div key={pathname} className={entered ? 'rs-page-enter' : 'opacity-0'}>
      {children}
    </div>
  )
}
