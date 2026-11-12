import { useEffect, useState } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

// The same curves as tokens.css, for Web Animations calls
export const EASE_OUT = 'cubic-bezier(0.22, 1, 0.36, 1)'
export const EASE_EXIT = 'cubic-bezier(0.55, 0.055, 0.675, 0.19)'

/** Whether the viewer asked for reduced motion right now (for event handlers). */
export function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia(QUERY).matches
}

/** Whether the viewer asked for reduced motion; follows the setting live. */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(prefersReducedMotion)
  useEffect(() => {
    const mq = window.matchMedia(QUERY)
    const update = () => setReduced(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])
  return reduced
}

/** Joins class names, skipping empty ones. */
export function cx(...names: Array<string | false | null | undefined>) {
  return names.filter(Boolean).join(' ')
}
