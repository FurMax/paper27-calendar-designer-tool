# V1 Motion / Interaction Polish — Implementation Plan

**Status:** Third Entry timing follow-up implemented and accepted by the Product Owner on 2026-09-24. Earlier scoped iPhone Safari smoke passed before this timing change. No release or deployment.

1. Audit existing motion and record the bounded CSS-only decision.
2. Define a few duration/easing tokens; replace the Entry layout animation with one short transform/opacity entrance.
3. Tune the existing keyed month proof, add opacity-only month heading, stagger the photo recommendation chips, and add a short background-color transition.
4. Tie full-set and export chip feedback to real progress; refine Important Date, Review card, button and selected-navigation states.
5. Honor reduced-motion with immediate final position and no stagger; suppress hover-only movement on touch layouts.
6. Verify interactions and regressions on isolated browser data; record actual-device gaps for Product Owner review.

## Outcome

All seven steps implemented with CSS and one keyed month heading. No GSAP dependency. Chrome/Edge focused motion and integration checks pass; see `qa/v1-motion-polish.md`. The Product Owner reported the requested iPhone 13 Safari motion/touch smoke as all normal; the formal release matrix remains open.

## Owner timing follow-up

Audit computed timing across the product, change only the Entry stack's one-time entrance to a perceptible roughly one-second desktop sequence and shorter but readable touch sequence, then verify intermediate frames, mobile layout, reduced motion, and unchanged quick state feedback. Record the actual timings and Product Owner review status without entering release.

## Second Entry rhythm follow-up

Product Owner found the ≈1s version still too quick. Revise only Entry to ≈1.8s desktop / ≈1.5s touch with clearly separated back-to-front starts. Verify computed timing, controlled midpoint, final layout and reduced-motion, then request another subjective review.

## Third Entry rhythm follow-up

After the Product Owner found the second rhythm a little slow, set the one-time sequence between the two rejected timings: ≈1.4s desktop / ≈1.2s touch. Re-run Chrome/Edge computed-style, midpoint, responsive and reduced-motion checks; update the Product/Design/QA artifacts and seek hands-on visual feedback.
