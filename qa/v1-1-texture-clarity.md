# V1.1 texture clarity follow-up — 2026-09-25

## Finding and correction

波浪格, 细点阵 and 纸张肌理 were hard to distinguish because the shared tile contained subpixel marks that vanished when the 1200px export was scaled into the Editor proof and 40px selectors. Wave strokes and dot radii are now visibly sized with restrained opacity. Paper uses a sparser 96px tile with varied fiber placement, and its CSS proof/thumbnail scale tracks the larger export tile. The photo, calendar type, month data, export geometry and other three texture choices are unchanged.

## Evidence

- Production build: PASS.
- Final 59/59 unit tests: PASS.
- Focused current-build Chrome and Edge: PASS for each adjusted texture. Editor proof and 1252 × 1843 print PNG both contain the selected texture. The selected state is unique, photo-region pixel hash matches the untextured export, calendar and print-bleed hashes differ, and there are no runtime exceptions.
- Final native print samples: `qa/v1-1-texture-waves-print.png`, `qa/v1-1-texture-dots-print.png`, `qa/v1-1-texture-paper-print.png`. Corresponding Editor screenshots use the same names ending in `-editor.png`.
- Visual check: the three patterns can now be distinguished at normal print view. The first stronger wave/paper trial was reduced after it competed with dates and made paper too repetitive.

Product Owner visual review remains pending. No release approval or deployment.
