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

Other browsers are best-effort. Automation may verify program logic and layout, but native picker UI, actual saved destination, OS share choices and resource pressure require real devices. Record device/OS/browser versions, URL/security context, file formats/total bytes, screenshots or actual output files, and observed status. Use trusted HTTPS for Web Share testing; HTTP LAN evidence cannot pass that row.

## 4. Session 05 deferred risks become explicit QA gates

The following remain **NOT TESTED / PARTIAL / FAIL** until new evidence passes them. Session 05 Technical Validation Gate approval did not waive them:

1. Real iPhone/iPad/Android picker selection and returned order, cancellation and individual fallback; native desktop picker behavior; actual HEIC/HEIF selection/transcoding/decode and EXIF variants.
2. iPhone/iPad single-finger drag, pinch, explicit zoom and Reset on the production full-width crop surface, including Safari scroll/gesture conflicts and no exposed blank region. The original spike's reported drag failure must be resolved, not treated as accepted behavior.
3. Final font licensing, local WebFont file size/loading, three visually distinct presets, Safari preview/Canvas PNG fidelity and fallback; all month names at all three scales.
4. Full 12-month date/preview/export fidelity, Auto/Custom contrast thresholds, output edge pixels, digital 1200×1800 and print 1252×1843 dimensions, trim/bleed geometry and physical-resolution metadata.
5. Twelve representative **original** modern phone photos in IndexedDB: total bytes, reload/restore, quota failure without damage to last valid save, eviction/local-only messaging, two-tab conflict on Safari and mobile interruption.
6. Actual iPhone/iPad and Android PNG/12-file handoff, desktop ZIP extraction, delivery failure/retry, mobile memory/time and backgrounding. For iOS multi-file share, record HTTPS `canShare({files})`, actual Share Sheet and whether **all twelve** PNGs arrive in Files/Photos. ZIP generation alone is not delivery.
7. **Separate Product Owner gate:** demonstrate a one-action direct save of one PNG into iPhone Photos with no second manual Save action, or obtain an explicit product/platform requirement resolution. A download to iCloud Drive, opened PNG, or Share Sheet alone does not pass this gate. The approved browser-only constraint cannot be silently changed.

The existing [iOS worksheet](../qa/ios-technical-validation.md), [cross-browser worksheet](../qa/cross-browser-technical-validation.md), and [Session 05 evidence](technical-validation.md) are starting records. M3 and M4 run the early iPhone Safari smoke checks described below; M8 performs targeted deferred device validation and browser fixes. Session 08 production QA must record new results against the actual app rather than copying spike or smoke PASS labels.

## 5. Milestone verification and stop rules

Each milestone in [the implementation plan](../plans/implementation-plan.md) has a bounded verification gate. **Immediately after M3**, run a minimal real iPhone Safari smoke test of single-finger drag, pinch, explicit zoom, Reset centered fill, no blank area and full-bleed Photo Region; record the device, actions and results, and fix crop-engine defects before closing M3. **Immediately after M4**, verify on real iPhone Safari that Sans/Serif/Handwritten look distinct in Preview and the reported font load/fallback state matches the face actually used; a silent fallback blocks M4 closure. These checks are early implementation validation, not PNG font fidelity or release QA.

M8 owns mobile hardening, safe-area/Safari-chrome fixes, targeted iPhone/iPad/Android deferred technical risks, mobile delivery candidates and large-photo storage smoke tests. **Session 08** owns the complete integration suite, formal browser matrix, full QA, release acceptance and production deployment. Release cannot pass with deferred device rows unresolved. If a test reveals a change to product scope, IA, screen structure, interaction meaning, hierarchy or the frozen visual system, record a UI/UX change request and obtain the applicable gate decision before implementing that change. The iPhone Photos and multi-file save/share questions remain **OPEN QUESTION** items during Session 07; do not declare a substitute flow accepted.

## Session 07 implementation closeout

`qa/session-07-m1.md` through `qa/session-07-m8.md` record milestone-level implementation verification. `qa/session-07-consistency-audit.md` maps the original implementation request to evidence. M8 completed scoped Chrome responsive/touch/storage/interruption checks, but actual iPhone/iPad/Android safe areas, HEIC, twelve representative originals, HTTPS multi-file delivery, Safari PNG fidelity and the one-action direct Photos outcome remain NOT TESTED or OPEN QUESTION as specified above. Session 07 does not provide release acceptance.

## Session 07 approved-revision verification

The print/color/type revisions are documented in the approved change requests and qa/session-07-approved-revisions.md. The scoped implementation checks include unit assertions for physical geometry, PNG pHYs replacement, cropped photo-point mapping and 0.80/1/1.20 scales; an isolated Chrome browser run samples a known red source pixel on a touch viewport, checks one-month print and digital outputs, checks opaque photo/background bleed pixels and 300 PPI metadata, opens a twelve-entry print ZIP, and checks 320/390px layout plus all 216 family/scale/month/viewport combinations for title/date overflow and the Review variant switch. Those checks do not establish physical iPhone Safari sampling, Android handoff, font rendering parity on Safari, printer profile/safe-area acceptance, or a provider preflight.

Session 08 must inspect all twelve months in all three typography systems and scales for clipping and date-grid legibility, compare Safari Preview against exported PNGs, test the sampler with a real iPhone finger and known-color fixture, verify both export variants and ZIP contents on the formal browser/device matrix, and submit a representative print PNG to the selected provider before claiming print readiness. Record the actual vendor requirements for format, ICC/CMYK, safe area and crop marks. The approved approximately 3 mm bleed is a documented geometry choice, not proof that every print service accepts it.