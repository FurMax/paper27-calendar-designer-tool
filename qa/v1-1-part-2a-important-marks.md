# V1.1 Part 2A important marks — QA (2026-09-25)

- `npm test`: 62/62 PASS. Covers project-wide style through two months, unchanged `importantDays`, legacy default, and invalid saved values.
- `npm run build`: PASS.
- Windows Chrome/Edge isolated production-preview flow (`tests/browser/important-mark-style.mjs`): import, mark January 14, switch 红字 → 圈记 → 小圆点, export a real 1200×1800 PNG for each and a 1252×1843 print JPG, open Review, reload from IndexedDB, and inspect the 320px phone selector. PASS, no console exceptions.
- The three digital PNG marked-date region hashes differ, while photo region hashes match exactly. The Review card and restored project retain `dot` and January 14. The three options fit the 320px Editor with no horizontal overflow.
- Visual samples: `qa/v1-1-important-mark-circle.png`, `qa/v1-1-important-mark-dot.png`, `qa/v1-1-important-mark-editor-dot.png`. The initial samples show the first placement; the corrected placement and evidence are in `qa/v1-1-part-2a-mark-placement.md`.

Physical Safari, named-printer and formal Session 08 release QA remain separate. No deployment.
