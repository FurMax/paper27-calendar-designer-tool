# Session 07 — M2 verification

**Date:** 2026-09-23  
**Scope:** In-memory project state, real bulk-selected assets, assignment commands and S02 interaction flow. Persistent IndexedDB storage belongs to M5.

## Results

| Check | Result | Evidence |
|---|---|---|
| Domain commands | PASS | `npm test`: 20/20 total, including seven M2 cases for returned-order bulk mapping, Move, Swap, Replace, Remove, same-asset reuse, deletion protection and over-limit rejection. |
| Production build | PASS | `npm run build`: TypeScript and Vite completed after M2 UI wiring. |
| Actual S01 selection | PASS | Browser file chooser selected two existing JPEG/PNG fixtures; S02 showed January and February Ready, 2/12 count, March–December Missing. Fixtures are test inputs; no spike code is imported. |
| S02 Move | PASS | January → empty March: January became Missing, March Ready. |
| S02 Swap | PASS | March ↔ occupied February required explicit confirmation describing both crop resets and preserved month colors. |
| S02 Remove | PASS | February became Missing; Unassigned Photos appeared with one item. |
| S02 Replace | PASS | Unassigned item → occupied March required explicit displacement confirmation. Displaced item became Unassigned. |
| S02 reuse/delete | PASS | March photo reused in April; deleting a different Unassigned item removed that section while March and April stayed Ready. |

The M2 in-memory project is intentionally lost on reload until M5. M2 connected the system picker and basic decode before M3 so S02 could be verified with actual photo items. M3 completes the import policy and crop interaction. Formal native picker/device behavior remains unverified.
