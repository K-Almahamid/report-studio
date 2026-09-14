import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from 'react'
import { useInViewOnce } from './useInViewOnce'

interface RevealProps {
  children: ReactNode
  className?: string
  mode?: 'mount' | 'inView'
  staggerIndex?: number
}

export function Reveal({
  children,
  className = '',
  mode = 'inView',
  staggerIndex = 0,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInViewOnce(ref)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (mode !== 'mount') {
      return
    }
    const frame = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(frame)
  }, [mode])

  const active = mode === 'mount' ? mounted : inView
  const style = { '--rs-stagger': staggerIndex } as CSSProperties

  return (
    <div
      ref={ref}
      className={`rs-reveal ${active ? 'rs-reveal-visible' : ''} ${className}`.trim()}
      style={style}
    >
      {children}
    </div>
  )
}
