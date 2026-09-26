# Session 06 — Proposed Production Code Index

**Status:** Session 06 approved planning map, now updated alongside active Session 07 implementation. The table retains proposed module responsibilities; the implemented files are listed below. `prototype/` and `spikes/` remain non-production references.

| Proposed path | Responsibility | Milestone |
|---|---|---|
| `package.json`, `vite.config.ts`, `tsconfig.json` | React/TypeScript/Vite build and test scripts, pinned dependencies | M1 |
| `src/app/App.tsx`, `src/app/navigation.ts` | S01–S04 shell, History/back, stable route and month context | M1 |
| `src/screens/Entry.tsx`, `Assign.tsx`, `Editor.tsx`, `Review.tsx` | Approved screen structure and responsive UI | M1–M4, M6–M8 |
| `src/components/` | T01–T05 sheets/dialogs/status and shared Direction A controls | M2–M8 |
| `src/domain/calendar.ts` | 2027 English labels and Sunday-first six-row date engine | M1 |
| `src/domain/project.ts`, `src/domain/assignment.ts` | Project types, selectors, commands, photo-item reuse and reset rules | M2 |
| `src/domain/crop.ts` | Renderer-independent cover/zoom/offset/clamp/pinch math | M3 |
| `src/domain/color.ts`, `src/domain/typography.ts` | Canonical colors, Auto/Custom contrast, bundled preset definitions | M4 |
| `src/domain/geometry.ts`, `src/domain/renderModel.ts` | One fixed output geometry and resolved month render input for preview/export | M1, M4 |
| `src/features/photos/import.ts` | Picker validation, decode-before-commit, metadata and graceful HEIC attempt in one module | M3 |
| `src/features/crop/CropSurface.tsx` | Pointer/touch gesture adapter and explicit zoom/reset controls | M3 |
| `src/persistence/indexedDb.ts`, `src/persistence/serialization.ts` | One-project/asset stores, atomic revision-guarded save/restore, schema validation | M5 |
| `src/export/canvasRenderer.ts`, `src/export/exportController.ts` | Exact monthly PNG renderer and immutable full-set snapshot/progress/cancel | M6–M7 |
| `src/export/zip.ts`, `src/export/delivery.ts` | Ordered ZIP packaging and isolated browser handoff adapters | M7–M8 |
| `src/styles/` and local font assets under `src/assets/fonts/` | Approved Direction A styling and licensed Calendar faces, independent Chinese UI stack | M1, M4, M8 |
| `tests/unit/`, `tests/browser/`, `qa/` | Domain tests, browser flow/file inspection, targeted device evidence in Session 07; formal release records in Session 08 | Throughout; M8 targeted validation, Session 08 full matrix |

Use `docs/architecture.md` for module boundaries, `docs/data-model.md` for types and invariants, `docs/export-pipeline.md` for render/delivery, `docs/testing-strategy.md` for gates, and `plans/implementation-plan.md` for sequence. Keep this index synchronized if implementation chooses different paths; it is a map, not a requirement to create empty files.

## Session 07 implemented files

M1 created `package.json`, `package-lock.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `src/main.tsx`, `src/app/App.tsx`, `src/app/navigation.ts`, the four `src/screens/` components, `src/components/CalendarProof.tsx`, `src/domain/calendar.ts`, `geometry.ts`, `renderModel.ts`, `src/styles/app.css`, and `tests/unit/calendar.test.ts`. `qa/session-07-m1.md` records the bounded verification. The initial unit runner is Node 24's built-in TypeScript stripping and test runner, rather than the proposed Vitest, so pure domain tests need no additional runtime package. Browser verification uses the Codex browser control surface; a repeatable browser suite is added with feature flows as the later milestones require. No prototype or spike code is imported.

M2 added `src/domain/project.ts`, `src/domain/assignment.ts`, `src/app/ProjectContext.tsx`, `src/components/PhotoImage.tsx`, `src/features/photos/import.ts`, and `tests/unit/assignment.test.ts`. S01/S02/S03/S04 now read one in-memory project. The picker/decode foundation was connected during M2 so real photos could exercise S02; M3 still owns the complete import policy, crop math and gestures. `qa/session-07-m2.md` records browser evidence.

M3 complete: `src/domain/crop.ts` owns cover, normalized offsets, drag, anchored zoom and reset; `src/features/crop/CropSurface.tsx` adapts pointer gestures; `src/domain/renderModel.ts` now resolves the same crop for proof and later Canvas export. `src/features/photos/import.ts` attempts `createImageBitmap` then image-element decode before committing. `tests/unit/crop.test.ts` and `tests/unit/import.test.ts` cover boundaries. Desktop evidence and the Product Owner-reported real iPhone smoke result are in `qa/session-07-m3.md`.

The first iPhone LAN test exposed a secure-context dependency. `src/domain/id.ts` now centralizes UUID creation with a `getRandomValues` fallback; `tests/unit/id.test.ts` prevents a repeat. Import diagnostics in `src/features/photos/import.ts` distinguish decoder failure from ID failure. See `qa/session-07-m3.md`.

M4 complete: `src/domain/color.ts` canonicalizes HEX/RGB and resolves Auto ink and the provisional Custom warning; `src/domain/typography.ts` defines three read-only curated systems and bounded scales; `src/components/StyleControls.tsx` provides desktop panel and phone sheet controls with explicit font load/fallback status. `src/assets/fonts/` contains the three candidate OFL faces and license notices. `src/domain/renderModel.ts` supplies the same resolved style to proof and later export. `tests/unit/style.test.ts` and `tests/browser/m4-check.mjs` cover the implementation. See `qa/session-07-m4.md`; The Product Owner reported no problems in the required real iPhone Safari font smoke.

M4 also corrected production UI copy to the frozen Simplified Chinese boundary: month selectors/cards/panel labels use Chinese month labels, while Calendar Proof and live font samples remain English. The visible site name now matches `design/DESIGN.md`.

M5 complete: `src/persistence/serialization.ts` validates saved schema/references and stable resume context; `src/persistence/indexedDb.ts` owns one-project and asset stores with atomic revision-guarded commit/replacement. `src/app/ProjectContext.tsx` debounces and serializes autosaves, retries the latest in-memory snapshot, restores on load and blocks stale tabs. S01 now supports Resume and confirmed Start New; T04 handles save failure and conflict. The retry coordinator lives with project state rather than inside the IndexedDB wrapper so it can use the latest visible snapshot. `tests/unit/serialization.test.ts`, `tests/browser/m5-check.mjs`, and `qa/session-07-m5.md` record evidence.

M6 complete: `src/export/canvasRenderer.ts` is the dedicated 1200×1800 Canvas renderer with exact preset-font preflight, oriented decode, shared crop/style/date model and PNG signature/dimension validation. `src/screens/Editor.tsx` keeps single-export transient prepare/ready/error/download state local to the screen; the planned shared `exportController.ts` begins with M7 full-set orchestration. `tests/browser/m6-check.mjs`, `qa/m6-preview.png`, `qa/m6-sample.png`, and `qa/session-07-m6.md` provide bounded evidence.

M7 complete: `src/export/exportController.ts` preflights all twelve Ready months and sequentially renders from one cloned snapshot, yielding between months and accepting cancellation. `src/export/zip.ts` uses pinned `fflate@0.8.2` pass-through ZIP streams, since PNGs are already compressed; `src/export/delivery.ts` owns the user-activated browser download adapter and capability helpers. `src/screens/Review.tsx` owns transient progress, cancel, ready, sent, error and retry state. `tests/unit/full-export.test.ts`, `tests/browser/m7-check.mjs`, `tests/browser/m7-memory.mjs` and `qa/session-07-m7.md` record evidence. Desktop ZIP delivery is validated; mobile multi-file delivery is still an OPEN QUESTION for M8.

M8 complete for implementation hardening with deferred device validation: `src/export/delivery.ts` now treats a throwing `navigator.canShare` as unsupported. `qa/m8-delivery-probe.html` is dev-only, not a product screen or build entry, and tests a second-tap 12-file Web Share candidate without changing the approved mobile delivery decision. `tests/browser/m8-layout.mjs`, `m8-touch.mjs`, `m8-storage.mjs`, `m8-large-export.mjs`, `m8-interruption.mjs`, and `m8-probe.mjs` plus `qa/session-07-m8.md` record scoped browser evidence and NOT TESTED device rows. The S01–S04 UI, crop engine and persistence architecture needed no M8 structural change.

Post-M8 Product Owner review: `src/screens/Editor.tsx` and `src/components/StyleControls.tsx` received small Simplified Chinese wayfinding copy so the phone typography sheet explicitly names text color and the existing HEX/RGB fields are discoverable. `tests/browser/m8-color-discovery.mjs` verifies the 320px entry. At that point, this did not add a color model, custom eyedropper, or mobile delivery adapter. `design/ui-ux-change-request-session-07.md` records the later-approved palette and sampler; mobile handoff still needs device evidence and a Product Owner decision.

## Session 07 approved-revision implementation map

- src/domain/exportVariant.ts defines print/digital dimensions, trim and nominal 300 PPI. src/export/pngMetadata.ts writes valid physical-resolution metadata. src/export/canvasRenderer.ts maps the shared composition into the print trim and extends artwork into bleed; Editor and Review select the variant through src/components/ExportVariantPicker.tsx. The default is print, while the digital variant preserves the original 1200×1800 output.
- src/domain/photoSampling.ts maps a point in the cropped Preview to the decoded source pixel. src/components/PhotoColorPicker.tsx provides a touch/click sampler with provisional swatch/HEX and explicit confirm/cancel. src/components/StyleControls.tsx groups the current background color, named Quick Colors, native picker and exact HEX/RGB; per-month text Auto/Custom remains.
- src/domain/typography.ts now resolves Small/Standard/Large as 0.80/1/1.20. The persisted scale values and project schema did not change.
- tests/unit/print-and-sampling.test.ts and tests/browser/session07-print-color.mjs provide scoped checks; qa/session07-photo-sample-mobile.png and qa/session07-type-scale-mobile.png are Chrome mobile-viewport evidence. qa/session-07-approved-revisions.md records limits and remaining Session 08 gates.

## Session 08 integration and QA additions

- `src/app/dialogFocus.ts` is a small app-wide dialog keyboard-focus adapter. It moves focus into transient dialogs, contains Tab navigation and restores the triggering control when the dialog closes. `src/app/App.tsx` installs it once; `tests/browser/session08-dialog-focus.mjs` is its browser regression.
- `tests/browser/session08-integration.mjs` runs the current production first-time/returning flow in isolated Windows Chrome and Edge profiles, checks actual IndexedDB state, all twelve Preview date grids, twelve digital PNG date-position pixels and the browser-downloaded default print ZIP's twelve PNG entries.
- `tests/browser/session08-assignment-ui.mjs` runs S02 Move/Swap/Remove/Replace/Reuse/Delete through production buttons and checks each committed IndexedDB state.
- `tests/browser/session08-color-output.mjs` checks actual PNG background and unified title/year/weekday/date ink pixels for nine Auto/Custom cases.
- `tests/browser/session08-photo-output.mjs` checks five actual PNG photo-ratio edge cases and oriented EXIF JPEG decode in Chrome.
- `tests/browser/session08-typography.mjs` renders 3 presets × 3 scales × 12 months as actual digital PNGs and checks face load status and visible title ink in Chrome.
- Historical `tests/browser/m5-check.mjs` and `m7-check.mjs` now use current approved control selectors and print-default wording/filename. Their persistence and cancel/failure/retry assertions pass again.
- `qa/integration-results.md`, `cross-browser-results.md`, `mobile-device-results.md`, `export-results.md`, and `release-checklist.md` record current evidence, limits, severity and remaining release gates. `design/ui-ux-change-request-session-08-contrast.md` records the unresolved Auto ink threshold/visual decision without changing production color behavior.
- `qa/session08-device-probe.html` is a QA-only picker/decode/metadata page served by the local dev server. It is outside the production build and does not upload or persist selected files.

The Product Owner's iPhone 13 Safari 16.2 LAN report adds a scoped browser-ZIP handoff PASS: the 24.2 MB ZIP appeared in iCloud Drive / Downloads, was extracted, and each of twelve PNGs opened. The QA-only picker probe decoded one 5,733,218-byte PNG through the img fallback after createImageBitmap failed. It does not establish native HEIC, twelve-source-photo capacity, HTTPS Share or direct Photos. See qa/mobile-device-results.md.

The Product Owner approved ZIP as the V1 mobile primary handoff and deferred multi-file Share and one-action direct Photos beyond V1. Production already has ZIP/individual PNG download and no Share button; the QA-only Share probe remains a historical experiment. The Review ZIP note now names opening/extraction. The Product Owner reports that iPad Air 5 also completed the core workflow in both orientations, with version, file size and destination unreported.

qa/printer-preflight-sample-2027-01.png is a synthetic January print PNG extracted from the validated Session 08 Chrome ZIP, held for comparison with the Product Owner's pending printer requirements; it is not provider approval.

Session 08 has not nominated a Release Candidate or entered deployment. The Windows browser results are headless; the Product Owner's iPhone/iPad reports are scoped. Native picker, current-stable Safari, Android, real-original-photo and printer-provider gates remain open.

## Session 08 export format and photo-edge correction

- `src/domain/exportFormat.ts`, `src/components/ExportFormatPicker.tsx`, `src/export/jpegMetadata.ts`, `src/export/canvasRenderer.ts`, `src/export/zip.ts`, `src/export/exportController.ts` and S03/S04 now support transient PNG/JPG choice, single output and twelve-file same-format ZIP. PNG stays default; print JPG writes 300 dpi JFIF density.
- `src/export/photoEdgeRisk.ts` scans the visible crop for broad pale edges. S03 warns beside crop controls; S04 checks every month before generation with Edit and Continue options. The Canvas renderer overscans beneath the exact digital crop; src/domain/printPhotoCrop.ts supplies the shared minimum-cover print transform for genuine source-photo bleed and print Preview.
- `tests/unit/jpeg-export.test.ts`, `tests/browser/session08-jpg-export.mjs`, and `tests/browser/session08-photo-edge.mjs` cover metadata, ZIP, narrow format UI, warnings and edge pixels in isolated Windows Chrome/Edge. The supplied January/May print JPGs are historical failure evidence; their original source Blobs/crop state were not supplied.

The selected variant also reaches `PhotoColorPicker.tsx`, so sampled pixels match the print or digital photo shown in S03. `sourcePixelAt` accepts the shared rectangle coordinates. The Session 07 print/color browser regression passed after this wiring.


## V1 Enhancement code map

- `src/domain/photoPalette.ts` and `src/features/photos/recommendColors.ts`: representative photo-color extraction, labeled tonal extensions when needed, and in-browser cropped-image sampling. `src/screens/Editor.tsx` analyzes only the active month and passes its three swatches to `src/components/StyleControls.tsx` for desktop and phone.
- `src/domain/batchColors.ts` with `src/app/ProjectContext.tsx`: one-action coordinated color apply/restore persisted in the existing project.
- `src/domain/importantDates.ts`, `src/components/ImportantDateControls.tsx`, `src/domain/renderModel.ts`, `src/components/CalendarProof.tsx`, `src/export/canvasRenderer.ts`: date-number validation/control and proof/export parity.
- `src/app/App.tsx`, `src/styles/app.css`, `public/favicon.svg`: brand slot, desk/Baby Blue/Milk Mint hierarchy and reduced-motion shell.
- `tests/unit/enhancement.test.ts` and `tests/browser/enhancement-patch.mjs`: focused patch verification.

## V1 Experience Polish code map

- `src/screens/Review.tsx`: twelve-color proposal strip, selected-month proof, 12/12 completion and month-by-month export status; `src/screens/Entry.tsx`: decorative three-page calendar stack.
- `src/domain/photoPalette.ts` and `src/components/StyleControls.tsx`: semantic photo-color labels and larger selectable swatches.
- `src/styles/app.css`: quieter workspace, brand/control hierarchy, palette/Review/Entry presentation and reduced-motion overrides. Export canvas never reads these styles.

- `src/domain/photoPalette.ts` `coordinatedSetColorChoice`: chooses a gently contrasting existing monthly photo swatch, softens unsuitable tones, and returns source metadata. `src/screens/Review.tsx` discloses that source in the read-only twelve-month confirmation preview.

## V1 Motion Polish code map

- `src/styles/app.css`: motion tokens, CSS-only entrances/state transitions, touch suppression and reduced-motion final states. `src/screens/Editor.tsx` keys only the month heading so its opacity cue restarts on month change without remounting the controls.
- `tests/browser/motion-polish.mjs`: focused Chrome/Edge behavior, CSS timing, mobile, reduced-motion and runtime-error checks. `tests/browser/experience-export-progress.mjs` verifies actual export steps.

## V1 Focused Experience Upgrade, 2026-09-24

- `src/screens/Entry.tsx`: scoped GSAP paper-stack timeline and context-safe fine-pointer response; CSS retains final static positions.
- `src/screens/Editor.tsx`: retained displayed proof/photo plus a target proof revealed only after photo decode; scoped, cancellable GSAP switch timeline with a reduced-motion final state.
- `src/screens/Review.tsx`: genuine per-month palette readiness, preview entrance, applied-color ribbon and Review-card wave; stored colors update without waiting for motion.
- `src/styles/app.css`: layout and retained CSS states; old stack/month/ready keyframes removed.
- `tests/browser/focused-experience.mjs`: cross-browser animation, frame-by-frame month opacity and image-readiness, rapid-switch, palette, reduced-motion and mobile layer checks. `tests/browser/diagnose-month-flash.mjs` records a detailed month-switch frame trace; `tests/browser/motion-polish.mjs` forwards to the current regression entry point.


## V1 pre-release QA, 2026-09-24/25

- tests/browser/pre-release-preview.mjs is the production-preview CDP harness. It exercises the public UI and real downloaded files in isolated Chrome/Edge profiles against dist/ at loopback port 4173.
- qa/v1-pre-release-plan.md defines run scope and evidence rules. qa/v1-pre-release-results.md is the twelve-part report and short Product Owner iPhone handoff. qa/v1-pre-release-9230.json and qa/v1-pre-release-9231.json hold machine-readable browser results; qa/v1-pre-release-*.png are reviewed visual captures.
- qa/release-checklist.md and qa/cross-browser-results.md distinguish this Windows production-preview pass from still-open formal Safari, macOS, Android, printer and product-decision gates.


## V1.1 Part 1 code map

- src/domain/color.ts defines ten named Common Colors; src/components/StyleControls.tsx renders them separately from the three current-photo suggestions.
- src/domain/texture.ts defines the six bounded IDs and cached deterministic tiles; src/components/TextureControls.tsx provides desktop/phone previews and selection. src/domain/project.ts, src/app/ProjectContext.tsx and src/persistence/serialization.ts persist and validate the optional per-month ID.
- src/domain/renderModel.ts, src/components/CalendarProof.tsx and src/export/canvasRenderer.ts share the chosen texture across proof, digital and print output without touching the photo/crop path.
- tests/unit/texture.test.ts and tests/browser/v1-1-part-1.mjs provide focused model and production-preview pixel/ZIP checks. qa/v1-1-part-1.md and qa/v1-1-full-workflow-9230.json / qa/v1-1-full-workflow-9231.json record evidence and review limits.

## V1.1 Editor current-month export entry — 2026-09-25

`src/screens/Editor.tsx` now owns a four-choice title-row export menu and compact transient handoff status. It still calls `renderMonthImage` from `src/export/canvasRenderer.ts` for actual print/digital PNG/JPG bytes. `src/components/ExportVariantPicker.tsx` and `ExportFormatPicker.tsx` remain shared Review controls; only their Editor instances were removed. `src/styles/app.css` owns the overlay and responsive placement. `tests/browser/month-export-menu.mjs` and `qa/v1-1-month-export-menu.md` record focused QA.

### 2026-09-25 retro type and paper addition

`src/domain/typography.ts` defines four project-wide presets, including locally bundled Fraunces in `src/assets/fonts/` with its OFL license. `src/domain/texture.ts` defines seven bounded textures and shares the linen tile between CSS proof and canvas export. The Editor current-month export chevron is styled in `src/styles/app.css`; its handler remains in `src/screens/Editor.tsx`.

### 2026-09-25 tracing-paper replacement

`src/domain/texture.ts` now generates the seventh `vellum` tile and draws its sheet edge; `src/components/TextureControls.tsx` exposes 硫酸纸, while `src/styles/app.css` mirrors the edge in proof. `src/persistence/serialization.ts` normalizes retired saved `linen` values to `vellum`. `tests/browser/tracing-paper.mjs` and `tests/unit/texture.test.ts` cover output and migration.

### Polka-dot visual revision (2026-09-25)

`src/domain/texture.ts` preserves `dots` while changing its label to 波点 and generating a 288px sparse staggered tile; `src/components/TextureControls.tsx` scales the same image for a 40px thumbnail. `tests/browser/polka-dots.mjs` checks Chrome/Edge print pixels, photo invariance and mobile overflow. Visual sample and results: `qa/v1-1-polka-dots-print.png`, `qa/v1-1-polka-dots.md`.

### Workspace Header (2026-09-25)

`src/app/App.tsx` scopes the `site-header--workspace` class to Assign, Editor and Review. `src/styles/app.css` owns the sticky positioning, compact phone treatment, non-sticky phone month selector, modal layering, and Editor proof offset/short-viewport fit. The navigation actions and routes are unchanged. Focused browser coverage: `tests/browser/sticky-workspace-header.mjs`; results: `qa/v1-1-sticky-workspace-header.md`.

### Part 2A important marks (2026-09-25)

`src/domain/project.ts` stores the project-wide `importantMarkStyle`; `src/domain/importantDates.ts` defines and validates its three choices. `src/app/ProjectContext.tsx` updates only that field; `src/persistence/serialization.ts` defaults legacy saves to red and rejects invalid choices. `src/domain/renderModel.ts` sends the style to `src/components/CalendarProof.tsx` and `src/export/canvasRenderer.ts`; `src/components/ImportantDateControls.tsx` and `src/screens/Editor.tsx` expose the compact selector. `tests/unit/enhancement.test.ts` and `tests/browser/important-mark-style.mjs` cover state, proof, PNG/JPG, Review, reload and 320px phone UI. See `qa/v1-1-part-2a-important-marks.md`.
