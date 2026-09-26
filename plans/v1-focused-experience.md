# V1 Focused Experience Upgrade — Implementation Plan

**Status:** Implemented; Product Owner review pending. No deployment.

1. Record the existing CSS motion audit and baseline build size (Vite app JS 297.77 kB / gzip 93.68 kB before GSAP).
2. Install `gsap` and `@gsap/react`; use core GSAP only. Implement scoped `useGSAP` and context-safe event callbacks.
3. Replace Entry stack CSS keyframes with a layered GSAP timeline, retaining the owner-accepted overall rhythm; add a fine-pointer-only subtle hover response if it passes visual inspection.
4. Replace keyed Editor proof/heading CSS entrance with outgoing/incoming month layers and a cancellable GSAP timeline. Verify rapid Jan→Feb→Mar→Apr switching ends on Apr without queued transitions.
5. Replace whole-set color readiness CSS keyframe with GSAP result progression, coordinated preview grid and a small apply wave on affected Review cards. Keep real analysis and immediate state update.
6. Remove overlapping CSS transform/opacity animations for replaced elements; leave simple controls, Important Date, Review hover and real export progress in CSS.
7. Check reduced-motion, touch layouts, crop/pinch/sticky controls, modal focus, export parity, browser console, tests and bundle size. Write a before/after QA record and request Product Owner review.

## Month-switch flash correction

Retain keyed proof DOM for the displayed month while mounting the target proof above it. Start the one-way GSAP reveal only after the target image is available; never fade both layers toward the workspace at once. On completion, promote the target keyed node and remove the previous node. A newer month cancels any waiting load or timeline. Verify per-frame opacity, image readiness, repeat rapid switches, reduced-motion and crop hit testing.

**Correction outcome, 2026-09-24:** Chrome and Edge frame/rapid-switch regressions pass. The Product Owner reports no more flash on the LAN page when switching months 1–4. The full three-interaction experience patch still awaits Product Owner review; no release or deployment approval is inferred.
