# UI / UX Change Request — V1 Focused Experience Upgrade

**Status:** Implemented for Product Owner review on 2026-09-24. Product Owner review required before this experience patch is accepted. No release or deployment.

## Boundary

Retain the four-screen IA, core screen structure, navigation semantics, image crop, project state, palette algorithm, saved data, and PNG/JPG/ZIP export. Refine three local interaction presentations: Entry calendar stack, Editor month switching, and Review whole-set color recommendation. Introduce production `gsap` and `@gsap/react` only for coordinated timelines and multi-item state changes. Simple hover/focus and real export progress stay CSS. Respect reduced-motion by showing final state immediately. Do not delay computation or user actions for animation.

## Existing motion audit

| Interaction | Decision | Reason |
|---|---|---|
| Landing heading, copy and CTA | NO MOTION NEEDED | Primary content and action should be available immediately. |
| Landing calendar stack | REPLACE WITH GSAP | The current CSS opacity/short travel stagger is visible but lacks the layered placement of paper proofs. |
| Month switching | REPLACE WITH GSAP | The keyed proof CSS entrance has no outgoing state; title only fades. Frequent switching needs a cancellable coordinated transition. |
| Photo Color Recommendation | KEEP CSS | Three swatches already have an understated 60ms stagger and immediate color choice. Revisit only if the three priorities fail the review. |
| Full-set Smart Palette | REPLACE WITH GSAP | Real per-month analysis exists, but result appearance, preview entrance and apply feedback are visually disconnected. |
| Review card hover/focus | KEEP CSS | A 2px lift and border/shadow state are adequate. |
| Important Date | KEEP CSS | Small press/color feedback already communicates toggle state. |
| Export progress | KEEP CSS | It already shows month-by-month real PNG progress; no simulated delay or spinner-only presentation. |

## Interaction contracts

1. Entry: back-left, back-right and front calendar proofs enter by GSAP timeline with restrained x/y, rotation, scale and opacity. Sequence lasts about the owner-accepted 1.4s desktop / 1.2s touch experience; it runs once on mount, then stops. Optional fine-pointer hover response stays subtle and is disabled on touch. Page content and buttons never wait.
2. Editor: month navigation and controls update immediately. The currently displayed proof stays fully visible until the target photo is decoded; GSAP then reveals the target proof once over it. The old proof is removed after the reveal. Consecutive switches cancel the preceding reveal and end at the newest month. The title/status, control panel body and crop gesture surface do not animate as a whole.
3. Whole-set color: each genuine analysis result marks its mini item ready. Preview grid enters as a coordinated set as soon as results are available. Applying changes updates project state immediately, then a restrained Jan–Dec wave acknowledges affected Review cards. Restore remains functional. No artificial computation delay.
4. All GSAP instances use `useGSAP` with scoped targets; callbacks created after mount use `contextSafe`. Timeline cleanup covers Strict Mode, route change, repeat actions and dependency changes. Reduced-motion sets final state without positional animation.

## Review gate

Before/after comparison, bundle impact, Chrome/Edge interaction/regression evidence and owner hands-on review are required for this patch. This patch does not advance the Session 08 release gate.

## Month-switch flashing correction — Product Owner feedback, 2026-09-24

The Product Owner reported two rapid flashes when choosing months 1–4 in the first GSAP Editor version. Frame sampling found the outgoing proof opacity fell below 0.5 before the incoming proof rose above 0.2, exposing the workspace; the outgoing `CalendarProof` was also remounted and its image was absent for the first frame. Keep the existing displayed proof mounted and fully opaque until the new photo is decoded, then reveal the new proof over it once. Remove the old proof only after the reveal. Keep latest-month cancellation, immediate navigation/data change, reduced-motion final state and editable crop. Do not animate heading opacity separately. The Product Owner confirmed on 2026-09-24 that the corrected LAN page no longer flashes when switching months 1–4. This confirms the local correction only; review of the full experience patch remains pending.
