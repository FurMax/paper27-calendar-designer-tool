# Session 08 — Integration results

**Status:** In progress, 2026-09-23. Isolated Windows browser automation and Product Owner-reported iPhone 13 Safari 16.2 and iPad Air 5 portrait/landscape runs are recorded; this is not release acceptance. The formal device/browser matrix remains open; multi-file Share is outside V1.

## Environment and commands

- App: current `src/` served by Vite at `http://127.0.0.1:5173/`; isolated browser profiles only. The Product Owner's device test address is `http://192.168.31.102:5174/` (LAN HTTP).
- Windows 10.0.26200; Chrome 153.0.8010.52 and Edge 153.0.4234.48, headless. Native system picker and download destination UI were not automated.
- `npm test`: **PASS, 49/49**. `npm run build`: **PASS** after the dialog-focus fix.
- `node tests/browser/session08-integration.mjs`: **PASS** in Chrome and Edge. `node tests/browser/session08-typography.mjs`: **PASS** in Chrome. `node tests/browser/session08-dialog-focus.mjs` and `session08-photo-output.mjs`, `session08-color-output.mjs` and `session08-assignment-ui.mjs`: **PASS** in Chrome.
- Updated historical selectors/copy in `tests/browser/m5-check.mjs` and `m7-check.mjs` to the approved palette, scale and print-default UI. Both then **PASS** on the current app. Their initial failure was test drift, not a product failure.
- `tests/browser/m8-layout.mjs` and `m8-touch.mjs`: **PASS** again in Chrome emulation. Historical Session 07 screenshots were restored after this run.

## End-to-end and state results

| Case | Result | Evidence and limit |
|---|---|---|
| First-time import with fewer than 12 | **PASS in Chrome/Edge automation** | Two real browser-generated PNG `File` objects entered via the production Entry input; S02 showed 2 Ready and all 12 slots, remaining 10 Missing. January/February assignment followed returned order. Native picker UI remains untested. |
| Unreadable occupied replacement | **PASS in Chrome/Edge automation** | An invalid `image/heic` File produced a named decode error and preserved January's prior photo item. This is an invalid fixture, not a genuine iPhone HEIC result. |
| Reload, Resume and location | **PASS in Chrome/Edge automation** | IndexedDB restored two assets and two Ready months; Resume returned to `/editor/1`. |
| Exactly 12, Review and full set | **PASS in Chrome/Edge automation** | Twelve distinct synthetic PNG files mapped 01–12; Review showed twelve cards and enabled full export. Default print ZIP downloaded and extracted with exactly twelve ordered valid PNGs. |
| All 2027 dates in Preview | **PASS in Chrome/Edge automation** | All twelve visible 42-cell grids matched independent UTC weekday/day-count expectations, including blanks. |
| All 2027 dates in digital PNG | **PASS in Chrome/Edge automation** | Generated each of twelve 1200×1800 PNGs. Pixel occupancy at all 42 date positions matched expected filled/blank positions. This verifies placement/absence; visual glyph transcription on Safari remains open. |
| Persistence failure and stale tab | **PASS in Chrome regression** | Transaction abort and aborted Start New preserved prior revision/assets. A stale revision threw `StaleProjectError`; UI conflict blocked editing. Forced autosave abort showed persistent error and Retry saved the visible change. Corrupt restore showed recovery rather than replacement. |
| Assignment semantics | **PASS in Chrome production UI automation and unit tests** | Two imported photos were moved, swapped, removed into Unassigned, replaced into an occupied month, reused as an independent item and one displaced unassigned item deleted. Each step was checked against committed IndexedDB state; two Ready months remained and the shared source asset survived. Physical tap and native picker remain open. |
| Photo ratios and EXIF | **PASS in Chrome automation** | Five actual digital PNGs used portrait, landscape, square, extreme wide and extreme tall solid-color sources at zoom 2.5 and clamped extreme offsets; all photo corners/edge samples matched source color. The EXIF orientation-6 JPEG fixture decoded upright as 1200×1920. Genuine phone originals and Safari remain open. |
| Crop and responsive | **PASS in Chrome emulation only** | 390/320 px Editor/Review had no horizontal overflow. Simulated single touch moved crop, pinch reached 2.4×, Reset returned 1/0/0 and cover stayed true. Physical Safari touch and safe areas remain open. |
| Export cancel, injected font failure, retry | **PASS in Chrome regression** | Cancel stopped after one completed month; injected font-load failure named January; retry prepared and downloaded the ZIP; persisted project fingerprint was unchanged. |
| Dialog keyboard focus | **Defect fixed; PASS regression** | Before the Session 08 fix, dialogs had no focus-entry/trap handling. `src/app/dialogFocus.ts` now moves focus into the open dialog, wraps Tab, and restores the trigger on close. New Chrome regression verified the Start New dialog. Screen reader QA remains open. |

## Product Owner iPhone 13 handoff report

On LAN HTTP, the Product Owner reports a 24.2 MB ZIP downloaded to iCloud Drive / Downloads, extracted, and all twelve 01–12 PNGs opened. This is a scoped PASS for browser ZIP handoff and inspection on iPhone 13 Safari 16.2. The picker metadata helper saw one 5,733,218-byte PNG and decoded it via img fallback at 2480×3505 after createImageBitmap failed. It does not establish native HEIC decode or twelve-source-photo capacity. Web Share and direct Photos were explicitly deferred beyond V1. The Product Owner declined further manual source-file metadata collection; do not repeat that request. See mobile-device-results.md.

The Product Owner separately confirms that iPad Air 5 completed the same core workflow in both portrait and landscape, including ZIP extraction and opening of the twelve PNGs. iPadOS/Safari version, ZIP size and destination were not supplied. This is a scoped device report, not formal current-stable Safari coverage.

## Open integration scenarios

Native picker cancel/order, exactly 13 selections, genuine HEIC/EXIF, step-level physical-device drag/pinch/sampler, original-phone-photo capacity, quota and mobile interruption, and the full required browser matrix remain **NOT TESTED** or **PARTIAL** in Session 08. The confirmed iPhone ZIP inspection fills only its specific browser handoff row. Existing Session 07 scoped passes do not fill these rows.

## Issues and severity

| ID | Severity | Status | Impact / action |
|---|---|---|---|
| S08-01 | **BLOCKER** | OPEN | Required macOS/current-stable iOS/iPadOS/Android physical/browser evidence and native picker outcomes are incomplete. iPhone 13 Safari 16.2 and iPad Air 5 portrait/landscape ZIP handoffs passed by Product Owner report; iPadOS version was not supplied; the Product Owner confirms no Mac, Android device or remote test service is available. |
| S08-02 | **RESOLVED V1 SCOPE** | CLOSED by Product Owner decision | V1 uses browser ZIP download on mobile. Multi-file Share and one-action direct Photos are deferred beyond V1, not marked technically PASS. Actual iPhone/iPad ZIP extraction and twelve-PNG opening are recorded in mobile-device-results.md. |
| S08-03 | **HIGH** | OPEN QUESTION | Auto Calendar ink measures 4.478:1 on `#777777` and 4.158:1 on `#FF0000` with the current dark/light pair. The final acceptance threshold remains unresolved; no silent visual-system change was made. |
| S08-04 | **HIGH** | OPEN QUESTION | The approved low-resolution warning is absent from production import/assignment UI; the exact warning threshold is still an open specification decision. |
| S08-05 | **MEDIUM** | FIXED | Dialog focus could remain behind an open modal. Focus entry, Tab containment and restore now pass regression. |
| S08-06 | **BLOCKER** | OPEN | Twelve representative original phone photos, native HEIC/HEIF picker behavior and measured mobile storage/time/interruption have no complete evidence. The Product Owner declined further manual metadata copying; no result is invented. |
| S08-07 | **BLOCKER** | PARTIAL | Product Owner supplied 300 dpi, 3 mm bleed and RGB-acceptable postcard requirements; sample PNG has matching nominal geometry, RGB and 299.999 PPI metadata. The Product Owner approved both PNG and JPG; browser JPG output has matching geometry/density, but named-provider acceptance is pending. No named-provider submission or physical proof occurred. |

No Release Candidate is declared. S08-01, S08-06 and S08-07 remain release blockers; S08-02 is a resolved V1 product-scope decision, not a technical PASS. The HIGH items need explicit outcomes before release acceptance.

## Session 08 output-format and photo-edge follow-up

The Product Owner approved PNG/JPG choice after supplying printer requirements and then supplied January/May print JPGs with visible light borders. The implementation now offers one chosen format for individual or twelve-file export, keeps PNG as default, emits print JPG with JFIF 300 dpi, and avoids magnifying trim-edge antialiasing into the print bleed. An editor warning and full-set preflight identify broad pale visible-crop edges and offer zoom/reposition or intentional continuation. Chrome and Edge passed `session08-jpg-export.mjs` and `session08-photo-edge.mjs`; Chrome passed `session08-photo-edge-ui.mjs`. Existing default PNG integration was rerun sequentially in both browsers and passed. `npm test` passed 49/49 and build passed. Earlier listed 46/46 is superseded. The original January/May source photos and saved crop states are unavailable, so the historical files cannot be regenerated for exact before/after comparison. Real-device retest and printer provider proof remain open.

**Later Session 08 correction:** The Product Owner's February/March outputs confirmed mirrored print bleed. The print renderer and print Preview now use a shared source-photo cover transform; digital and saved crop remain unchanged. Chrome/Edge default PNG and selected JPG 12-file ZIP regressions, genuine-source bleed pixel checks, Chrome print-proof alignment, 49 unit tests and build passed. These browser fixtures do not replace current-build iPhone/iPad testing or provider preflight. See qa/export-results.md and the print-photo-bleed change request.
