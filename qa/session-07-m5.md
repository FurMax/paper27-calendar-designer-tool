# Session 07 — M5 verification

**Date:** 2026-09-23  
**Status:** Complete. IndexedDB persistence passed unit, build and real-browser integration checks. Large original phone-photo capacity remains M8/Session 08 validation.

| Check | Result | Evidence |
|---|---|---|
| Schema/invariants | PASS | `tests/unit/serialization.test.ts` checks canonical colors, crop bounds, one Blob shared by independent photo items, missing assets, unsupported schema and invalid-location fallback. `npm test`: 40/40 total. |
| Build | PASS | `npm run build` completed with TypeScript and Vite. |
| Full save/restore | PASS in local Chrome | A selected PNG Blob, two independently assigned items using the same asset, month-3 crop zoom 1.5, background `#1E3933`, Custom ink, Handwritten/Large typography and editor/3 context committed at revision 1. After reload, S01 showed Resume; opening it restored the editor, Ready state, proof color/font and crop. One asset Blob was stored, not duplicated per item. |
| Transaction abort | PASS in local Chrome | Injected abort after queued project/asset writes kept the preceding revision, background and Blob. An aborted Start New likewise retained the preceding project ID, revision and asset. |
| Stale revision | PASS in local Chrome | A write using the prior revision threw `StaleProjectError`; the newer revision and value remained. A UI edit from a stale tab showed the blocking refresh dialog and did not overwrite newer data. |
| Save failure/retry | PASS in local Chrome | Forced a project-store write abort during autosave. Persistent banner identified unsaved in-memory edits; prior committed background remained. Retry after removing the injected fault saved the visible edit and cleared the banner. |
| Two tabs / Start New | PASS in local Chrome | Confirmed Start New removed the active project and assets atomically. A second tab with the old project received the `BroadcastChannel` hint and displayed the blocking conflict dialog. The transaction revision guard remains authoritative. |
| Corrupt restore | PASS in local Chrome | Injected an unsupported saved schema. Reload displayed a recoverable read error and Retry; it did not create a blank replacement. |

Repeatable browser check: `node tests/browser/m5-check.mjs` with Vite on 5173 and a dedicated hidden Chrome debugging profile on port 9225. The check clears only that dedicated profile's local IndexedDB before starting. No user browser data is used. `src/persistence/indexedDb.ts` owns transaction boundaries; the React project controller owns the debounced queue and Retry of the latest in-memory snapshot. Save acknowledgement happens only on transaction `complete`.

**Deferred:** Actual quota exhaustion, eviction, twelve representative original modern phone photos, iPhone Safari two-tab behavior and browser interruption belong to M8/Session 08. This M5 pass does not claim those results.
