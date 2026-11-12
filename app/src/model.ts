import { DAYS_IN_MONTH, SUBS, TODAY, type CategoryId, type Sub } from './data'

export type Status = 'active' | 'cancelled'
export type States = Record<string, Status>

export const initialStates = (): States => Object.fromEntries(SUBS.map((s) => [s.id, 'active' as Status]))

const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MO = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const utc = (y: number, m: number, d: number) => Date.UTC(y, m - 1, d)
const TODAY_MS = utc(TODAY.y, TODAY.m, TODAY.d)

export function money(cents: number, opts: { sign?: boolean } = {}) {
  const abs = Math.abs(cents)
  const body = '$' + (abs / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  if (cents < 0) return '−' + body
  return opts.sign && cents > 0 ? '+' + body : body
}

/** Whole-dollar money for large, calm figures where cents add nothing. */
export const moneyRound = (cents: number) => '$' + Math.round(cents / 100).toLocaleString('en-US')

export function dateLabel(ms: number) {
  const d = new Date(ms)
  return `${WD[d.getUTCDay()]} ${d.getUTCDate()} ${MO[d.getUTCMonth()]}`
}

export function relative(days: number) {
  if (days === 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  if (days < 7) return `In ${days} days`
  if (days < 14) return 'Next week'
  if (days < 60) return `In ${Math.round(days / 7)} weeks`
  return `In ${Math.round(days / 30)} months`
}

export function lastUsed(days: number) {
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  return `${days} days ago`
}

/** What a plan costs per month, for totals. Yearly plans are spread over twelve months. */
export const perMonth = (s: Sub) => (s.cycle === 'monthly' ? s.price : Math.round(s.price / 12))

/** What it will cost per year from its next renewal on. */
export const perYear = (s: Sub) => (s.cycle === 'monthly' ? (s.newPrice ?? s.price) * 12 : s.price)

export type Charge = { ms: number; days: number; amount: number }

/** The next charge: monthly plans on their day this month or next; yearly plans on their date. */
export function nextCharge(s: Sub): Charge {
  let ms: number
  if (s.cycle === 'monthly') {
    const thisMonth = s.day! >= TODAY.d
    ms = thisMonth ? utc(TODAY.y, TODAY.m, s.day!) : utc(TODAY.y, TODAY.m + 1, s.day!)
  } else {
    ms = utc(s.renews!.y, s.renews!.m, s.renews!.d)
  }
  return { ms, days: Math.round((ms - TODAY_MS) / 86_400_000), amount: s.newPrice ?? s.price }
}

export type MonthMark = { sub: Sub; day: number; amount: number; paid: boolean }

/** Every charge in the current month, for the dial. */
export function monthMarks(): MonthMark[] {
  return SUBS.filter((s) => s.cycle === 'monthly').map((s) => {
    const paid = s.day! < TODAY.d
    return { sub: s, day: s.day!, amount: paid ? s.price : s.newPrice ?? s.price, paid }
  })
}

export function totals(states: States) {
  const active = SUBS.filter((s) => states[s.id] === 'active')
  const cancelled = SUBS.filter((s) => states[s.id] === 'cancelled')
  const monthly = active.reduce((n, s) => n + perMonth(s), 0)
  const marks = monthMarks().filter((m) => m.paid || states[m.sub.id] === 'active')
  const paid = marks.filter((m) => m.paid).reduce((n, m) => n + m.amount, 0)
  const toPay = marks.filter((m) => !m.paid).reduce((n, m) => n + m.amount, 0)
  const saving = cancelled.reduce((n, s) => n + perYear(s), 0)
  const week = active
    .map((s) => ({ s, c: nextCharge(s) }))
    .filter(({ c }) => c.days >= 0 && c.days <= 7)
    .sort((a, b) => a.c.days - b.c.days)
  const byCategory = new Map<CategoryId, number>()
  for (const s of active) byCategory.set(s.category, (byCategory.get(s.category) ?? 0) + perMonth(s))
  return { active, cancelled, monthly, yearly: monthly * 12, paid, toPay, due: paid + toPay, saving, week, byCategory }
}

export type Insight =
  | { kind: 'rise'; sub: Sub; from: number; to: number; on: number; perYear: number }
  | { kind: 'unused'; sub: Sub; days: number; next: Charge }

export function insights(states: States): Insight[] {
  const out: Insight[] = []
  for (const s of SUBS) {
    if (states[s.id] !== 'active') continue
    if (s.newPrice && s.newPrice !== s.price) {
      out.push({ kind: 'rise', sub: s, from: s.price, to: s.newPrice, on: nextCharge(s).ms, perYear: (s.newPrice - s.price) * 12 })
    }
  }
  const unused = SUBS.filter((s) => states[s.id] === 'active' && s.lastUsedDaysAgo >= 30).sort((a, b) => b.lastUsedDaysAgo - a.lastUsedDaysAgo)
  for (const s of unused) out.push({ kind: 'unused', sub: s, days: s.lastUsedDaysAgo, next: nextCharge(s) })
  return out
}

export const DIAL_DAYS = DAYS_IN_MONTH
