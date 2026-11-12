import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './recipes/tokens.css'
import './recipes/MorphButton.css'
import './recipes/HoldToConfirm.css'
import './styles/tokens.css'
import './styles/app.css'
import './styles/shell.css'
import './demo/demo.css'
import './concept/concept.css'
import { App } from './App'
import { DemoPage } from './demo/DemoPage'
import { Concept } from './concept/Concept'
import { useTheme } from './theme'

type View = 'concept' | 'demo' | 'app'
const fromHash = (): View => (location.hash === '#app' ? 'app' : location.hash === '#demo' ? 'demo' : 'concept')
const VIEWS: [View, string][] = [['concept', 'Concept'], ['demo', 'Product demo'], ['app', 'Clickable app']]

/** One page, three views of one product, switched by the address hash. */
function Showcase() {
  useTheme()
  const [view, setView] = useState<View>(fromHash)
  useEffect(() => {
    const on = () => { setView(fromHash()); window.scrollTo(0, 0) }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return (
    <>
      <nav className="shell" aria-label="Recur views">
        <span className="shell__name">Product concept</span>
        <span className="shell__views">
          {VIEWS.map(([id, label]) => (
            <a key={id} href={`#${id}`} aria-current={view === id ? 'page' : undefined}>{label}</a>
          ))}
        </span>
      </nav>
      {view === 'app' ? <App /> : view === 'demo' ? <DemoPage /> : <Concept />}
    </>
  )
}

createRoot(document.getElementById('root')!).render(<StrictMode><Showcase /></StrictMode>)
