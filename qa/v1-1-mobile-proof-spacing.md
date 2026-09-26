# Phone Editor proof spacing QA — 2026-09-26

- `npm run build`: PASS.
- `tests/browser/mobile-proof-spacing.mjs`: Chrome and Edge PASS. Checks January, May, August and October at 390px and 320px with Classic/Large and Handwritten/Large. Title-to-weekday gap changes from 0px to 10px at 390px and 4px at 320px. Last occupied date stays at least 8px inside proof bounds; no horizontal overflow.
- Existing `tests/browser/six-row-handwritten-fit.mjs`: Chrome and Edge PASS, including January/May/October last-row clearance.
- Physical iPhone Safari visual review remains open. This is a phone Editor preview CSS correction only; export output was not changed or retested for pixel parity. No deployment.
