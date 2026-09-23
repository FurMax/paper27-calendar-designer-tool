# Calendar Design Studio — Project Working Agreement

## Source of Truth

- This repository is the source of truth. Do not rely on prior chat history as project memory.
- Important product decisions must be written into the relevant files under `product/`.
- When a decision changes, update every affected artifact so the documents remain consistent.

## Delivery Model

- Work spec-first and artifact-first.
- One session addresses one stage.
- Do not enter the next gate automatically; wait for explicit product-owner approval.
- Do not expand scope because a feature seems useful or conventional.
- Mark unresolved decisions as **OPEN QUESTION**. Never silently resolve them.
- Point out conflicts, omissions, and risky assumptions and discuss them with the product owner.

## Current Stage

- **Session 01 — Product Discovery: Approved / Complete**
- Product Discovery Gate: **Passed** with explicit Product Owner approval on 2026-09-14.
- **Session 02 — IA / UX: Approved / Complete**
- IA / UX Gate: **Passed** with explicit Product Owner approval on 2026-09-22.
- **Session 03 — Wireframe: Approved / Complete**
- Wireframe Gate: **Passed** with explicit Product Owner approval on 2026-09-23 after the approved mobile Month Editor navigation simplification.
- **Session 04 — High-Fidelity UI Prototype: Approved / Complete**
- Session 04 began in a new Codex session on 2026-09-23.
- Direction A — Gallery Proofing was explicitly approved by the Product Owner on 2026-09-23 as the V1 visual system. Direction B and Direction C remain comparison/rejected references only and are not product themes.
- The controlled V1 revision covers Simplified Chinese Product UI, English Calendar Proof/output, unified Auto/Custom Calendar Text Color, three curated project-wide Calendar typography systems, and Small/Standard/Large scale presets. Desktop exposes these directly in the right Properties Panel; phone uses a bottom sheet.
- The final Direction A prototype covers S01–S04, T01–T05, required states, responsive layouts, and prototype-level accessibility review. This is not production implementation.
- **UI Freeze / Visual Gate: Passed** with explicit Product Owner approval on **2026-09-23**. The current V1 UI baseline is frozen.
- **Session 05 — Technical Validation: Complete with deferred device validation.** The Product Owner explicitly approved closing Session 05 on 2026-09-23. **Technical Validation Gate: Passed for Technical Design.** Desktop spike evidence and scoped iPhone observations are recorded in `docs/technical-validation.md` and `qa/ios-technical-validation.md`. Deferred device/browser items retain their PASS/FAIL/PARTIAL/NOT TESTED status; gate approval does not turn them into PASS or waive V1 release QA.
- The Product Owner's Session 05 [UI/UX change request](design/ui-ux-change-request-session-05.md) clarifies full-width cover Photo Region, mandatory drag/pinch/zoom, 12 independent monthly PNGs as the output, ZIP as packaging, and mobile delivery as an open technical question. The disposable spike and approved non-production prototype must not be mistaken for Production Architecture.
- This Session 05 closeout does not begin Technical Design, deployment planning, or production code. Session 06 may begin only in a later Codex session with explicit Product Owner direction.
- **Session 06 — Technical Design + Implementation Plan: Approved / Complete. Technical Gate: Passed** by explicit Product Owner decision on 2026-09-23 after two plan corrections. The approved design artifacts are `docs/architecture.md`, `docs/data-model.md`, `docs/export-pipeline.md`, `docs/testing-strategy.md`, and `docs/code-index.md`; `plans/implementation-plan.md` is **Approved for execution**. M3 and M4 require early real iPhone Safari smoke validation of crop/touch and Preview font switching/fallback. M8 is **Mobile Hardening + Deferred Device Validation**; formal Integration, full QA, release acceptance, and production deployment are deferred to Session 08. iPhone multi-file save/share and browser-only versus one-action direct iPhone Photos remain **OPEN QUESTION** items; they do not block starting implementation. No production app was started in Session 06. **Session 07 — Implementation may begin only in a new Codex session with explicit Product Owner direction.**
- **Session 07 — Implementation: M1–M8 complete; Product Owner-approved revisions implemented; implementation review remains open.** The Product Owner explicitly directed Session 07 on 2026-09-23. M3 crop/import and M4 preview font switching had scoped Product Owner-reported real iPhone Safari smoke passes; full device details were not supplied. M5 IndexedDB, M6 individual PNG, M7 ordered twelve-PNG ZIP, and M8 mobile hardening passed bounded checks recorded in qa/session-07-m1.md through qa/session-07-m8.md. The Product Owner later reported the five-step iPhone Safari workflow and iPhone ZIP extraction working; inspection of all twelve PNGs on that phone was not recorded. The Product Owner approved a controlled frozen-UI and product amendment: grouped background palette, exact cropped-photo sampling, 0.80/1/1.20 type scales, and default 100×150 mm trim within a 106×156 mm print PNG with approximately 3 mm bleed and 300 PPI metadata; optional digital 1200×1800 remains. See both Session 07 change requests and qa/session-07-approved-revisions.md. Real iPhone sampler/print checks, trusted-HTTPS multi-file handoff, printer preflight, formal Integration, full browser/device QA, release acceptance, and production deployment remain Session 08 work. Mobile primary delivery and one-action direct iPhone Photos remain OPEN QUESTION; no such decision is inferred from ZIP extraction.

## Product Discovery Gate

The Product Discovery Gate passed after the following became explicit and were reflected in the product artifacts:

- Core user and core task
- Product value and reason to choose it over alternatives
- V1, P1, P2, and non-goals
- Desktop and iOS/Safari core use cases
- Major edge cases
- Acceptance criteria

## Session 02 Approved Artifacts

- `design/information-architecture.md`
- `design/user-flow.md`
- `design/screen-inventory.md`
- `design/interaction-rules.md`

These artifacts are the approved source of truth for V1 navigation and interaction semantics. Any later change to these semantics must be reflected consistently across the affected artifacts and pass the applicable gate.

The Product Owner has approved these Session 02 structural decisions:

- With no saved project, combine first-time entry and photo-selection guidance so the primary action opens the system picker directly; do not require a separate Start step.
- Returning users see Resume Calendar as primary and Start New Calendar as secondary with replacement confirmation.
- Assignment is fully operable by tap/click; drag is not required.
- Assignment actions are context-sensitive; empty months, occupied months, and Unassigned Photos do not expose the full operation vocabulary at once.
- Move targets an empty month, Swap exchanges occupied months, and replacing an occupied month moves its displaced photo item to Unassigned Photos.
- Use in Another Month creates another independently assignable project photo item using the same source photo.
- User-facing month completion uses only Missing Photo and Ready; editing/customization is not a completion tier.
- V1 has four core screens and five transient interaction surfaces. Export progress/result is transient rather than a required standalone screen.

## Session 03 Approved Artifacts

- `design/wireframes.md`
- `design/wireframe-decisions.md`

These artifacts are the approved source of truth for V1 page structure, responsive layout, control placement, information hierarchy, and transient interaction-surface structure. Any later change to these structures must be reflected consistently across the affected artifacts and pass the applicable gate.

The Product Owner has approved these Session 03 structural decisions:

- Assign Photos uses a 4 × 3 desktop grid and a default 2-column phone grid with a one-column accessibility/narrow-width fallback.
- Desktop Month Editor uses a light month navigator plus a dominant preview and narrow control area.
- Phone Month Editor uses a top sticky Current Month + Year direct selector and state/Review context, plus a bottom sticky Previous/Next-only dock; month navigation never uses the crop surface.
- Review & Export uses a 4 × 3 desktop overview and default 2 × 6 phone overview.
- Single-PNG feedback remains lightweight; ZIP progress/result is more prominent, and neither becomes a standalone page.
- Healthy autosave is quiet; save failure persists; a newer-tab conflict blocks stale editing.
- Responsive rearrangement preserves the complete desktop and phone workflows without changing semantics.

## Session 04 Approved Artifacts

- `design/DESIGN.md`
- `design/ui-prototype-review.md`
- `prototype/visual-directions/`

These are the approved V1 UI baseline and **NON-PRODUCTION UI PROTOTYPE** artifacts. Prototype code organization, state, interactions, and data must not be treated as decisions about production architecture.

After UI Freeze, small Simplified Chinese copy refinements, spacing/alignment adjustments, accessibility or contrast fixes, browser-specific layout fixes, and implementation-fidelity corrections remain permitted when they preserve the approved baseline. Any proposed change to Product Scope, IA, User Flow, Screen Structure, Interaction Semantics, Feature Hierarchy, or Visual System must first be recorded as a **UI / UX CHANGE REQUEST**; a later implementation agent must not make such a change silently.

The Session 04 technical handoff was taken into Session 05. The [Technical Validation record](docs/technical-validation.md) now distinguishes scoped spike results from deferred device/browser checks. Final font licensing, WebFont file size and Safari/PNG fidelity, full calendar accuracy, touch crop, Auto/Custom contrast thresholds, safe-area/browser-chrome behavior, large-photo persistence, and PNG/ZIP handoff across the formal support matrix retain their documented open status for Technical Design and later QA.

## Controlled V1 Language and Calendar Type Decision

- Product UI Language is Simplified Chinese throughout website/editor navigation, controls, statuses, helper copy, transient surfaces, errors, and feedback. Calendar Output Language is English: month names and weekday initials remain English, while year/dates remain Arabic numerals. No V1 language switcher.
- Calendar Background remains one arbitrary solid color per month with picker, HEX, RGB, and Quick Colors. Quick Colors are optional shortcuts, not a restriction.
- Calendar Text Color defaults to Auto dark/light contrast. Custom picker/HEX sets one color for the month title, year, weekdays, and dates. A low-contrast Custom choice displays a non-blocking warning.
- One of three curated Calendar typography presets plus a Small/Standard/Large scale preset applies across all 12 English calendar pages and never changes the Simplified Chinese Product UI font. A typography preset may define different role fonts/weights/spacing internally, without exposing per-role editing. Prototype candidates are temporary; final names and Safari output reliability remain open for Technical Design and deferred device QA.
- Workspace Custom Background remains Post-V1 and means the editing workspace, never Calendar Output. Do not introduce advanced typography controls, background images/gradients/textures, or production export in Session 04.

## Platform Constraint

- The product is a responsive browser-based website for both desktop and mobile; neither device class is exclusive.
- V1 must not require a native mobile app.
- At V1 release, formal browser QA covers current stable desktop Chrome and Edge on Windows/macOS, current stable Safari on macOS, current stable Safari on iPhone/iPad, and current stable Chrome on Android.
- Other browsers are best-effort and do not block V1 release.
- A phone user must be able to complete the full core workflow from image selection through 12-month editing and export without a computer.
- A desktop-browser user must also be able to complete the full core workflow.
- Product, UX, UI, architecture, implementation, and QA decisions must preserve this constraint.
