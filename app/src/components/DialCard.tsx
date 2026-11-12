import { CATEGORIES } from '../data'
import { money, totals, type States } from '../model'
import { CATEGORY_ICON } from './CategoryIcon'
import { Dial } from './Dial'
import { Money } from './Money'

type Props = {
  states: States
  selected?: string | null
  onSelect?: (id: string) => void
  interactive?: boolean
  /** Small layout for narrow places: the figures under the dial, no category list. */
  compact?: boolean
  intro?: boolean
}

/** The one rich object: the month dial and the figures it explains, on midnight ink. */
export function DialCard({ states, selected, onSelect, interactive = true, compact, intro = true }: Props) {
  const t = totals(states)
  const cats = CATEGORIES.map((c) => ({ ...c, amount: t.byCategory.get(c.id) ?? 0 }))
    .filter((c) => c.amount > 0)
    .sort((a, b) => b.amount - a.amount)

  return (
    <section className="dial-card" data-compact={compact || undefined} aria-label="November at a glance">
      <Dial states={states} selected={selected} onSelect={onSelect} interactive={interactive} intro={intro}>
        <span className="dial-card__label">Still to pay in November</span>
        <Money className="dial-card__big" cents={t.toPay} raised />
        <span className="dial-card__sub">
          of <Money cents={t.due} /> this month
        </span>
      </Dial>

      <div className="dial-card__side">
        <div className="dial-card__head">
          <span className="dial-card__title">November</span>
          <span className="dial-card__date">Thursday 5</span>
        </div>

        <dl className="dial-card__figs">
          <div>
            <dt>Every month</dt>
            <dd><Money cents={t.monthly} raised /></dd>
          </div>
          <div>
            <dt>Every year</dt>
            <dd><Money cents={t.yearly} raised /></dd>
          </div>
          <div className="dial-card__saving" data-on={t.saving > 0 || undefined} aria-hidden={t.saving > 0 ? undefined : true}>
            <dt>Saving</dt>
            <dd>
              <Money cents={t.saving} raised /> <span className="dial-card__per">a year</span>
            </dd>
          </div>
        </dl>

        {!compact && (
          <ul className="dial-card__cats" aria-label="Each month, by category">
            {cats.map((c) => {
              const Icon = CATEGORY_ICON[c.id]
              return (
                <li key={c.id} data-cat={c.id}>
                  <Icon size={16} strokeWidth={2} aria-hidden="true" />
                  <span className="dial-card__cat">{c.label}</span>
                  <span className="dial-card__amt num">{money(c.amount)}</span>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </section>
  )
}
