import { useId, useState, type ReactNode } from 'react'
import { TODAY, TODAY as T } from '../data'
import { DIAL_DAYS, money, monthMarks, type States } from '../model'

const C = 220
const R_TRACK = 122
const R_MARK = 130
const PX_PER_DOLLAR = 1.35
const SUNDAYS = [1, 8, 15, 22, 29]
const WEEK = 7

const ang = (day: number) => ((-90 + ((day - 1) / DIAL_DAYS) * 360) * Math.PI) / 180
const pt = (day: number, r: number) => ({ x: C + r * Math.cos(ang(day)), y: C + r * Math.sin(ang(day)) })

/** Drawing units to a position over the drawing, in percent. */
const at = (p: { x: number; y: number }) => ({ left: `${((p.x + 12) / 464) * 100}%`, top: `${((p.y + 12) / 464) * 100}%` })

function arc(from: number, to: number, r: number) {
  const a = pt(from, r)
  const b = pt(to, r)
  const large = ((to - from) / DIAL_DAYS) * 360 > 180 ? 1 : 0
  return `M ${a.x} ${a.y} A ${r} ${r} 0 ${large} 1 ${b.x} ${b.y}`
}

type Props = {
  states: States
  /** The subscription picked elsewhere (a table row, an insight). */
  selected?: string | null
  onSelect?: (id: string) => void
  /** Off inside the self-playing demo: marks are pictures there, not controls. */
  interactive?: boolean
  children?: ReactNode
  className?: string
  /** Marks draw out once when the dial first appears (off in the demo, which tells its own story). */
  intro?: boolean
}

/**
 * The month dial: every charge this month as a mark on its day. Mark length is the amount
 * (1.35 px per dollar, same scale for every mark); colour is the category. The brass hand is
 * today and the brass arc the next seven days. Charges already paid sit dimmed.
 */
export function Dial({ states, selected, onSelect, interactive = true, children, className, intro = true }: Props) {
  const [hover, setHover] = useState<string | null>(null)
  const uid = useId().replace(/:/g, '')
  const marks = monthMarks()
  const focus = hover ?? selected ?? null
  const tipId = hover ?? (interactive ? selected : null) ?? null
  const tip = tipId ? marks.find((m) => m.sub.id === tipId) : null
  const tipAt = tip ? pt(tip.day, R_MARK + (tip.amount / 100) * PX_PER_DOLLAR + 18) : null

  return (
    <div className={`dial ${intro ? 'dial--intro' : ''} ${className ?? ''}`}>
      <svg className="dial__svg" viewBox="-12 -12 464 464" role="group" aria-label={`Charges in November by day. Today is the ${T.d}th.`}>
        <circle className="dial__face" cx={C} cy={C} r={204} />
        <circle className="dial__track" cx={C} cy={C} r={R_TRACK} />
        {Array.from({ length: DIAL_DAYS }, (_, i) => i + 1).map((d) => {
          const sun = SUNDAYS.includes(d)
          const a = pt(d, R_TRACK - (sun ? 13 : 9))
          const b = pt(d, R_TRACK - 5)
          return <line key={d} className={sun ? 'dial__tick dial__tick--sun' : 'dial__tick'} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
        })}
        {(() => {
          // The coming week: brass at today, fading out by the seventh day
          const a = pt(TODAY.d, R_TRACK)
          const b = pt(TODAY.d + WEEK, R_TRACK)
          return (
            <>
              <defs>
                <linearGradient id={`${uid}-week`} gradientUnits="userSpaceOnUse" x1={a.x} y1={a.y} x2={b.x} y2={b.y}>
                  <stop offset="0" className="dial__week-stop" />
                  <stop offset="1" className="dial__week-stop dial__week-stop--end" />
                </linearGradient>
              </defs>
              <path className="dial__week" d={arc(TODAY.d, TODAY.d + WEEK, R_TRACK)} style={{ stroke: `url(#${uid}-week)` }} />
            </>
          )
        })()}

        {marks.map((m) => {
          const gone = states[m.sub.id] === 'cancelled' && !m.paid
          const len = (m.amount / 100) * PX_PER_DOLLAR
          const a = pt(m.day, R_MARK)
          const b = pt(m.day, R_MARK + len)
          const dim = focus && focus !== m.sub.id
          const label = `${m.sub.name}, ${money(m.amount)} on ${m.day} November${m.paid ? ', paid' : ''}`
          const handlers = interactive && !gone
            ? {
                role: 'button',
                tabIndex: 0,
                'aria-label': label,
                'aria-pressed': selected === m.sub.id,
                onPointerEnter: () => setHover(m.sub.id),
                onPointerLeave: () => setHover(null),
                onFocus: () => setHover(m.sub.id),
                onBlur: () => setHover(null),
                onClick: () => onSelect?.(m.sub.id),
                onKeyDown: (e: React.KeyboardEvent) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onSelect?.(m.sub.id)
                  }
                },
              }
            : { 'aria-hidden': true }
          return (
            <g
              key={m.sub.id}
              className="dial__mark"
              data-cat={m.sub.category}
              data-paid={m.paid || undefined}
              data-dim={dim || undefined}
              data-on={focus === m.sub.id || undefined}
              data-gone={gone || undefined}
              data-mark={m.sub.id}
              {...handlers}
            >
              <circle className="dial__hit" cx={(a.x + b.x) / 2} cy={(a.y + b.y) / 2} r={20} />
              <line className="dial__ring" x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
              {/* Flat sweep: the category hue turns a little toward the head (under 30 degrees), on the same scale */}
              <linearGradient id={`${uid}-${m.sub.id}`} gradientUnits="userSpaceOnUse" x1={a.x} y1={a.y} x2={b.x} y2={b.y}>
                <stop offset="0" className="dial__stop" />
                <stop offset="1" className="dial__stop dial__stop--head" />
              </linearGradient>
              <line
                className="dial__bar"
                x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                pathLength={1}
                style={{ stroke: `url(#${uid}-${m.sub.id})`, ['--i' as string]: m.day }}
              />
            </g>
          )
        })}

        <g className="dial__hand" aria-hidden="true">
          {(() => {
            const a = pt(TODAY.d, R_TRACK + 4)
            const b = pt(TODAY.d, 200)
            return (
              <>
                <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
                <circle cx={b.x} cy={b.y} r={3.5} />
              </>
            )
          })()}
        </g>
      </svg>
      {/* Day numbers and the Today label are page text over the drawing, so they keep their real size */}
      <div className="dial__labels" aria-hidden="true">
        {SUNDAYS.map((d) => {
          const p = at(pt(d, 216))
          return <span key={d} className="dial__num" style={{ left: p.left, top: p.top }}>{d}</span>
        })}
        {(() => {
          const p = at(pt(TODAY.d, 214))
          return <span className="dial__today" style={{ left: p.left, top: p.top }}>Today</span>
        })()}
      </div>
      {children && <div className="dial__centre">{children}</div>}
      {tip && tipAt && (
        <div className="dial__tip" style={at(tipAt)} aria-hidden="true">
          <span className="dial__tip-name">{tip.sub.name}</span>
          <span className="dial__tip-meta">
            {tip.paid ? 'Paid' : 'Due'} {tip.day} Nov, <span className="num">{money(tip.amount)}</span>
          </span>
        </div>
      )}
    </div>
  )
}
