// Sample data for a product concept. Every name is invented; amounts are in cents so totals add up exactly.

export type CategoryId = 'streaming' | 'music' | 'software' | 'fitness' | 'reading'

export const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: 'streaming', label: 'Streaming' },
  { id: 'music', label: 'Music' },
  { id: 'software', label: 'Software' },
  { id: 'fitness', label: 'Fitness' },
  { id: 'reading', label: 'Reading' },
]

export type Sub = {
  id: string
  name: string
  plan: string
  category: CategoryId
  cycle: 'monthly' | 'yearly'
  /** Monthly plans: the day of the month it renews. */
  day?: number
  /** Yearly plans: the next renewal date. */
  renews?: { y: number; m: number; d: number }
  price: number
  /** A price change notified by the service, applied from the next renewal. */
  newPrice?: number
  lastUsedDaysAgo: number
  since: string
  card: string
  /** The last twelve charges, oldest first (monthly plans). */
  history?: number[]
}

/** "Today" in the concept: Thursday 5 November 2026. */
export const TODAY = { y: 2026, m: 11, d: 5 }
export const DAYS_IN_MONTH = 30
export const MONTH_NAME = 'November'

export const SUBS: Sub[] = [
  {
    id: 'reelhouse', name: 'Reelhouse', plan: 'Premium 4K', category: 'streaming', cycle: 'monthly', day: 21,
    price: 1549, newPrice: 1799, lastUsedDaysAgo: 2, since: 'March 2023', card: 'Visa ending 4821',
    history: [1399, 1399, 1399, 1549, 1549, 1549, 1549, 1549, 1549, 1549, 1549, 1549],
  },
  {
    id: 'northlight', name: 'Northlight Music', plan: 'Family', category: 'music', cycle: 'monthly', day: 6,
    price: 1699, lastUsedDaysAgo: 0, since: 'June 2021', card: 'Visa ending 4821',
    history: [1699, 1699, 1699, 1699, 1699, 1699, 1699, 1699, 1699, 1699, 1699, 1699],
  },
  {
    id: 'canvasly', name: 'Canvasly', plan: 'Pro', category: 'software', cycle: 'monthly', day: 9,
    price: 1299, lastUsedDaysAgo: 1, since: 'January 2024', card: 'Mastercard ending 0716',
    history: [1299, 1299, 1299, 1299, 1299, 1299, 1299, 1299, 1299, 1299, 1299, 1299],
  },
  {
    id: 'margin', name: 'The Margin', plan: 'Digital', category: 'reading', cycle: 'monthly', day: 12,
    price: 800, lastUsedDaysAgo: 3, since: 'September 2024', card: 'Visa ending 4821',
    history: [800, 800, 800, 800, 800, 800, 800, 800, 800, 800, 800, 800],
  },
  {
    id: 'strata', name: 'Strata Cloud', plan: '2 TB', category: 'software', cycle: 'monthly', day: 17,
    price: 999, lastUsedDaysAgo: 0, since: 'August 2020', card: 'Mastercard ending 0716',
    history: [999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999, 999],
  },
  {
    id: 'folio', name: 'Folio Books', plan: 'One title a month', category: 'reading', cycle: 'monthly', day: 23,
    price: 1495, lastUsedDaysAgo: 41, since: 'February 2025', card: 'Visa ending 4821',
    history: [1495, 1495, 1495, 1495, 1495, 1495, 1495, 1495, 1495, 1495, 1495, 1495],
  },
  {
    id: 'pace', name: 'Pace Club', plan: 'Coach', category: 'fitness', cycle: 'monthly', day: 28,
    price: 1499, lastUsedDaysAgo: 1, since: 'April 2025', card: 'Visa ending 4821',
    history: [1299, 1299, 1299, 1299, 1499, 1499, 1499, 1499, 1499, 1499, 1499, 1499],
  },
  {
    id: 'ironworks', name: 'Ironworks Gym', plan: 'Off-peak', category: 'fitness', cycle: 'monthly', day: 1,
    price: 4900, lastUsedDaysAgo: 4, since: 'October 2022', card: 'Mastercard ending 0716',
    history: [4900, 4900, 4900, 4900, 4900, 4900, 4900, 4900, 4900, 4900, 4900, 4900],
  },
  {
    id: 'kino', name: 'Kino+', plan: 'Standard', category: 'streaming', cycle: 'monthly', day: 2,
    price: 799, lastUsedDaysAgo: 9, since: 'November 2024', card: 'Visa ending 4821',
    history: [699, 699, 699, 699, 799, 799, 799, 799, 799, 799, 799, 799],
  },
  {
    id: 'fieldnote', name: 'Fieldnote Pro', plan: 'Annual', category: 'software', cycle: 'yearly', renews: { y: 2027, m: 1, d: 14 },
    price: 9600, lastUsedDaysAgo: 64, since: 'January 2025', card: 'Visa ending 4821',
  },
  {
    id: 'keyline', name: 'Keyline VPN', plan: 'Annual', category: 'software', cycle: 'yearly', renews: { y: 2027, m: 3, d: 3 },
    price: 5988, lastUsedDaysAgo: 6, since: 'March 2024', card: 'Mastercard ending 0716',
  },
]
