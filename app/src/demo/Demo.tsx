import { useEffect, useState } from 'react'
import { Stage } from '@kit/stage'
import { Window } from '@kit/window'
import { Swap } from '@kit/motion/Swap'
import type { Act } from '@kit/act'
import { SUBS } from '../data'
import { dateLabel, initialStates, insights, money, nextCharge, perYear, type States } from '../model'
import { CategoryIcon } from '../components/CategoryIcon'
import { DialCard } from '../components/DialCard'
import { Dial } from '../components/Dial'
import { Money } from '../components/Money'
import { Insights } from '../components/Insights'
import { History } from '../components/SubList'
import { totals } from '../model'
import { useReducedMotion } from '../recipes/motion'
import { keepMotion } from './keep-motion'
import { useDark } from '../theme'

// The real product's components and data. The demo cancels Reelhouse the day its price rise is spotted,
// so every figure that changes on screen is computed by the same model as the app.

type Phase = 'list' | 'review' | 'holding' | 'done'
type S = { phase: Phase; states: States }

const START: S = { phase: 'list', states: initialStates() }
const END: S = { phase: 'done', states: { ...initialStates(), reelhouse: 'cancelled' } }
const REST = { wide: { x: 700, y: 500 }, compact: { x: 300, y: 580 } }
const REEL = SUBS.find((s) => s.id === 'reelhouse')!

const script = async (a: Act<S>) => {
  // The month, and the alert that matters: long enough to read both
  await a.wait(1600)
  a.mark('alert')
  await a.click('review-reelhouse')
  await a.set({ phase: 'review' })
  // The rise, in its history: the hatched bar is the next charge
  await a.wait(1700)
  a.mark('hold')
  await a.move('hold')
  await a.set({ phase: 'holding' })
  await a.wait(1250)
  await a.set({ phase: 'done', states: END.states })
  a.mark('payoff')
  await a.wait(600)
  await a.move(a.layout === 'wide' ? REST.wide : REST.compact)
  await a.wait(2600)
}

/** The cancel panel: the same parts the app's row shows, with the hold drawn by state. */
function ReviewPanel({ phase }: { phase: Phase }) {
  const c = nextCharge(REEL)
  const held = phase === 'holding' || phase === 'done'
  return (
    <div className="card rd-review" data-cat={REEL.category}>
      <div className="rd-review__head">
        <CategoryIcon category={REEL.category} size={40} />
        <div className="rd-review__name">
          <span className="trow__title">{REEL.name}</span>
          <span className="trow__plan">{REEL.plan}, monthly</span>
        </div>
        <span className="rd-review__price num">{money(REEL.price)}<span className="trow__per">/mo</span></span>
      </div>
      <p className="rd-review__line">
        Goes up to <span className="num insight__rise">{money(REEL.newPrice!)}</span> on {dateLabel(c.ms)}
      </p>
      <History s={REEL} />
      <div className="rd-review__act">
        <div className="rd-slot" data-show={phase === 'done' ? 'undo' : 'hold'}>
          <span className="ix-btn ix-btn--danger ix-hold rd-hold" data-target="hold" data-held={held || undefined}>
            <span className="ix-btn__label">Hold to cancel {REEL.name}</span>
            <span className="ix-hold__fill is-on" aria-hidden="true">
              <span className="ix-hold__fill-inner">Hold to cancel {REEL.name}</span>
            </span>
          </span>
          <span className="ix-undo rd-undo">
            <span className="ix-undo__msg">Cancelled. Undo for 8s</span>
            <span className="ix-btn ix-btn--secondary ix-btn--compact"><span className="ix-btn__label">Undo</span></span>
            <span className="ix-undo__bar rd-undo__bar" />
          </span>
        </div>
        <span className="row-panel__note">
          {phase === 'done'
            ? <>Saving <span className="num">{money(perYear(REEL))}</span> a year. You keep access until {dateLabel(c.ms)}.</>
            : <>You keep access until {dateLabel(c.ms)} and won’t be charged again.</>}
        </span>
      </div>
    </div>
  )
}

function Side({ s }: { s: S }) {
  const items = insights(START.states).slice(0, 2)
  const group = s.phase === 'list' ? 'list' : 'review'
  return (
    <Swap id={group} duration={360} className="rd-side">
      {group === 'list' ? (
        <Insights items={items} onReview={() => {}} onDismiss={() => {}} still />
      ) : (
        <ReviewPanel phase={s.phase} />
      )}
    </Swap>
  )
}

function Compact({ s }: { s: S }) {
  const t = totals(s.states)
  return (
    <div className="rd-compact">
      <div className="rd-compact__top">
        <Dial states={s.states} interactive={false} intro={false} className="rd-compact__dial" />
        <dl className="rd-compact__figs">
          <div><dt>Still to pay in November</dt><dd><Money cents={t.toPay} raised /></dd></div>
          <div className="rd-compact__saving" data-on={t.saving > 0 || undefined}><dt>Saving</dt><dd><Money cents={t.saving} raised /> <span className="dial-card__per">a year</span></dd></div>
        </dl>
      </div>
      <Side s={s} />
    </div>
  )
}

const BEATS = [
  { t: 'Spot the price rise', d: 'Recur flags that Reelhouse goes up to $17.99 on 21 November.' },
  { t: 'Hold to cancel', d: 'One press and hold on the plan. No menus, no confirm dialog.' },
  { t: 'Keep the saving', d: 'The charge leaves the dial and $215.88 a year lands as saved.' },
]
const beatOf = (p: Phase) => (p === 'list' ? 0 : p === 'done' ? 2 : 1)

/** Reports the stage's phase to the page outside it, for the step row under the demo. */
function Report({ phase, on }: { phase: Phase; on: (p: Phase) => void }) {
  useEffect(() => on(phase), [phase, on])
  return null
}

/** The self-playing demo: spot a price rise, hold to cancel, the saving lands. Plays once in view. */
export function Demo() {
  const reduced = useReducedMotion()
  const [chosen, setChosen] = useState(false)
  const [paused, setPaused] = useState(false)
  const [run, setRun] = useState(0)
  const [fonts, setFonts] = useState(false)
  const dark = useDark()
  const [phase, setPhase] = useState<Phase>('list')

  useEffect(() => {
    document.fonts.ready.then(() => setFonts(true))
  }, [])
  // A demo the person chose to play keeps its motion; nothing else on the page does
  useEffect(() => (chosen ? keepMotion() : undefined), [chosen])

  const still = paused || (reduced && !chosen)
  return (
    <figure className="rd-figure">
      <div aria-hidden="true">
        {fonts ? (
          <Stage<S>
            key={`${run}-${still}-${chosen}-${dark}`}
            width={1040}
            height={540}
            compact={{ below: 640, width: 358, height: 620 }}
            initial={START}
            poster={END}
            play="once"
            script={still ? undefined : script}
            cursor={{ at: REST }}
            className="rd"
            theme={dark ? 'dark' : 'light'}
          >
            {(s, _rect, layout) =>
              layout === 'compact' ? (
                <><Report phase={s.phase} on={setPhase} /><Compact s={s} /></>
              ) : (
                <><Report phase={s.phase} on={setPhase} /><Window title="Recur" className="rd-window">
                  <div className="rd-body">
                    <DialCard states={s.states} interactive={false} compact intro={false} />
                    <Side s={s} />
                  </div>
                </Window></>
              )
            }
          </Stage>
        ) : (
          <div className="rd-pending" />
        )}
      </div>
      <ol className="rd-beats" aria-label="What the demo shows">
        {BEATS.map((b, i) => (
          <li key={b.t} aria-current={beatOf(still ? 'done' : phase) === i ? 'step' : undefined}>
            <span className="rd-beats__n" aria-hidden="true">{i + 1}</span>
            <span className="rd-beats__t">{b.t}</span>
            <span className="rd-beats__d">{b.d}</span>
          </li>
        ))}
      </ol>
      <figcaption className="rd-controls">
        {reduced && !chosen ? (
          <button type="button" className="btn btn--secondary btn--sm" onClick={() => { setChosen(true); setPaused(false); setRun((n) => n + 1) }}>
            Play demo
          </button>
        ) : (
          <>
            <button type="button" className="btn btn--secondary btn--sm" aria-pressed={paused} onClick={() => setPaused((p) => !p)}>
              {paused ? 'Play demo' : 'Pause demo'}
            </button>
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => { setPaused(false); setRun((n) => n + 1) }}>
              Replay
            </button>
          </>
        )}
        <span className="rd-note">
          Reelhouse’s price is about to rise. One hold cancels it, and the saving lands on the dial. Sample data.
        </span>
      </figcaption>
    </figure>
  )
}
