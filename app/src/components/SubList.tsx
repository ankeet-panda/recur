import { useEffect, useRef } from 'react'
import { ChevronDown, RotateCcw } from 'lucide-react'
import { CATEGORIES, SUBS, type CategoryId, type Sub } from '../data'
import { dateLabel, lastUsed, money, nextCharge, perYear, relative, type States } from '../model'
import { HoldToConfirm, UndoWindow } from '../recipes/HoldToConfirm'
import { CategoryIcon } from './CategoryIcon'

export type Filter = 'all' | CategoryId
export type Sort = 'soonest' | 'cost'

type Props = {
  states: States
  open: string | null
  setOpen: (id: string | null) => void
  filter: Filter
  setFilter: (f: Filter) => void
  sort: Sort
  setSort: (s: Sort) => void
  reminders: Record<string, boolean>
  toggleReminder: (id: string) => void
  pending: string | null
  setPending: (id: string | null) => void
  /** Hold done: cancelled now, with an undo window on the row. */
  cancel: (id: string) => void
  restore: (id: string) => void
  /** The undo window ran out. */
  settle: (id: string) => void
}

export function History({ s }: { s: Sub }) {
  if (!s.history) {
    const c = nextCharge(s)
    return (
      <div className="hist hist--yearly">
        <span className="hist__label">Billed once a year</span>
        <span className="hist__yearly">
          Next charge <span className="num">{money(c.amount)}</span> on {dateLabel(c.ms)}
        </span>
      </div>
    )
  }
  const next = nextCharge(s)
  const bars = [...s.history, next.amount]
  const max = Math.max(...bars)
  const changed = s.newPrice && s.newPrice !== s.price
  return (
    <div className="hist">
      <span className="hist__label">Last 12 charges, then the next</span>
      <div className="hist__bars" role="img" aria-label={`Last 12 charges from ${money(s.history[0])} to ${money(s.history[11])}; next charge ${money(next.amount)}.`}>
        {bars.map((v, i) => (
          <span
            key={i}
            className="hist__bar"
            data-next={i === bars.length - 1 || undefined}
            data-rise={(i === bars.length - 1 && changed) || undefined}
            style={{ height: `${(v / max) * 100}%` }}
          />
        ))}
      </div>
      <span className="hist__foot">
        <span>A year ago <span className="num">{money(s.history[0])}</span></span>
        <span className={changed ? 'hist__next is-rise' : 'hist__next'}>
          Next <span className="num">{money(next.amount)}</span>
        </span>
      </span>
    </div>
  )
}

function Panel({ s, p }: { s: Sub; p: Props }) {
  const c = nextCharge(s)
  const pending = p.pending === s.id
  const on = !!p.reminders[s.id]
  return (
    <div className="row-panel" id={`panel-${s.id}`}>
      <History s={s} />
      <dl className="row-panel__facts">
        <div><dt>Plan</dt><dd>{s.plan}, {s.cycle}</dd></div>
        <div><dt>Billed to</dt><dd>{s.card}</dd></div>
        <div><dt>Member since</dt><dd>{s.since}</dd></div>
      </dl>
      <div className="row-panel__act">
        <button type="button" role="switch" aria-checked={on} className="switch" onClick={() => p.toggleReminder(s.id)}>
          <span className="switch__track" aria-hidden="true"><span className="switch__knob" /></span>
          <span>Remind me 3 days before it renews</span>
        </button>
        {pending ? (
          <UndoWindow
            message={(n) => `Cancelled. Undo for ${n}s`}
            announcement={`${s.name} is cancelled. You can undo for 8 seconds.`}
            onUndo={() => p.restore(s.id)}
            onExpire={() => p.settle(s.id)}
          />
        ) : (
          <>
            <HoldToConfirm onConfirm={() => p.cancel(s.id)} className="row-panel__cancel">
              Hold to cancel {s.name}
            </HoldToConfirm>
            <span className="row-panel__note">
              You keep access until {dateLabel(c.ms)} and won’t be charged again.
            </span>
          </>
        )}
      </div>
    </div>
  )
}

export function SubList(p: Props) {
  const { states, open, setOpen, filter, setFilter, sort, setSort } = p
  const active = SUBS.filter((s) => states[s.id] === 'active')
  const cancelled = SUBS.filter((s) => states[s.id] === 'cancelled' && s.id !== p.pending)
  const shown = SUBS.filter((s) => states[s.id] === 'active' || s.id === p.pending)
    .filter((s) => filter === 'all' || s.category === filter)
    .sort((a, b) => (sort === 'soonest' ? nextCharge(a).ms - nextCharge(b).ms : perYear(b) - perYear(a)))
  const counts = new Map<Filter, number>([['all', active.length]])
  for (const s of active) counts.set(s.category, (counts.get(s.category) ?? 0) + 1)

  // An insight's Review opens a row: bring it into view
  const rowRefs = useRef(new Map<string, HTMLButtonElement>())
  const lastOpen = useRef<string | null>(null)
  useEffect(() => {
    if (open && open !== lastOpen.current) {
      const el = rowRefs.current.get(open)
      if (el && document.activeElement !== el && !el.contains(document.activeElement)) {
        el.scrollIntoView({ block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
        el.focus({ preventScroll: true })
      }
    }
    lastOpen.current = open
  }, [open])

  return (
    <section className="card subs" aria-labelledby="subs-title">
      <div className="subs__top">
        <div className="card__head">
          <span className="mark" aria-hidden="true"><RotateCcw size={15} strokeWidth={2} /></span>
          <h2 className="card__title" id="subs-title">Subscriptions</h2>
          <span className="card__count num">{active.length}</span>
        </div>
        <div className="subs__tools">
          <div className="chips" role="group" aria-label="Show category">
            {(['all', ...CATEGORIES.map((c) => c.id)] as Filter[]).map((f) => {
              const n = counts.get(f) ?? 0
              if (f !== 'all' && n === 0) return null
              return (
                <button key={f} type="button" className="chip" aria-pressed={filter === f} onClick={() => setFilter(f)}>
                  {f === 'all' ? 'All' : CATEGORIES.find((c) => c.id === f)!.label}
                  <span className="chip__n num">{n}</span>
                </button>
              )
            })}
          </div>
          <div className="seg" role="group" aria-label="Sort by">
            <button type="button" aria-pressed={sort === 'soonest'} onClick={() => setSort('soonest')}>Soonest</button>
            <button type="button" aria-pressed={sort === 'cost'} onClick={() => setSort('cost')}>Cost</button>
          </div>
        </div>
      </div>

      <div className="table" role="list">
        <div className="table__head" aria-hidden="true">
          <span>Service</span>
          <span>Next charge</span>
          <span>Last used</span>
          <span className="right">Price</span>
          <span />
        </div>
        {shown.map((s) => {
          const c = nextCharge(s)
          const isOpen = open === s.id
          const stale = s.lastUsedDaysAgo >= 30
          const rise = s.newPrice && s.newPrice !== s.price
          return (
            <div key={s.id} role="listitem" className="trow" data-open={isOpen || undefined} data-cat={s.category}>
              <button
                ref={(el) => { if (el) rowRefs.current.set(s.id, el); else rowRefs.current.delete(s.id) }}
                type="button"
                className="trow__btn"
                aria-expanded={isOpen}
                aria-controls={isOpen ? `panel-${s.id}` : undefined}
                onClick={() => setOpen(isOpen ? null : s.id)}
              >
                <span className="trow__svc">
                  <CategoryIcon category={s.category} />
                  <span className="trow__name">
                    <span className="trow__title">{s.name}</span>
                    <span className="trow__plan">{s.plan}</span>
                  </span>
                </span>
                <span className="trow__next">
                  <span className={c.days <= 7 ? 'trow__when is-soon' : 'trow__when'}>{relative(c.days)}</span>
                  <span className="trow__date">{dateLabel(c.ms)}</span>
                </span>
                <span className={stale ? 'trow__used is-stale' : 'trow__used'}>{lastUsed(s.lastUsedDaysAgo)}</span>
                <span className="trow__cost right">
                  <span className="trow__price num">
                    {money(s.price)}
                    <span className="trow__per">{s.cycle === 'monthly' ? '/mo' : '/yr'}</span>
                  </span>
                  {rise ? (
                    <span className="trow__change is-rise">
                      <span className="num">{money(s.newPrice!)}</span> from {dateLabel(c.ms).slice(4)}
                    </span>
                  ) : s.cycle === 'yearly' ? (
                    <span className="trow__change"><span className="num">{money(Math.round(s.price / 12))}</span> a month</span>
                  ) : null}
                </span>
                <span className="trow__chev" aria-hidden="true"><ChevronDown size={18} strokeWidth={2} /></span>
              </button>
              {isOpen && <Panel s={s} p={p} />}
            </div>
          )
        })}
      </div>

      {cancelled.length > 0 && (
        <div className="gone">
          <span className="gone__title">Cancelled</span>
          <ul className="gone__list">
            {cancelled.map((s) => (
              <li key={s.id} className="gone__row">
                <CategoryIcon category={s.category} size={28} />
                <span className="gone__name">{s.name}</span>
                <span className="gone__saving">Saving <span className="num">{money(perYear(s))}</span> a year</span>
                <button type="button" className="btn btn--ghost btn--sm" onClick={() => p.restore(s.id)}>
                  Restore {s.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
