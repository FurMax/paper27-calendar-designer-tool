# Calendar Design Studio — V1 Interaction Rules

**Stage:** Session 02 — IA / UX  
**Status:** Approved / Complete  
**Gate:** IA / UX Gate passed with Product Owner approval on 2026-09-22  
**Next authorized stage:** Session 03 — Wireframe, in a new Codex session  
**Scope:** Cross-screen V1 interaction semantics

## 1. Purpose

These rules are normative for V1 IA, wireframes, UI behavior, and acceptance review. They keep assignment, editing, completion, persistence, and recovery semantics consistent across screens. They do not prescribe implementation libraries or technical storage/export mechanisms.

Capitalized operation names in this specification identify underlying semantics. They do not prescribe final button copy, visual form, or simultaneous exposure of the full action set.

## 2. Terminology

- **Assigned Photo:** a project photo currently attached to a month.
- **Unassigned Photo:** a selected project photo not currently attached to a month.
- **Source photo:** the selected photo data that may be referenced by one or more month assignments.
- **Project photo item:** one assignable project-scoped instance of a source photo. Initial selection creates one item per selected photo; Use in Another Month creates another item that can be assigned, unassigned, or deleted independently.
- **Month-photo pairing:** one month’s assignment to one source photo together with that month’s crop, position, and zoom.
- **Centered fill:** the default crop that fills the fixed photo area, centers the image, and exposes no empty space.
- **Ready month:** a month with one readable assigned photo.
- **Missing month:** a month without an assigned photo.
- **Origin:** the project screen and month, if any, from which the user entered Assign Photos or another transient flow.

## 3. Fixed V1 System Rules

### IR-01 — Fixed project constants

Every project is a 2027, Sunday-first, English-output calendar using the one Standard Photo Calendar layout. The Product UI is Simplified Chinese. V1 exposes a small project-wide Calendar typography preset choice and Small/Standard/Large scale presets; it exposes no controls for year, language switching, week start, template, font upload, free px sizing, per-month typography override, photo/calendar proportions, or date layout.

### IR-02 — One active project

Only one local project exists. Starting a new one while a project exists requires the explicit T03 replacement confirmation. There is no project list, duplicate-project command, cloud copy, or archive.

### IR-03 — Local-only language

Use **Saved on this device** or **Saved in this browser**. Do not use wording that implies cloud backup, account storage, cross-device access, or guaranteed permanent storage.

### IR-03A — Entry state follows saved-project presence

- With no saved project, entry and photo-selection guidance are one state; its primary action opens the system picker directly.
- A first-time user is not required to confirm Start and then confirm Choose Photos in consecutive screens.
- With a saved project, entry prioritizes Resume versus Start New. Starting new still requires project-replacement confirmation.
- These are states of the same Project Entry screen, not a project dashboard or separate Prepare Photos screen.

## 4. Photo Selection Rules

### IR-04 — Initial bulk selection

- One initial system-picker action accepts up to 12 photos.
- Returned photos initially map in order from January through December.
- The UI describes this as an initial order that can be corrected, not as intelligent assignment.
- No image-content inspection, month inference, seasonal sorting, or AI design occurs.

### IR-05 — Fewer than 12 is valid

One to eleven readable photos produce a valid incomplete assignment. Zero selected photos after picker cancellation does not produce an error and does not prevent the individual-picker fallback.

### IR-06 — Over-limit selection

Prevent selection beyond 12 when the environment allows. Otherwise reject the over-limit result clearly and as a whole. Never keep an arbitrary first or last 12 without the user’s knowledge.

### IR-07 — Picker cancellation

Cancellation returns to the origin and changes nothing. An informational message may acknowledge the cancellation; do not use an error modal.

### IR-08 — Individual selection

Individual selection is always available for an empty month, Replace Photo, and mobile multi-select fallback. A failed or cancelled individual selection preserves the existing month photo and edits.

## 5. Month Assignment Rules

### IR-09 — Twelve explicit month slots

Assign Photos always represents all months from January through December. Empty months are first-class slots labeled Missing Photo; they are not omitted or pushed into a separate backlog.

### IR-10 — Context-sensitive tap/click interaction

Every assignment action is possible through tap or click, a contextually relevant action, and a named destination chooser when needed. Drag and drop is not required for V1 and must never be the only route to Move or Swap.

- Selecting an empty month exposes only actions for filling that month.
- Selecting an occupied month exposes only actions valid for its current photo.
- Selecting an Unassigned Photo exposes only assignment and explicit project-removal actions.
- The Swap/Replace distinction is introduced when an occupied destination makes it relevant, not before.
- Same-photo reuse is a secondary occupied-photo action, not a primary concept every user must understand.
- Source photo, project photo item, and month-photo pairing remain specification terminology; the UI does not need to explain the data model.

### IR-11 — Move

Move transfers an Assigned Photo from one month to an empty month.

- Valid destinations: empty months only.
- Source month becomes Missing Photo.
- Destination photo uses centered fill.
- Source and destination background colors stay attached to their respective months.
- If no empty destination exists, Move is unavailable and the UI offers Swap or Replace as applicable.

### IR-12 — Swap

Swap exchanges photos between two occupied months.

- Valid destinations: occupied months other than the source.
- Both month-photo pairings change.
- Crop, position, and zoom reset to centered fill in both months.
- Each month retains its own background color.
- Swap never sends either photo to Unassigned Photos.

### IR-13 — Remove from Month

Remove from Month detaches the photo from that month and places it in Unassigned Photos.

- The month becomes Missing Photo.
- The month background color remains stored.
- The photo remains in the current project.
- This action is not labeled Delete.

### IR-14 — Assign an Unassigned Photo to an empty month

- The photo leaves Unassigned Photos and becomes assigned to the selected empty month.
- The month uses centered fill.
- The month’s stored background color remains.

### IR-15 — Replace an occupied month

Replace is the explicit operation whenever a new or Unassigned Photo is placed into an occupied month.

- The current assigned photo moves to Unassigned Photos.
- The incoming photo becomes assigned.
- Incoming crop, position, and zoom use centered fill.
- The month’s background color remains.
- Before commitment, wording states the displacement and crop reset consequence.
- Picker cancellation or unreadable input leaves the existing month and edits unchanged.

### IR-16 — Use in Another Month

This action allows the same source photo to be used in more than one month.

- The source month stays unchanged.
- The action creates another project photo item that references the same source photo.
- An empty destination receives that new item with centered fill.
- An occupied destination enters the explicit Replace flow.
- Each month maintains independent crop, position, zoom, and background values.
- Later deleting one Unassigned project photo item or replacing one month must not silently remove another item’s valid assignment.

### IR-17 — Unassigned Photos boundary

Unassigned Photos contains only project photo items that currently lack a month assignment. Two items may reference the same source photo when the user chose Use in Another Month; this does not turn the area into a reusable library.

- Hide the section when it is empty.
- Do not add folders, albums, tags, search, reusable collections, uploads history, or cross-project access.
- Do not describe it as a Library or Asset Manager.

### IR-18 — Delete Photo

Delete Photo appears only for an Unassigned Photo.

- It requires explicit confirmation.
- Confirmation says the photo leaves this calendar project but does not delete the device original.
- Cancel changes nothing.
- Deletion must not remove another valid assignment that uses the same source photo.

## 6. Photo-Change Reset and Preservation

### IR-19 — What counts as a photo change

A month’s photo changes when Replace, Move into the month, Swap, assignment from Unassigned Photos, or Use in Another Month gives that month a different/new photo assignment.

### IR-20 — Reset rule

Whenever a month’s photo changes:

- Crop resets.
- Position resets.
- Zoom resets.
- The incoming photo uses centered fill.
- Crop data from the old month-photo pairing is never transferred.

### IR-21 — Background preservation

Background color belongs to the month and is not photo data.

- It survives Replace, Move, Swap, Remove, assignment, and duplicate use.
- It remains editable even while the month has no photo.
- Photo changes never silently overwrite a manually chosen background color.
- Photo changes never silently overwrite the month’s Calendar text-color mode or Custom value.
- New months begin with white unless the user previously changed that month.

### IR-22 — Communicating reset consequences

- Assign Photos contains a persistent concise explanation of the reset/preservation rule.
- Move, Swap, or Replace does not require a repetitive blocking warning when the rule is already visible.
- Replace into an occupied month includes the consequence in its commitment wording because another photo is displaced.
- Returning from a changed assignment shows a non-blocking summary naming affected months.
- If no photo changed, no reset message is shown.

## 7. Reopening Assign Photos

### IR-23 — Availability

Assign Photos remains accessible from Month Editor and Review & Export after editing begins. It is not hidden after onboarding.

### IR-24 — Origin-preserving return

- Entry records the origin screen and current month where applicable.
- Done returns to that origin.
- From Month Editor, return to the same month even if it has become Missing Photo.
- From Review & Export, return to Review & Export.
- The user may explicitly navigate elsewhere instead of using Done.

### IR-25 — No unnecessary confirmation

Opening or leaving Assign Photos requires no confirmation. Assignment actions apply as performed and autosave. Destructive project/photo deletion still uses its dedicated confirmation.

## 8. Month Editing Rules

### IR-26 — One month at a time

The editor displays and edits one month. It does not become a multi-page free canvas. Review & Export provides the whole-year overview.

### IR-27 — Crop and zoom

- The editable trim composition is 1200 × 1800 px portrait 2:3. Its upper Photo Region spans the full width above a separate Calendar Region; the Photo Region itself is not required to be 2:3. Print export adds bleed outside the 100 × 150 mm trim.
- The photo uses cover scaling within the fixed Photo Region: no side gutters, added background border, letterboxing, smaller centered image, or exposed blank area.
- The crop ratio and photo-area shape are fixed.
- Repositioning clamps offsets at every zoom and cannot expose an empty area or change Photo Region geometry.
- Portrait, landscape, square, and extreme-aspect-ratio photos scale to fill.
- Desktop supports pointer/mouse drag repositioning and an explicit zoom control.
- Touch supports single-finger drag repositioning, pinch-zoom, and an explicit zoom control.
- Reset Crop returns to centered fill.
- Rotation, filters, retouching, and crop-ratio changes do not appear.

### IR-28 — Background color

- Each month has one arbitrary solid background color.
- White is the V1 default.
- Calendar text color defaults to Auto, choosing contrasting black or white when the background changes.
- The user may choose one Custom text color for the current month through a picker and HEX field. A low-contrast pairing shows a non-blocking warning; the chosen color is retained.
- Month title, year, weekday labels, and date numbers always share one computed Calendar text color; weekday/weekend color does not diverge in V1.
- A curated Calendar typography preset and Small/Standard/Large scale preset are selected at project level and apply to all four text roles across 12 months. A preset may define fixed role-specific fonts, weights, and spacing internally; neither selection changes the Simplified Chinese Product UI font.
- No font upload, large library, free px slider, weight/spacing editor, or separately selectable font/color per text role appears.
- The original V1 baseline excludes gradients, textures, background images, and multiple regions. V1.1 Part 1 adds six named low-opacity textures to the lower calendar background only; no freeform texture placement or photo overlay appears.

### IR-29 — Touch gesture separation

Dragging and pinching inside the photo crop affect only the photo. Month navigation never uses a swipe gesture on the crop surface. Previous, Next, and the month switcher are explicit controls outside it.

## 9. Month Navigation and Completion

### IR-30 — Navigation availability

Previous Month, Next Month, and direct January–December selection remain available from the editor. Missing months remain selectable.

### IR-31 — Month state definitions

- **Missing Photo:** no assigned photo; not downloadable.
- **Ready:** readable assigned photo; downloadable. Centered fill and white background are valid completed values.

Whether crop/position/zoom or background differs from defaults may remain internal metadata. Session 03 may surface a lightweight Edited hint if useful, but Edited is not a completion state, requirement, score, or quality ranking.

### IR-32 — Project completion

- An incomplete project has at least one Missing Photo month.
- A complete project has one readable assigned photo in every month.
- Crop or color adjustment is never required for project completion.
- Only a complete project enables full-set generation of 12 independent monthly PNGs.

### IR-33 — Skipping and returning

Users may leave any month without customizing it, move past a missing month, and return later. Navigation preserves saved photo, crop, position, zoom, background, text-color mode/Custom value, and the project-wide typography/scale presets.

## 10. Review Rules

### IR-34 — Review is never completion-gated

Review & Export is available for incomplete and complete projects. It always shows all 12 months in order.

### IR-35 — Review actions

- Selecting a month opens that month in the editor.
- Missing months link to Add Photo.
- Assign Photos remains available.
- Every ready month offers individual PNG export.
- Full-set availability and missing requirements remain visible.

## 11. Export Rules

### IR-36 — Single-month PNG

- Available for any Ready month.
- Unavailable for Missing Photo.
- Output is one PNG in the selected variant: default print 1252 × 1843 px at 300 PPI (approximately 106 × 156 mm with approximately 3 mm bleed around a 100 × 150 mm trim), or optional digital 1200 × 1800 px.
- Failure preserves the project and offers retry.

### IR-37 — Full-set generation and delivery

- Available only when all 12 months are ready.
- Generates 12 independent January–December PNGs. ZIP is a delivery package containing those files, not the output definition.
- Desktop and mobile use sequential render → one downloadable ZIP as the V1 full-set handoff. On mobile, the user opens/extracts the ZIP in Files/Downloads to access all twelve independent PNGs; no direct-Photos or production multi-file Share action is promised.
- Never automatically trigger 12 independent browser downloads.
- Files are ordered and named unambiguously from `01` through `12` in any batch package.
- An incomplete state explains which months are missing and provides direct recovery paths.
- Failure preserves the project, offers retry, and leaves individual PNG exports available.

### IR-38 — Export progress

- Prevent duplicate export starts while the same request is running.
- Identify whether the operation is one month or all 12.
- Full-set progress should use understandable month-based progress where available and identify the 12 PNGs before any packaging step.
- Success identifies what was prepared and returns the user to an editable project.
- Browser-specific save/download handoff is described accurately without promising a fixed device folder.
- Export progress and results are transient interaction states, not a required standalone screen. Session 03 may choose inline progress, a dialog, bottom sheet, temporary overlay, or focused state according to task duration and platform.
- Single-month PNG export must not be forced into a full-page transition by this IA. Full-set generation and its actual delivery still require clear progress, success, failure, and retry feedback.

## 12. Persistence and Return Rules

### IR-39 — Autosave

Normal project changes autosave locally; there is no required Save button. Navigation must not suggest that leaving a month discards healthy saved changes.

### IR-40 — Resume

- Returning in the same browser/device presents Resume Calendar as primary.
- Resume restores assignments, Unassigned Photos, missing states, crops, positions, zoom, background/text colors and mode, selected project-wide typography/scale presets, and valid project context.
- Resume returns to the last saved area/month when valid; otherwise it opens Review & Export.

### IR-41 — Save failure

- A failed save is an Error, not a silent condition.
- The UI does not report unsaved changes as saved.
- The last valid saved project is not silently deleted or replaced.
- Persistent recovery feedback remains until retry succeeds or the risk is understood.

### IR-42 — Multiple tabs

When a tab detects newer project state from another tab, it must stop stale writes and ask the user to refresh. It never silently overwrites the newer state.

### IR-43 — Interrupted mobile work

After browser interruption, resume the last saved context. Transient UI such as an open picker or sheet need not be recreated; return to the stable originating screen with saved project content intact.

## 13. Feedback and Confirmation Rules

### IR-44 — Info, Warning, and Error

- **Info:** expected condition; no forced correction. Examples: picker cancelled, local-only note, missing months.
- **Warning:** work may continue but deserves attention. Examples: low-resolution photo, full set unavailable, replacement consequence.
- **Error:** an operation failed. Examples: unreadable image, local save failure, export failure.

### IR-45 — Modal restraint

Use blocking confirmation only when the user is about to:

- Delete an Unassigned Photo from the project.
- Replace an occupied month when the displacement needs explicit commitment.
- Replace the entire active project.
- Resolve a newer-tab conflict that must stop stale edits.

Use inline messages, banners, and status labels for expected and reversible operations.

### IR-46 — No general history requirement

V1 does not require a general Undo, history, or version-management feature. Users can correct assignment changes through the applicable context-sensitive assignment operations.

## 14. Responsive Interaction Rules

### IR-47 — Desktop

- Month slots may use a multi-column layout.
- Preview and controls may be side by side.
- All functions work with pointer and keyboard-accessible controls.
- Drag and drop, if later included, is redundant to explicit Move/Swap actions.

### IR-48 — Phone portrait

- This is the primary mobile layout.
- Core controls use explicit touch targets and do not depend on hover, right-click, or long-press.
- Sheets and sticky actions respect device safe areas and Safari browser chrome.
- The editor does not shrink a desktop multi-column control panel into an unreadable layout.
- Long screens retain visible context and a reliable route back to project-level navigation.

### IR-49 — Phone landscape and iPad

- Phone landscape remains operable without a separately optimized structure.
- iPad portrait and landscape support the complete workflow.
- Responsive rearrangement may change placement but never remove actions or change semantics.

## 15. Error and Recovery Matrix

| ID | Condition | Class | Must preserve | Required recovery |
|---|---|---|---|---|
| ER-01 | Picker cancelled | Info | All existing project state | Return unchanged; reopen picker |
| ER-02 | More than 12 selected | Warning | Prior valid selection/project | Choose up to 12; no silent trimming |
| ER-03 | Unreadable image | Error | Existing month photo and edits | Select another image |
| ER-04 | Low-resolution image | Warning | Selected photo remains usable | Keep or replace |
| ER-05 | Missing months | Info | All ready months | Add later; individual PNG remains available |
| ER-06 | PNG unavailable | Info | Month/background state | Add a photo |
| ER-07 | PNG export failure | Error | Entire project | Retry or return to editing |
| ER-08 | Full set unavailable | Info | Entire project | Fill named missing months |
| ER-09 | ZIP failure | Error | Entire project and single PNG access | Retry or download individually |
| ER-10 | Local save failure | Error | Last valid saved project and visible in-memory work | Retry; never claim saved |
| ER-11 | Newer-tab conflict | Warning/blocking | Newer saved project | Refresh; do not overwrite |
| ER-12 | Mobile interruption | Info/Error by outcome | Last successfully saved project | Resume stable context |
| ER-13 | New project requested | Destructive warning | Existing project until confirmation succeeds | Keep current or replace explicitly |
| ER-14 | Mobile full-set handoff failure | Error | Entire project and generated-month access where safely retained | Retry the validated handoff or use its tested fallback; do not claim files were saved |

## 16. Session 03 Constraints

Wireframes may choose spatial arrangements and component forms, but they must preserve:

- The combined first-time entry/photo-selection state, four core screens, and five transient interaction surfaces.
- Tap/click-complete assignment behavior.
- Move/Swap/Replace distinctions.
- Unassigned Photos boundaries and explicit deletion.
- Same-photo reuse through Use in Another Month.
- Crop reset and month-background preservation.
- Default-ready completion semantics.
- Full iPhone workflow without desktop-only interactions.
- Incomplete Review access and ZIP gating.
- Local-only resume and destructive New Project confirmation.

The Session 02 gate has passed. Session 03 begins only in the separately authorized new Codex session, not during this closeout.

## Session 07 Product Owner approval — color, scale and print

The desktop system color picker remains available. A separate **从照片取色** action opens a photo sampling sheet/dialog inside S03; touch drag or click selects a pixel in the current crop, previews its HEX value, and only **使用此颜色** changes the current month's background. Cancel leaves the prior color intact. This nested S03 control does not add a new core screen or a new numbered cross-screen transient surface.

Small / Standard / Large are 80% / 100% / 120%. Single and full-set export each offer default print and optional digital variants. The trim preview remains 2:3; the print file adds approximately 3 mm bleed outside a 100 × 150 mm trim and carries 300 PPI metadata. The selected variant applies to all files in that export action.

## Session 08 controlled export interactions

PNG remains the default export format; JPG can be selected for one-month and full-set output in print or digital size. A format or project-content change invalidates a previously prepared file. The editor analyzes the current visible photo crop after import/crop changes and warns about a broad light edge with zoom/reposition guidance. Before full-set rendering, T05 lists affected months and lets the user edit one or continue with an intentional pale background. The warning does not change saved crop or block export. ZIP is the V1 mobile delivery method for twelve same-format images. Earlier PNG-only/mobile-handoff descriptions are historical.

**Session 08 print-bleed correction:** Selecting print displays the actual slightly tighter source-photo crop needed to cover bleed. Switching to digital restores the saved crop visually; neither switch writes an automatic zoom to the project. The full-set edge warning evaluates the selected output variant.


## V1 Enhancement rules

Photo recommendations never auto-apply. Selecting a swatch applies only that month's background and recalculates Auto ink; failed extraction leaves the current color untouched and offers safe choices. Full-set suggestions require all twelve ready photos, show each month before/after, and apply only after confirmation. Restore reverts that batch's changed backgrounds once; a later manual background choice clears the restore record. Important Date toggles a valid day number, has no event text, and persists per month. Reduced-motion removes decorative entrance/hover movement while preserving feedback and operation speed.

2026-09-24 per-month photo color rule: Background Color displays three optional swatches extracted from the current month's visible photo crop. Selection applies one color to that month only; passive analysis never alters the saved background. Fixed Common Colors remain distinct. Fewer than three distinct photo colors may create explicitly labeled tonal extensions; a decode/analysis failure uses clearly labeled fixed backups. The phone sheet follows the same rule.

2026-09-24 experience polish: Selecting a per-month recommendation changes only the active month. The Review twelve-color strip switches a proposal-only month proof; it never saves until Apply. Cancel preserves every background; Apply retains the existing one-step Restore. Export progress marks completed months in order, while the text status remains the screen-reader announcement. Important Date blue hover/focus is ordinary interaction feedback; only the red marked state changes preview and export.

2026-09-24 whole-set refinement: For each ready month, choose a mildly contrasting companion/accent from the same photo recommendation set shown in the month Editor. Prefer actual photo swatches; if the photo offers only one color, use a labeled tonal extension. Soften a raw swatch only when too dark/intense for the calendar background, and identify its source in the confirmation proof. Fixed backup colors are for extraction failure only. Preview is read-only until explicit Apply; one-operation Restore remains.

2026-09-24 motion polish: All animation is optional presentation feedback. Rapid month changes resolve to the latest selected month; progress visuals follow actual analysis/render completion without added waiting. Important Date pressed/marked meaning, keyboard focus, batch confirmation and one-step restore are unchanged. Reduced-motion removes movement and stagger while retaining readable selected, loading, error and success states. Mobile suppresses hover-only lifts and never delays touch input.
## V1.1 Editor interaction placement (2026-09-25)

The ten fixed colors remain immediate current-month background shortcuts, now in a 2 × 5 swatch shelf. Pointer hover and keyboard focus expose name + HEX; accessible names and pressed states persist without visible labels. Photo-derived main, matching, and accent colors remain direct-apply controls. Exact HEX/RGB, texture, typography, important-date marking, and export retain their behavior in sections below the proof. The whole-set palette still previews and applies on Review; the Editor's lower Export section provides its entry. The important-date hover style is unchanged.
## Editor color and export refinement (2026-09-25)

Round common-color swatches and round photo recommendation samples keep the same direct-apply behavior, accessible names, names/HEX and pressed state. Precise HEX/RGB/current-month picker now stays with the quick color controls (desktop rail, phone background sheet). Export variant, format, current-month generation and Review palette entry remain in the last standalone section. No export algorithm, date-hover, or crop behavior changes.
## Background and texture control refinement (2026-09-25)

Photo-derived and fixed colors remain direct-apply buttons with pressed state, accessible name and hover/focus name/HEX. Common colors scroll in one row. The existing precise photo pixel picker remains a small action beside recommendations. Custom toggles the existing HEX/RGB/native color inputs, closed initially; input values still follow the current month background. Texture Clear writes `none` and the five preview buttons write the same texture IDs as before. Texture names are available through hover tooltip and accessible names. Export, crop and date-hover interactions are unchanged.

## V1.1 Editor placement amendment — 2026-09-25

Repositioning Text Color, typography, texture and Important Date does not change their behavior. A custom text color retains its HEX input and the existing non-blocking contrast warning; changing the adjacent background updates that warning immediately. Desktop proof remains sticky while the long rail scrolls. At widths below 1024px the proof is static and the rail follows it.

## V1.1 desktop Editor scroll and grid clarification — 2026-09-25

The right rail still scrolls with the page; the left proof remains sticky. The Product Owner chose this current behavior over introducing nested inspector scroll. The subtle workspace grid appears through CSS only while the editable crop surface is active and fades away after release; pointer, pinch, crop and export behavior are unchanged.

## V1.1 Editor current-month export menu amendment — 2026-09-25

The Editor title-row utility control `导出本月⌄` offers print PNG, print JPG, digital PNG and digital JPG for the currently selected month. Selecting an item closes the overlay, snapshots current state, renders the one file and attempts browser download; it does not navigate, switch month or edit project state. The menu closes on outside pointer, repeat click, Escape and selection. A small anchored status offers manual download if the asynchronous automatic handoff did not start, plus failure retry. The old bottom Export section and duplicate Review palette link are removed from Editor. Review retains its own full-set export interaction. See `ui-ux-change-request-v1-1-month-export-menu.md`.
