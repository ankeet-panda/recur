import { BellRing } from 'lucide-react'
import { dateLabel, money, type Insight } from '../model'
import { CategoryIcon } from './CategoryIcon'

type Props = {
  items: Insight[]
  onReview: (id: string) => void
  onDismiss: (key: string) => void
  /** Inside the demo: pictures of buttons, not controls. */
  still?: boolean
}

export const insightKey = (i: Insight) => `${i.kind}:${i.sub.id}`

function Text({ i }: { i: Insight }) {
  if (i.kind === 'rise') {
    return (
      <>
        <span className="insight__title">{i.sub.name} is going up</span>
        <span className="insight__body">
          From <span className="num">{money(i.from)}</span> to <span className="num insight__rise">{money(i.to)}</span> a month
          on {dateLabel(i.on)}. That’s <span className="num">{money(i.perYear)}</span> more a year.
        </span>
      </>
    )
  }
  return (
    <>
      <span className="insight__title">
        {i.sub.name} hasn’t been opened in {i.days} days
      </span>
      <span className="insight__body">
        <span className="num">{money(i.next.amount)}</span> renews on {dateLabel(i.next.ms)}.
      </span>
    </>
  )
}

export function Insights({ items, onReview, onDismiss, still }: Props) {
  const Btn = still ? 'span' : 'button'
  return (
    <section className="card insights" aria-labelledby="insights-title">
      <div className="card__head">
        <span className="mark" aria-hidden="true"><BellRing size={15} strokeWidth={2} /></span>
        <h2 className="card__title" id="insights-title">Worth a look</h2>
        <span className="card__count num">{items.length}</span>
      </div>
      {items.length === 0 ? (
        <p className="insights__empty">Nothing needs a look. Recur will tell you before any price changes.</p>
      ) : (
        <ul className="insights__list">
          {items.map((i) => (
            <li key={insightKey(i)} className="insight" data-kind={i.kind}>
              <CategoryIcon category={i.sub.category} size={36} />
              <div className="insight__text">
                <Text i={i} />
              </div>
              <div className="insight__actions">
                <Btn
                  {...(still ? {} : { type: 'button' as const, onClick: () => onReview(i.sub.id) })}
                  className={i.kind === 'rise' ? 'btn btn--primary btn--sm' : 'btn btn--secondary btn--sm'}
                  data-target={`review-${i.sub.id}`}
                >
                  Review
                </Btn>
                <Btn
                  {...(still ? {} : { type: 'button' as const, onClick: () => onDismiss(insightKey(i)), 'aria-label': `Dismiss: ${i.sub.name}` })}
                  className="btn btn--ghost btn--sm"
                >
                  Dismiss
                </Btn>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
