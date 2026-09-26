# Session 06 — Testing Strategy

**Status:** Approved with the Session 06 Technical Gate on 2026-09-23. Session 05 desktop spikes are design inputs, not production test passes. Session 07 uses bounded milestone checks; formal Integration, full QA, and release acceptance belong to Session 08.

## 1. Levels and tools

Use a small TypeScript unit runner (proposed Vitest) for pure date, assignment, crop, color and serialization rules; browser tests (proposed Playwright) for milestone flows and actual file inspection. Pin versions when M1 creates the production package. Use golden/reference images only for fixed geometry and font cases, with reviewed tolerance for cross-engine rasterization; do not substitute snapshots for date/math assertions. Tests must exercise user-visible behavior, not copy implementation details. The complete integration suite is a Session 08 activity.

| Level | Required checks | Evidence |
|---|---|---|
| Unit | All 12 2027 date grids: Sunday-first, 42 cells, correct day counts/start columns; crop cover/clamp/reset and pinch-anchor math for portrait/landscape/square/extreme ratios; assignment/reset/style invariants; Auto ink choice and Custom warning; color canonicalization; project serialization/schema/reference validation | Deterministic assertions, including boundary/property cases |
| Persistence integration | Save→reload/restore with assets/items/crops/styles/typography; same-asset reuse; transaction abort leaves prior revision/assets; stale two-tab revision rejection; confirmed Start New replacement and failure preservation | Real IndexedDB in browser, including injected abort plus later actual quota case |
| End-to-end | S01 select→S02 assign/reuse/replace→S03 crop/style→save→restore→S04 single PNG/full set; missing-month gating; picker cancel/unreadable/over-limit; error and retry states; S01 returning resume | Browser automation plus actual exported file inspection |
| Visual/export | Preview vs PNG geometry, crop, font/scale, English date grid, color, photo edge pixels; selected print 1252×1843 or digital 1200×1800 PNG signature and dimensions; print trim/bleed/PPI metadata; ZIP contains exactly twelve ordered valid PNGs; interruption/cancel/retry | Pixel/layout inspection and package extraction, on multiple sample photos/backgrounds |
| Manual device/accessibility | Real picker routes/order, touch drag/pinch, safe areas/browser chrome, delivery destination, low memory, keyboard and screen reader basics | Named device/browser/version, files, measured result and PASS/FAIL/PARTIAL/NOT TESTED |

## 2. Required domain scenarios

- **Dates:** Verify every 2027 month, including Jan 1 Friday, month lengths, Sunday-first columns, six rows and blank tail positions. Compare the model and exported date numbers, not merely the browser preview.
- **Assignment:** Move only into empty, Swap occupied, explicit Replace into occupied, Remove to Unassigned, delete only unassigned, reuse same source through a second item, delete one item without breaking another. Every changed pairing resets crop; both affected months retain their own background and Custom text values.
- **Crop:** At zoom 1, no blank pixels; at maximum zoom and ±1 offsets, exact edge coverage; drag in both axes where overflow exists; zero-travel axes stay centered; pinch centroid stable within clamp; Reset centered. Exercise decoded EXIF-rotated and extreme-ratio images. Test pointer/mouse and real single-finger/pinch separately.
- **Color/type:** White, dark, mid-tone `#777777`, saturated backgrounds and low-contrast Custom. Assert one resolved ink for title/year/weekdays/dates; Custom is never silently changed. The 4.48:1 mid-tone spike result is **not** a threshold pass. Final Auto ink pair and Custom-warning threshold are an **OPEN QUESTION** requiring measured acceptance. All three final fonts and three scales must remain legible for all month names, especially September at Large.
- **Import:** Returned-order mapping, 0/1/11/12/>12, picker cancel, partial unreadable bulk, unreadable occupied replacement, low-resolution warning without blocking. JPEG/PNG/WebP on formal browsers; HEIC decode attempt with exact file metadata and graceful error if unreadable. No native HEIC promise.
- **Save:** Commit acknowledgement only after transaction completion; failed write does not change last valid revision; visible unsaved feedback and retry; stale tab blocked by transactional compare even if `BroadcastChannel` message is missed; close/reopen and browser interruption restore the last committed context and every required field.
- **Export:** Single Ready PNG, Missing denial, 12 independent output names/content, desktop ZIP integrity, generation vs delivery status, cancel after month N, injected error, retry, and unchanged saved project. Check generated file signature/dimensions and actual destination, not only a success toast.

## 3. Release browser/device matrix

Formal V1 QA in **Session 08** uses current stable versions **at release time**. Keep a row for each OS/browser combination rather than treating one Chromium result as universal:

| Environment | Core workflow required | Special focus |
|---|---|---|
| Windows Chrome and Edge | Full desktop flow | Native picker order/cancel; pointer crop; ZIP download/integrity; two tabs |
| macOS Chrome, Edge and Safari | Full desktop flow | Safari decode/font/Canvas and file handoff; native picker; ZIP |
| iPhone Safari | Full phone flow | Photos/Files picker, returned order, HEIC, drag/pinch, safe areas, font/PNG fidelity, local capacity, single/full-set delivery |
| iPad Safari portrait and landscape | Full tablet flow | Same iOS file/touch/export checks in both orientations |
| Android Chrome | Full phone flow | Native picker, touch crop, local save, PNG/ZIP or tested mobile handoff |

Other browsers are best-effort. Automation may verify program logic and layout, but native picker UI, actual saved destination and resource pressure require real devices. Record device/OS/browser versions, URL, file formats/total bytes, screenshots or actual output files, and observed status. For V1 full-set handoff, verify the downloaded ZIP destination, extraction and all twelve independently openable PNGs on each supported mobile browser. Historical Web Share research on HTTP LAN is not a V1 gate.

## 4. Session 05 deferred risks become explicit QA gates

The following remain **NOT TESTED / PARTIAL / FAIL** until new evidence passes them. Session 05 Technical Validation Gate approval did not waive them:

1. Real iPhone/iPad/Android picker selection and returned order, cancellation and individual fallback; native desktop picker behavior; actual HEIC/HEIF selection/transcoding/decode and EXIF variants.
2. iPhone/iPad single-finger drag, pinch, explicit zoom and Reset on the production full-width crop surface, including Safari scroll/gesture conflicts and no exposed blank region. The original spike's reported drag failure must be resolved, not treated as accepted behavior.
3. Final font licensing, local WebFont file size/loading, three visually distinct presets, Safari preview/Canvas PNG fidelity and fallback; all month names at all three scales.
4. Full 12-month date/preview/export fidelity, Auto/Custom contrast thresholds, output edge pixels, digital 1200×1800 and print 1252×1843 dimensions, trim/bleed geometry and physical-resolution metadata.
5. Twelve representative **original** modern phone photos in IndexedDB: total bytes, reload/restore, quota failure without damage to last valid save, eviction/local-only messaging, two-tab conflict on Safari and mobile interruption.
6. Actual iPhone/iPad and Android individual PNG and full-set ZIP handoff: record browser download destination, extract the package, verify all twelve ordered PNGs open, and measure resource/time and interruption behavior. ZIP generation without an actual usable downloaded package is not delivery. Multi-file Web Share is outside V1 by Product Owner decision in Session 08.
7. **Resolved V1 scope decision:** The Product Owner explicitly deferred one-action direct iPhone Photos import beyond V1 in Session 08. QA must describe Files/Downloads truthfully and must not claim a ZIP or manual Photos import is an automatic save. This is no longer a V1 release gate.

The existing [iOS worksheet](../qa/ios-technical-validation.md), [cross-browser worksheet](../qa/cross-browser-technical-validation.md), and [Session 05 evidence](technical-validation.md) are starting records. M3 and M4 run the early iPhone Safari smoke checks described below; M8 performs targeted deferred device validation and browser fixes. Session 08 production QA must record new results against the actual app rather than copying spike or smoke PASS labels.

## 5. Milestone verification and stop rules

Each milestone in [the implementation plan](../plans/implementation-plan.md) has a bounded verification gate. **Immediately after M3**, run a minimal real iPhone Safari smoke test of single-finger drag, pinch, explicit zoom, Reset centered fill, no blank area and full-bleed Photo Region; record the device, actions and results, and fix crop-engine defects before closing M3. **Immediately after M4**, verify on real iPhone Safari that Sans/Serif/Handwritten look distinct in Preview and the reported font load/fallback state matches the face actually used; a silent fallback blocks M4 closure. These checks are early implementation validation, not PNG font fidelity or release QA.

M8 owns mobile hardening, safe-area/Safari-chrome fixes, targeted iPhone/iPad/Android deferred technical risks, mobile delivery candidates and large-photo storage smoke tests. **Session 08** owns the complete integration suite, formal browser matrix, full QA, release acceptance and production deployment. Release cannot pass with deferred device rows unresolved. If a test reveals a change to product scope, IA, screen structure, interaction meaning, hierarchy or the frozen visual system, record a UI/UX change request and obtain the applicable gate decision before implementing that change. The Product Owner approved browser ZIP as V1 mobile primary delivery and deferred one-action direct iPhone Photos beyond V1 in Session 08.

## Session 07 implementation closeout

Session 07 milestone files qa/session-07-m1.md through qa/session-07-m8.md record scoped implementation verification; qa/session-07-consistency-audit.md maps the original implementation request to evidence. Session 08 added Product Owner-reported iPhone 13 and iPad Air 5 ZIP extraction and twelve-PNG inspection, while native HEIC, twelve representative originals, current-stable Safari fidelity, Android, macOS, printer preflight and other formal QA rows remain open. Multi-file Share and one-action direct Photos were deferred beyond V1 by explicit Product Owner decision; see design/ui-ux-change-request-session-08-mobile-handoff.md.

## Session 07 approved-revision verification

The print/color/type revisions are documented in the approved change requests and qa/session-07-approved-revisions.md. The scoped implementation checks include unit assertions for physical geometry, PNG pHYs replacement, cropped photo-point mapping and 0.80/1/1.20 scales; an isolated Chrome browser run samples a known red source pixel on a touch viewport, checks one-month print and digital outputs, checks opaque photo/background bleed pixels and 300 PPI metadata, opens a twelve-entry print ZIP, and checks 320/390px layout plus all 216 family/scale/month/viewport combinations for title/date overflow and the Review variant switch. Those checks do not establish physical iPhone Safari sampling, Android handoff, font rendering parity on Safari, printer profile/safe-area acceptance, or a provider preflight. The later Product Owner-reported Session 08 iPhone ZIP extraction and twelve-PNG inspection are recorded separately in qa/mobile-device-results.md.

Session 08 must inspect all twelve months in all three typography systems and scales for clipping and date-grid legibility, compare Safari Preview against exported PNGs, test the sampler with a real iPhone finger and known-color fixture, verify both export variants and ZIP contents on the formal browser/device matrix, and submit a representative print PNG to the selected provider before claiming print readiness. Record the actual vendor requirements for format, ICC/CMYK, safe area and crop marks. The approved approximately 3 mm bleed is a documented geometry choice, not proof that every print service accepts it.

## Session 08 amended export test obligations

Verify PNG (default) and JPG in both single/full-set paths and print/digital sizes. Assert actual JPEG signature, SOF dimensions, print JFIF density, twelve ordered same-format ZIP entries and format-switch invalidation; preserve PNG pHYs, geometry and date tests. Pixel-check fractional crop edges and genuine-source print bleed with solid, gradient, marked and broad-white-margin sources. Verify print proof geometry matches the export crop. Verify the edge warning identifies a pale source-photo margin before batch generation, clears after zoom, links to the month and allows intentional pale backgrounds. Repeat on actual iPhone/iPad output; desktop Chromium results do not establish Safari or printer proof. The original PNG-only test table above remains the Session 06/07 baseline.


## V1 Enhancement verification

Unit coverage checks distinct photo suggestions and neutral fallback, twelve-photo color variation, batch snapshot/restore validation, valid date toggling and old-project defaults. Isolated Chrome/Edge browser coverage checks wordmark/favicon, desk-only grid, 320px overflow, three suggestion selection/Auto ink, full-set preview/confirm/reload/restore, Important Date add/remove/reload, single and full-set PNG pixel parity, and reduced-motion. Existing import/save/crop/ZIP/JPG/photo-edge tests remain regression gates. Physical Safari, named-printer and formal release-browser evidence remain separate and open.


### Fresh Baby Blue / Milk Mint UI regression

Compare current and candidate Editor/Review/sheet/mobile screenshots before committing a color-system revision. Assert primary, hover, pressed, selected, Mint assistance and disabled computed colors, plus 320px overflow and focus treatment. Re-render an unchanged project under an alternate UI-only stylesheet and compare output hashes so product chrome cannot leak into the calendar artwork. See `tests/browser/color-system-regression.mjs` and `qa/v1-enhancement-patch.md`.

Per-month photo-color regression: `tests/browser/monthly-photo-colors.mjs` checks distinct inline swatches for two different photos, a month-only background change, and parity in the 320px phone sheet. `tests/unit/enhancement.test.ts` checks sampled colors, neutral sources, tonal extensions and empty-data backup. The existing exact-pixel picker and print/color browser path remain regression gates.

Experience polish checks: `tests/browser/experience-polish.mjs` verifies three-page Entry, 12-card Review, proposal-only month switching, cancel/apply/restore, 320px palette targets and reduced-motion behavior. `tests/browser/experience-export-progress.mjs` observes all 0–12 completed-month states during actual full-set rendering. `tests/browser/experience-polish-visual.mjs` stores before/after desktop/mobile screenshots. Existing `enhancement-patch`, `color-system-regression`, Session 08 PNG/JPG integration, monthly photo-color, mobile layout and dialog-focus checks run sequentially against an isolated browser origin.

The whole-set color follow-up has a focused unit case for a suitable companion used unchanged, an overly intense companion softened, one-color tonal extension, and analysis-failure backup. Isolated browser checks verify twelve distinct photo-dependent proposals, source disclosure, preview/cancel persistence, Apply/Restore, 320px layout, and output parity. Physical-device acceptance remains open.

Motion polish verification uses computed-style and interaction checks in isolated desktop Chrome/Edge: stack duration and no margin/layout animation; rapid month switching; repeated photo recommendations and 60ms chip spacing; full-set source/progress; Important Date toggle; Review card state; real 0–12 export steps; reduced-motion final state; 320px mobile overflow; runtime exceptions. Existing integration verifies import, crop, IndexedDB recovery and PNG ZIP. Real iPhone Safari smoke remains separate evidence, not inferred from emulation.


## V1.1 Part 1 focused regression

Check the ten exact fixed colors and Auto ink recalculation; the three photo suggestions must remain photo-derived with label/HEX/selected state. Validate all six texture IDs, legacy no-texture defaults, invalid saved IDs, Preview/PNG pixel differences, unchanged photo pixels, print lower bleed continuation, JPG dimensions, 12-file ZIP and reload persistence. Repeat the established production-preview Chrome/Edge core workflow after the renderer change. Physical iPhone Safari visual quality and the existing formal Session 08 release matrix remain separate gates.

### V1.1 retro type and linen paper follow-up (2026-09-25)

The current choice set is four locally bundled Calendar font presets and seven bounded textures. Verify Fraunces load/fallback and proof/export fidelity, all twelve month names at Large scale on narrow phones, linen preview/export parity, unchanged photo pixels, saved-project round trip, and no horizontal overflow in the one-line texture strip. Earlier three/six counts above describe the prior stages. See `qa/v1-1-retro-linen.md`.

### Tracing-paper replacement check (2026-09-25)

For the seventh choice, verify the retired `linen` ID is accepted only for saved-project migration and appears as `vellum` after validation. Compare proof/PNG texture and edge, photo-region pixel invariance, dark-background readability, 320 px strip reachability, and production export geometry. See `qa/v1-1-tracing-paper.md`.

### Polka-dot texture regression (2026-09-25)

Verify that an old saved `dots` value selects 波点; the small preview, CSS proof and print PNG share a sparse staggered pattern; photo pixels are unchanged; date numerals remain visually readable; and 320/390px have no horizontal overflow. Focused Chrome/Edge evidence is in `qa/v1-1-polka-dots.md`. Device and physical-print reviews remain separate.

### Sticky workspace Header regression (2026-09-25)

Check that Landing is non-sticky; Assign/Editor/Review retain the three stage links after scrolling; the phone menu remains accessible at 320px; the phone month selector scrolls instead of sticking under the Header; desktop preview starts below the Header and fits a 600px-high viewport; modal backdrops cover the Header. Use an isolated browser context for production-preview tests so saved user projects are not cleared. See `qa/v1-1-sticky-workspace-header.md`.

### Part 2A important-mark regression (2026-09-25)

Check that all three project-wide styles leave marked-day arrays unchanged, the legacy missing field defaults to red, invalid saved values fail validation, Editor and Review proofs select the same style, and screen PNG/print JPG depict distinct red/circle/dot output with unchanged photo pixels. Verify reload and 320px selector access in isolated Chrome/Edge contexts; do not clear existing user IndexedDB. Formal Safari/printer review remains separate. Evidence: `qa/v1-1-part-2a-important-marks.md`.
