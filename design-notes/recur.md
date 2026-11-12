# Recur — hand-over record

Views: `#concept` (opens first), `#demo`, `#app`. Local copy: `publish/recur-local.html`.

## Decision
A subscriptions tracker whose one rich object is a month dial: each charge a mark on its day (length = amount, one
scale; colour = category), a brass hand at today and a brass arc for the coming week. Everything else is quiet
porcelain and ink, so warmth reads as premium. Full contract in `direction.md`.

**Score: passing for the app and concept views; the demo carries one documented timing artifact (below).**

## Round 4 (version 2)
The dial's finishing layer, nothing else changed:
- Flat sweep on each mark: the category hue turns under 30 degrees toward the head (Activity-ring style, no 3D); the
  mark's length and scale are unchanged. The brass week arc fades to 25% by the seventh day.
- Raised cents on the large serif figures (dial centre, every month, every year, saving; demo; type specimen).
- One opening moment: marks draw out clockwise from the ring on first view (560 ms each, 16 ms per day apart). A
  cancelled charge retracts into the ring, then its cap fades. Both off under reduced motion; off inside the demo stage.
- Dark only: a hairline highlight edge on the dial card (light keeps its shadow and no edge).
Checks: type check and lint clean; render check of the built page in Chromium and WebKit, light and dark, 1440 and 390:
app and concept clean, demo the same crossfade artifacts as before. Opening draw and cancel retract verified in the
browser (animation present and finished; retracted mark at offset 1 and opacity 0; $77.91 and $215.88 after cancel).
Not done this round: a second fresh-eye review (the first one's findings were all acted on in round 3).

## Assumptions
- Currency USD, today Thursday 5 November 2026, one person's plans, invented services and prices.
- Cancelling is optimistic: totals change at once, with an 8 s undo on the row (same in the demo).
- Usage ("not opened in 64 days") and price-change notices are concept behaviour; how Recur learns them is not designed.
- The direction was stated before building, not picked from rendered alternatives.

## Applied rules
- Recipes: HoldToConfirm + UndoWindow (app row, concept try-it), MorphButton.css base, tokens, motion: copied unchanged.
  The demo draws the hold with the same classes driven by state (a script cannot hold a real pointer).
- Kit: Stage, Window, Swap (demo panels), Count (rolling figures, wrapped by `Money` for screen readers).
- Taste profile: soft meaningful colour, one gradient object (the dial), category-coloured icons in identity lists,
  heading marks (own project), hatched forecast bars, flat buttons, never truncate, never a pie.
- Waivers (lint, with reasons in code): hatched forecast bars ×2, linear hold fill, linear + 8 s undo countdown,
  wordmark not a link (single-screen app).

## Checks
- Type check and production build: pass. Design lint: 0 FAIL, 0 WARN, 6 waived.
- Render check on the built page, http://127.0.0.1:5212/recur-local.html, Chromium and WebKit, light and dark,
  1440 and 390, axe: `#app` clean, `#concept` clean. `#demo`: some runs flag contrast/covered text on the insight
  and review panels. Verified in the browser: at rest only one panel exists at full opacity; the flags come from frames
  caught during the 0.36 s Swap crossfade. Kept; not a fault at rest.
- Arithmetic checked by the reviewer and in the browser: $163.38 × 12 = $1,960.56; still to pay $95.90; after
  cancelling Reelhouse $147.89 a month, $77.91 still to pay, saving $215.88 a year.
- Interaction: Review scrolls to and opens the row; hold completes after 1.2 s; release early rolls back; undo restores;
  expiry closes the row; Restore brings a plan back; chips, sort, reminder switch, theme switch work.

## Review
Fresh-eye reviewer (did not build it): `fix`. Acted on: demo window now whole, bleeding only off the bottom with a foot
fade; step row under the demo tracks the beats; second dial given its own centre content and smaller size; history bars
keep their category hue in both themes; dial a step lighter in dark; phone chips one scrolling row and equal row
heights; product name shown once; selected dial mark shows its details (tap, not only hover); price-rise Review is the
primary button; closing call to action on the concept page.
Kept on purpose: the "Composed, exact, warm" design-rationale section. The concept page is meant to show the
reasoning. Reviewer saw only screenshots; hold, rows and hover were tested here instead.

## Not checked
- A real iPhone (Safari motion caps, touch hold); WebKit was checked only as an engine at 390 wide.
- Screen-reader pass (VoiceOver / NVDA) and a full keyboard-only walk; focus rings were seen but not every path.
- The demo with OS reduced motion turned on (this machine's browser reports it off); the Play button path is built, not watched.
- Film gate (`kit/scripts/film.mjs`): needs `playwright-core` in the kit, present, but not run this round.

## Slots and samples
No slots. All names, prices, card endings ("Visa ending 4821") and usage figures are sample data, labelled on every view.
