# Calendar Design Studio — Acceptance Criteria

**Status:** Approved Product Discovery acceptance specification  
**Gate:** Passed with Product Owner approval on 2026-09-14

Checked items record confirmed product decisions. Unchecked items are testable V1 implementation/QA outcomes and do not mean the product decision is unresolved.

## Product Discovery Gate

- [x] One primary V1 user is explicit: fandom users turning collected celebrity photos into downloadable calendar images, potentially without a computer or design skills.
- [x] The primary job is explicit: prepare up to 12 favorite celebrity photos once, manually assign them to months, and personalize 12 cohesive, correct 2027 monthly images in the chosen PNG or JPG format without manually designing or verifying 12 calendar pages.
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
- [ ] On desktop and phone, “从照片取色” samples the chosen visible photo pixel after the current crop, previews its HEX value, and changes only the current month after explicit confirmation; Cancel leaves the prior color intact. The system color picker and arbitrary HEX/RGB remain available.
- [x] Gradients, textures, background images, and multiple background-color regions are not V1 requirements.
- [x] The trimmed V1 composition is portrait 2:3 and the print variant targets a physical 100 × 150 mm trim.
- [x] A completed calendar's core output consists of 12 separate monthly images, not a single full-year image.
- [x] PNG is the default V1 download format; JPG is an explicit alternative for individual and full-set export.
- [x] Each month offers a default print PNG or JPG at 1252 × 1843 px with 300 PPI metadata (approximately 106 × 156 mm including approximately 3 mm bleed on every edge), plus an optional 1200 × 1800 px digital PNG or JPG.
- [x] Bookmark-size output is post-V1 and does not block V1 acceptance.
- [x] A calendar cover is not part of V1; the complete V1 set contains exactly 12 monthly images.
- [x] V1 uses one Standard Photo Calendar system: upper photo, lower normal monthly calendar/date area, and coordinated overall background color.
- [x] The editable 1200 × 1800 trim composition is portrait 2:3; its upper Photo Region is full-width but need not itself be 2:3. Print export places the composition inside the 100 × 150 mm trim.
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
- [x] V1 permits only Small / Standard / Large project-wide Calendar typography scale presets at 80% / 100% / 120%, defaulting to Standard; no free px slider or per-month size override.
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

- [x] The selected print or digital dimensions for PNG and JPG are consistent in single and full-set export; batch ordering is January through December.
- [ ] The user can download any individual month as the selected print or digital PNG or JPG. Print output has continuous photo/background artwork through bleed, keeps important content inside trim, and does not burn preview trim guides into the file.
- [x] **Session 08 Product Owner resolution:** The earlier one-action direct iPhone Photos request is deferred beyond V1. V1 browser download targets Files/Downloads; opening/extracting a ZIP or manually importing a PNG into Photos is a separate user action and is described truthfully. No V1 direct-Photos claim is made.
- [ ] On desktop, the user can download one ZIP containing all 12 monthly files in the selected PNG or JPG format; ZIP is a package for the separate selected-format outputs.
- [ ] A distinct full-set action generates 12 independent January–December images in the selected format; a ZIP, when used, packages those files and is not the output definition.
- [ ] The mobile full-set result downloads one ZIP containing twelve independently named January–December PNGs or JPGs. On each supported iPhone/iPad/Android browser, QA confirms the actual download destination, extraction and opening of all twelve files. ZIP is the V1 primary mobile handoff; production multi-file Share is outside V1 and twelve automatic downloads remain prohibited.
- [ ] Individual PNG or JPG download is available once that month has a photo, even when its crop and background remain at valid defaults.
- [ ] Full-set generation is unavailable until all 12 months have assigned photos, with a clear explanation of what remains incomplete.
- [ ] ZIP filenames preserve unambiguous `01` through `12` ordering and month identity.
- [ ] Batch download does not depend on triggering 12 separate browser downloads.
- [ ] Export behavior on desktop, iOS Safari, and agreed Android browsers is defined.
- [ ] The product gives a clear result or recovery path for interrupted or failed exports.
- [ ] ZIP failure leaves the project intact and permits retry or individual month download.
- [x] The print PNG or JPG includes a 100 × 150 mm trim, approximately 3 mm bleed on every edge, and 300 PPI metadata. Physical printing service, print ordering, CMYK/PDF preparation, and universal vendor acceptance remain outside V1.

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

## Session 08 approved output amendment — pending formal release QA

- [ ] PNG is the default and JPG is selectable for one-month and full-set export in both print and digital sizes. A ZIP contains exactly twelve ordered files in the selected format; switching format discards a previously prepared output.
- [ ] Print JPG has valid JPEG dimensions and nominal 300 PPI JFIF metadata; print PNG retains its pHYs density. Both are RGB. The named printer accepts a submitted representative file and its actual trim/bleed proof before print readiness is claimed.
- [ ] A covered source photo produces no app-created white fringe in digital or print PNG/JPG. Print photo bleed is covered by genuine source pixels without reflection or single-pixel stretching. Print Preview must show the resulting slightly tighter crop while digital output retains the saved crop.
- [ ] Month Editor identifies a broad light/white edge in the current visible photo crop before export and provides zoom/reposition recovery. The full-set flow identifies affected months before generating files and permits an intentional pale edge to be accepted. This heuristic is not a guarantee that every source-photo border is detected.

- [ ] Print PNG/JPG top and side photo bleed contains genuine source-photo pixels rather than reflected or flat replicated trim edges; the Month Editor/Review print proof matches the resulting tighter crop. Actual iPhone/iPad and named-printer verification remain open.


## V1 Enhancement / Polish Patch — awaiting Product Owner review

- [x] The Editor desk grid stays in UI only; Baby Blue primary/selected/focus states and Milk Mint recommendation states, wordmark slot and favicon render at desktop and 320px without horizontal overflow in Chrome/Edge automation. Reduced-motion disables the proof entrance motion.
- [x] Each ready month shows three distinct, photo-derived suggestions directly in Background Color on desktop and phone. Switching month/photo/crop/print-digital view recomputes them; any tonal extensions and analysis-failure backups are labeled. Choosing one updates only that month's background and Auto text ink while fixed Common Colors, HEX, RGB, system picker and exact pixel sampling remain.
- [x] Review derives month-specific colors from all twelve assigned photos, previews old/new swatches and actual change count, requires confirmation, and stores one-operation restore through project reload.
- [x] Important Date add/remove is restricted to valid 2027 day numbers; older saved projects load with none. Preview, single digital PNG and full-set PNG show the same mark in bounded Chrome/Edge checks.
- [ ] Product Owner accepts the actual visual and interaction polish on their device. Current-build iPhone/iPad Safari and formal release matrix still need their own evidence.

## V1 Experience Polish — scoped acceptance, 2026-09-24

- [x] Editor proof remains visually dominant; workspace grid is quieter and right-hand controls retain the same functions with clearer grouping.
- [x] Per-month photo choices use natural Chinese names, larger color swatches and an accessible selected state; selecting a swatch changes only that month and recalculates Auto ink.
- [x] Full-set color analysis reveals a twelve-color overview, lets the user inspect an individual proposed month proof without mutating saved colors, and applies only on explicit confirmation. One batch restore remains.
- [x] Review keeps twelve clickable calendar cards, signals 12/12 completion, and exposes the full-set export choice and CTA. Export progress reports completed months from January to December.
- [x] Entry hero uses three example calendar pages; browser UI artwork does not enter PNG/JPG export.
- [x] Focus, 320px layout, reduced motion and prior import/save/export behavior pass bounded automated checks.
- [ ] Product Owner reviews the experience on the actual project and iPhone/iPad. Formal Session 08 release matrix remains separate.

## Whole-set color fidelity follow-up — awaiting Product Owner review

- [x] The twelve-month proposal uses a distinct extracted companion/accent color from each month's photo when available; a single-color photo uses its labeled tonal extension. A swatch is softened only if too dark or intense. Fixed backups are reserved for extraction failure.
- [x] The confirmation preview identifies the source swatch and any softening. Cancel leaves saved backgrounds unchanged; Apply/Restore behavior and the 320px sheet remain functional in isolated browser checks.
- [ ] Product Owner accepts the look of these recommendations with their own twelve photos.

## V1 Motion / Interaction Polish — pending Product Owner device review

- [x] Desktop Chrome and Edge show a one-time ≈1.4s Entry stack sequence (≈1.2s touch) without animating layout, a ≤220ms interruptible month proof/heading change, and 60ms-spaced photo-color chip reveals. Repeated photo analysis and rapid month selection keep the latest state.
- [x] Full-set chips reflect actual photo-analysis completion and export chips reflect real January–December rendering progress; neither process receives artificial delay. Important Date add/remove, Review hover/focus, buttons and selected states retain their established meaning.
- [x] Reduced-motion immediately shows final content without transform/stagger; 320px/390px browser emulation has no horizontal overflow. No React runtime exception was captured in the focused Chrome/Edge checks.
- [x] Build, 56 unit tests, desktop core integration, PNG ZIP and batch-color parity pass after the CSS-only patch.
- [x] Product Owner reported all normal on current-build iPhone 13 Safari for touch crop, rapid month switching, repeated palette selection, Important Date and export progress (2026-09-24). This is scoped owner-reported smoke evidence; formal release browser/device matrix remains separate.

## Entry motion timing correction 3 — Product Owner accepted

- [x] Computed Chrome/Edge Entry animation is 1000ms with 0/200/400ms desktop starts; touch emulation is 900ms with 0/150/300ms starts. The midpoint is visibly unfinished, the container stays fixed, and reduced-motion shows the final state immediately.
- [x] Month switching, color chips, buttons, Review and true export progress retain short functional timings; no artificial work delay or animation dependency was added.
- [x] Product Owner accepted the revised Entry rhythm on the current site on 2026-09-24. The earlier iPhone Safari report predates these Entry timing corrections. The Product Owner found the ≈1s desktop / ≈820ms touch attempt too fast and the ≈1.8s desktop / ≈1.5s touch attempt a little slow.

## V1 Focused Experience Upgrade — awaiting Product Owner review

- [x] `gsap` and `@gsap/react` are used in production Entry, Editor month switching and Review whole-set palette interactions; superseded CSS transform/opacity animations are removed.
- [x] Landing stack enters as layered proofs once, then stays still; desktop hover response is subtle and mobile omits it.
- [x] Rapid month switching keeps the latest month, cancels prior transitions, preserves control layout and leaves the current crop surface interactive.
- [x] The corrected month switch keeps the previous photo visible until the target photo is ready and never exposes the workspace between proofs; Chrome/Edge frame checks pass, and the Product Owner reports no double flash when switching months 1–4 on the LAN site.
- [x] Smart palette reflects real per-month completion, previews 12 recommendations without mutating saved colors, applies immediately with visible completion feedback, and restores the prior colors.
- [x] Reduced-motion presents final state immediately; Chrome/Edge emulated 320px/390px layouts have no horizontal overflow and keep the crop surface and sticky dock usable.
- [x] Build, 56 unit tests, Chrome/Edge focused experience and palette parity, real 12-month export progress, and Chrome dialog-focus checks pass.
- [ ] Product Owner accepts Landing, month switching and smart palette experience on the current LAN site; post-upgrade real iPhone/iPad Safari smoke remains to be recorded.
- [ ] Formal Session 08 release acceptance and production deployment remain separate gates.


## V1.1 Part 1 — additional acceptance, pending Product Owner review

- [x] The Editor offers the ten named fixed background colors specified in the V1.1 request; one click updates the active month Preview and existing Auto ink logic. Arbitrary picker/HEX/RGB remains.
- [x] A ready month still presents three distinct current-crop photo suggestions with label, swatch, HEX and selected state.
- [x] Six bounded texture choices appear after Background Color on desktop and inside the phone Background sheet. Existing saved projects default to no texture; choosing one persists per month.
- [x] Texture is limited to the lower calendar background, never the photo. Preview and digital/print PNG/JPG use the same tile; print calendar bleed continues the texture.
- [x] Existing four-screen workflow, crop gestures, English calendar output, typography, Important Date and full-set ZIP export remain functional in isolated Windows Chrome/Edge production-preview regression.
- [ ] Product Owner hands-on visual and iPhone Safari review of this V1.1 patch. This review does not waive the outstanding V1 Session 08 release criteria.
## V1.1 Editor layout acceptance (2026-09-25)

The first Editor level has a dominant month proof and a short quick rail with month status, crop/photo, current background, three visible photo recommendations, and ten fixed color swatches. The next level contains Style (HEX/RGB, six textures, calendar typography/size/ink), Dates (important-day controls), and Export (use, format, current-month file, Review whole-set palette entry). All existing actions remain keyboard reachable and work at 320 px phone width. The existing date-hover presentation remains unchanged.
## Editor refinement after hierarchy review (2026-09-25)

Acceptance now expects round common-color and photo-recommendation samples, precise HEX/RGB and picker in the desktop rail/phone background sheet, lower Style and Dates, and a standalone Export section last. The prior criterion locating HEX/RGB in lower Style is superseded. Calendar artwork, selected colors, date hover and export data stay unchanged.
## Compact Editor control acceptance (2026-09-25)

The current Background section is a default-collapsed three-row palette, no more than approximately 200 px high, with three photo colors, ten horizontally scrolling fixed colors, an available precise pixel picker, and a Custom reveal for HEX/RGB/native color. No current-color card or visible color-value labels are required in the collapsed state. Texture stays in one 40 px thumbnail strip with Clear and name tooltips. The earlier 2 × 5 fixed-color grid and six large texture cards are superseded.

## V1.1 Editor continuous-rail acceptance — 2026-09-25

- At desktop widths (at least 1024px), the proof stays visible while scrolling the ordered Photo, Background, Text Color, Style, Date rail; its visible workspace fits within viewport height minus 48px without distorting the artwork.
- Below 1024px, the rail stacks after the static proof with the same control order and no horizontal overflow.
- The old lower Style/Date cards are absent. Export follows the main layout as a separate final section.
- The compact background palette is at most approximately 200px when collapsed; texture choices occupy one row. Text Color Auto/Custom and its existing low-contrast warning update correctly after background changes.
- Crop, typography, texture, important dates, and PNG/JPG exports retain their current behavior and stored fields.

## V1.1 desktop Editor refinement acceptance — 2026-09-25

- Desktop widths 1280, 1440 and 1920 have no horizontal overflow; month navigator height is 56px, inspector width is 320px, canvas padding is 48px, and export options sit beside a 360px whole-set palette column.
- Existing whole-page scroll and sticky proof remain. There is no new nested inspector scrollbar. The export section is reachable by normal document scroll.
- At 800px viewport height the artwork is about 72vh, and the first inspector section is visible. See the geometric **OPEN QUESTION** in the change request about fitting the entire padded canvas above the initial fold.
- Background swatches wrap; texture Clear is in its field header; segmented typography and compact export radio rows preserve existing selections, warnings and outputs.
- Grid is hidden at rest, appears while the photo is dragged, then fades. Calendar, crop, date, persistence, PNG/JPG and ZIP logic remain unchanged.

### V1.1 retro type and linen paper acceptance (2026-09-25)

Editor offers four curated project-wide Calendar font presets including **复古**, plus seven per-month texture choices including **亚麻纸**. The selected font loads locally for proof and PNG/JPG; the new texture appears in the lower calendar area in proof/export and does not affect the photo. The current-month export chevron is centered inside its existing compact button. Earlier three-font/six-texture references are superseded for the current build.

### Tracing-paper replacement acceptance (2026-09-25)

The seventh texture is labeled **硫酸纸**; 亚麻纸 is absent from the active UI. Proof and PNG/JPG show the same satin-paper treatment below the photo only. Existing saved `linen` selections restore as `vellum`; missing texture still restores as none. Other calendar controls and export geometry remain unchanged.

## V1.1 波点纹理验收补充（2026-09-25）

The previously named 细点阵 option is now 波点. It remains the same stored `dots` choice. The small preview, Calendar proof and print/digital renderer must use the same sparse staggered pattern on the calendar background only; the photo region is unchanged and date legibility is retained. Existing saved `dots` selections restore as 波点 without migration. All circles remain whole at the calendar trim edges; print bleed carries the solid background without partial circles at the file edge. Colored backgrounds use soft white dots, while near-white backgrounds retain visible low-opacity dark dots; calendar text color is unaffected.

## Current sticky workspace navigation (2026-09-25)

Assign, Editor and Review keep the existing three-stage Header accessible after scroll. Landing Header remains non-sticky. On phones the current-stage menu stays reachable in the compact Header while the month selector scrolls normally. Editor desktop proof remains visible below the Header, including at short viewport heights. Navigation routes, month selection and export behavior stay unchanged.

## V1.1 Part 2A mark-style acceptance (2026-09-25)

- [x] Project-wide `importantMarkStyle` has only red, circle and dot; the third choice displays as 星号 and restores existing `dot` saves; switching it preserves each month's marked days.
- [x] Legacy projects missing the field restore as red, while an invalid stored choice is rejected.
- [x] Editor proof, Review proof and PNG/JPG export apply the same style without changing photo or output geometry in bounded Chrome/Edge checks.
- [x] The compact choice stays inside the existing Date settings section and fits 320px without horizontal overflow.
- [x] At large date typography, the circle and upper-right asterisk remain within their marked date row in Editor/Review proof and PNG/JPG output.

The earlier red-only acceptance criterion is the historical V1 baseline and is superseded only for this optional presentation choice. Product Owner visual/device acceptance and Session 08 release checks remain open.

## V1.1 six-row Handwritten Large proof fit (2026-09-25)

- [x] January, May and October 2027 show the full sixth date row within the Calendar proof when Handwritten and Large are selected.
- [x] The same proof remains inside its edge at 390px and 320px, without horizontal overflow.
- [x] Calendar dimensions, marked-day data and PNG/JPG export coordinates remain unchanged.

Product Owner device/visual acceptance remains open.

## V1.1 current-month photo effects (2026-09-25)

- [x] The Editor shows five compact effect previews. Clicking one changes only the current month's photo; the three fixed duotone pairs are available under 双色映射.
- [x] Existing saves missing the effect render as 原图; valid per-month selections survive save/restore and invalid effect IDs are rejected.
- [x] Editor, Review and PNG/JPG use the same treatment code. It is confined to the photo region, including print bleed; calendar background, texture and text remain unchanged.
- [x] Chrome/Edge automated checks cover four export combinations, month isolation, restore and 390px layout.
- [ ] Product Owner visual assessment on actual photos and real iPhone/iPad crop/export smoke remain open.

## V1.1 Editor hierarchy and duotone follow-up (2026-09-25)

- [x] The Editor keeps Photo, Effect and Background visible; precise picker/HEX/RGB starts collapsed and can stay expanded during the Editor session.
- [x] Typography contains Font → Scale → Text Color; Auto hides Custom HEX/picker, while Custom retains the low-contrast warning.
- [x] Fine Tune starts open and Mark starts closed. Their toggles are independent; closed Mark reports the current month's marked-day count without showing the date grid.
- [x] Six owner-specified duotone pairs and one shadow/highlight swap are available. The swap reverses the preview label, persists per month, and uses the same luminance mapping in Editor, Review and PNG/JPG export.
- [x] Isolated Chrome/Edge browser checks cover state, export and 390px layout; 64 unit tests and build pass.
- [ ] Product Owner visual/device review remains open.

## V1.1 Sidebar micro polish (2026-09-26)

- [x] Mark header shows `未标记` or live `已标记 X 天 · 样式`, without a second status beneath the date grid.
- [x] Simple date-grid targets measure 36–40 px desktop and at least 44 px at 390px and 320px phone widths, with visible keyboard focus and no horizontal overflow.
- [x] Closed Fine Tune shows texture/type/scale; Auto Text Color hides HEX and Custom warns only for low contrast.
- [x] Build, 64 unit tests and isolated Chrome/Edge Editor regressions pass.
- [ ] Product Owner device/visual review remains open.

## V1.1 Review / Export final UX polish (2026-09-26)

- [x] Every Review card directly opens its month Editor by mouse, keyboard or tap, with no persistent selected state.
- [x] The 12/12 Review header favors 编辑月份; incomplete projects retain 分配照片.
- [x] Palette modal labels say 当前背景 / 推荐背景; its edit action names the previewed month and its Cancel/Apply actions state their effects.
- [x] Apply count and explanation derive from actual proposed/current color comparisons; persisted one-operation undo still works after reload.
- [x] The final primary action reads 生成整套 12 张, with use/format choices preserved.
- [x] Build, 64 unit tests and isolated Chrome/Edge full-workflow regressions pass.
- [ ] Product Owner device/visual review remains open.

## V1.1 phone Editor proof spacing (2026-09-26)

- [x] At 390px and 320px, the month title has visible separation from weekday/date rows for January, May, August and October, including Large typography.
- [x] Six-row last dates remain inside the proof and the page has no horizontal overflow.
- [x] Review thumbnails, output geometry and saved state remain unchanged.
- [ ] Product Owner iPhone visual confirmation remains open.

## Session 08 Product Owner acceptance — 2026-09-26

The Product Owner explicitly accepted the current Calendar Design Studio project for Session 08 on 2026-09-26. This is acceptance of the current product/workflow after the owner reported the other iPhone functions normal. The photo-top pale band traced to a white source-image edge was deferred by the owner; the focused edge-warning correction passed Chrome/Edge regression, but the affected file has not been re-exported and checked on iPhone. This remains a known exception, not a PASS.

Formal evidence rows retain their actual status: macOS Safari/Chrome/Edge and Android Chrome NOT TESTED; named-printer proof and current-stable Safari PARTIAL/NOT TESTED as recorded; Auto contrast and low-resolution-warning decisions OPEN. Product Owner acceptance does not convert these to PASS, nominate a Release Candidate, authorize production deployment, or begin the next gate. Deployment requires a separate explicit decision.
