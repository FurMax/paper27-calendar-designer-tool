# Session 07 — M6 verification

**Date:** 2026-09-23  
**Status:** Complete. One-month Canvas PNG generation and browser handoff passed scoped desktop verification. Mobile/Safari font and destination fidelity remain later QA.

| Check | Result | Evidence |
|---|---|---|
| Preflight | PASS | A Missing Photo month rejects direct render and its Editor generation control is disabled. A Ready month renders from an immutable `structuredClone` snapshot. |
| Dedicated renderer | PASS | `src/export/canvasRenderer.ts` consumes `buildMonthRenderModel`: one 1200×1800 canvas, upper 1200×1044 clipped full-width photo, lower 1200×756 independent solid background, 42 English Sunday-first date cells and one resolved ink. No DOM/SVG screenshot export. |
| PNG integrity | PASS | Browser-generated `qa/m6-sample.png` has the PNG signature, `image/png` MIME and IHDR width/height 1200×1800. The actual downloaded `01-January-2027.png` was separately read from the isolated browser download directory and passed signature/dimension checks; both were 211,072 bytes in this fixture run. |
| Ratios, crop and styles | PASS | Real Chrome rendered portrait 300×450, landscape 450×300, and square 400×400 sources at zoom 1.7 / nonzero offsets. The three cases used Classic/Small, Minimal/Standard and Handwritten/Large with Custom white ink and `#123456` calendar background. Pixel samples at left, right and top photo edges were the source green `#00CC66`, including x=0 and x=1199; lower-region edge samples matched `#123456`. |
| Proof comparison | PASS for scoped fixture | `qa/m6-preview.png` and `qa/m6-sample.png` were visually inspected: same gradient crop orientation, full-width upper photo, dark lower calendar region, English January dates and selected Serif/large style. DOM/Canvas antialiasing and Safari fidelity remain formal QA rather than pixel-identity claims. |
| Font failure / retry | PASS | Forced `document.fonts.load` to report no loaded face. Renderer stopped with named Instrument Serif error; UI showed generation failure and Retry. Restored font loading produced a ready PNG. No fallback was reported as success. |
| Handoff and resource state | PASS | UI waits until preparation completes, then a separate Download tap starts the browser handoff. Feedback says the download was started, not saved to Photos. Closing or changing month revokes the prepared URL; a delayed render completed after switching month without showing the previous month's PNG. |
| Unit/build | PASS | `npm test`: 40/40; `npm run build`: TypeScript/Vite PASS. M6 PNG byte/pixel and browser handoff checks live in `tests/browser/m6-check.mjs`. |

The repeatable browser check uses a dedicated hidden Chrome profile on debugging port 9226, Vite on 5173, and a download directory under the system temp folder so Vite does not watch Chrome's temporary `.crdownload` file. The test resets only that dedicated profile's IndexedDB. No user browser data is used.

**Deferred:** Actual iPhone Safari PNG font rendering, browser delivery destination, representative large original photos and full browser matrix are M8/Session 08 checks. The direct one-action iPhone Photos requirement remains an OPEN QUESTION and is not inferred from a download.
