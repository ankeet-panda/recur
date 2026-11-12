import { useState } from 'react'
import { SUBS } from '../data'
import { initialStates, insights, money, perYear } from '../model'
import { CategoryIcon, CATEGORY_ICON } from '../components/CategoryIcon'
import { Dial } from '../components/Dial'
import { DialCard } from '../components/DialCard'
import { Insights } from '../components/Insights'
import { HoldToConfirm, UndoWindow } from '../recipes/HoldToConfirm'
import { CATEGORIES } from '../data'

const KINO = SUBS.find((s) => s.id === 'kino')!

/** A working hold-to-cancel, on its own: hold, watch the undo window, reset. */
function TryHold() {
  const [step, setStep] = useState<'idle' | 'undo' | 'done'>('idle')
  return (
    <div className="card cx-try" data-cat={KINO.category}>
      <div className="cx-try__row">
        <CategoryIcon category={KINO.category} size={40} />
        <div className="cx-try__name">
          <span className="trow__title">{KINO.name}</span>
          <span className="trow__plan">{KINO.plan}, monthly</span>
        </div>
        <span className="trow__price num">{money(KINO.price)}<span className="trow__per">/mo</span></span>
      </div>
      <div className="cx-try__act">
        {step === 'idle' && (
          <>
            <HoldToConfirm onConfirm={() => setStep('undo')}>Hold to cancel {KINO.name}</HoldToConfirm>
            <span className="row-panel__note">Press and hold for about a second. Let go early and nothing happens.</span>
          </>
        )}
        {step === 'undo' && (
          <UndoWindow
            message={(n) => `Cancelled. Undo for ${n}s`}
            announcement={`${KINO.name} is cancelled. You can undo for 8 seconds.`}
            onUndo={() => setStep('idle')}
            onExpire={() => setStep('done')}
            onUnmount="cancel"
          />
        )}
        {step === 'done' && (
          <div className="cx-try__done">
            <span>
              Cancelled. Saving <span className="num cx-saved">{money(perYear(KINO))}</span> a year.
            </span>
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => setStep('idle')}>
              Try it again
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

const SWATCHES = [
  { name: 'Midnight', role: 'The dial: the one rich object on the screen', v: 'var(--dial)' },
  { name: 'Brass', role: 'Today, and the charges coming in the next seven days', v: 'var(--brass)' },
  { name: 'Green', role: 'Money you’ve saved', v: 'var(--saved)' },
  { name: 'Red', role: 'A price that’s going up', v: 'var(--rise)' },
]

export function Concept() {
  const [selected, setSelected] = useState<string | null>(null)
  const states = initialStates()
  return (
    <main className="cx">
      <section className="cx-hero">
        <div className="cx-hero__copy">
          <h1 className="cx-title">Every renewal, before it lands</h1>
          <p className="cx-lede">
            Recur keeps track of your subscriptions for you. It puts every recurring charge on one month dial, warns you
            before a price changes, and cancels with a single hold.
          </p>
          <div className="cx-actions">
            <a className="btn btn--primary" href="#app">Try the app</a>
            <a className="btn btn--secondary" href="#demo">Watch the demo</a>
          </div>
        </div>
        <div className="cx-hero__product">
          <DialCard states={states} selected={selected} onSelect={(id) => setSelected((s) => (s === id ? null : id))} />
          <p className="cx-caption">The real dial, with sample data. Select a mark to see the charge.</p>
        </div>
      </section>

      <section className="cx-why" aria-labelledby="why">
        <h2 className="cx-h2" id="why">Easy to start, easy to forget</h2>
        <div className="cx-why__points">
          <p><strong>Renewals happen quietly.</strong> A free trial becomes a monthly charge, and the first sign is the bank statement.</p>
          <p><strong>Price rises arrive by email.</strong> The notice is easy to miss, and the new price starts on the next renewal.</p>
          <p><strong>Cancelling is buried.</strong> It sits behind account menus that are different for every service.</p>
        </div>
      </section>

      <section className="cx-moments" aria-labelledby="how">
        <h2 className="cx-h2" id="how">How Recur helps</h2>

        <article className="cx-moment">
          <div className="cx-moment__text">
            <h3 className="cx-h3">See the whole month at a glance</h3>
            <p>
              The dial is November. Each mark is one charge, placed on its day. The longer the mark, the more it costs,
              on one scale for every service. The brass hand is today; the brass arc is the coming week.
            </p>
            <ul className="cx-keys">
              {CATEGORIES.map((c) => {
                const Icon = CATEGORY_ICON[c.id]
                return (
                  <li key={c.id} data-cat={c.id}><Icon size={16} strokeWidth={2} aria-hidden="true" />{c.label}</li>
                )
              })}
            </ul>
          </div>
          <div className="cx-moment__visual cx-dial-solo">
            <Dial states={states} interactive={false}>
              <span className="dial-card__label">November</span>
              <span className="cx-dial-solo__big">8 charges</span>
              <span className="dial-card__sub">2 paid, 6 to come</span>
            </Dial>
          </div>
        </article>

        <article className="cx-moment cx-moment--flip">
          <div className="cx-moment__text">
            <h3 className="cx-h3">Hear about a price rise before it charges</h3>
            <p>
              Recur watches for price changes and plans you’ve stopped using, and puts them in one short list. Each
              one says what changes, when, and what it costs you over a year.
            </p>
          </div>
          <div className="cx-moment__visual">
            <Insights items={insights(states).slice(0, 2)} onReview={() => { location.hash = '#app' }} onDismiss={() => {}} />
          </div>
        </article>

        <article className="cx-moment">
          <div className="cx-moment__text">
            <h3 className="cx-h3">Cancel with one hold, undo for eight seconds</h3>
            <p>
              No confirm dialog, no hunting through menus. Press and hold, and it’s done. If you change your mind,
              Undo stays open for eight seconds. Try it here.
            </p>
          </div>
          <div className="cx-moment__visual">
            <TryHold />
          </div>
        </article>
      </section>

      <section className="cx-design" aria-labelledby="design">
        <div className="cx-design__intro">
          <h2 className="cx-h2" id="design">Composed, exact, warm</h2>
          <p>
            Recur should feel like a good watch, not a banking app. One deep object, the dial, sits on a quiet porcelain
            page. Every other surface stays calm, so the few colours that appear always mean something.
          </p>
        </div>

        <div className="cx-design__grid">
          <div className="cx-block">
            <h3 className="cx-h3">Colour that means one thing</h3>
            <ul className="cx-swatches">
              {SWATCHES.map((s) => (
                <li key={s.name}>
                  <span className="cx-swatch" style={{ background: s.v }} aria-hidden="true" />
                  <span className="cx-swatch__name">{s.name}</span>
                  <span className="cx-swatch__role">{s.role}</span>
                </li>
              ))}
            </ul>
            <p className="cx-small">Each category keeps one hue everywhere: on its icon, on its dial mark and in its total.</p>
          </div>

          <div className="cx-block">
            <h3 className="cx-h3">Two typefaces, two jobs</h3>
            <div className="cx-type">
              <span className="cx-type__serif money--raised"><span className="sr-only">$163.38</span><span aria-hidden="true" className="money__face">$163<span className="money__cents">38</span></span></span>
              <span className="cx-small">Newsreader, for the figures you came to see</span>
            </div>
            <div className="cx-type">
              <span className="cx-type__sans">Hold to cancel Reelhouse</span>
              <span className="cx-small">Hanken Grotesk, for everything you read and press. Its figures line up in columns.</span>
            </div>
          </div>

          <div className="cx-block cx-block--wide">
            <h3 className="cx-h3">Motion only where something changed</h3>
            <p>
              Digits roll to their new value. A cancelled charge leaves the dial. The hold fills as you press. Nothing
              loops, nothing waits for you, and with reduced motion turned on every change still happens, just without the
              movement.
            </p>
          </div>
        </div>
      </section>

      <section className="cx-close" aria-labelledby="close">
        <h2 className="cx-h2" id="close">See it work</h2>
        <div className="cx-actions">
          <a className="btn btn--primary" href="#demo">Watch the demo</a>
          <a className="btn btn--secondary" href="#app">Try the app</a>
        </div>
      </section>

      <footer className="cx-foot">Recur is a product concept. Every name, price and usage figure here is sample data.</footer>
    </main>
  )
}
