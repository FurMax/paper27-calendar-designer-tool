# V1 Focused Experience Upgrade — QA and Before/After Review

**Status:** Implemented for Product Owner review on 2026-09-24. No release or deployment approval.

## Existing CSS motion audit

| Interaction | Decision | Evidence |
|---|---|---|
| Landing heading and CTA | NO MOTION NEEDED | Content remains immediately readable and clickable. |
| Landing calendar stack | REPLACE WITH GSAP | CSS `stack-enter` faded each card over 1000ms with 0/200/400ms starts (touch 900ms with 0/150/300ms); rotation and layer positions were already set before the fade. |
| Editor month switching | REPLACE WITH GSAP | CSS `month-enter` showed only the new proof for 200ms; old proof vanished instantly. Heading used a separate 200ms fade. |
| Per-month photo recommendation | KEEP CSS | Existing 200ms swatches with 60ms spacing are sufficient. No fourth GSAP interaction was added. |
| Whole-set smart palette | REPLACE WITH GSAP | Real per-month analysis existed, but each ready swatch used a 160ms CSS keyframe, the 12-color preview appeared without coordination, and apply had only a notice/background color change. |
| Review card hover/focus | KEEP CSS | 2px lift, border and shadow remain sufficient. |
| Important Date | KEEP CSS | 160ms press/color feedback already communicates the toggle. |
| Export progress | KEEP CSS | Real 1–12 month completion is visible; no artificial delay or spinner-only state. |

## Before / after

| Priority | Before | After | Why GSAP improves it |
|---|---|---|---|
| Landing stack | Three cards primarily faded in from nearly final positions. | Back-left, back-right, then front arrive with restrained x/y, rotation and scale in a scoped timeline; approximately 1.34s desktop / 1.2s touch. Fine-pointer hover spreads the rear cards by only 4px and raises the front 2px; touch omits hover. | The paper proofs now appear placed on the desk in order. The page becomes still after the one-time entrance; CTA is never delayed. |
| Month switch | New month faded in; old month disappeared in one React commit. The first GSAP iteration then caused a double flash by fading both proofs and remounting the old photo. | Navigation and controls update immediately. The old proof and photo remain fully visible while the new photo loads; GSAP reveals the new proof over it in 250ms after decode. The old proof is removed at completion. | One visible handoff keeps the workspace covered throughout. `useGSAP` cancels previous work during rapid navigation; the title and Ready state stay stable. |
| Smart palette | Real analysis progressed, but result reveal, preview and apply were visually disconnected. | Real completed months appear in the loading grid; 12 preview choices enter in a short stagger; apply changes project state immediately, then a visible 12-color ribbon and small Jan–Dec card wave acknowledge the result. Restore removes the ribbon. | Analysis, preview and completion now form one readable sequence. No delay is inserted into analysis, state update or export. |

## React, reduced motion and mobile

- `gsap` **3.15.0** and `@gsap/react` **2.1.2** are production dependencies. Entry pointer callbacks use `contextSafe`; Entry, Editor and Review animation scopes use `useGSAP`. Context cleanup handles Strict Mode and route unmount. Editor uses `revertOnUpdate` and a latest-month guard; old timelines do not queue.
- Reduced-motion shows the final Entry stack and month immediately. Review analysis, preview and apply show their final state without GSAP movement. The retained CSS interactions follow their reduced-motion rules.
- Mobile keeps the month transition and smart palette. Entry uses a simpler 1.2s sequence; hover response is disabled. 390px/320px Chrome and Edge emulation showed no horizontal overflow, the current crop surface remained hit-testable, and the bottom dock stayed sticky. This is not a real iPhone Safari retest.

## Regression evidence

| Check | Result |
|---|---|
| `npm run build` | PASS; TypeScript and Vite |
| `npm test` | 56/56 PASS |
| Chrome + Edge `focused-experience.mjs` | PASS after correction: final stack, hover return, month frame checks for retained old photo, workspace coverage and decoded new photo, rapid Jan→Feb→Mar→Apr latest result, 12-color preview, apply wave/ribbon, restore, reduced-motion final states, 390px/320px crop hit testing and sticky dock, no captured runtime errors |
| Chrome + Edge `experience-polish.mjs` | PASS: palette preview leaves saved project unchanged, apply/restore data parity, 320px sheet, reduced-motion |
| Chrome + Edge `experience-export-progress.mjs` | PASS: real completed sequence 0–12 and ready ZIP |
| Chrome `session08-dialog-focus.mjs` | PASS: dialog focus entry, wrap and restoration |
| Visual captures | `qa/focused-entry-final.png`, `qa/focused-editor-april.png`, `qa/focused-palette-preview.png`, `qa/focused-palette-applied.png` |

## Bundle impact and remaining review

Before GSAP, Vite app JS was **297.77 kB / 93.68 kB gzip**. After the month-switch correction it is **375.14 kB / 123.94 kB gzip**: **+77.37 kB raw / +30.26 kB gzip**. CSS is 52.46 kB / 10.12 kB gzip after removal of superseded keyframes. No ScrollTrigger, Flip, Draggable, MorphSVG, MotionPath or other motion package was added.

A production dependency audit reports one moderate advisory in existing `fflate@0.8.2` ZIP parsing; it does not implicate GSAP and is outside this motion patch. The Product Owner's earlier iPhone 13 motion/crop report predates this GSAP upgrade. On 2026-09-24, the Product Owner reported that the corrected LAN page no longer flashes while repeatedly switching months 1–4. The report does not identify a device or approve the other two GSAP interactions. Real iPhone/iPad Safari review and the formal Session 08 browser/release matrix remain open. Product Owner visual acceptance of the full three-interaction patch is pending.

## Motion ideas intentionally rejected

No animation on Landing text or CTA, no 3D tilt, idle loop, scroll effect, simulated AI thinking, artificial analysis/export wait, whole-panel movement, per-button GSAP hover, Review-card flying/scaling, or GSAP rewrite of Important Date and export progress.

## Month-switch flash correction evidence

- **Cause:** In the first GSAP version, the outgoing proof faded below 0.5 opacity before the incoming proof reached 0.2, and the old keyed photo was briefly remounted. Both effects exposed the workspace as two flashes.
- **Fix:** Keep the old keyed proof mounted and fully opaque; wait for the target image to load and decode; reveal the target over it once; remove the old proof only when the reveal completes. The month title and Ready state no longer fade.
- **Frame trace:** `tests/browser/diagnose-month-flash.mjs` sampled 40 Chrome frames over 658ms. The first old photo was loaded, minimum old opacity was 1, and the first visible target frame came after its photo loaded. No frame had a combined proof opacity below 1.
- **Regression:** Chrome and Edge `focused-experience.mjs` assert old-photo retention, combined proof opacity above 0.99, target-photo readiness before reveal, and latest-month behavior under Jan→Feb→Mar→Apr switching. Both pass after the correction. `npm test` passes 56/56, `npm run build` passes, and the LAN site returns HTTP 200.
- **Owner observation:** The Product Owner refreshed the LAN page and reported “已经没有闪烁” after repeated month 1–4 switching. This confirms the reported defect is resolved in their current view; full experience and device QA gates remain open.
