import { type RefObject, useEffect, useState } from 'react'

export function useInViewOnce<T extends Element>(
  ref: RefObject<T | null>,
  options?: IntersectionObserverInit,
) {
  const [inView, setInView] = useState(false)

  useEffect(() => {
    if (inView) {
      return
    }
    const element = ref.current
    if (!element) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      {
        rootMargin: '0px 0px -6% 0px',
        threshold: 0.08,
        ...options,
      },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [inView, ref])

  return inView
}
