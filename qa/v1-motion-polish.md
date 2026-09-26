# V1 Motion / Interaction Polish — QA Record

**Status:** Third Entry timing correction accepted by the Product Owner after a current-site visual review (2026-09-24). Earlier scoped iPhone 13 Safari interaction smoke passed before these corrections. No release or deployment.

## Implementation

CSS-only: Entry three-card transform/opacity entrance (current: 1000ms plus 0/200/400ms desktop delays; touch 900ms plus 0/150/300ms); keyed month proof 200ms opacity/5px and opacity-only heading; photo recommendation chips 200ms with 60ms spacing; real full-set ready chips; Important Date short color/press feedback; Review 2px hover/focus lift; export progress color/opacity; fast button/navigation state changes. No idle animation, GSAP, render-time timeline or artificial progress delay. The prior Entry `margin-top` entrance was replaced with transform to avoid layout animation. Reduced-motion removes entrances, stagger and transforms and displays the final state immediately.

## Verification

| Check | Result |
|---|---|
| `npm run build` | PASS |
| `npm test` | 56/56 PASS |
| Chrome + Edge `motion-polish.mjs` | PASS: rapid months resolve to May; 200ms proof/heading; 0/60/120ms chips; repeated color choice; Important Date toggles both ways; 12 Review cards; batch palette; 320px/390px no overflow; reduced-motion final opacity 1 and zero-duration button; no captured runtime exceptions |
| Chrome + Edge `experience-export-progress.mjs` | PASS: real completion sequence 0–12 and ready ZIP |
| Chrome + Edge `enhancement-patch.mjs` | PASS: batch apply/restore, crop photo choices, important dates, PNG output parity |
| Chrome + Edge `session08-integration.mjs` | PASS: import, reload persistence, 12 digital and print PNGs, ordered ZIP |
| Visual check | PASS: `qa/motion-polish-entry.png`, `qa/motion-polish-mobile-review.png` after animation; no visible layout displacement or 320px clipping |

## Remaining evidence

The Product Owner reported **all normal** on iPhone 13 Safari after refreshing the current LAN site: rapid month switching, repeated photo recommendation selection, Important Date add/remove, whole-set palette and twelve-image export progress, crop drag and pinch zoom. This is scoped owner-reported real-device smoke evidence; the iOS version was not reconfirmed and no device logs were captured. macOS/Android and the separate formal release gate remain open.

## Entry speed audit and correction, 2026-09-24

The Product Owner reported that the earlier Entry animation was over before it could be seen. Audit found a 500ms desktop / 360ms touch duration with a strongly front-loaded curve; the visible change was shorter than the nominal timing. The first revision ran 760ms per card with back-to-front starts at 0/120/240ms (about 1s total); touch ran 640ms with 0/90/180ms starts (about 820ms total). The first revision left front-card opacity 0.729 at 620ms animation time in Chrome and Edge, but the Product Owner still found the sequence too fast. Container top stays fixed; no margin/width/height animation or idle loop. The final and controlled midpoint captures are `qa/motion-polish-entry.png` and `qa/motion-polish-entry-mid.png` (these files are refreshed by each timing correction).

Other measured timings: month proof/heading 200ms, photo swatches 200ms with 60ms spacing, Review card 180ms, buttons 140ms, real export chips 140ms. These remain short because they confirm actions or real progress and should not hold up work. Chrome/Edge `motion-polish.mjs` passed for the first correction; the later second-correction result is recorded below.

## Second Entry rhythm correction, 2026-09-24

The Product Owner found the first ≈1s desktop / ≈820ms touch revision still too fast. The second revision used 1300ms per card and back-to-front starts at 0/250/500ms on desktop (≈1.8s overall); touch used 1100ms and 0/200/400ms (≈1.5s overall). The Product Owner found this revision a little too slow. The symmetric ease-in-out and ≤12px travel were retained for the third correction. Other interaction feedback remains 140–200ms.

Chrome and Edge `tests/browser/motion-polish.mjs` PASS: computed desktop duration/delays, touch duration/delays, front card at opacity 0.5 at the controlled 1150ms point, fixed container top, month switching and recommendation interactions, 12 Review cards, 320px/390px without horizontal overflow, reduced-motion final state, and no captured runtime exceptions. `qa/motion-polish-entry-mid.png` is a controlled animation-time capture; `qa/motion-polish-entry.png` shows the completed stack. The Product Owner reviewed this second rhythm and found it a little too slow.

## Third Entry rhythm correction, 2026-09-24

The Product Owner found the ≈1.8s desktop / ≈1.5s touch second revision a little slow. The current version sits between the two rejected rhythms: desktop 1000ms per card with 0/200/400ms starts (≈1.4s overall), touch 900ms per card with 0/150/300ms starts (≈1.2s overall). Easing, ≤12px travel, and other action feedback are unchanged.

Chrome and Edge `tests/browser/motion-polish.mjs` PASS: computed desktop/touch timing, front-card opacity 0.5 at the controlled 900ms point, fixed container position, other editor/Review interaction checks, 320px/390px without horizontal overflow, reduced-motion final state, and no captured runtime exceptions. `qa/motion-polish-entry-mid.png` and `qa/motion-polish-entry.png` were refreshed for this version. The Product Owner refreshed the current site and said the third rhythm is suitable. This is visual timing acceptance, not formal device/browser release QA.
