# Session 07 — M7 verification

**Date:** 2026-09-23  
**Status:** Complete for desktop full-set/ZIP. Mobile delivery selection remains an OPEN QUESTION for M8/device validation.

| Check | Result | Evidence |
|---|---|---|
| Preflight and recovery | PASS | Incomplete Review shows 12 month recovery links and disables full-set generation. All Ready months enable it. |
| Batch semantics | PASS | `renderFullSet` clones one visible project state, generates January–December sequentially, reports month count, yields between months, stops on cancellation and identifies the failed month. Unit injection changed the live December style mid-run without changing the snapshot. |
| ZIP dependency | PASS | Pinned `fflate@0.8.2` uses `ZipPassThrough`, storing already-compressed PNG bytes without recompression. Production JS bundle is 261.47 kB (81.96 kB gzip), about 3.75 kB raw / 2.00 kB gzip above the pre-ZIP build. |
| Actual browser ZIP | PASS | Isolated Chrome downloaded one 937,477-byte ZIP. Python `zipfile` extracted exactly 12 ordered files, `01-January-2027.png` through `12-December-2027.png`, no extras. CRC check passed; all entries use STORE, have PNG signature and 1200×1800 IHDR, and 12 distinct SHA-256 hashes. No 12 automatic downloads. |
| Cancel/error/retry | PASS | Browser canceled while 2 February rendering after 1 completed; transient dialog closed and no ZIP handoff occurred. Forced font failure identified January; Retry after restoring font loading prepared all 12. Browser feedback distinguishes prepared files from browser download handoff. |
| Memory trend | SCOPED PASS | Two repeated 12-page renders of one shared 600×900 original in isolated desktop Chrome produced 935,915 total PNG bytes each and 937,477-byte ZIPs. With Chrome garbage collection before/after, JS heap was 7,159,715 → 7,174,638 bytes; per-month samples peaked at 7,249,480 and 8,451,930 bytes. This does not include native/GPU memory and does not establish mobile capacity. |
| Unit/build | PASS | `npm test`: 42/42; `npm run build`: TypeScript/Vite PASS. |

`tests/browser/m7-check.mjs` and `tests/browser/m7-memory.mjs` use an isolated hidden Chrome profile on port 9227 and a system-temp download directory. The test fixture shares one synthetic source photo behind twelve distinct project photo items; it is not a twelve-representative-original capacity test.

**Deferred:** The approved mobile delivery model is still open. ZIP is an honest fallback package containing the twelve PNGs and does not prove a one-action save to iPhone Photos. Trusted HTTPS `canShare({files})`/Share Sheet/Files/Photos behavior, twelve representative originals, interruption and device/browser matrix remain M8/Session 08 work.
