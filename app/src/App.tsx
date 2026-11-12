import { useState } from 'react'
import { DialCard } from './components/DialCard'
import { Insights, insightKey } from './components/Insights'
import { SubList, type Filter, type Sort } from './components/SubList'
import { initialStates, insights, type States } from './model'
import { ThemeControl } from './theme'

/** The clickable screen: one page, everything on it works. State lives in this tab only. */
export function App() {
  const [states, setStates] = useState<States>(initialStates)
  const [open, setOpen] = useState<string | null>(null)
  const [filter, setFilter] = useState<Filter>('all')
  const [sort, setSort] = useState<Sort>('soonest')
  const [reminders, setReminders] = useState<Record<string, boolean>>({ reelhouse: true })
  const [pending, setPending] = useState<string | null>(null)
  const [dismissed, setDismissed] = useState<string[]>([])

  const items = insights(states).filter((i) => !dismissed.includes(insightKey(i)))
  const review = (id: string) => {
    setFilter('all')
    setOpen(id)
  }

  return (
    <div className="app">
      <header className="appbar">
        {/* lint-allow: logo-not-home a single-screen app: the wordmark is on the only page there is */}
        <span className="wordmark">Recur</span>
        <div className="appbar__end">
          <ThemeControl />
          <span className="avatar" aria-label="Signed in as Mira Shah" role="img">MS</span>
        </div>
      </header>
      <main className="app__main">
        <h1 className="page-title">Your subscriptions</h1>
        <div className="app__top">
          <DialCard states={states} selected={open} onSelect={review} />
          <Insights items={items} onReview={review} onDismiss={(k) => setDismissed((d) => [...d, k])} />
        </div>
        <SubList
          states={states}
          open={open}
          setOpen={(id) => {
            if (pending && pending !== id) setPending(null)
            setOpen(id)
          }}
          filter={filter}
          setFilter={setFilter}
          sort={sort}
          setSort={setSort}
          reminders={reminders}
          toggleReminder={(id) => setReminders((r) => ({ ...r, [id]: !r[id] }))}
          pending={pending}
          setPending={setPending}
          cancel={(id) => {
            setStates((s) => ({ ...s, [id]: 'cancelled' }))
            setPending(id)
          }}
          restore={(id) => {
            setStates((s) => ({ ...s, [id]: 'active' }))
            setPending((p) => (p === id ? null : p))
          }}
          settle={(id) => {
            setPending((p) => (p === id ? null : p))
            setOpen((o) => (o === id ? null : o))
          }}
        />
        <p className="app__foot">A product concept. Every name, price and date here is sample data.</p>
      </main>
    </div>
  )
}
