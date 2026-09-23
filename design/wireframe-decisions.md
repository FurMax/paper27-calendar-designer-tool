# Calendar Design Studio — Wireframe Decisions

**Stage:** Session 03 — Wireframe  
**Status:** Approved / Complete  
**Wireframe Gate:** Passed with Product Owner approval on 2026-09-23  
**Scope:** V1 spatial structure and responsive behavior only  
**Companion artifact:** `design/wireframes.md`

## 1. Purpose

This document records the high-impact layout choices behind the low-fidelity wireframes. It does not change the approved product scope or IA/UX semantics. All recommendations remain black-and-white structural decisions; final typography, color, decoration, spacing values, breakpoints, and motion belong to later stages.

No conflict was found that requires reopening the approved IA/UX gate.

## 2. Decision Summary

| ID | Area | Decision |
|---|---|---|
| WD-01 | Product shell | Use a light project shell, not a dashboard: desktop shows the three project destinations; phone names the current destination and exposes the others through a compact menu. |
| WD-02 | S01 first-time | Put the explanation, constraints, and **Choose Photos** in one focused panel; the primary action is visible in the first phone viewport. |
| WD-03 | S02 desktop | Use a 4-column × 3-row month grid in January–December row-major order. |
| WD-04 | S02 phone | Use a 2-column compact month grid by default; fall back to one column only when available width or enlarged text makes two columns unreadable. |
| WD-05 | S02 card actions | Make the entire month card a clear tap/click target that opens context-sensitive actions. Do not place the full operation set on every card. |
| WD-06 | Unassigned Photos | Place it after the twelve month slots, only when non-empty, with a visible section heading and count. |
| WD-07 | T01 desktop | Use a small anchored action surface followed by a focused destination dialog/panel when a month must be chosen. |
| WD-08 | T01 mobile | Use a bottom sheet for contextual actions and a near-full-height sheet for the named destination list. |
| WD-09 | S03 desktop | Use a light top month navigator over a two-column main area: large preview plus narrow controls. Do not use a permanent three-column dashboard. |
| WD-10 | S03 phone | Use a top sticky Current Month + Year control as the only direct selector, a large scrollable preview area, visible high-level edit actions, bottom sheets for detailed controls, and a bottom sticky Previous/Next dock for sequential navigation. |
| WD-11 | Mobile crop gestures | Reserve drag and pinch inside the photo region for the photo. Top direct month selection and bottom Previous/Next remain outside the preview and do not duplicate each other. |
| WD-12 | S04 desktop | Use a 4-column × 3-row overview to compare all twelve portrait cards with minimal scrolling. |
| WD-13 | S04 phone | Use a 2-column × 6-row overview by default, with explicit labels and states; use one column only as an accessibility/narrow-width fallback. |
| WD-14 | Export feedback | Keep single-PNG feedback lightweight and local to its origin; use a more prominent dialog/sheet for the longer ZIP operation. Neither becomes a page. |
| WD-15 | Save feedback | Healthy autosave is quiet. Save failure is a persistent banner; a newer-tab conflict is blocking because stale writes must stop. |
| WD-16 | Edited metadata | Do not show an Edited badge in the recommended V1 wireframe. Only **Missing Photo** and **Ready** are user-facing month states. |

**Session 05 Product Owner clarification (supersedes the export wording of WD-14, without changing T05's transient surface):** the full-set Primary means generating 12 independent monthly PNGs. Desktop ZIP packages those files; the phone handoff remains open until trusted-HTTPS device validation. The upper Photo Region covers the whole proof width without gutters. See [UI / UX change request](ui-ux-change-request-session-05.md). Existing Session 03 mock/prototype ZIP copy is historical, not the final output definition.

## 3. Assign Photos — Mobile Alternatives

### Option A — Single-column month list

```text
┌──────────────────────────┐
│ JAN  [thumbnail]  Ready >│
├──────────────────────────┤
│ FEB  [thumbnail]  Ready >│
├──────────────────────────┤
│ MAR  [ Add Photo ] Missing│
├──────────────────────────┤
│ ...                      │
└──────────────────────────┘
```

Strengths:

- Largest thumbnail and clearest label/status combination.
- Generous touch target and room for warning text.
- Works well with enlarged text.

Weaknesses:

- Twelve rows create a long page.
- The user sees only a few months at once, making order checking and swaps harder to reason about.
- Unassigned Photos can be pushed far below the fold and become difficult to discover.
- A sticky Continue/Done action covers proportionally more of the list while scrolling.

### Option B — Two-column compact grid

```text
┌────────────┐ ┌────────────┐
│ JAN  Ready │ │ FEB  Ready │
│ [  photo ] │ │ [  photo ] │
└────────────┘ └────────────┘
┌────────────┐ ┌────────────┐
│ MAR Missing│ │ APR  Ready │
│ [  + Add ] │ │ [  photo ] │
└────────────┘ └────────────┘
```

Strengths:

- Six rows keep the year and Unassigned Photos much closer together.
- January–December order is easy to scan in row-major pairs.
- Missing slots form a visible pattern rather than disappearing inside a long list.
- The card itself can remain a large tap target because actions open in T01.

Weaknesses:

- Thumbnails are smaller.
- Inline action buttons would be cramped, so the design must not place operation buttons inside every card.
- Very narrow widths or large text may require one column.

### Recommendation

Use **Option B, the two-column compact grid**, as the primary phone portrait structure. Photo recognition remains adequate for assignment, while the shorter year overview materially improves order checking, missing-state scanning, and discovery of Unassigned Photos. The whole card opens T01; only the month, state, thumbnail/placeholder, and a clear action affordance appear on the card.

## 4. Month Editor — Desktop Alternatives

### Option A — Three permanent columns

```text
┌──────────┬──────────────────────┬──────────────┐
│ Months   │ Preview              │ Controls     │
│ JAN–DEC  │                      │ Photo        │
│          │                      │ Background   │
└──────────┴──────────────────────┴──────────────┘
```

Strengths:

- All navigation and editing controls remain visible.
- Direct month switching is fast.

Weaknesses:

- The preview loses width to two persistent side panels.
- It resembles a generic SaaS/design-tool dashboard despite the deliberately small V1 toolset.
- At medium desktop widths, either the month rail or controls become cramped.

### Option B — Light month strip plus preview/controls

```text
┌────────────────────────────────────────────────┐
│ Prev  JAN FEB MAR ... DEC  Next                │
├────────────────────────────────┬───────────────┤
│                                │ Photo         │
│        LARGE PREVIEW           │ Zoom / Reset  │
│                                │ Background    │
│                                │ Replace / PNG │
└────────────────────────────────┴───────────────┘
```

Strengths:

- The preview remains the visual hero.
- The month strip preserves direct access to all months without a heavy navigation column.
- The control area matches the actual V1 complexity.
- It adapts more cleanly to iPad landscape and narrower desktop windows.

Weaknesses:

- The month strip must communicate month status compactly.
- Very narrow intermediate widths may require the strip to become a month selector.

### Recommendation

Use **Option B**. The preview receives the dominant area, the controls stay in one narrow column, and the month navigation reads as calendar context rather than application chrome.

## 5. Month Editor — Phone Alternatives

### Option A — Preview with a large fixed bottom control dock

```text
┌──────────────────────────┐
│ JAN 2027 / Ready         │
│                          │
│      PREVIEW             │
│                          │
├──────────────────────────┤
│ Zoom | Color | Photo |…  │ fixed
│ Prev | Month | Next      │ fixed + safe area
└──────────────────────────┘
```

Strengths:

- Editing commands are always reachable.
- Very little page scrolling is needed.

Weaknesses:

- Two rows of fixed controls compete with Safari browser chrome and the safe area.
- The dock reduces the visible preview, especially on shorter phones and landscape.
- Too many equal-weight controls increase cognitive load.

### Option B — Visible essentials plus task-specific sheets

```text
┌──────────────────────────┐
│ JANUARY 2027 ▾     Review│ sticky direct selector
│ Ready                    │
├──────────────────────────┤
│                          │
│      LARGE PREVIEW       │ scroll area
│                          │
│ [Photo & Crop] [Color]   │ visible actions
│ [Replace]      [PNG]     │
├──────────────────────────┤
│ ‹ Previous        Next › │ sticky sequential nav
└──────────────────────────┘
```

Selecting Photo & Crop, Background, or the compact Calendar Text control opens a bottom sheet with the detailed control. The preview remains visible above the sheet when space permits.

Strengths:

- The preview stays large and the default state stays simple.
- Detailed controls appear only when needed.
- Random month access and sequential month navigation each have one explicit location, both separate from crop gestures.
- The structure tolerates different mobile viewport heights better.

Weaknesses:

- Zoom and background changes each require opening a sheet.
- Two sticky regions consume some vertical space, so each must remain compact and carry a distinct navigation job.

### Recommendation

Use **Option B**, refined so the top sticky row carries Current Month + Year, the only direct selector, month state, and Review entry. It contains no Previous/Next arrows. The bottom sticky row carries only Previous/Next for sequential work and does not repeat the direct selector. High-level edit actions sit immediately below the preview in the scroll area. Detailed Photo & Crop, Background, and controlled-change Calendar Text settings use compact bottom sheets. This produces one clear mental model: top for random access and context, bottom for sequential movement.

## 6. Review — Mobile Alternatives

### Option A — Single-column cards

Strengths:

- Largest previews and generous labels/actions.
- Strong accessibility fallback for narrow screens and enlarged text.

Weaknesses:

- Requires substantial scrolling to assess the whole year.
- Missing months are less visible as a set.
- Overall visual consistency is harder to compare.

### Option B — Two-column × six-row overview

Strengths:

- Shows more of the year and makes missing months obvious.
- Better supports visual comparison without using a hidden carousel.
- Keeps the ZIP summary and missing recovery closer to the overview.

Weaknesses:

- Preview details and inline actions are smaller.
- Cards need a disciplined content limit: month, state, preview, Edit/Add, and PNG only.

### Recommendation

Use **Option B** for ordinary phone portrait widths. Each Ready card provides an explicit Edit target and a compact, clearly named PNG action; a Missing card replaces those with Add Photo. Use a one-column fallback when text or width cannot preserve readable labels and touch targets.

## 7. Destination-Chooser Decision

The chooser does not expose Swap and Replace as universal alternatives after every destination tap. The operation path determines the valid meaning:

- **Move** lists empty months only.
- **Swap** lists occupied months only.
- Assigning an **Unassigned Photo** to an occupied month enters Replace confirmation.
- **Use in Another Month** keeps the source month unchanged; an empty target assigns the copy, while an occupied target enters Replace confirmation.

This preserves the approved semantics and avoids asking ordinary users to reason about internal photo-item concepts. Empty/Occupied labels remain visible in destination lists so the consequence is predictable before selection.

## 8. Rejected Alternatives

### Drag-first assignment board

Rejected because precision drop, hover affordances, and drag-only rearrangement would fail the approved phone workflow. Drag may be considered later only as a redundant desktop enhancement, not as a V1 wireframe requirement.

### Twelve-card horizontal carousel

Rejected for both Assign Photos and Review because it hides month order, missing states, and visual inconsistency outside the viewport.

### Permanent left month rail on desktop editor

Rejected as the recommended default because it competes with the preview for width and adds dashboard weight to a small toolset.

### Full-screen page for export

Rejected because the approved IA defines export progress/result as transient and requires the project to remain editable. Single PNG feedback is especially too small a task for a page transition.

### Always-visible action vocabulary on assignment cards

Rejected because Move, Swap, Replace, Remove, Reuse, Assign, and Delete are not simultaneously valid. Showing them together would increase cognitive load and blur destructive distinctions.

### Edited as a third completion state

Rejected because centered fill and white background are valid completion values. The recommended wireframe uses only Missing Photo and Ready.

### Persistent success toasts for autosave

Rejected because routine saving should be quiet. A small Saved on this device status is sufficient; only save failure persists prominently.

## 9. Non-Decisions Reserved for Later Stages

This session intentionally does not decide:

- Final colors, typography, iconography, shadows, illustration, or brand treatment.
- Exact pixel dimensions, breakpoint values, spacing scale, or animation.
- Component library, state management, crop library, persistence mechanism, export implementation, API, or backend.
- Final calendar-template typography and font licensing evidence.
- Whether optional drag-and-drop is added as a redundant desktop enhancement.

## 10. Controlled V1 Change During Session 04

Product UI copy is Simplified Chinese; the Calendar Proof and exported pages remain English. The approved S03 month navigation and screen geometry stay intact. A compact Calendar Text section is directly visible in the desktop right properties panel; phone uses its bottom sheet. Both Ready and Missing Photo expose Auto/Custom unified text color, a non-blocking contrast warning, three curated English-output typography presets with live `January` samples, and project-wide Small/Standard/Large scale presets. Background remains an arbitrary solid color with the existing system picker, HEX, RGB, named Quick Colors, and a separate explicit photo-pixel sampler. The three size cards display 80% / 100% / 120%. These settings do not add an open-ended style panel or change crop gestures. Final font names and output rendering are Technical Validation handoffs.

## 11. Wireframe Gate Status

The recommended structures are documented in `design/wireframes.md`. After the approved minor revision removing duplicate mobile month-navigation controls, Session 03 is **Approved / Complete** and the Wireframe Gate **Passed** with Product Owner approval on 2026-09-23.

No Wireframe **OPEN QUESTION** blocks Session 04. Session 04 is authorized as the next stage but must begin in a new Codex session; this closeout does not begin it.
