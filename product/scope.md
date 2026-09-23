# Calendar Design Studio — Scope

**Status:** Approved / Complete — Product Discovery Gate Passed on 2026-09-14

## Confirmed Scope Driver

- Primary V1 audience: fandom users turning collected celebrity photos into downloadable calendar images
- User constraint: may have no computer and no visual-design skills
- Core visual outcome: photo and overall calendar colors feel cohesive
- Core output structure: 12 separate downloadable monthly PNG images
- Primary V1 canvas: portrait 2:3 postcard-style format, conceptually 10 × 15 cm
- Fixed V1 export dimensions: 1200 × 1800 px per PNG
- Product UI Language: Simplified Chinese; Calendar Output Language: English; no V1 language switcher
- Single V1 calendar system: upper photo, lower normal monthly calendar/date area, and coordinated overall background color
- Whole 1200 × 1800 output is 2:3; the fixed upper Photo Region covers the full output width edge to edge, with cover crop and no gutters, letterboxing, extra border, or exposed blank area; the lower Calendar Region is separate and uses the chosen solid background
- One fixed V1 layout with no template selector or adjustable photo-to-calendar proportion
- Exactly one primary photo per month, with replacement, crop, and crop repositioning
- Large writable Grid / Writable templates are post-V1
- Photography and journaling/lifestyle audiences are secondary and do not control V1 tradeoffs
- V1 is a responsive website usable through both desktop and mobile browsers; it is not mobile-only
- Desktop-browser users can complete the full core workflow
- iPhone and Android phone users can complete the full core workflow without a computer
- iPad Safari remains a formally supported environment
- Formal release QA covers current stable desktop Chrome/Edge/Safari, iPhone/iPad Safari, and Android Chrome; other browsers are best-effort
- Phone portrait is primary; phone landscape remains operable; iPad supports full portrait and landscape workflows; desktop responds to window width

## V1 Value Boundary

- The system owns correct 2027 dates, one consistent layout, shared selected Calendar typography/scale presets, and January-to-December organization.
- The user prepares photos once, assigns them to months, and owns each month's crop/position, background color, unified text color, and one project-wide Calendar Font preset.
- V1 value statement: **“Prepare photos once → personalize each month within one consistent calendar system.”**
- V1 competes through calendar-specific guidance and reduced repetition, not freeform design breadth.
- The comparison with general-purpose design tools is a product hypothesis and has not been externally validated.

## Confirmed V1 Scope

- Create a fixed-year 2027 project and generate its 12 months correctly; no V1 year selector
- Use a fixed Sunday-first week layout
- Standard Photo Calendar System with upper photo, lower date area, and overall background color
- Fixed six-row Sunday-first date layout with blank unused positions
- One normal date color for all weekdays and weekends; no V1 weekend highlight
- Select up to 12 photos in one system-picker action from the mobile photo library or desktop local folders
- Initially assign selected photos to January through December in selection order
- Review a simple Month Assignment step
- Swap two months' photos or move/reassign a photo to another month
- Move a removed month's photo into a project-local Unassigned Photos area
- Reassign an Unassigned Photo to any month or explicitly delete it from the active project
- Reopen Month Assignment after monthly crop/color editing begins
- Continue into monthly editing with fewer than 12 assigned photos
- Add a missing photo later through an individual month picker
- Return to a completed month and replace its photo
- Reuse the same source photo in multiple months
- Skip an unfinished month, return later, and see which months have photos
- Crop and reposition each month's single image by pointer/mouse drag on desktop and single-finger drag on touch, with clamped offsets and no uncovered Photo Region
- Zoom the photo within the fixed crop using an explicit control on both platforms or touch pinch gesture; Reset returns to centered fill
- Reset crop/position/zoom to centered fill whenever a month's photo changes through replacement, swap, or reassignment, while preserving that month's manually chosen background color
- Choose one arbitrary solid background color for each month, defaulting to white
- Default to Auto Calendar text color, using contrasting black or white across month title, year, weekdays, and dates together
- Let the user choose one Custom Calendar text color for those four roles per month, with a non-blocking warning for low contrast
- Choose from three curated Calendar typography presets and Small / Standard / Large scale presets; each selection applies consistently across all 12 months, with Standard size as the default
- Keep the Simplified Chinese Product UI font independent from the English Calendar Font preset
- Download/save any single month as PNG
- **OPEN QUESTION — Session 05 mobile Photos handoff feasibility:** On 2026-09-23 the Product Owner specified one action that saves the PNG directly into the iPhone Photos library, without a second manual Save step. The Product Owner found a downloaded PNG in iCloud Drive → Downloads after trying both isolated Safari download entrances, confirming at least one real file download; which entrance produced it is unknown. Open PNG followed by Save to Photos also works as an observed manual route, but neither route directly saves into Photos. The existing browser-only V1 platform constraint remains approved, and compatibility with the newly stated one-action Photos requirement is unproven. Do not silently substitute a Share Sheet or Open→Save flow, or expand V1 to a native app without an explicit product decision.
- Generate the full January–December set as 12 independent monthly PNGs through a distinct full-set action; ZIP is a delivery package, not the output definition
- Deliver the complete set on desktop through a ZIP containing those 12 PNGs with `01` through `12` filename ordering; mobile full-set handoff remains an **OPEN TECHNICAL QUESTION** pending trusted-HTTPS iPhone/iPad testing of multi-file Share/Save and fallbacks
- Automatically save project data and images in the current browser
- Restore the local project, including Unassigned Photos and Month Assignment, after closing and reopening the same browser on the same device
- Keep one active local project and confirm before a new project replaces it

Bulk photo selection plus deterministic initial ordering and manual Month Assignment is part of V1. Content-based assignment, AI ordering, and AI design are not.

A broad “Apply Style to All” action is not required in V1. The selected Calendar Font preset is already shared across the set. Month-level photo, crop, background, and unified text color remain independent.

A month is individually downloadable after a photo is assigned. Full-set generation requires photos for all 12 months. Do not automatically trigger 12 independent browser downloads. Default crop and white background count as valid completed values.

## Confirmed V1 Non-goals

- Figma-style infinite canvas
- Canva-style complex layer system
- Arbitrary absolute positioning of objects
- Backend account system
- Cloud sync
- Multi-user collaboration
- Community features
- Marketplace
- AI image generation
- AI automatic design of an entire calendar
- Large template catalog

These non-goals are confirmed. Do not add them to V1 without reopening Product Discovery and obtaining an explicit scope decision.

## Excluded From the Current Digital-Editing Direction

- General daily-plan entry in the website editor; users may handwrite ordinary plans after printing
- Full calendar/task-management behavior
- Multi-photo collage or multiple image layers within one monthly card
- Crop-ratio changes, image rotation, filters, and photo retouching
- Gradient, textured, image-based, or multi-region backgrounds
- Separate text colors for month, year, weekdays, or dates; complex text styling
- Per-month font overrides, template proportions, or date-layout overrides
- A broad Apply Style to All command that can overwrite month-level photos, crops, colors, or important dates
- Font upload, unlimited font libraries, free px size sliders, advanced typography editing, or per-month typography overrides
- Template selection, alternative layouts, repositioning the calendar region, or changing the photo-to-calendar proportion
- Physical printing or print ordering
- Print-vendor-specific output, bleed, CMYK, and physical-size/DPI guarantees
- Print-ready PDF
- Account-based storage, cloud backup, cross-device sync, and cross-browser restore
- Multiple named projects, project lists, and local project management
- Direct camera capture, image URL import, social-platform import, cloud-drive import, whole-folder ingestion, and reusable media-library management
- Content-based month inference, AI photo sorting, AI assignment, or AI design

## Future Technical Design Constraint — No V1 Scope Expansion

V1 still has one template and no template selector. Because P2 will add more visual templates, the later Technical Architecture stage must avoid scattering template layout and visual constants as unstructured hardcoded values across multiple UI components. This is an extensibility constraint, not a technical solution and not an additional V1 feature.

## Final V1 Assignment Semantics

- Unassigned Photos is a lightweight temporary collection of selected-but-unassigned photos inside the one active project.
- Removing an assigned photo moves it to Unassigned Photos; only explicit deletion removes it from the active project.
- Month Assignment can be reopened after crop/color editing begins.
- Background color belongs to the month. It survives photo changes.
- Crop, position, and zoom belong to the current month-photo pairing and reset to centered fill whenever that month's photo changes.
- Unassigned Photos must not expand into a media library, asset manager, folder system, or reusable photo library.

No Product Discovery question blocks Session 02.

## Post-V1 Priorities

### P1 — Committed

- Support 2028 and 2029 in addition to 2027
- Custom important fandom dates, including artist birthdays, debut anniversaries, and album anniversaries
- Exported treatment is only a red date number, without event text

### P1 — Conditional

- Automatically generate a default monthly background color from the selected photo's main color family
- Include only if a later technical feasibility check finds the behavior simple, reliable, and compatible with formally supported browsers; otherwise keep the white V1 fallback and defer it

### P2 / V2

- Expanded font library and advanced typography controls beyond the small V1 curated presets
- Additional visual templates and template selection
- Grid / Writable calendar system with large cells for handwriting daily plans
- Bookmark-size output
- Calendar cover

### Later Than P2 — Not Yet Prioritized

- Broader year selection beyond 2027–2029
- Multiple calendar languages
- Chinese public holidays
- Lunar calendar
- Decorative assets
