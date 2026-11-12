import { type ReactNode, useEffect, useId, useRef, useState } from 'react'
import { cx, prefersReducedMotion } from './motion'

type HoldToConfirmProps = {
  /** The action, as a verb phrase with its object: "Revoke 12 links". */
  children: ReactNode
  onConfirm: (input: 'pointer' | 'keyboard' | 'press-again') => void
  /** Hold time in ms. Recommended range 1000–1600. */
  duration?: number
  /** Read to screen readers with the button. */
  description?: string
  /** Label while waiting for the second press (screen readers and switch access). */
  pressAgainLabel?: string
  size?: 'compact' | 'regular'
  disabled?: boolean
  className?: string
}

const PRESS_AGAIN_MS = 4000
const ROLL_BACK_MS = 180

/** How far the fill has travelled (0–1), read from what is on screen, whatever is moving it. */
function fillProgress(fill: HTMLElement | null) {
  if (!fill || !fill.offsetWidth) return 0
  const x = new DOMMatrixReadOnly(getComputedStyle(fill).transform).m41
  return Math.min(1, Math.max(0, 1 + x / fill.offsetWidth))
}

/**
 * A confirmation done in place: press and hold. The fill sweeps across while held;
 * letting go early rolls it back. The sweep is a compositor animation (transform), so it
 * stays smooth when script frames are slow or throttled, and completion runs on a timer,
 * so a slow frame or a hidden tab never decides the outcome. Space and Enter hold too;
 * key repeat is ignored.
 *
 * Screen readers (VoiceOver, NVDA browse mode) and switch access send a bare click and
 * cannot hold: such a click arms the button ("Press again to confirm") and a second one
 * within 4 seconds confirms. Follow it with <UndoWindow> before the effect is released.
 */
export function HoldToConfirm({
  children,
  onConfirm,
  duration = 1200,
  description = 'Press and hold for about one second. Release to cancel.',
  pressAgainLabel = 'Press again to confirm',
  size = 'regular',
  disabled,
  className,
}: HoldToConfirmProps) {
  const descId = useId()
  const fill = useRef<HTMLSpanElement>(null)
  const inner = useRef<HTMLSpanElement>(null)
  const state = useRef({ holding: false, timer: 0, input: 'pointer' as 'pointer' | 'keyboard', release: () => {} })
  const anims = useRef<Animation[]>([])
  const settle = useRef(0)
  const [holding, setHolding] = useState(false)
  const [armed, setArmed] = useState(false)
  const armTimer = useRef(0)

  useEffect(() => {
    const s = state.current
    return () => {
      window.clearTimeout(s.timer)
      window.clearTimeout(armTimer.current)
      anims.current.forEach((a) => a.cancel())
      window.clearTimeout(settle.current)
      s.release()
    }
  }, [])

  const stop = () => {
    anims.current.forEach((a) => a.cancel())
    anims.current = []
    window.clearTimeout(settle.current)
    fill.current?.classList.remove('is-on')
  }

  // Moves the fill (and the counter-moving label copy inside it) between two progress values
  const sweep = (from: number, to: number, ms: number, easing: string) => {
    if (!fill.current || !inner.current) return
    const pct = (p: number) => `${((1 - p) * 100).toFixed(3)}%`
    const opts: KeyframeAnimationOptions = { duration: Math.max(1, ms), easing, fill: 'forwards' }
    fill.current.classList.add('is-on')
    // Hidden again once a roll-back has landed (on a timer, not the animation's end)
    if (to === 0) settle.current = window.setTimeout(() => fill.current?.classList.remove('is-on'), ms + 20)
    anims.current = [
      fill.current.animate([{ transform: `translateX(-${pct(from)})` }, { transform: `translateX(-${pct(to)})` }], opts),
      inner.current.animate([{ transform: `translateX(${pct(from)})` }, { transform: `translateX(${pct(to)})` }], opts),
    ]
  }

  const complete = () => {
    const s = state.current
    s.holding = false
    s.release()
    setHolding(false)
    onConfirm(s.input)
    // Back to empty, so a button that stays mounted never confirms on the next tap
    stop()
  }

  const begin = (input: 'pointer' | 'keyboard') => {
    const s = state.current
    if (disabled || s.holding) return
    const p = fillProgress(fill.current)
    stop()
    s.holding = true
    s.input = input
    s.timer = window.setTimeout(complete, duration * (1 - p))
    sweep(p, 1, duration * (1 - p), 'linear')
    setHolding(true)
  }

  const cancel = () => {
    const s = state.current
    if (!s.holding) return
    s.holding = false
    s.release()
    window.clearTimeout(s.timer)
    setHolding(false)
    const p = fillProgress(fill.current)
    stop()
    if (p > 0 && !prefersReducedMotion()) sweep(p, 0, ROLL_BACK_MS, 'cubic-bezier(0.22, 1, 0.36, 1)')
  }

  const isHoldKey = (key: string) => key === ' ' || key === 'Enter'

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        aria-describedby={descId}
        className={cx('ix-btn', 'ix-btn--danger', `ix-btn--${size}`, 'ix-hold', holding && 'is-holding', className)}
        onPointerDown={(e) => {
          if (e.button !== 0) return
          // Letting go is read from the window, for this pointer only: a release always reaches
          // the window, wherever the pointer is. Pointer capture is not used, because browsers can
          // drop it mid-press (seen right after page load), which would read as a let-go.
          const id = e.pointerId
          const onEnd = (ev: PointerEvent) => {
            if (ev.pointerId === id) cancel()
          }
          window.addEventListener('pointerup', onEnd)
          window.addEventListener('pointercancel', onEnd)
          state.current.release = () => {
            window.removeEventListener('pointerup', onEnd)
            window.removeEventListener('pointercancel', onEnd)
            state.current.release = () => {}
          }
          begin('pointer')
        }}
        onBlur={() => {
          cancel()
          setArmed(false)
        }}
        onContextMenu={(e) => e.preventDefault()}
        onKeyDown={(e) => {
          if (!isHoldKey(e.key)) return
          e.preventDefault()
          if (!e.repeat) begin('keyboard')
        }}
        onKeyUp={(e) => {
          if (!isHoldKey(e.key)) return
          e.preventDefault()
          cancel()
        }}
        onClick={(e) => {
          // detail 0: a click with no pointer press behind it, sent by assistive technology
          if (e.detail !== 0 || state.current.holding) return
          window.clearTimeout(armTimer.current)
          if (armed) {
            setArmed(false)
            onConfirm('press-again')
            return
          }
          setArmed(true)
          armTimer.current = window.setTimeout(() => setArmed(false), PRESS_AGAIN_MS)
        }}
      >
        <span className="ix-btn__bg" aria-hidden="true" />
        <span className="ix-btn__label">{armed ? pressAgainLabel : children}</span>
        <span ref={fill} className="ix-hold__fill" aria-hidden="true">
          <span ref={inner} className="ix-hold__fill-inner">
            {children}
          </span>
        </span>
      </button>
      <span id={descId} hidden>
        {description}
      </span>
    </>
  )
}

type UndoWindowProps = {
  /** Visible message with the seconds left, e.g. (s) => `Revoking 12 links in ${s}s`. */
  message: (secondsLeft: number) => ReactNode
  /** Announced once to screen readers when the window opens, e.g. "Revoking 12 links. Undo is available for 8 seconds." */
  announcement: string
  onUndo: () => void
  /** Called once when the window runs out: release the effect here. */
  onExpire: () => void
  /** Window length in ms. Recommended range 5000–10000. */
  duration?: number
  /** Moves focus to Undo when it appears (do this when it replaces the focused control). */
  focusUndo?: boolean
  /**
   * What leaving early means. 'release' (default): the user believed the action happened,
   * so unmounting (navigating away) releases it. 'cancel': unmounting drops it.
   * Under React StrictMode in development, 'release' fires on the simulated unmount.
   */
  onUnmount?: 'release' | 'cancel'
  className?: string
}

/**
 * The honest undo window before an effect is released. Pauses while hovered, while the
 * user moves focus into it and while the tab is hidden (WCAG 2.2.1); the focus it places
 * on Undo itself does not pause it. Time is counted from real elapsed time on a timer.
 * The bar is a compositor animation kept in step with that timer (paused and resumed
 * with it), so it glides instead of stepping; the seconds re-render only when they change.
 */
export function UndoWindow({
  message,
  announcement,
  onUndo,
  onExpire,
  duration = 8000,
  focusUndo = true,
  onUnmount = 'release',
  className,
}: UndoWindowProps) {
  const root = useRef<HTMLDivElement>(null)
  const undo = useRef<HTMLButtonElement>(null)
  const bar = useRef<HTMLSpanElement>(null)
  const [seconds, setSeconds] = useState(Math.ceil(duration / 1000))
  const [said, setSaid] = useState('')
  const paused = useRef({ hover: false, focus: false })
  const placingFocus = useRef(false)
  const settled = useRef(false)
  const expire = useRef(onExpire)
  expire.current = onExpire
  const unmountMode = useRef(onUnmount)
  unmountMode.current = onUnmount

  useEffect(() => {
    if (focusUndo) {
      placingFocus.current = true
      undo.current?.focus()
      placingFocus.current = false
    }
    // Fill the live region after it is mounted, so the message is announced
    const t = window.setTimeout(() => setSaid(announcement), 50)
    return () => window.clearTimeout(t)
    // Mount only: the announcement is spoken once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    let remaining = duration
    let last = performance.now()
    const glide = bar.current?.animate([{ transform: 'scaleX(1)' }, { transform: 'scaleX(0)' }], {
      duration,
      easing: 'linear',
      fill: 'forwards',
    })
    const id = window.setInterval(() => {
      const now = performance.now()
      const p = paused.current
      const isPaused = p.hover || p.focus || document.hidden
      if (!isPaused) remaining -= now - last
      last = now
      // Keep the picture in step with the clock: hold it while paused, resync on resume
      if (glide) {
        if (isPaused && glide.playState === 'running') glide.pause()
        else if (!isPaused && glide.playState === 'paused') {
          glide.currentTime = duration - Math.max(0, remaining)
          glide.play()
        }
      }
      if (remaining <= 0) {
        window.clearInterval(id)
        settled.current = true
        expire.current()
        return
      }
      setSeconds(Math.ceil(remaining / 1000))
    }, 100)
    return () => {
      window.clearInterval(id)
      glide?.cancel()
      if (!settled.current && unmountMode.current === 'release') {
        settled.current = true
        expire.current()
      }
    }
  }, [duration])

  return (
    <div
      ref={root}
      className={cx('ix-undo', className)}
      onPointerEnter={() => (paused.current.hover = true)}
      onPointerLeave={() => (paused.current.hover = false)}
      onFocus={() => {
        if (!placingFocus.current) paused.current.focus = true
      }}
      onBlur={(e) => {
        if (!root.current?.contains(e.relatedTarget as Node | null)) paused.current.focus = false
      }}
    >
      <span className="ix-sr" role="status">
        {said}
      </span>
      <span className="ix-undo__msg" aria-hidden="true">
        {message(seconds)}
      </span>
      <button
        ref={undo}
        type="button"
        className="ix-btn ix-btn--secondary ix-btn--compact"
        onClick={() => {
          settled.current = true
          onUndo()
        }}
      >
        <span className="ix-btn__bg" aria-hidden="true" />
        <span className="ix-btn__label">Undo</span>
      </button>
      <span ref={bar} className="ix-undo__bar" aria-hidden="true" />
    </div>
  )
}
