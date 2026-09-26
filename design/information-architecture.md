# Calendar Design Studio — Information Architecture

**Stage:** Session 02 — IA / UX  
**Status:** Approved / Complete  
**Gate:** IA / UX Gate passed with Product Owner approval on 2026-09-22  
**Next authorized stage:** Session 03 — Wireframe, in a new Codex session  
**Scope:** V1 only

## 1. Purpose

This document defines how the V1 experience is organized so a user can prepare photos once, assign them to months, personalize each month, and export a coherent 2027 calendar. It defines product areas and navigation relationships, not visual styling, wireframes, or technical architecture.

The information architecture assumes one active, local-only project and one fixed Standard Photo Calendar. It does not include a template catalog, year selection, accounts, cloud storage, or project management.

## 2. V1 User Task

The user completes one continuous project:

1. Start or resume a 2027 calendar.
2. Select up to 12 photos in a system picker.
3. Review and correct the initial January–December assignment.
4. Personalize one month at a time using crop, position, zoom, a solid background color, and unified Calendar text color; choose one small Calendar Font preset for the set.
5. Review all 12 months.
6. Download any ready month as a PNG or, once all months have photos, generate the 12 independent monthly PNGs as a full set. ZIP is one delivery package; the phone handoff remains under technical validation.

The system owns correct 2027 dates, the Sunday-first calendar, fixed layout, and January–December organization. The user owns photo choice, assignment, crop, position, zoom, monthly background and unified Calendar text color, and one Calendar Font preset shared across the set.

## 3. Structural Principles

### 3.1 One project, not a project dashboard

V1 stores one active project. The product therefore has a Project Entry screen, not a project list, folders, naming system, or workspace switcher.

### 3.2 A short first-use path

There is no separate marketing landing page or Prepare Photos screen inside the first-use creation flow. When no saved project exists, the first entry state contains the short product explanation, fixed 2027 context, local-only note, photo-selection guidance, and a primary action that opens the system picker directly. A first-time user moves through:

`First-time Entry / Photo Selection → Month Assignment → Month Editor → Review & Export`

There is no template-selection or year-selection step.

### 3.3 Assignment and editing remain revisitable

The main project is not a locked wizard. Once a project exists, the user can move among three persistent work areas:

- **Assign Photos** — organize photos across January–December and Unassigned Photos.
- **Edit Months** — personalize one selected month at a time.
- **Review & Export** — inspect the set, return to a month, and export.

Photo-selection guidance belongs to the first-time entry state and is not a permanent media-management area.

### 3.4 Mobile is a first-class structure

Desktop and mobile expose the same capabilities but do not require the same layout. Mobile navigation uses explicit taps and compact sheets; no core action depends on drag, hover, right-click, or desktop precision.

### 3.5 Completion is based on content readiness

A month is ready when it has a readable assigned photo. Centered fill and white background are valid defaults. Editing is optional, so “not customized” must never be presented as “incomplete.”

## 4. Product Map

```text
Calendar Design Studio
├── Project Entry
│   ├── First visit / no saved project
│   │   ├── Brief product and 2027 context
│   │   ├── Local-only storage note
│   │   └── Choose up to 12 photos → system picker
│   └── Saved project found
│       ├── Resume Calendar
│       └── Start New Calendar → replacement confirmation
│
└── Active 2027 Project
    ├── Assign Photos
    │   ├── January–December month slots
    │   ├── Empty month slots
    │   ├── Unassigned Photos
    │   └── Context-sensitive assignment actions
    │
    ├── Edit Months
    │   ├── Month navigator
    │   ├── One monthly calendar preview
    │   ├── Photo crop / position / zoom
    │   ├── Background color
    │   ├── Calendar text color: Auto / Custom
    │   ├── Curated Calendar typography and Small/Standard/Large scale presets (project-wide)
    │   ├── Add / Replace Photo
    │   └── Single-month PNG download
    │
    └── Review & Export
        ├── Twelve month thumbnails and statuses
        ├── Open a month in the editor
        ├── Reopen Assign Photos
        ├── Single-month PNG download
        └── Generate full set: 12 monthly PNGs → platform-appropriate handoff
```

## 5. Main Areas

### 5.1 Project Entry

Project Entry has two mutually exclusive states based on whether a saved project exists.

In the first-time state, the screen includes:

- A one-sentence product explanation.
- The fixed 2027 calendar context.
- A concise local-only storage note.
- Guidance to select up to 12 photos, that fewer than 12 is allowed, and that the initial order can be corrected.
- One primary photo-selection action that opens the system picker directly.

Cancelling the picker returns to this unchanged first-time state and is not an error.

When a saved project exists, Project Entry instead prioritizes the Resume versus Start New decision. Resume is primary; Start New is secondary and requires confirmation because it replaces the one active local project. The photo-selection prompt is not placed ahead of that decision.

A concise local-storage note appears in both states: the project is saved only in this browser on this device and has no cloud backup. The wording is informational, not an alarm.

### 5.2 Assign Photos

Assign Photos is the project’s organizational area and remains available after editing begins. It contains:

- Twelve named month slots in calendar order.
- A visible missing-photo state for empty months.
- An Unassigned Photos section only when at least one unassigned photo exists.
- Actions for adding, replacing, removing, moving, swapping, duplicating an assignment, and deleting an unassigned photo.

The primary interaction model is tap/click followed by an action and, where needed, a destination chooser. Drag and drop may be offered later as a desktop convenience, but it is not part of the required interaction contract.

The action presentation is context-sensitive. An empty month, an occupied month, and an Unassigned Photo expose only actions relevant to that object and moment. The operation names below define behavior; they are not a requirement to show every term together or to use these exact words as final button copy.

Assignment changes follow explicit semantics:

- **Move** targets an empty month.
- **Swap** exchanges two occupied month slots.
- Assigning an Unassigned Photo to an occupied month is **Replace**; the displaced photo moves to Unassigned Photos.
- **Use in another month** keeps the source assignment and creates another independently assignable project photo item using the same source photo.
- **Remove from month** moves the photo to Unassigned Photos.
- **Delete Photo** is available only from Unassigned Photos and explicitly removes it from the active project.

### 5.3 Edit Months

Edit Months focuses on one month at a time. Its information hierarchy is:

1. Current month and readiness state.
2. Calendar preview.
3. Photo controls: add/replace, reposition, zoom, and reset crop.
4. Background color and unified Calendar text color (Auto / Custom).
5. Small curated Calendar typography and Small/Standard/Large scale preset choices applying to all 12 months.
6. Month navigation.
7. Routes to Assign Photos, Review & Export, and single-month download.

The editor does not expose template, year, week-start, calendar-layout, or advanced typography controls. Product UI is Simplified Chinese; Calendar Proof/output remains English. The Calendar Font choice never changes the Product UI font.

### 5.4 Review & Export

Review & Export presents the 12-month set as a whole. It shows each month’s thumbnail and state, lets the user open any month, and provides export actions.

The area is available for both complete and incomplete projects. Missing months remain actionable. The full-set action is unavailable until all 12 months have photos, with a direct explanation and links to the missing months. Ready months remain individually downloadable regardless of overall project completeness. Full-set output means 12 separate PNG images; ZIP packages them for delivery where appropriate. Phone delivery is an OPEN TECHNICAL QUESTION until real HTTPS Safari testing.

## 6. Navigation Model

### 6.1 First-use navigation

- In the no-saved-project entry state, the primary action opens the system picker directly.
- A successful selection creates the initial mapping and leads to Assign Photos.
- Picker cancellation returns to the same first-time entry state.
- Continue from Assign Photos leads to the first month with a photo; if none has a photo, it leads to January’s empty editor state.
- The user can enter Review & Export at any time after the active project is created.

### 6.2 Established-project navigation

The persistent project-level destinations are:

- **Assign Photos**
- **Edit Months**
- **Review & Export**

Desktop may expose these destinations together in persistent project navigation. Phone portrait uses a compact navigation control or menu, with the current destination always named. iPad may adopt either pattern according to available width without changing the information structure.

### 6.3 Month navigation

Desktop may use a visible January–December navigator alongside the editor. Phone portrait uses an explicit month switcher and Previous/Next controls. Horizontal swipe on the preview is not a core month-navigation gesture because it conflicts with photo repositioning.

Every month-navigation representation shows at least:

- Month identity.
- Missing Photo or Ready state.
- Current selection.

### 6.4 Context-preserving return

When Assign Photos is reopened from a month editor or Review & Export, the product remembers the origin. **Done** returns to that origin unless the user explicitly chooses another destination. After changes, a non-blocking summary identifies affected months and explains that their crops were centered while their background colors were kept.

## 7. Responsive Organization

The same complete information architecture applies to the formal V1 support matrix: current stable Chrome and Edge on Windows/macOS, Safari on macOS, Safari on iPhone/iPad, and Chrome on Android at release time. Other browsers are best-effort and do not alter the required core flow.

### Desktop

- Project navigation and month context may remain visible beside the work area.
- Assign Photos can show multiple month slots in a grid while preserving January–December reading order.
- The editor can place the preview and controls side by side.
- Pointer-based repositioning and an explicit zoom control are both available.

### Phone portrait

- Content is organized as a single primary column.
- Assignment month slots appear as a compact vertical list or small grid with named action buttons; no action depends on dragging.
- Destination selection, photo actions, and color controls may open as bottom sheets.
- The preview remains large enough for touch cropping; controls sit outside the crop surface.
- Persistent actions respect safe areas and browser chrome.
- The interface provides visible navigation instead of relying on browser Back or swipe gestures.

### Phone landscape

The full workflow remains operable, but no separate landscape-specific editing structure is required.

### iPad portrait and landscape

iPad supports the same full workflow. It may use the desktop arrangement when space permits or the mobile arrangement when constrained; neither orientation removes actions or changes semantics.

## 8. Status Vocabulary

### Project status

- **Incomplete:** one or more months lack a photo.
- **Ready to export:** all 12 months have photos; full-set generation is available.
- **Saving:** a local save is in progress when feedback is needed.
- **Saved on this device:** the latest confirmed state is local to this browser/device.
- **Save problem:** new changes could not be saved; the last valid saved project remains protected.

### Month status

- **Missing Photo:** no assigned photo; no PNG export.
- **Ready:** has a readable assigned photo; PNG export is available. Centered fill and white background are already valid.

Whether crop, zoom, or background has changed may remain internal metadata. A later wireframe may use a lightweight Edited hint if useful, but Edited is not a completion tier and must never imply that customization is required.

### Feedback severity

- **Info:** expected conditions requiring no correction, such as local-only storage or picker cancellation.
- **Warning:** work can continue but deserves attention, such as low resolution or an incomplete ZIP set.
- **Error:** an operation failed and needs recovery, such as an unreadable image, save failure, or export failure.

## 9. Local Project and Recovery Structure

- Autosave is continuous; there is no manual Save command required for normal use.
- A returning user sees the saved project’s progress before choosing Resume.
- Starting a new project from any project area routes through a replacement confirmation.
- Local-only storage limitations are communicated at Project Entry and remain available from project help/information.
- A save failure appears persistently until resolved or dismissed after the risk is understood; it never claims the new state is saved.
- A conflicting browser tab blocks writes in the older/conflicting tab and asks the user to refresh.
- Interrupted mobile work resumes at the last saved project area and month when possible; the project remains navigable if the precise transient action cannot be restored.

## 10. Scope Boundaries

This architecture intentionally excludes:

- Template, year, language switching, week-start, advanced font selection, font upload, and per-month font overrides.
- Free canvas, layers, collage, filters, rotation, and crop-ratio changes.
- Important-date editing, Grid / Writable, cover, and bookmark output.
- Accounts, cloud sync, multiple projects, folders, and reusable media libraries.
- Printing and print-production workflows.
- AI assignment, AI ordering, AI design, and content analysis.

## 11. Handoffs and Open Questions

No open IA question currently blocks completion of the detailed Session 02 flows.

The following remain Technical Validation handoffs, not IA decisions:

- Multi-select availability and picker-returned order on supported browsers.
- Supported image decoding and local storage capacity for representative phone photos.
- Reliable local PNG/ZIP handoff on iPhone/iPad Safari and Android Chrome.
- The concrete low-resolution warning threshold.

## Session 08 controlled output amendment

The current S03 and S04 export controls offer a transient PNG (default) or JPG choice alongside print/digital size. One-month and full-set actions use the chosen format; the ZIP contains twelve ordered same-format files. The Month Editor shows a non-blocking photo-edge warning by the crop controls. Before full-set rendering, a transient warning lists months with broad pale photo edges and links to edit each month, with an option to continue for intentional pale backgrounds. The approved four-screen information architecture is unchanged. Earlier PNG-only and unresolved mobile-handoff wording above is historical and is superseded by the Session 08 mobile ZIP, JPG and photo-edge change requests.

**Session 08 print-bleed correction:** S03 proof and S04 overview reflect the selected output variant: print displays its slightly tighter genuine-photo cover, digital displays the saved crop. No IA change.


## V1 Enhancement placement

The four-screen architecture remains. Editor Background gains three photo-color suggestions inside the existing photo sampler; Editor also gains a small Important Date group. Review gains a full-set color suggestion action and confirmation sheet, plus one-operation Restore Previous Colors. No fifth core screen or event-management area is added. See `ui-ux-change-request-v1-enhancement.md`.


## V1.1 Part 1 clarification

S03 still owns all month customization. The optional texture choice sits immediately after the existing per-month solid Background control and affects the lower calendar background only. It adds no screen, route, navigation level or freeform editing mode. Fixed Common Colors are shortcuts within Background; three photo-derived suggestions remain distinct.
