import { useEffect, useSyncExternalStore } from 'react'
import { Monitor, Moon, Sun } from 'lucide-react'

export type ThemeChoice = 'system' | 'light' | 'dark'
const KEY = 'recur-theme'
const listeners = new Set<() => void>()

function read(): ThemeChoice {
  const q = new URLSearchParams(location.search).get('theme')
  if (q === 'light' || q === 'dark') return q
  try {
    const v = localStorage.getItem(KEY)
    return v === 'light' || v === 'dark' ? v : 'system'
  } catch {
    return 'system'
  }
}

let current: ThemeChoice = read()
// A host page (an embedding viewer) may stamp its own theme on <html>; "System" follows that stamp when there is one
const host = document.documentElement.dataset.theme === 'dark' || document.documentElement.dataset.theme === 'light'
  ? document.documentElement.dataset.theme
  : undefined

function apply(c: ThemeChoice) {
  if (c === 'system') {
    if (host) document.documentElement.dataset.theme = host
    else delete document.documentElement.dataset.theme
  }
  else document.documentElement.dataset.theme = c
}
apply(current)

export function setTheme(c: ThemeChoice) {
  current = c
  try {
    localStorage.setItem(KEY, c)
  } catch {
    /* storage blocked: the choice lasts for this visit */
  }
  apply(c)
  listeners.forEach((l) => l())
}

export function useTheme() {
  const c = useSyncExternalStore(
    (l) => (listeners.add(l), () => listeners.delete(l)),
    () => current,
  )
  useEffect(() => apply(c), [c])
  return c
}

const OPTIONS: { id: ThemeChoice; label: string; Icon: typeof Sun }[] = [
  { id: 'system', label: 'System', Icon: Monitor },
  { id: 'light', label: 'Light', Icon: Sun },
  { id: 'dark', label: 'Dark', Icon: Moon },
]

/** System, Light or Dark. Remembered on this device. */
export function ThemeControl() {
  const c = useTheme()
  return (
    <div className="seg seg--icons" role="group" aria-label="Theme">
      {OPTIONS.map(({ id, label, Icon }) => (
        <button key={id} type="button" aria-pressed={c === id} onClick={() => setTheme(id)} aria-label={label} title={label}>
          <Icon size={16} strokeWidth={1.9} aria-hidden="true" />
        </button>
      ))}
    </div>
  )
}

/** Whether the page is showing its dark theme right now (the choice, or the system setting under System). */
export function useDark() {
  const c = useTheme()
  const sys = useSyncExternalStore(
    (l) => {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      mq.addEventListener('change', l)
      return () => mq.removeEventListener('change', l)
    },
    () => window.matchMedia('(prefers-color-scheme: dark)').matches,
  )
  return c === 'dark' || (c === 'system' && (host ? host === 'dark' : sys))
}
