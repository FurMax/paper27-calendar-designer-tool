# V1.1 texture clarity follow-up — UI / UX change request

Directed by the Product Owner on 2026-09-25 after finding 波浪格, 细点阵 and 纸张肌理 too faint.

## Diagnosis

The shared 48px tile uses strokes below 1px, dots below 1px radius and sparse half-pixel paper fibers. Downscaling for the Calendar Proof and 40px selector makes these marks hard to distinguish. The prior print sample confirms that paper is barely visible at normal view size.

## Bounded correction

- Increase mark dimensions and modestly increase opacity for only waves, dots and paper; make paper fibers more evenly distributed and distinguishable.
- Keep the same six texture choices, per-month state, preview/export tile source, background color, photo exclusion, calendar geometry and print bleed logic.
- Keep marks quiet enough for month/date text and for pale and dark calendar backgrounds. No intensity slider or additional material effects.
- Verify the three textures in thumbnail, Editor/Review proof, and actual PNG/JPG output. Product Owner visual review remains pending.

## Implemented calibration

Wave marks use 1.55px/0.09 horizontal strokes and a lighter secondary weave; dots use 2.2px/0.12 circles. Paper uses irregularly positioned 2.5px/0.095 fibers on a 96px tile, scaled consistently in proof, selector and print output. The first stronger trial was softened after actual print review; final samples are recorded in `qa/v1-1-texture-clarity.md`.
