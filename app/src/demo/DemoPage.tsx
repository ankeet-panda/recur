import { Demo } from './Demo'

/** A landing-hero setting for the demo: page copy above one stage. */
export function DemoPage() {
  return (
    <main className="demo-page">
      <div className="demo-page__copy">
        <h1 className="demo-page__title">Catch the price rise before it charges</h1>
        <div className="demo-page__side">
          <p className="demo-page__lede">
            Recur puts every renewal on one month dial and tells you when a price is about to change. One hold cancels,
            and the saving shows up straight away.
          </p>
          <a className="btn btn--primary" href="#app">Try the app</a>
        </div>
      </div>
      <Demo />
    </main>
  )
}
