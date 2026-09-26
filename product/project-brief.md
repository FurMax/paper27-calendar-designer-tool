# Calendar Design Studio — Project Brief

**Stage:** Session 01 — Product Discovery  
**Status:** Approved / Complete  
**Gate:** Passed with Product Owner approval on 2026-09-14  
**Next authorized stage:** Session 02 — IA / UX, in a new Codex session

## Original Product Idea — Superseded Context

Calendar Design Studio is a web product for quickly making a visually coherent, downloadable 12-month calendar image set from a reusable calendar system and the user's own images.

The project began with this broader workflow hypothesis:

1. Upload photos or images.
2. Choose a Calendar System / Visual Template.
3. Design the overall visual style once.
4. Generate all 12 months automatically with correct dates.
5. Make month-specific adjustments.
6. Export the finished calendar.

The confirmed V1 below supersedes template selection and automatic whole-year creative generation. Its refined value is **“Prepare photos once → personalize each month within one consistent calendar system.”** The system maintains date correctness, visual consistency, and January-to-December organization; it does not make creative choices or finish all 12 compositions automatically.

Users may skip a month and return later. A month becomes exportable once one photo has been selected; the centered/default crop and white background are valid defaults. Full-set generation becomes available only after all 12 months have photos.

## Observed Problem

Many calendar designs reuse one layout system from January through December, yet creators repeatedly change the month, verify dates, replace and crop images, adjust colors and headings, and manually preserve spacing and typography consistency. The product aims to remove this repetitive production work without becoming a general-purpose freeform design tool.

## Why Not a General-Purpose Design Tool

The V1 positioning hypothesis is not that Canva or a similar tool is incapable of producing a calendar. The expected friction is that a non-designer must still understand the template, preserve layout consistency across 12 pages, verify every month's dates, perform precision editing in a general-purpose canvas, and organize the outputs.

Calendar Design Studio owns the calendar-specific system: correct 2027 dates, a consistent constrained layout, and January-to-December organization. The user selects photos, assigns them to months, adjusts each month's crop, position, background, and unified calendar text color, and chooses one font preset for the whole set.

This is an explicit product hypothesis, not yet a claim validated through external user research.

## Primary V1 User — Confirmed

The primary V1 user is a fandom user who has collected many favorite celebrity photos and wants to turn them into downloadable calendar images. They may have no computer and no visual-design skills.

The essential visual expectation is that the selected photo and the calendar's overall color treatment can feel cohesive. V1 lets the user choose one arbitrary solid background color for each month, starting from white. Calendar text color defaults to Auto, which chooses contrasting black or white; Custom lets the user choose one color for the entire month title, year, weekday, and date system. Low contrast in Custom shows a non-blocking warning. The original V1 baseline excluded gradients, textures, background images, and multiple background-color regions. V1.1 Part 1 adds only six restrained per-month textures to the calendar area beneath the photo; gradients, background images, and freely editable regions remain excluded. The default background remains white. Optional photo-derived recommendations appear in each ready month’s Background Color controls and apply only when chosen.

## Calendar-System Direction

V1 has one confirmed calendar system and one fixed visual template. Do not design template selection or multiple editing systems into V1.

### V1 — Standard Photo Calendar

Each monthly image uses a constrained top-and-bottom composition:

- Upper area: exactly one primary photo
- Lower area: a normal monthly calendar/date section
- Whole card: a coordinated overall background color treatment

The **editable 1200 × 1800 px trim composition** is portrait 2:3. The default print PNG additionally includes bleed outside a 100 × 150 mm physical trim. Its upper Photo Region and lower Calendar Region are independent, stacked regions. The Photo Region spans the complete output width, edge to edge. Its assigned photo uses cover scaling plus crop/reposition to fill that fixed region: no side gutters, background border, letterboxing, smaller centered image, or exposed blank area. The lower Calendar Region uses the month's selected solid background color and retains the English calendar output. The Photo Region itself is not required to be 2:3.

The date section is not required to provide large writable cells in V1.

The compact calendar always uses six date rows. Months that need only five rows leave the unused final positions blank so the layout remains identical across all 12 images.

V1 uses the same normal text color for weekdays and weekends; Saturday and Sunday are not highlighted. Beginning in P1, red is reserved for user-selected important fandom dates.

The fixed-shape photo slot supports replacing the image, dragging to reposition it, and zooming it within the crop. Touch users can single-finger drag and pinch-zoom; desktop users can pointer/mouse drag and use an explicit zoom control. All offsets are clamped so the fixed Photo Region stays fully covered; Reset returns to centered fill. V1 does not support changing the crop ratio, rotating images, filters, retouching, or multi-photo collage.

The same source photo may be used in multiple months. Replacing a month's photo resets its crop to the centered default while preserving any manually chosen background color. Portrait, landscape, square, and extreme-aspect-ratio photos remain usable by scaling to fill the fixed crop area without exposing empty space.

### V1 — Bulk Photo Selection and Manual Assignment

- The user can select up to 12 photos in one system-picker action.
- The photos are initially assigned to January through December in the order returned from the user's selection.
- A simple Month Assignment step shows one photo slot for each month.
- The user can swap two months' photos, reassign a photo to another month, move a month's photo into Unassigned Photos, or replace one month's photo individually.
- Fewer than 12 selected photos do not block entry into monthly editing. Missing months remain incomplete and can receive photos later.
- Individual month selection remains available for missing photos, replacement, and as a mobile fallback when multi-selection is unavailable.
- This is deterministic ordering plus manual assignment, not AI or content-based month selection.

`Unassigned Photos` is a lightweight temporary area within the active project for selected photos that are not currently assigned to a month. Removing a photo from a month moves it there. The user can later reassign it to any month. Only an explicit delete from Unassigned Photos removes it from the active project. This area is not a media library, asset manager, folder system, or reusable photo library.

Month Assignment remains available after monthly crop/color editing begins. Whenever a month's photo changes through replacement, swap, or reassignment, that month's crop, position, and zoom reset to centered fill for the new photo. Its manually chosen background color remains because background color belongs to the month, not the photo. Crop settings from the old photo never migrate to the new photo.

The user cannot change the photo-to-calendar proportion, move the calendar region, or select an alternative layout in V1.

P2 is expected to add more visual templates. This does not add a V1 template selector, but it creates a handoff constraint for the later Technical Architecture stage: template layout and visual constants should not be scattered as unstructured hardcoded values across multiple UI components. No technical solution is selected during Product Discovery.

V1 offers three curated Calendar typography presets. Each is a complete English month/year/weekday/date system and may internally use different font files, weights, and spacing; the user cannot edit those roles individually. A separate project-wide Small / Standard / Large scale preset defaults to Standard without changing the fixed calendar layout. Individual month typography overrides, font upload, free px sliders, and advanced typography controls are excluded. Prototype font candidates are temporary. Technical Validation must verify license compatibility, webfont loading and size, Safari compatibility, and stable PNG text rendering before final font names are selected.

### P1 — Important Fandom Dates

Digital important-date marking is excluded from V1 and committed for P1. Users can choose important fandom dates such as an artist's birthday, debut anniversary, and album anniversary. Only the date number is rendered in red; the event name or reason is not printed on the exported calendar.

### P2 — Grid / Writable Calendar

A visual area is paired with a true day-cell grid. Possible future behaviors include birthdays, anniversaries, short notes, markers, and circled dates. Its rules may include week start, weekend emphasis, grid-line style, cell size, visual-to-grid ratio, fixed or variable rows, accents, and cell notes.

The printed day cells may be used for handwriting the owner's daily plans. Ordinary plans remain outside the digital editor.

## Confirmed Constraints

- The product is not intended to be a low-feature Canva or a blank infinite canvas.
- The product is opened and used through a web browser on either a computer or a mobile device; it is not mobile-only.
- Desktop-browser users can complete the full workflow.
- Both iPhone and Android phone users must be able to complete the full core workflow—from selecting images through creating, adjusting, and exporting all 12 months—without a computer.
- Formal V1 QA covers current stable Chrome and Edge on Windows/macOS, Safari on macOS, Safari on iPhone/iPad, and Chrome on Android, measured at release time.
- Other browsers, including Firefox, are best-effort and do not block V1 release.
- Phone portrait orientation is the primary mobile workflow. Phone landscape remains operable but does not require a separately optimized editing layout.
- iPad portrait and landscape orientations both support the full workflow. Desktop adapts to the browser window width.
- The Product Discovery gate must pass before IA/UX or technical architecture begins.
- Formal business/application code is out of scope for this session.
- Product UI Language: **Simplified Chinese** for all website/editor navigation, actions, status, help, sheets, dialogs, errors, and export feedback.
- Calendar Output Language: **English** for the Calendar Proof and future PNG/ZIP output, including month names and Sunday-first weekday labels; year and dates remain Arabic numerals. No V1 language switcher is required.
- V1 calendars are Sunday-first; no week-start switcher is required.
- V1 supports the year 2027 only. A new project uses 2027 and does not need a year selector.
- V1 project progress—including Month Assignment and Unassigned Photos—is stored locally in the current browser and can be restored after the page or browser is closed and reopened on the same device/browser.
- V1 has no account, cloud storage, cross-device sync, or cross-browser restore.
- Clearing site data, private-browsing behavior, or operating-system/browser storage eviction may remove local projects; this limitation must be communicated.
- V1 stores one active local project only. Starting a new project requires explicit confirmation that the existing draft will be replaced.
- Mobile-browser users can bulk-select up to 12 photos from the device's system photo library, with individual month selection as a supplement or fallback.
- Desktop-browser users can bulk-select up to 12 images from local system folders, with individual month selection for later additions or replacement.
- V1 does not require direct camera capture, URL import, social-platform import, or cloud-drive import.

## Confirmed V1 Non-goals

- Freeform/infinite canvas, complex layers, or arbitrary object positioning
- Accounts, cloud sync, or collaboration
- Community or marketplace features
- AI image generation or AI automatic calendar design
- Large template catalog
- Multiple-project management
- Physical printing service, print ordering, or vendor-specific prepress workflows

## Candidate Use Cases

- **Primary V1:** Fandom users with a collection of favorite celebrity photos who want to turn them into downloadable calendar images but may have no computer and no visual-design skills
- Photography enthusiasts who habitually take photos and want to curate favorite images into a calendar
- Journaling and lifestyle enthusiasts who enjoy documenting everyday life
- Couple or friend commemorative calendar
- Pet calendar
- Personal photo calendar
- Small-run cultural or creative product
- Printable desk or wall calendar
- Social-sharing calendar

## Confirmed V1 Output

The expected product output is a set of **12 separate downloadable images in the selected PNG or JPG format, one per calendar month**. It is not one image containing the entire year.

The confirmed trimmed V1 composition is a **portrait 2:3, 100 × 150 mm postcard-style format**.

Each V1 month offers a default **1252 × 1843 px, 300 PPI print image (PNG or JPG)** representing approximately **106 × 156 mm** with approximately 3 mm bleed around a **100 × 150 mm trim**, plus an optional **1200 × 1800 px digital image (PNG or JPG)**. Each month can be downloaded individually. A distinct **Generate Full Set / 生成整套 12 张** action generates January–December as twelve separate images of the selected variant and format. One ZIP packages those files for desktop and mobile delivery; the user opens/extracts it in Files/Downloads on phone. ZIP is not the output definition. The Product Owner selected ZIP as V1 mobile primary handoff and deferred multi-file Share and one-action direct iPhone Photos beyond V1 in Session 08. The flow does not automatically start twelve browser downloads. A cover is outside V1. Physical printing services, vendor-specific prepress, CMYK and universal printer acceptance remain outside V1. Bookmark-size output is post-V1.

## OPEN QUESTIONS

No Product Discovery question blocks Session 02. Interaction design questions are handed off to IA / UX, and feasibility/compatibility checks are handed off to Technical Validation as recorded in the acceptance criteria.

## Session 08 export format and photo-edge amendment

The Product Owner approved a PNG/JPG choice for both sizes and both export paths. PNG remains the default. The full-set ZIP contains twelve files in the one selected format. Print JPG is RGB with 300 PPI metadata; the stated printer requirements allow RGB, while named-provider acceptance is still unverified. The image renderer must cover fractional crop edges without app-created white fringes. Print photo bleed uses real source pixels, with the minimum additional cover scale reflected in print Preview; the saved crop and digital output remain unchanged. The editor and full-set preflight warn about broad white/light bands already visible within a photo crop and offer zoom/reposition guidance; intentional pale photo backgrounds may be left unchanged.


## V1 Enhancement direction

The Product Owner directed a restrained Calendar Design Desk polish patch: the user's twelve calendar pages remain the visual focus, while the workspace, brand typography and interaction accent become more distinctive. Optional photo-based single-month and full-set color suggestions support, but do not replace, manual styling. A tightly scoped 2027 important-date number mark is the only product-scope addition. The patch is awaiting Product Owner experience review and does not advance the release gate.
