# Calendar Design Studio — Product Requirements Document

**Status:** Approved / Complete  
**Completed session:** 01 — Product Discovery  
**Product Discovery Gate:** Passed with Product Owner approval on 2026-09-14  
**Next authorized stage:** Session 02 — IA / UX, in a new Codex session

## 1. Product Outcome

Help a user turn their own images and one coherent visual system into a correct, editable 12-month calendar with substantially less repetition than designing 12 independent pages.

V1 lets the user prepare up to 12 photos once, manually assign them to months, and then personalize crop, position, background color, and unified Calendar text color month by month within one fixed structural system. One curated Calendar Font preset applies to the full 12-month set. It does not automatically make creative choices or complete all 12 compositions.

## 2. Users and Jobs

### Primary V1 User — Confirmed

A fandom user who has many favorite celebrity photos, may have no computer or visual-design skills, and wants to turn those photos into downloadable calendar images.

Photography enthusiasts and journaling/lifestyle enthusiasts are secondary audiences and must not drive V1 tradeoffs when their needs conflict with the primary fandom use case.

The primary job is: use a desktop or mobile browser to prepare favorite celebrity photos once, manually assign them to months, and personalize each month within one consistent 2027 calendar system—without designing or verifying 12 calendar pages manually. A computer is supported but not required.

The visual result lets the user coordinate each selected photo with that month's background. Manual background-color adjustment is required. The baseline default is white. Automatically deriving a default from the photo is optional and depends on a later feasibility check; it must not block V1.

### Positioning Against General-Purpose Design Tools

V1 removes calendar-specific work rather than competing on freeform design breadth:

- The product owns correct 2027 dates.
- The product owns one consistent layout and a project-wide selected Calendar Font preset across 12 months.
- The product owns January-to-December organization, including a Month Assignment step.
- The user owns photo selection, month assignment, crop/position, monthly background and unified text color, and one Calendar Font preset for the set.

The hypothesis is that this is easier for a non-designer than maintaining 12 pages in a general-purpose canvas. This positioning has not yet been validated through external user research.

## 3. Confirmed V1 End-to-End Journey

The complete V1 first-use task is:

1. Start a 2027 calendar project; V1 does not ask the user to choose a year.
2. Enter the single fixed V1 Standard Photo Calendar; there is no template-selection step.
3. Select up to 12 photos in one system photo/file picker action.
4. Enter Month Assignment, where photos are initially mapped to January through December in selection order.
5. Review the mapping and optionally swap, reassign, remove, or individually replace photos.
6. Continue even if fewer than 12 months have photos; missing months remain incomplete.
7. Work through January to December one monthly card at a time, optionally adjusting crop, position, background color, and unified text color; one selected Calendar Font preset applies across the set.
8. Add missing photos or replace an assigned photo through the individual month picker when needed.
9. Review the set of 12 monthly cards.
10. Download any complete month as PNG or JPG or generate the full set of 12 monthly images in the chosen format after all months have photos. Desktop and mobile receive one ZIP containing twelve separate files of the chosen format; on mobile the user opens or extracts it in Files/Downloads.
11. Preserve the project locally for later editing.

This flow was confirmed by the product owner during Product Discovery.

**Session 05 export-handoff feasibility escalation (2026-09-23):** The Product Owner subsequently required an iPhone action that saves a generated PNG directly into Photos without a second manual step. The isolated Safari test generated an openable PNG and at least one actual download to iCloud Drive → Downloads; the specific download entrance is not identified. Neither ordinary file download nor opening and then manually saving demonstrates direct Photos import. The existing V1 browser-only constraint and the requested direct-Photos outcome now have an **OPEN QUESTION** about technical compatibility. No alternate mobile handoff or platform change is approved by this note. See `docs/technical-validation.md` and `qa/ios-technical-validation.md` before Technical Design.

**Session 08 resolution (2026-09-23):** After a real iPhone ZIP download to iCloud Drive / Downloads and inspection of all twelve extracted PNGs, the Product Owner selected ZIP as the V1 mobile primary handoff and explicitly removed multi-file Share and one-action direct Photos from V1 acceptance. The Session 05 request remains historical context; it is not a V1 release gate.

### Completion Rules — Confirmed

- The user can skip a month and return to it later.
- Month Assignment and monthly editing show which months already have an assigned photo.
- A month becomes eligible for individual PNG download once it has one assigned photo.
- The default centered crop and white background are valid; manual crop or color adjustment is not required for completion.
- Full-set generation of 12 monthly images in the chosen format is available only after all 12 months have assigned photos.

## 4. Editing Model

### Project-Wide Constants — Confirmed

The following are fixed across all 12 months in V1:

- Calendar year fixed to 2027 in V1
- Sunday-first week rule
- Output size and orientation
- Fixed Standard Photo Calendar structure and photo-to-date-area proportion
- One curated Calendar typography preset and one Small/Standard/Large typography scale shared across the set, with fixed calendar structure and no per-month typography override
- The visual rule that important dates use red when the P1 feature is added

Year, week start, layout structure, and date placement have no user-facing controls. Export offers only the approved print/digital output variants. The limited project-wide typography and scale presets do not change structural proportions; no single month may override them.

### V1 Calendar Font Presets — Controlled V1 Change, 2026-09-23

- The user chooses from approximately two or three curated English Calendar Font presets; the selected preset applies consistently to all 12 months.
- The preset controls the month heading, year, weekday labels, and date numbers as one Calendar typography system; its internal roles may use different font files, weights, and spacing. Users cannot edit those roles separately.
- A project-wide Small / Standard / Large typography scale is available, defaulting to Standard. It is a constrained preset, not a free px slider, and keeps the fixed calendar layout intact.
- The Product UI uses a separate, readable Simplified Chinese UI font and is unaffected by this choice.
- V1 excludes font upload, an unlimited font library, free size sliders, weight/spacing editors, and per-month or per-text-role typography overrides.
- Prototype candidates are temporary. Final names depend on Technical Validation of free commercial licensing, webfont loading and size, Safari compatibility, and stable PNG export rendering.

### Month-Level Content — Confirmed

The following are edited independently for each month:

- Primary photo
- Photo crop and position
- Background color chosen to coordinate with that month's photo
- Calendar text color mode (Auto or Custom), with one optional Custom color for the entire month's text system
- Important dates belonging to that month beginning in P1

### No Apply-Style-to-All Action in V1

V1 does not need a broad “Apply Style to All” action because the selected Calendar Font preset already applies across the set. Month-level photo, crop, background, and unified text color remain independent.

### Photo-Coordinated Background

- **Required:** The user can manually adjust the background color for each month.
- **Required:** The selected background is one arbitrary solid color.
- **Required fallback:** If no reliable automatic suggestion is implemented, a new month starts with a white background.
- **Conditional P1:** If a later feasibility check shows that it is simple and reliable across supported browsers, the system may generate a default background color from the photo's main color family. This is not a V1 requirement.
- Auto is the default Calendar text-color mode and selects contrasting black or white for the current background.
- In Auto, changing the background recalculates the text color for month title, year, weekdays, and dates together.
- Custom accepts an arbitrary color through a picker and HEX input and applies it to the same four text roles together. A low-contrast Custom choice shows a non-blocking warning without changing the user's color.
- The text-color mode and Custom value belong to the month and survive photo replacement and reassignment.
- The exact color-analysis approach and any library choice are outside Product Discovery.

The original V1 baseline excluded gradients, textures, background images, and multiple background-color regions. V1.1 Part 1 explicitly adds six fixed low-opacity textures to the lower calendar background only; gradients, image-based backgrounds and freely editable regions remain excluded. The exact color-picker interaction is an IA/UI decision.

If automatic suggestion is included, replacing the photo should recompute the color only while the month is still using an automatic value. A user's manual color choice must not be silently overwritten.

V1 does not include year selection or year changes. Support for 2028, 2029, and broader year selection is post-V1.

## 5. Calendar-System Requirements

### V1 — Standard Photo Calendar

- Upper photo area containing exactly one primary photo per month
- Lower normal monthly calendar/date area
- The editable trim composition is 1200 × 1800 px portrait 2:3; the Photo Region itself is not prescribed a 2:3 ratio. Print export maps it to a 100 × 150 mm trim inside a 106 × 156 mm bleed canvas.
- The fixed upper Photo Region spans the entire output width; its image uses cover scaling/crop/reposition with no gutters, letterboxing, extra background border, or exposed blank space
- The lower Calendar Region is a separate stacked region with the selected solid background color and the existing English calendar content
- Overall background color coordinated with the photo
- Accurate month heading and dates
- Constrained customization rather than arbitrary object placement
- One fixed layout with no template selector
- Fixed photo-to-calendar proportion and calendar position
- No requirement for large writable day cells
- Photo replacement, crop, and crop repositioning
- No multi-photo collage
- Fixed-shape crop window; clamped offsets preserve full coverage and Reset returns to centered fill
- Pointer/mouse drag repositioning and an explicit zoom control on desktop
- Single-finger drag repositioning, pinch-zoom, and an explicit zoom control on touch devices
- No crop-ratio changes, rotation, filters, or photo retouching
- English-only month names, weekday headings, and calendar labels
- Simplified Chinese website/editor UI, separate from English Calendar Proof and output; no V1 language switcher
- Sunday-to-Saturday weekday order with no V1 week-start control
- Fixed six-row date layout; unused positions remain blank for months requiring only five rows
- Weekdays and weekends use the same normal date color in V1
- Saturday and Sunday receive no special highlight; red is reserved for P1 important-date marking

Exact use of full names versus abbreviations is a later template-detail decision and does not require multilingual support.

### Future Template Extensibility Constraint

V1 still ships exactly one template and has no template selector. Because P2 is expected to add more visual templates, the later Technical Architecture stage must avoid scattering this template's layout and visual constants as unstructured hardcoded values across multiple UI components. This records an extensibility boundary only; it does not select a technical design or expand V1.

V1 separates photo preparation from creative editing. The user may prepare up to 12 photos in one bulk selection and manually correct their Month Assignment, then edits crop, position, and color one month at a time. Bulk selection never performs content analysis or AI-based assignment.

The same source photo may be selected for multiple months. Whenever a month's photo changes through replacement, swap, or reassignment, crop, position, and zoom reset to centered fill for the new photo. The month's manually chosen background color remains unchanged because background color belongs to the month, not the photo. Crop settings from an old photo never migrate to a new photo. Every supported photo orientation is scaled to fill the fixed crop area without exposing empty space.

### Confirmed Image Sources

- On iPhone, iPad, and Android, the user can select up to 12 photos from the system photo library through the browser.
- On desktop, the user can select up to 12 images from local system folders through the browser.
- A photo selected from the supported mobile photo library should not require the user to perform a manual file conversion first.
- The individual picker remains available to fill a missing month, replace a month's photo, or provide a mobile fallback if multi-selection is unavailable.
- V1 does not require direct camera capture, remote URL import, social-platform import, cloud-drive import, whole-folder ingestion, or a reusable media-library system.

### Month Assignment — Confirmed

- One bulk action accepts at most 12 photos.
- Initial mapping follows the selection order: the first photo goes to January, the second to February, continuing through December.
- The user can swap the photos assigned to two months.
- The user can move/reassign a photo to another month.
- Removing a photo from a month moves it to Unassigned Photos rather than deleting it from the project.
- The user can replace one month's photo through an individual picker.
- Selecting fewer than 12 photos is valid and does not block monthly editing.
- Missing photos can be added later one month at a time.
- The assignment system does not inspect image contents, infer seasons/months, perform AI sorting, or create designs.
- Month Assignment can be reopened after monthly crop/color editing begins.

### Unassigned Photos — Confirmed

- Unassigned Photos contains photos already selected for the active project but not currently assigned to a month.
- A photo removed from a month enters Unassigned Photos and can later be assigned to any month.
- Only an explicit delete action on an Unassigned Photo removes it from the active project.
- Unassigned Photos is temporary and project-local. It is not a media library, asset manager, folder system, or reusable photo library.

### P1 — Important Fandom Dates

- Users may define artist birthdays, debut anniversaries, and album anniversaries.
- The corresponding date number is red.
- Exported calendars do not show an event name or explanation.
- The editor must still let users understand and manage marked dates.

### P2 — Grid / Writable

- Each date occupies a real cell
- A later Grid / Writable system may reconsider whether to offer a week-start setting
- Weekend, grid-line, row-count, and cell-content behavior are unresolved
- Printed cells may provide space for the user to handwrite daily plans
- Ordinary daily plans are intended to be handwritten after printing rather than managed in the digital editor

## 6. Platform and Mobile Discovery

V1 is a responsive browser-based website for both desktop and mobile and does not require a native mobile app. A phone user and a desktop-browser user must each be able to complete the full core flow—from image selection through creation, month-by-month adjustment, and export of all 12 months. The product is not mobile-only, and a computer is not mandatory.

Formal V1 browser QA uses the current stable versions available at release time:

- Chrome and Edge on Windows and macOS
- Safari on macOS
- Safari on iPhone and iPad
- Chrome on Android

Other browsers, including Firefox, are best-effort and do not block V1 release. Acceptance behavior must cover:

- Photo and file selection
- Full-flow mobile usage, including project creation, 12-month generation, review, adjustment, and export
- Touch interaction and image cropping
- Bottom-sheet or other compact editing patterns
- Software keyboard and safe-area behavior
- Portrait and landscape orientation
- On-device export and file handoff

### Orientation Requirements — Confirmed

- Phone portrait is the primary mobile editing orientation.
- Phone landscape remains operable but does not require a separate optimized layout.
- iPad portrait and landscape both support the full workflow.
- Desktop adapts to browser-window width.
- V1 has no user text-entry workflow, so software-keyboard interaction is not a core product requirement.

No technical implementation decisions are made in this document during Product Discovery.

## 7. Export and Output

The requested final artifact is a set of 12 separate downloadable monthly PNG or JPG images, with one image/card for each month. The default print variant is **1252 × 1843 px at 300 PPI** (approximately **106 × 156 mm**, including approximately 3 mm bleed on every edge around a **100 × 150 mm trim**). The optional digital variant remains **1200 × 1800 px**. The year is not condensed into one image. Bookmark output is post-V1.

V1 ends at image download/save. It supplies a bleed PNG and PPI metadata, but does not operate a printing service, place print orders, convert to CMYK/PDF, or guarantee acceptance by every print vendor.

### Confirmed Output and Download Behavior

- Any month can be downloaded individually as a PNG.
- A distinct full-set action generates January–December as **12 independent monthly images in the selected format**. ZIP is a delivery package, not the output definition.
- After the set is complete, desktop and mobile deliver the 12 selected-format monthly image files together in one ZIP. The Product Owner confirmed the iPhone 13 Safari 16.2 LAN download, extraction and opening of all twelve PNGs in Session 08; formal support-matrix QA remains open.
- ZIP entries use unambiguous `01` through `12` ordering in their filenames.
- V1 does not trigger 12 separate browser downloads as its batch behavior.
- **Session 08 approved mobile handoff:** ZIP download is the V1 primary full-set handoff on phone. The user obtains the twelve independent selected-format images by opening/extracting the ZIP in Files/Downloads. V1 does not offer multi-file Web Share as a production feature or promise direct import into iPhone Photos. One-action direct Photos is deferred beyond V1 by explicit Product Owner decision on 2026-09-23. Actual ZIP handoff still requires QA across the formal device/browser matrix.

A cover is explicitly outside V1.

## 8. Persistence

### V1 Local-Only Autosave — Confirmed

- Project progress is automatically stored in the current browser.
- Closing and reopening the page or browser on the same device and browser restores the locally saved project.
- Restored state includes bulk-selected photos needed by the active project, Unassigned Photos, month assignments, missing-month state, crop/position, monthly background and unified text-color mode/value, selected project-wide Calendar typography and scale presets, completed-month progress, and fixed project constants.
- V1 does not include accounts, cloud storage, cross-device sync, or cross-browser restore.
- Clearing site/browser data, private browsing, or browser/operating-system storage eviction may remove the project. The product must communicate this limitation rather than imply a cloud backup.
- V1 stores one active local project only; there is no project list, naming, or multi-project management.
- Starting a new project requires an explicit confirmation that the current local draft will be replaced.

## 9. Edge Cases

### V1

- Correct date and blank-cell placement in the fixed six-row 2027 layout
- Bulk selection of zero, fewer than 12, exactly 12, or more than the allowed maximum
- System pickers that do not preserve an observable selection order or do not offer multi-selection
- One or more months without an assigned photo after initial Month Assignment
- Reassignment or removal that leaves a month incomplete while retaining the removed photo in Unassigned Photos
- Moving a photo into a month that already contains another photo
- Portrait, landscape, square, very small, unreadable, or extreme-aspect-ratio images
- A mid-tone background where black and white contrast are similar
- Reuse of one source photo across multiple months; reuse is allowed
- Photo replacement, swap, or reassignment after crop and manual background edits; the changed month's crop resets and its manual background is preserved
- Mobile memory pressure or interrupted export
- ZIP failure or export requested before all 12 photos exist
- Browser refresh, local storage loss/quota exhaustion, or incomplete projects
- Conflicting edits from multiple tabs
- Starting a new project while the current local draft contains work
- English month or weekday labels that approach the available template width

### Post-V1

- Different weekday alignments and leap years when 2028/2029 are added
- Photos with no clear dominant color when showing per-month photo-derived recommendations
- Multiple P1 fandom events on the same date; one red number may represent multiple reasons
- P1 important-date red interacting with later holiday or weekend treatments
- P1 events after a later year-changing action
- Text overflow in the P2 Grid / Writable system

### Confirmed V1 Failure Responses

- If a newly selected image cannot be read, show a clear error and preserve the month's existing photo and edits.
- If an image appears low resolution, warn that the result may look unclear but allow the user to continue because V1 makes no print-quality guarantee.
- If local storage cannot save new work because capacity is insufficient, show a clear error and never silently discard the existing saved project.
- If ZIP generation or download fails, preserve the project and allow retry; individual month downloads remain available.
- If another open tab could overwrite newer local edits, the later/conflicting tab must ask the user to refresh rather than silently write over the project.
- If the supported mobile environment cannot provide bulk selection, the user can still complete the full workflow with the individual month picker.
- A selection beyond the 12-photo maximum is prevented or rejected with a clear explanation; it never silently discards an arbitrary photo.

## 10. Acceptance Status

Detailed acceptance criteria are maintained in `product/acceptance-criteria.md`. They remain provisional until the Product Discovery gate is approved.

## 11. Confirmed V1 Non-goals

- Freeform/infinite canvas, complex layers, or arbitrary object positioning
- Accounts, cloud sync, or collaboration
- Community or marketplace features
- AI image generation or AI automatic calendar design
- Large template catalog
- Multiple-project management
- Physical printing service, print ordering, or vendor-specific prepress workflows

## 12. Approved Post-V1 Priorities

### P1

- Add 2028 and 2029
- Add user-selected important fandom dates, rendered only as red date numbers without event text

### Conditional P1

- Photo-derived default background color, only if a later feasibility check finds it simple and reliable on formally supported browsers

### P2 / V2

- Expanded font library and advanced typography controls beyond the limited V1 curated presets
- Additional visual templates
- Grid / Writable calendar system
- Bookmark-size output
- Calendar cover

### Later / Unprioritized

- Broader year selection
- Multiple calendar languages
- Chinese public holidays
- Lunar calendar
- Decorative assets

## 13. Session 01 Closure and Handoffs

No Product Discovery question blocks Session 02.

- IA / UX must define the concrete Month Assignment, Unassigned Photos, swap/reassignment, explicit-delete, incomplete-month, and individual-picker interactions without expanding them into media management.
- Technical Validation must verify browser photo-picker multi-selection/order, local persistence capacity, supported image decoding, and mobile PNG/ZIP reliability.
- Technical Architecture must honor the recorded future template-extensibility constraint without adding a V1 template selector.

## Session 08 approved output amendments

The Product Owner approved an export-format choice: PNG remains the default and JPG is available for both single-month and full-set output, in print or digital size. A ZIP contains exactly twelve independently named files of the selected format. Print JPG records 300 PPI in JFIF metadata; both formats are browser-rendered RGB. The Product Owner's print requirements allow RGB, but named-provider submission and physical proof remain release QA. The supplied January and May print JPGs exposed visible light photo borders. The renderer fills fractional digital crop edges with photo pixels; print output uses genuine source-photo pixels across the full bleed with a small automatic cover adjustment shown in print Preview. Month Editor and full-set export warn when the visible crop has a broad light/white edge and guide zoom or reposition; users may continue when the light edge is intentional. See the two Session 08 change requests for the bounded correction.

**Session 08 genuine-photo print bleed correction:** The Product Owner identified mirrored content in new February/March JPGs. Print output now covers the bleed with actual source-photo pixels by a small automatic extra cover scale; print Preview and the photo sampler show the actual crop. The saved crop and digital output remain unchanged. See design/ui-ux-change-request-session-08-print-photo-bleed.md.


## V1 Enhancement / Polish Patch

A user can see three suggestions in each month’s Background Color controls, extracted from that month’s visible photo crop (with labeled tonal extensions if the photo has too few distinct colors), and optionally apply one to that month, or preview a coordinated set of month-specific suggestions for all twelve photos before applying them. The batch action records the immediately previous backgrounds for a single restore, including after browser reload; a later manual background edit ends that restore opportunity. Existing color controls remain.

A user may mark or unmark individual dates in the current 2027 month. Marked dates render as contrasting red-toned numbers in the interactive proof and exported PNG/JPG, including full-set ZIPs. No event metadata or reminders are stored. The product shell gains a quiet desk surface, Baby Blue action states and Milk Mint recommendation support, a typography wordmark slot and favicon; none enter the calendar artwork. This is a controlled V1 scope addition awaiting Product Owner review, not a release decision.

## V1 Experience Polish — Product Owner direction, 2026-09-24

The current four-screen workflow and export choices remain. Each month’s Background Color control presents three photo-derived choices with semantic labels; a visible selection updates that month’s proof and Auto text contrast. Review shows a twelve-color overview and a selectable month proof before the user confirms one batch change; a single restore remains available. Review signals a complete twelve-month set and shows month-by-month export progress. The Entry illustration shows three example calendar pages without using or exporting customer photos. These presentation changes do not change the saved calendar model, add an export format, or waive release QA. Product Owner hands-on acceptance is pending.

**Whole-set color refinement, 2026-09-24:** The batch action selects a mildly contrasting companion/accent from each month's existing cropped-photo recommendations, using a labeled tonal extension only when needed. A raw swatch that is too dark or intense is softened for use as a calendar background. The preview names the source swatch and any softening; only extraction failure uses fixed backup colors. Explicit apply and one-step restore are unchanged.

## V1 Motion / Interaction Polish — Product Owner direction, 2026-09-24

The existing four-screen tool gains only short functional feedback: one Entry calendar-stack entrance, interruptible month-switch proof/heading feedback, staggered photo-color chips, real per-month full-set analysis and export progress, a small Important Date press response, and restrained Review/button/selection states. CSS handles all motion; no GSAP or new runtime dependency is added. Reduced-motion shows final positions immediately. The UI-only change does not modify calendar artwork, crop, saved data, or PNG/JPG/ZIP output. Product Owner device review remains pending; no release or deployment decision follows from this patch.

**Entry motion timing correction, 2026-09-24:** The Product Owner found the first slowed calendar-stack entrance too fast and the second a little slow. The one-time Entry presentation now runs about 1.4 seconds overall on desktop and about 1.2 seconds on touch devices, with small ≤12px transforms and no idle loop. Quick feedback on editing, selection and real progress retains its short timing so operations stay responsive. This does not add data or export behavior. The Product Owner reviewed the current site and accepted this Entry timing on 2026-09-24.

## V1 Focused Experience Upgrade — Product Owner direction, 2026-09-24

The Product Owner directed a bounded interaction upgrade that supersedes the prior CSS-only implementation for three interactions: Entry calendar stack, Editor month switching, and Review whole-set color recommendation. Production `gsap` and `@gsap/react` may coordinate those local layers, result sequences and apply feedback. The approved IA, screen structure, project model, photo algorithm, crop, and PNG/JPG/ZIP output remain. Landing text/CTA, ordinary hover/focus, Important Date and real export progress retain their existing direct behavior. Reduced-motion shows final states immediately, and no analysis/export step waits for animation. The current implementation awaits Product Owner experience review; this does not approve release or deployment.

### V1.1 Editor current-month export entry — 2026-09-25

The Product Owner replaced the oversized Editor bottom export section with a compact title-row menu. Its four direct current-month actions preserve print/digital PNG/JPG output and do not change calendar editing state. Review continues to own twelve-month palette review and batch export. Automatic browser download is attempted after generation; a small manual download fallback remains for browsers that require renewed user activation. This is UI/interaction scope only, not a new output format or release approval.

### V1.1 type and paper refinement (2026-09-25)

A later Product Owner request adds a fourth curated English Calendar font preset (复古) and a seventh lower-calendar paper texture (亚麻纸). The older approximate two-to-three font and six-texture statements above record earlier stage scope; the current approved option counts are four and seven. Product UI language, photo area, export geometry, and existing editing flow remain unchanged.

### Paper choice correction (2026-09-25)

The seventh fixed texture is now stylized 硫酸纸 instead of 亚麻纸. It is a smooth satin/translucent visual treatment on the lower calendar area, with no photo overlay or additional editing controls. Old saved 亚麻纸 choices migrate on load.

### Current dot texture amendment (2026-09-25)

The existing `dots` texture is displayed as **波点** instead of 细点阵. It uses sparse staggered circles in the calendar region only; a saved `dots` choice needs no migration. This changes neither photo output nor the number of texture choices. See `design/ui-ux-change-request-v1-1-polka-dots.md`.

## Current workspace navigation amendment (2026-09-25)

The existing three-stage project Header remains visible while Assign, Editor or Review scrolls. Landing remains non-sticky. Phone month selection is no longer an additional sticky top bar; the compact project Header retains the current-stage menu and brand return. Calendar artwork and workflow routes are unchanged. See `design/ui-ux-change-request-v1-1-sticky-workspace-header.md`.

## V1.1 Part 2A important-date presentation (2026-09-25)

The earlier red-only Important Date statements describe the V1 baseline. The current bounded amendment adds a project-wide choice among red text, thin circle and small dot, without changing the saved day-number arrays or adding event details. Old projects remain red by default. See `design/ui-ux-change-request-v1-1-part-2a-important-marks.md`.
