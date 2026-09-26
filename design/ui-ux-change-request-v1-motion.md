# V1 Motion / Interaction Polish — UI / UX Change Request

**Status:** Third Entry timing correction accepted by the Product Owner on 2026-09-24 after a current-site visual review. Earlier iPhone 13 Safari interaction smoke passed before this timing correction. No release or deployment authorization.

## Scope

Preserve the four-screen IA, layout, color roles, project model, crop engine, persistence, and PNG/JPG/ZIP export. Use small, functional transitions for Entry calendar-stack entrance, month switch proof and month heading, photo recommendation chips, actual full-set analysis progress, Important Date feedback, Review card hover/focus, real export progress, buttons and selected navigation. No artificial delay is added to analysis or export. Calendar artwork remains visually dominant; UI animation never enters exported files.

## Motion contract

CSS custom properties define fast (140ms), normal (200ms), emphasis (320ms), and hero (500ms) durations. Use opacity/transform for entrances and color/border/shadow for states. Entry stack has one 500ms entrance with 70ms back-to-front staggering and no idle loop. Month switch has a 200ms proof reveal and opacity-only right heading; keyed month content makes rapid switching interruptible. Palette reveal is 200ms with 60ms spacing. Full-set chips enter ready as real analysis finishes. Review cards move at most 2px on hover/focus; mobile removes hover-only movement. Important Date press is at most 0.96 scale and its red marked state remains the semantic feedback. Export chips transition with real month completion. Reduced-motion uses final positions immediately, without stagger or layout-affecting animation.

## Technology choice

Use CSS transitions/keyframes only. This patch has no coordinated timeline requiring GSAP, so do not add `gsap` or `@gsap/react`; bundle impact from GSAP is zero. No animations are created in React render, and no timeline/listener cleanup is needed.

## Verification boundary

Run build/unit tests, isolated Chrome and Edge interaction checks, 320px/390px responsive checks, reduced-motion computed-state checks, rapid month switching, repeated palette extraction, Important Date add/remove, export progress, and crop/save/export regressions. Real iPhone Safari smoke remains Product Owner/device QA; do not claim it from desktop emulation.

## Entry timing correction — Product Owner feedback, 2026-09-24

The Product Owner reports the Entry three-calendar entrance finishes before it can be perceived and asks for an audit of all motion timing. The 500ms desktop / 360ms touch animation used a strongly front-loaded easing, making most visible travel end much earlier than the nominal duration. Revise this one-time entrance to a 760ms card animation with 0/120/240ms back-to-front starts (about 1s overall) and a gentler ease-in-out curve; touch uses 640ms with 0/90/180ms starts (about 820ms overall). Keep travel at or below 12px, no idle loop or layout animation. Keep month switching, controls, progress and export feedback at their existing short timings because those are interaction states, not artwork entrances; real work is never delayed. Reduced-motion remains immediate. This owner correction supersedes the earlier 500–650ms hero ceiling only for Entry.

## Entry timing correction 2 — Product Owner feedback, 2026-09-24

The Product Owner tried the revised ≈1s desktop Entry sequence and still found it too fast. Increase perceptibility with a 1300ms per-card ease-in-out and 0/250/500ms back-to-front starts (≈1.8s overall). Touch uses 1100ms per card and 0/200/400ms starts (≈1.5s overall). The stack remains a one-time, nonblocking entrance with the same ≤12px travel and no idle motion. Do not lengthen month switching, color selection, buttons or real progress, where speed serves direct manipulation. This second owner correction supersedes the first Entry timing correction.

## Entry timing correction 3 — Product Owner feedback, 2026-09-24

The Product Owner found the ≈1.8s desktop / ≈1.5s touch sequence a little too slow. The acceptable rhythm is bracketed by that version and the ≈1s desktop / ≈820ms touch version judged too fast. Set Entry to 1000ms per card with 0/200/400ms back-to-front starts (≈1.4s total) on desktop, and 900ms with 0/150/300ms starts (≈1.2s total) on touch. Retain the symmetric ease-in-out, ≤12px movement, one-time nonblocking entrance, and immediate reduced-motion final state. Other interaction timing stays unchanged. This third owner correction supersedes the prior Entry timings; the Product Owner reviewed the current site and said this rhythm is suitable.
