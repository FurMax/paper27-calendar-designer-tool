# Calendar Design Studio — Acceptance Criteria

**Status:** Approved Product Discovery acceptance specification  
**Gate:** Passed with Product Owner approval on 2026-09-14

Checked items record confirmed product decisions. Unchecked items are testable V1 implementation/QA outcomes and do not mean the product decision is unresolved.

## Product Discovery Gate

- [x] One primary V1 user is explicit: fandom users turning collected celebrity photos into downloadable calendar images, potentially without a computer or design skills.
- [x] The primary job is explicit: prepare up to 12 favorite celebrity photos once, manually assign them to months, and personalize 12 cohesive, correct 2027 monthly PNGs without manually designing or verifying 12 calendar pages.
- [x] The positioning against general-purpose design tools is explicit: the product owns dates, consistency, and January-to-December organization while the user owns photo selection/assignment, crop/position, and monthly color.
- [x] The end-to-end first-use task is defined and confirmed in the PRD.
- [x] V1, P1, conditional P1, P2, and later scope are explicit in `product/scope.md`.
- [x] V1 non-goals are confirmed in `product/scope.md` and the PRD.
- [x] The mobile role is explicit: phones must support the complete core workflow without a computer.
- [x] The desktop role is explicit: desktop browsers also support the complete core workflow; the product is not mobile-only.
- [x] Formal V1 browsers are specified by current stable release-time versions: desktop Chrome/Edge/Safari, iPhone/iPad Safari, and Android Chrome.
- [x] Major V1 edge cases have an agreed product response.
- [x] Feature-level V1 acceptance criteria are expressed as testable outcomes.
- [x] Product artifacts have passed a consistency audit.
- [x] The Product Owner explicitly approved moving to Session 02 — IA / UX on 2026-09-14.

## Emerging User and Output Requirements

- [ ] A user without a computer or visual-design experience can understand the agreed core creation flow.
- [x] The primary V1 audience is fandom users; photography and journaling/lifestyle are secondary audiences.
- [ ] The user can choose one arbitrary solid background color for each month.
- [ ] When automatic color suggestion is absent or unavailable, a new month uses white as its default background.
- [ ] Auto is the default Calendar text-color mode and selects contrasting black or white for the current background.
- [ ] Changing the background in Auto immediately recalculates one color for month title, year, weekday labels, and date numbers together.
- [ ] Custom accepts an arbitrary Calendar text color through a picker and HEX field and applies it to all four text roles together.
- [ ] A low-contrast Custom text/background pairing shows a non-blocking warning without silently changing the selected color.
- [x] Photo-derived default color is not required to pass V1 if the later feasibility check finds it unreliable or disproportionately costly on supported browsers.
- [ ] If photo-derived color is included, it handles photos with no clear dominant color or extreme light/dark values by returning a usable result or falling back to white.
- [ ] Replacing a photo never silently overwrites a manually chosen background color.
- [x] Gradients, textures, background images, and multiple background-color regions are not V1 requirements.
- [x] The primary V1 canvas is a portrait 2:3 postcard-style format, conceptually corresponding to 10 × 15 cm.
- [x] A completed calendar's core output consists of 12 separate monthly images, not a single full-year image.
- [x] PNG is the default V1 download format.
- [x] Every V1 monthly PNG is exactly 1200 × 1800 px in portrait orientation.
- [x] Bookmark-size output is post-V1 and does not block V1 acceptance.
- [x] A calendar cover is not part of V1; the complete V1 set contains exactly 12 monthly images.
- [x] V1 uses one Standard Photo Calendar system: upper photo, lower normal monthly calendar/date area, and coordinated overall background color.
- [x] The **whole** 1200 × 1800 output is portrait 2:3; the Photo Region is an upper fixed region, not itself required to be 2:3.
- [ ] The assigned photo covers the upper Photo Region edge to edge across the full output width, without side gutters, background border, letterboxing, a smaller centered image, or crop-exposed blank area. The lower region separately uses the chosen solid background and English calendar output.
- [x] V1 uses one fixed layout with no template selector or adjustable photo-to-calendar proportion.
- [x] Future P2 template expansion is recorded as a Technical Architecture constraint without adding any V1 template-selection feature.
- [x] Large writable Grid / Writable templates are not required in V1.
- [x] Each V1 month has exactly one primary photo slot; multi-photo collage is not required.
- [x] V1 includes bulk selection of up to 12 photos and manual Month Assignment, followed by one-month-at-a-time crop, position, and color editing.

## Provisional Calendar Correctness

- [x] V1 calendar labels use English only; multilingual switching is not required.
- [ ] All Product UI navigation, buttons, page headings, statuses, helper copy, dialogs, sheets, errors, save feedback, and export feedback use Simplified Chinese.
- [ ] Calendar Proof and exported images retain English month and weekday labels, Arabic-numeral year and dates, independent of the Product UI font and language.
- [x] V1 supports 2027 only and does not require a year selector.
- [ ] Every 2027 month displays the correct number of days and Sunday-first weekday alignment.
- [x] Leap-year handling is not required until additional years enter scope.
- [x] V1 is Sunday-first and does not require a week-start switcher.
- [ ] Every V1 calendar displays weekday columns in Sunday-to-Saturday order.
- [x] The compact V1 date section always uses six rows; unused positions remain blank.
- [ ] Every 2027 month places dates and blank positions correctly in the fixed six-row layout.
- [x] V1 does not distinguish weekends by color; all ordinary dates use the same text treatment.
- [x] Red is reserved for user-selected important dates beginning in P1.
- [x] Changing year or week start is not a V1 action.
- [x] Digital important-date marking is not required for V1 and is committed for P1.
- [ ] P1 criteria will require artist birthdays, debut anniversaries, and album anniversaries to be assigned to the intended calendar date and survive relevant edits.
- [ ] P1 behavior for multiple events on one date is defined.
- [x] The P1 exported marker is a red date number without an event label or explanation.
- [ ] The P1 editing UI lets users understand and manage marked dates even though exported event labels are omitted.
- [ ] P1 conflicts between important-date red and other date-color rules are defined.
- [x] Large writable cells and handwritten-plan space are not V1 requirements.

## Provisional Image Workflow

- [x] Image sources are defined: system photo library on mobile and local system folders on desktop.
- [ ] iPhone, iPad, and Android users can select up to 12 photos in one system-library picker action without first performing a manual file conversion.
- [ ] Desktop users can select up to 12 local images in one system file-picker action.
- [ ] A bulk selection accepts no more than 12 photos; an over-limit attempt is prevented or rejected clearly without silently discarding arbitrary selections.
- [ ] Initial Month Assignment maps photos to January through December in the order returned from the user's selection.
- [ ] Month Assignment visibly presents all 12 month slots and their assigned or missing-photo state.
- [ ] The user can swap two months' photos.
- [ ] The user can move/reassign a photo to another month.
- [ ] Removing a month's assigned photo moves it to Unassigned Photos without deleting it from the active project.
- [ ] An Unassigned Photo can be assigned to any month.
- [ ] Only an explicit delete action on an Unassigned Photo removes it from the active project.
- [x] Unassigned Photos is project-local and temporary; it is not a media library, asset manager, folder system, or reusable photo library.
- [ ] Month Assignment can be reopened after monthly crop/color editing begins.
- [ ] The user can replace one month's photo through an individual system picker.
- [ ] Selecting fewer than 12 photos does not block entry into monthly editing; missing months can be filled later individually.
- [ ] If a supported mobile environment cannot provide multi-selection, the individual month picker still allows completion of the full workflow.
- [x] Bulk selection and Month Assignment do not inspect image contents, infer months, perform AI sorting, or perform AI design.
- [x] Direct camera capture, URL/social/cloud import, whole-folder ingestion, and reusable media-library management are not V1 requirements.
- [ ] At minimum, supported system-picker photos can be processed without manual conversion; implementation guardrails fail clearly rather than corrupting work.
- [ ] An unreadable newly selected image produces a clear error and leaves the existing month's photo and edits unchanged.
- [ ] A low-resolution image produces a warning but can still be used.
- [x] Crop interaction is defined: fixed-ratio crop, drag to reposition, and zoom; touch supports drag and pinch-zoom.
- [ ] A user can replace, crop, and reposition the single photo assigned to any month.
- [ ] Crop behavior preserves the template's required photo-area shape and does not expose an empty area.
- [ ] Desktop pointer/mouse drag and mobile single-finger drag visibly reposition the photo when crop overflow exists; mobile pinch and an explicit zoom control work, and Reset restores centered fill. Offsets clamp at every zoom and never change Photo Region geometry.
- [ ] Portrait, landscape, square, and extreme-aspect-ratio photos scale to fill the fixed crop without exposing empty space.
- [ ] The same source photo can be reused in multiple months.
- [ ] Whenever replacement, swap, or reassignment changes a month's photo, that month's crop, position, and zoom reset to centered fill.
- [ ] A manually selected background color remains attached to its month through replacement, swap, or reassignment.
- [ ] Crop settings from the old photo are never migrated to the new photo.
- [ ] Desktop crop is operable with pointer input and an explicit zoom control.
- [ ] Touch crop is operable with drag and pinch-zoom without requiring hover.
- [x] Crop-ratio changes, rotation, filters, and retouching are not required in V1.
- [ ] Bulk selections, month assignments, and edits survive the expected project lifecycle.
- [ ] The user can move forward through January to December and return to an earlier month without losing that month's photo, crop, position, or style choices.
- [ ] The user can skip a month and the experience distinguishes months with and without assigned photos.

## Local Persistence

- [ ] Project changes are automatically saved in the current browser without requiring an account.
- [ ] Closing and reopening the site in the same browser on the same device restores bulk-selected project photos, Unassigned Photos, Month Assignment, missing-month state, project-wide Calendar typography/scale presets and constants, crops/positions, background colors, and each month's text-color mode/Custom value.
- [x] V1 does not require cloud storage, cross-device sync, or cross-browser restore.
- [ ] The UI clearly explains that clearing site data, private browsing, or browser/OS storage eviction may remove the local project.
- [ ] Storage-quota failure has a clear, non-destructive error state.
- [ ] Storage-quota failure never silently deletes or replaces the last valid saved project.
- [ ] A later or conflicting browser tab asks the user to refresh instead of silently overwriting newer local work.
- [x] V1 stores one active local project only and does not require a project list or project naming.
- [ ] Starting a new project while a draft exists requires explicit replacement confirmation.

## Provisional Editing Model

- [x] V1 permits a small curated set of approximately two or three project-wide Calendar Font presets and no per-month font override.
- [x] V1 permits only Small / Standard / Large project-wide Calendar typography scale presets, defaulting to Standard; no free px slider or per-month size override.
- [ ] Each curated preset may define different font files, weights, and spacing for month, weekday, and date roles as a fixed system, while the user selects only the complete preset.
- [x] V1 month-level content includes photo, crop/position, background color, and unified Calendar text-color mode/value; important dates begin in P1.
- [x] V1 does not permit per-month overrides of font, structural proportions, or date layout.
- [x] V1 does not require an Apply Style to All action because the chosen font preset already applies across the set.
- [x] V1 project-wide year, layout, and date rules are fixed; only the limited typography and scale presets can change text styling.
- [ ] Moving between months preserves completed month-level work.
- [ ] Every V1 preset font has recorded evidence that its license permits free commercial use and redistribution/use in the product as applicable.
- [ ] The preset typography renders consistently across all 12 months.
- [ ] The Calendar Font preset changes the English Calendar Proof and output without changing Simplified Chinese Product UI typography.
- [ ] Technical Validation verifies license compatibility, webfont loading, file size, Safari compatibility, and stable PNG font rendering for the final candidates.
- [x] Per-month font overrides are not required in V1.
- [ ] Unsupported or failed font loading falls back without corrupting layout or exported PNG text.

## Provisional Export

- [x] PNG dimensions are fixed at 1200 × 1800 px and batch ordering is January through December.
- [ ] The user can download any individual month as a PNG.
- [ ] **Session 05 unresolved iPhone acceptance:** A single user action saves that month's PNG directly into Photos without a second manual Save action, as requested by the Product Owner on 2026-09-23. At least one isolated iPhone Safari download succeeded to iCloud Drive → Downloads, but that is a file download rather than Photos import; Open→Save requires a second action. Feasibility under the approved browser-only V1 constraint is an **OPEN QUESTION** and must be resolved explicitly before treating the mobile Photos handoff as accepted.
- [ ] On desktop, the user can download one ZIP containing all 12 monthly PNG files; ZIP is a package for the separate PNG outputs.
- [ ] A distinct full-set action generates 12 independent January–December PNGs; a ZIP, when used, packages those files and is not the output definition.
- [ ] The mobile full-set result offers a tested, usable path to obtain all 12 PNGs. Its primary handoff is selected only after real iPhone/iPad Safari HTTPS testing of multi-file Share/Save; ZIP and per-month save remain fallback candidates. It never automatically starts 12 separate downloads.
- [ ] Individual PNG download is available once that month has a photo, even when its crop and background remain at valid defaults.
- [ ] Full-set generation is unavailable until all 12 months have assigned photos, with a clear explanation of what remains incomplete.
- [ ] ZIP filenames preserve unambiguous `01` through `12` ordering and month identity.
- [ ] Batch download does not depend on triggering 12 separate browser downloads.
- [ ] Export behavior on desktop, iOS Safari, and agreed Android browsers is defined.
- [ ] The product gives a clear result or recovery path for interrupted or failed exports.
- [ ] ZIP failure leaves the project intact and permits retry or individual month download.
- [x] Printing, print ordering, bleed, CMYK, vendor compatibility, and physical-size/DPI guarantees are outside V1.

## Provisional iOS / Safari Support

- [x] Required phone scope is explicit: bulk-select photos, manually assign months, fill or replace individual months, edit all 12 months, and export without a computer.
- [ ] Current stable iPhone/iPad Safari can select up to 12 photos in one system Photos picker action and preserve the returned selection order for initial Month Assignment.
- [ ] If iOS multi-selection is unavailable or interrupted, the individual month picker remains a complete fallback path.
- [x] iPad portrait and landscape both support the complete workflow.
- [x] Phone portrait is primary; phone landscape remains operable without requiring a separate optimized layout.
- [ ] Desktop remains usable across the agreed supported window-width range.
- [ ] Touch targets and gestures do not require hover or a mouse.
- [x] Software-keyboard behavior is not a V1 core requirement because V1 has no user text-entry workflow.
- [ ] Controls and content respect device safe areas.
- [ ] Photo/file selection and output handoff work through the agreed iOS flows.
- [ ] Mobile resource limits and interrupted work have an agreed recovery behavior.

## Provisional Android Browser Support

- [x] Android phones are included in V1 mobile-browser support.
- [x] Android formal support targets current stable Chrome at V1 release time.
- [ ] The complete bulk-selection, Month Assignment, individual fallback, editing, and export workflow meets the same product outcome on supported Android Chrome.
- [ ] Image selection, touch editing, and export use browser-accessible flows and do not require a native app.

## Session 01 Closure

- [x] Unassigned Photos behavior is fully defined.
- [x] Reopening Month Assignment and photo-change reset/preservation behavior are fully defined.
- [x] No Product Discovery question blocks Session 02.

## Known Validation Risk

- The positioning against general-purpose design tools is an explicit product hypothesis but has not yet been tested with representative fandom users. This does not change the approved V1 scope, but should be validated before significant expansion.
- Multi-selection limits and returned selection order must be verified on the formal desktop, iOS/iPadOS Safari, and Android Chrome support matrix.
- Local-only persistence capacity must be verified with 12 representative modern phone photos; failure must follow the documented non-destructive storage error behavior.
