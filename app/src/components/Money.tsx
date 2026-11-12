import { Count } from '@kit/motion/Count'
import { money } from '../model'

const fmt = (n: number) => money(Math.round(n))

const dollars = (n: number) => '$' + Math.floor(Math.round(n) / 100).toLocaleString('en-US')
const two = (n: number) => String(Math.round(n)).padStart(2, '0')

/**
 * A rolling amount. The digits roll for sighted readers; screen readers get the plain amount.
 * `raised` sets the cents small and high, for the large serif figures.
 */
export function Money({ cents, className, raised }: { cents: number; className?: string; raised?: boolean }) {
  return (
    <span className={raised ? `money money--raised ${className ?? ''}` : className}>
      <span className="sr-only">{money(cents)}</span>
      {raised ? (
        <span aria-hidden="true" className="money__face">
          <Count value={Math.round(cents)} format={dollars} />
          <span className="money__cents">
            <Count value={Math.round(cents) % 100} format={two} />
          </span>
        </span>
      ) : (
        <Count value={cents} format={fmt} aria-hidden="true" />
      )}
    </span>
  )
}
