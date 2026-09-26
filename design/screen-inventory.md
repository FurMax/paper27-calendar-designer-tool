# Calendar Design Studio — V1 Screen Inventory

**Stage:** Session 02 — IA / UX  
**Status:** Approved / Complete  
**Gate:** IA / UX Gate passed with Product Owner approval on 2026-09-22  
**Next authorized stage:** Session 03 — Wireframe, in a new Codex session  
**Scope:** V1 only

## 1. Inventory Summary

V1 requires **four core screens** and **five transient interaction surfaces**.

| ID | Screen / surface | Role |
|---|---|---|
| S01 | Project Entry | First-time photo selection, or Resume/Start New when a saved project exists |
| S02 | Assign Photos | Organize selected photos across months and Unassigned Photos |
| S03 | Month Editor | Personalize one month at a time |
| S04 | Review & Export | Inspect the whole set and start export actions |
| T01 | Contextual Photo Actions / Destination Chooser | Expose only assignment actions valid for the selected context |
| T02 | Delete Unassigned Photo Confirmation | Confirm removal from the active project |
| T03 | Start New Project Confirmation | Confirm replacement of the saved project |
| T04 | Save / Conflict Feedback | Explain local save failure or newer-tab conflict |
| T05 | Export Progress / Result Surface | Show preparation, success, failure, and retry without requiring a separate page |

The operating-system photo/file picker is external system UI. The product launches it and handles its outcomes but does not redesign it.

Operation names in this inventory identify semantics, not final button copy or visual form. A wireframe must not expose the full assignment vocabulary at once when only a subset applies.

## 2. S01 — Project Entry

### Purpose

Minimize first-use friction while safely handling the one saved local project. With no saved project, this screen includes photo-selection guidance and opens the picker directly. With a saved project, it prioritizes Resume versus Start New.

### User enters from

- Opening the website.
- Returning from an abandoned Start New confirmation.
- Returning to the project entry point from project-level navigation.

### Main information

**No saved project:**

- One-sentence Calendar Design Studio explanation.
- Fixed 2027 Standard Photo Calendar context.
- Concise note that work is stored only in this browser on this device.
- Select up to 12 photos; fewer than 12 is allowed.
- Picker-returned order creates the initial Jan–Dec order, which can be corrected next.

**Saved project found:**

- 2027 Calendar.
- Ready-month count and last-saved information when available.
- Resume and Start New decision.
- Local-only storage note.

### Primary action

- No saved project: open the system picker to choose up to 12 photos.
- Saved project: resume the existing calendar.

### Secondary actions

- No saved project: continue to an empty Assign Photos state when individual month selection is required as a fallback.
- Saved project: start a new calendar through T03.
- Access concise information about local-only storage limitations.

### Exit paths

- Successful first-time selection → S02 Assign Photos with initial Jan–Dec mapping.
- Picker cancellation → remain on unchanged S01 first-time state.
- Individual-selection fallback → S02 with 12 empty month slots.
- Resume → last valid saved S02, S03, or S04 context.
- Start New while a project exists → T03.

### Empty state

No saved project is a normal first-time state, not an empty dashboard. It contains the product context, selection guidance, and direct photo-selection action; it does not require a separate Start confirmation.

### Relevant errors

- More than 12 selected: prevent or reject clearly; never silently trim.
- Unreadable items: identify them and allow proceeding with readable items or retrying.
- Low-resolution items: warn without blocking use.
- Picker unavailable/interrupted: offer individual month selection as the complete fallback.
- Saved project cannot be restored: explain the problem and offer a safe retry before replacement.
- Browser storage unavailable: explain that progress may not persist; do not imply cloud saving.

### Desktop notes

Use local-file-selection language. Keep first use focused on the direct selection action; do not add a project dashboard, template gallery, or separate Prepare Photos screen.

### Mobile notes

Use system photo-library language. Explain the 12-photo limit before opening the picker. The first-time primary action must be immediately reachable in phone portrait without hover or tiny text.

## 3. S02 — Assign Photos

### Purpose

Let the user understand and control which photo belongs to each month before or after month editing.

### User enters from

- S01 after bulk selection or individual fallback.
- S03 through project navigation.
- S04 through project navigation.
- Resume when this was the last saved area.

### Main information

- Twelve month slots in January–December order.
- Each slot’s photo or Missing Photo state.
- Project readiness count, such as “8 of 12 months ready.”
- Unassigned Photos when non-empty.
- Short persistent rule: changing a month photo resets crop to centered fill; the month background color stays.
- Low-resolution warning attached to affected photos when relevant.

### Primary action

- Initial use: continue to month editing.
- Reopened use: finish assignment changes and return to the originating screen.

### Secondary actions

Actions are context-sensitive rather than one permanent command set:

- Empty month: add/select a photo or choose an eligible project photo.
- Occupied month: edit that month or open only applicable reassignment/removal/reuse actions.
- Unassigned Photo: assign it, choose a destination, or explicitly delete it from the project.
- Add more photos when fewer than 12 were selected.
- Open Review & Export after project creation.

Move, Swap, Replace, Remove, Delete, and same-photo reuse remain the underlying operations, but exact UI labels and presentation are deferred to wireframes.

### Exit paths

- Initial Continue → S03 at the first Ready month; if none are Ready, January’s empty state.
- Reopened Done → originating S03 month or S04.
- Select a month for editing → S03.
- Review → S04.
- Start New → T03.

### Empty state

- All month slots show Missing Photo.
- Unassigned Photos is hidden when empty rather than presenting an empty media shelf.
- Add Photos is the primary recovery action.
- Continuing to the editor remains possible for the individual-picker fallback.

### Relevant errors

- Unreadable replacement leaves the existing month unchanged.
- Assignment target becomes unavailable due to a conflicting action: refresh destination choices and let the user choose again.
- Local save failure uses T04 and does not falsely mark the state saved.
- Newer-tab conflict blocks further writes until refresh.

### Desktop notes

- Show month slots in a multi-column grid while preserving calendar order.
- Unassigned Photos follows the 12 slots as a distinct temporary section.
- Click/action-menu interactions are complete without drag. Drag may only be a redundant enhancement considered later.

### Mobile notes

- Use a readable list or compact grid with persistent month labels and contextual action triggers.
- Tapping an empty month, occupied month, or Unassigned Photo opens only relevant T01 actions.
- Destination selection uses a touch-friendly named list rather than precision drop targets.
- Keep Continue/Done reachable while respecting safe areas.

## 4. S03 — Month Editor

### Purpose

Let the user personalize one month’s photo, background, and unified Calendar text color, plus select project-wide curated Calendar typography and size presets, while preserving the fixed calendar layout.

### User enters from

- S02 Continue or select-month action.
- S04 selecting a month.
- Month navigation within S03.
- Resume when this was the last saved area.

### Main information

- Current month and 2027 context.
- User-facing month status: Missing Photo or Ready.
- Full monthly calendar preview.
- Assigned photo and crop surface when present.
- Zoom control and crop reset.
- Solid background-color control.
- Calendar text-color mode: Auto by default or one Custom color for month title, year, weekdays, and dates, with a non-blocking low-contrast warning.
- Three curated Calendar typography presets and Small/Standard/Large scale presets shared across all 12 months; Product UI typography stays independent.
- Previous/Next and January–December navigation.
- Local save status when relevant.

Whether the month has been edited may remain internal metadata. A later wireframe may surface a lightweight Edited hint, but it is not a completion state.

### Primary action

- Ready month: interact with the preview to crop/reposition and use visible controls to personalize.
- Missing month: add a photo.

### Secondary actions

- Replace the photo.
- Reset crop to centered fill.
- Change background color.
- Change the unified Calendar text color mode/value or project-wide typography/scale presets.
- Previous Month / Next Month / select a month.
- Download this month’s PNG when Ready.
- Open Assign Photos.
- Open Review & Export.
- Start New Calendar through project-level navigation.

### Exit paths

- Month navigation → another S03 month state.
- Assign Photos → S02 with this month recorded as origin.
- Review & Export → S04.
- Download PNG → T05 export surface.
- Start New → T03.

### Empty state

For a Missing Photo month, preserve the calendar preview and month identity while replacing the photo surface with an Add Photo prompt. Background and Calendar text colors remain visible and editable because they belong to the month. The font preset remains reachable. Download PNG is unavailable.

### Relevant errors

- Picker cancel: return unchanged with optional informational feedback.
- Unreadable replacement: retain the current photo, crop, and color.
- Low-resolution photo: non-blocking warning with replacement path.
- Save failure: persistent T04 feedback; continue displaying current in-memory work without claiming it is saved.
- Export failure: handled in T05; return here intact.

### Desktop notes

- Preview and controls may sit side by side.
- A visible month navigator may remain alongside the preview.
- Photo repositioning works with pointer input; zoom always has an explicit control.

### Mobile notes

- Preview and controls stack vertically or use a compact control surface.
- Drag on the crop surface repositions; pinch zooms.
- Month switching uses explicit controls outside the crop surface; no swipe-to-change-month gesture.
- Sticky controls respect iPhone safe areas and changing Safari browser chrome.
- The entire workflow remains possible in portrait without hover.

## 5. S04 — Review & Export

### Purpose

Show the complete January–December set, reveal missing work, and provide single-month and full-set export entry points.

### User enters from

- S03 Review & Export.
- S02 Review.
- Resume when this was the last saved area or when the previous transient context cannot be restored.
- T05 after export completion or cancellation.

### Main information

- Twelve months in calendar order.
- Thumbnail for each Ready month.
- Missing Photo or Ready state for each month.
- Ready count and missing-month names.
- Full-set availability and reason when unavailable.
- Product output is twelve separate monthly PNG files. Full-set generation prepares those files; one ZIP packages them for download on desktop and mobile. The user opens/extracts it in Files/Downloads on phone. Multi-file Share and one-action direct Photos are outside V1 by the Session 08 Product Owner decision.

Edited metadata is not a completion tier. If a later wireframe surfaces it lightly, Ready remains the only completed user-facing state.

### Primary action

- All 12 Ready: start full-set generation of 12 monthly PNGs, followed by the validated platform handoff.
- Incomplete: add or open a Missing Photo month.

### Secondary actions

- Open any month in S03.
- Start a Ready month’s PNG export.
- Open Assign Photos.
- Start New Calendar through project-level navigation.

### Exit paths

- Select month → S03.
- Assign Photos → S02 with Review as origin.
- Single PNG or ZIP → T05.
- Start New → T03.

### Empty state

If all 12 months are Missing Photo, show the 12 named placeholders, explain that photos are required for export, and route to Add Photos/Assign Photos. Do not show an empty generic gallery.

### Relevant errors

- Full set unavailable because of Missing Photo months: informational locked state, not a system error.
- Missing/unreadable thumbnail: preserve the month state and offer recovery through the editor.
- Export failures are handled in T05.
- Save/conflict issues use T04.

### Desktop notes

Display an overview grid large enough to compare all months. Keep month order and status labels unambiguous.

### Mobile notes

Use one or two columns according to width; preserve month labels and tap targets. Avoid a 12-item horizontal carousel that hides missing months. Batch export status and missing-month recovery remain obvious without desktop hover.

## 6. T01 — Contextual Photo Actions / Destination Chooser

### Purpose

Provide a touch-safe interaction model while exposing only actions relevant to the selected object and destination.

### User enters from

- Selecting an empty month, occupied month, or Unassigned Photo in S02.
- Starting photo replacement from S03.

### Main information

- Current context: empty month, occupied month, or Unassigned Photo.
- Only the operations valid for that context.
- When destination selection is needed: month name plus Empty or Occupied status.
- Crop-reset/background-preservation consequence when an assignment will change.

Internal terms such as source photo, project photo item, and month-photo pairing do not need to appear in the UI.

### Primary action

Perform the contextually selected assignment operation. Exact labels and visual form are deferred to wireframes.

### Secondary actions

- Same-photo reuse may appear as a secondary action for an occupied month.
- Cancel or return without committing.

### Exit paths

- Commit → originating S02 or S03 with updated state.
- Explicit deletion of an Unassigned Photo → T02.
- New/replacement photo selection → system picker, then return to origin.
- Cancel → unchanged origin.

### Empty state

If the selected operation has no valid destination, explain why and present only valid alternatives. For example, with no empty month, a move destination is not offered; an occupied target introduces the relevant Swap/Replace distinction.

### Relevant errors

- Destination state changed: refresh choices and ask the user to select again.
- Picker cancel or unreadable selection: leave the current assignment unchanged.

### Desktop notes

May be a contextual menu followed by a focused destination surface. It remains fully operable by click and keyboard without drag.

### Mobile notes

May use a bottom sheet or compact full-height sheet with large targets. Do not depend on long-press, hover, or drag, and do not show irrelevant operations.

## 7. T02 — Delete Unassigned Photo Confirmation

### Purpose

Prevent accidental removal of an Unassigned Photo from the active project and distinguish project removal from device deletion.

### User enters from

- The explicit delete operation for an Unassigned Photo in T01.

### Main information

- The photo will be removed from this calendar project.
- The original photo on the user’s device is not deleted.

### Primary action

Confirm removal from the project.

### Secondary actions

Cancel.

### Exit paths

- Confirm → S02 with the photo removed.
- Cancel → S02 unchanged.

### Empty state

Not applicable.

### Relevant errors

If local saving fails after deletion, T04 states that the deletion may not persist; it does not claim completion as saved.

### Desktop notes

Use a focused destructive confirmation with explicit meaning.

### Mobile notes

The confirmation surface respects safe areas and keeps the safe action easy to reach.

## 8. T03 — Start New Project Confirmation

### Purpose

Protect the one existing local project from accidental replacement.

### User enters from

- Starting a new calendar from S01, S02, S03, or S04 while a project exists.

### Main information

- V1 stores one active project.
- Starting new removes the current calendar from this browser.
- There is no cloud backup or project history.

### Primary action

Explicitly replace the project and start new.

### Secondary actions

Keep the current calendar.

### Exit paths

- Confirm → fresh S01 first-time entry state with direct photo-selection action.
- Keep/Cancel → originating screen unchanged.

### Empty state

Not applicable when no project exists; the confirmation is not shown in that case.

### Relevant errors

If replacement cannot be saved safely, preserve the current project and report the failure rather than leaving an ambiguous partial project.

### Desktop notes

Use a focused destructive confirmation, not a multi-step wizard.

### Mobile notes

Use explicit meaning instead of generic Yes/No. Do not make the destructive action the easiest accidental tap.

## 9. T04 — Save / Conflict Feedback

### Purpose

Communicate when local persistence is unsafe without blocking access to the visible project unnecessarily.

### User enters from

- Any project screen after a save failure.
- Any project screen when another tab has a newer state.

### Main information

- Save failure: recent changes may not be saved; the last valid saved project has not been silently deleted.
- Conflict: another tab has newer project data; this tab will not overwrite it.

### Primary action

- Save failure: retry when available.
- Conflict: refresh to load the newer version.

### Secondary actions

- Dismiss only informational detail while retaining a visible unsaved/conflict indicator.
- Continue viewing/exporting the in-memory project when safe and accurately described.

### Exit paths

- Successful retry → originating screen with Saved on this device state.
- Refresh → load the newer saved project context.
- Leave site → browser-supported unsaved-work warning when applicable.

### Empty state

No surface is shown when saves are healthy and no conflict exists.

### Relevant errors

- Repeated save failure remains visible.
- Refresh failure returns to a recoverable error and never authorizes stale overwrites.

### Desktop notes

A persistent banner/status is preferable to repeated modals. The newer-tab conflict may use a focused blocking state because editing must stop.

### Mobile notes

Messages must not be hidden under browser chrome or safe areas. Persistent status must not consume so much space that the editor becomes unusable.

## 10. T05 — Export Progress / Result Surface

### Purpose

Give clear feedback while preparing a single PNG or all 12 independent monthly PNGs, then provide success or recovery actions for the actual delivery package without requiring navigation to a dedicated page.

### User enters from

- S03 single-month PNG export.
- S04 single-month PNG export.
- S04 full-set generation of 12 monthly PNGs and its platform delivery.
- Retry after a previous export failure.

### Main information

- Export type: named month PNG or 12-month full set; distinguish PNG generation from any ZIP/Share delivery step.
- Preparing/progress state.
- For full-set generation, progress expressed in months prepared where available; packaging/handoff is a separate status when relevant.
- Success, interruption, or failure result.
- Confirmation that the project remains saved and editable.

### Primary action

- Preparing: prevent duplicate starts and show progress.
- Success: return to the originating project context.
- Failure: retry.

### Secondary actions

- Cancel/return when cancellation is safe.
- On full-set generation or delivery failure, return to Review and keep individual PNG downloads available.

### Exit paths

- Return to originating S03 or S04.
- Successful browser handoff may leave the product visible in the same project context.
- Retry remains in the transient export state until success, cancellation, or return.

### Empty state

Not applicable. T05 exists only for a valid export request.

### Relevant errors

- Export preparation fails: explain failure and offer retry.
- Browser file handoff is interrupted or blocked: explain that export did not complete and offer retry.
- ZIP failure never removes or modifies the project.

### Desktop notes

Session 03 may represent this as inline progress, a dialog, temporary overlay, or focused state. Single PNG export must not be forced into a full new page.

### Mobile notes

Session 03 may use an inline state, dialog, bottom sheet, overlay, or focused state appropriate to task duration. ZIP progress must remain clear during longer work and respect Safari/Chrome browser chrome and safe areas.

## 11. Screen-State Coverage Check

| Required state | Covered in |
|---|---|
| First-time entry and direct bulk selection | S01 |
| Returning resume | S01 |
| Picker cancellation and selection errors | S01 |
| Fewer than 12 photos | S02, S04 |
| Month Assignment and Unassigned Photos | S02, T01, T02 |
| Empty month and individual add | S02, S03 |
| Crop, position, zoom, background | S03 |
| Month navigation and completion | S03 |
| Reopen assignment | S02, S03, S04 |
| Review | S04 |
| Single PNG and ZIP | S03, S04, T05 |
| iPhone full workflow | Mobile notes across S01–S04 and T01–T05 |
| Save failure and tab conflict | T04 |
| New project replacement | T03 |

## Session 07 approved control amendment

S03 Background contains the existing system picker, named Quick Colors, HEX/RGB and an explicit **从照片取色** action. This action opens a nested photo sampling sheet/dialog with a touch target, live HEX/swatch, Cancel and **使用此颜色**; it does not change crop gestures. It remains part of the S03 editing controls, so the four-screen / five-numbered-transient IA count remains intact.

S03 typography displays 80% / 100% / 120% scale cards. S03 single export and S04 full-set export display default print and optional digital variant choices. Print copy names the 100 × 150 mm trim, approximately 3 mm bleed per edge, 106 × 156 mm file, 1252 × 1843 px and 300 PPI. T05 remains transient.

## Session 08 controlled export-surface amendment

S03 and S04 each expose a PNG (default) / JPG export-format selector beside print/digital size. S03 shows a non-blocking visible-photo-edge warning near crop controls. T05 checks all twelve crops before rendering and, if a broad pale edge is found, names the months and edges with Edit Month and Continue actions. Existing S01–S04/T01–T05 structure is unchanged. Earlier PNG-only mock copy is historical.

**Session 08 print-bleed correction:** S03 proof and S04 thumbnails render the selected print/digital photo crop. Print can show a slightly tighter crop to cover output bleed with genuine photo pixels. No new screen is added.


## V1 Enhancement inventory addendum

S03 Month Editor: quiet desk background around proof, three-color recommendations in T photo-sampling sheet, and a minimal Important Date group (phone sheet). S04 Review: completed-set summary, coordinated color preview/confirmation sheet and Restore Previous Colors action. Global shell: typographic wordmark slot, minimal `27` favicon, Baby Blue action/selection states with Milk Mint recommendation states. No new core screen.

2026-09-24 per-month recommendation correction: S03 Background Color now shows three photo-derived swatches inline for the currently visible photo crop on desktop and in the phone sheet. Fixed Common Colors are labeled separately. The exact pixel picker remains a nested S03 dialog. A change of photo, month, crop, or print/digital preview recomputes the swatches; selecting a swatch changes only that month.

2026-09-24 experience polish: S01 Entry retains its actions and gains a decorative three-page calendar stack. S03 Month Editor retains its structure with a quieter desk and clearer Background Color recommendation cards. S04 Review retains its twelve-card gallery and export actions; the existing color-confirmation dialog gains a twelve-color overview and one selected-month proof. The existing export dialog gains visible 1–12 completion markers. No core screen or numbered transient surface is added.


## V1.1 Part 1 S03 inventory amendment

Desktop S03 Properties presents Background (ten fixed Common Colors, three current-crop photo suggestions, arbitrary color inputs), then Texture (none, fine horizontal lines, light grid, wave grid, fine dots, paper grain), then existing Calendar Text, Important Date and Export. The phone's existing Background sheet includes the texture choices after the color inputs. The texture selection is per-month and immediately visible in the proof; it never overlays the photo. The four-screen / five-transient-surface count is unchanged.
## V1.1 Editor hierarchy follow-up (2026-09-25)

S03 Month Editor remains the same screen. Its first level is proof + lightweight quick rail; its lower level is three named workbench sections: Style, Dates, Export. The quick rail contains month status, photo actions, current color, photo-derived suggestions, and ten compact fixed swatches. Exact color, texture, calendar text, important dates, and single-month export move below. The lower Export section routes to the existing whole-set palette in S04 Review. Mobile stacks the lower sections and retains the quick background sheet. No new screen or transient surface is added.
## S03 current placement refinement (2026-09-25)

Precise current-month background color returns to the desktop quick rail and the phone background sheet. The ten common swatches and three photo-recommendation samples are circular. Below the proof, Style now contains texture/calendar text, Dates contains important marks, and a separate full-width Export section is last. The existing S04 Review whole-set palette remains linked from Export. This supersedes the exact-color-in-Style placement in the V1.1 hierarchy note above.
## S03 compact controls, 2026-09-25

The Background section in the S03 quick rail is now a single approximately 141 px collapsed card with Recommendation, Common and Custom rows. Three recommendation circles, ten horizontally scrolling fixed circles, and an expandable precise-color form retain the existing current-month actions. The separate current-color card is removed. The Style texture block is one row: Clear plus five square previews. This supersedes the earlier 2 × 5 common swatch and six-card texture presentation; no new screen or sheet is added.

## V1.1 Month Editor placement amendment — 2026-09-25

The Month Editor retains the same controls and states. Its desktop control placement is now Photo → Background → Text Color → Style → Date in one right rail beside a sticky proof; Export is a separate final section. At widths below 1024px the rail follows the proof. This supersedes descriptions that place Style, Date or Text Color in lower cards.

## V1.1 desktop Editor visual refinement — 2026-09-25

The Month Editor's control set and transient surfaces are unchanged. Desktop presentation now uses segmented font/size choices, wrapped quick colors, five texture tiles with Clear in the field header, compact export radio rows, neutral Ready status, and a white focus canvas with its bleed note below. These are visual/control-layout changes only; mobile remains as before.
