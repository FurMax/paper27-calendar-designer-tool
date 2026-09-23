# Session 07 — M1 verification

**Date:** 2026-09-23  
**Scope:** Production shell and fixed 2027 calendar engine only. Assignment, import, crop, style, persistence, and export remain for M2–M7.

## Results

| Check | Result | Evidence |
|---|---|---|
| Twelve 2027 months | PASS | `npm test`: 12 independent start-column/day-count/42-cell/blank-cell cases plus geometry case, 13/13 passing. January 1 is Friday. |
| Shared geometry | PASS | One `OUTPUT_GEOMETRY` defines 1200×1800, full-width 1200×1044 photo and separate 1200×756 calendar. The proof takes its split from the render model. |
| Production build | PASS | `npm run build`: TypeScript and Vite completed. |
| Browser navigation | PASS | In-app browser: S01→S02→S03→S04 and browser Back to S03; URL paths `/assign`, `/editor/1`, `/review` reflected the selected screen. |
| Responsive shell | PASS | At 1440×900, desktop navigation and 1004px proof workspace + 300px properties column. At 390px, phone menu and direct month selector; S02 has 2 columns and no horizontal overflow. At 320px, S02 falls to 1 column with no horizontal overflow. |

The M1 shell intentionally leaves future milestone controls disabled and labels their milestone in tooltips. This is not a functional end-to-end app or a Session 08 QA result.
