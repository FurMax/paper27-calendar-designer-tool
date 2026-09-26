# V1.1 Part 2A mark placement correction — QA (2026-09-25)

The Product Owner's January 18 screenshots exposed a circle overlapping adjacent rows and a dot landing near the date below. Only mark geometry changed: the CSS proof circle is 1.22em rather than 2.1em, and Canvas circle radius is 23 rather than 32 at base scale. The smaller dot moved from below to the upper right of its date in both renderers. Stored style IDs and marked dates are unchanged.

- `npm run build`: PASS.
- `npm test`: 62/62 PASS.
- Isolated Windows Chrome/Edge production-preview regression (`tests/browser/important-mark-placement.mjs`): retro font, large scale, paper texture, January 18, all three styles, digital PNG, print JPG, Review, IndexedDB restore and 320px layout: PASS. No runtime exception.
- Browser proof geometry: the circle and dot both clear the January 11 and 25 cells above/below. In Chrome, the circle occupies about 19px in the scaled proof; the dot about 4px.
- Export comparison: the photo hash remains identical across styles; digital PNG marked-day hashes differ. Pixel differences for circle and dot remain in the January 18 row, away from the adjacent date rows.
- Visual samples: `qa/v1-1-important-mark-placement-circle.png`, `qa/v1-1-important-mark-placement-dot.png`, and `qa/v1-1-important-mark-placement-editor-dot.png`. The red sample is the unmodified-mark baseline.

Physical Safari and Product Owner visual acceptance remain open. No deployment.
