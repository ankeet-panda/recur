// A demo the person chose to play keeps its motion (a scoped opt-out from reduced motion).
// The kit reads the reduced-motion setting through matchMedia, so while this is on, that one query
// answers "no". It is switched on only by the demo's Play button and off when the demo unmounts.
const REDUCE = /prefers-reduced-motion:\s*reduce/
const native = window.matchMedia.bind(window)
let on = false

window.matchMedia = (query: string) => {
  if (!on || !REDUCE.test(query)) return native(query)
  const noop = () => {}
  return {
    matches: false, media: query, onchange: null,
    addEventListener: noop, removeEventListener: noop, addListener: noop, removeListener: noop,
    dispatchEvent: () => false,
  } as MediaQueryList
}

export function keepMotion() {
  on = true
  document.documentElement.classList.add('keep-motion')
  return () => {
    on = false
    document.documentElement.classList.remove('keep-motion')
  }
}
