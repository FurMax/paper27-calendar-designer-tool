# Calendar Design Studio — Scope

**Status:** Approved / Complete — Product Discovery Gate Passed on 2026-09-14

## Confirmed Scope Driver

- Primary V1 audience: fandom users turning collected celebrity photos into downloadable calendar images
- User constraint: may have no computer and no visual-design skills
- Core visual outcome: photo and overall calendar colors feel cohesive
- Core output structure: 12 separate downloadable monthly images in the selected PNG or JPG format
- V1 trimmed composition: portrait 2:3, physically 100 × 150 mm for the print variant
- Default print image (PNG or JPG): 1252 × 1843 px at 300 PPI, representing approximately 106 × 156 mm including approximately 3 mm bleed on each edge around a 100 × 150 mm trim; optional digital image (PNG or JPG): 1200 × 1800 px
- Product UI Language: Simplified Chinese; Calendar Output Language: English; no V1 language switcher
- Single V1 calendar system: upper photo, lower normal monthly calendar/date area, and coordinated overall background color
- The editable 1200 × 1800 trim composition is 2:3; its fixed upper Photo Region covers the full trim width edge to edge, with cover crop and no gutters, letterboxing, extra border, or exposed blank area; the lower Calendar Region is separate and uses the chosen solid background. Print export scales this composition into the 100 × 150 mm trim and extends artwork through bleed.
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
- Choose one arbitrary solid background color for each month, defaulting to white; retain desktop/system color input and HEX/RGB, and offer a separate touch-friendly action to sample a visible photo pixel for that month
- Default to Auto Calendar text color, using contrasting black or white across month title, year, weekdays, and dates together
- Let the user choose one Custom Calendar text color for those four roles per month, with a non-blocking warning for low contrast
- Choose from three curated Calendar typography presets and Small / Standard / Large scale presets at 80% / 100% / 120%; each selection applies consistently across all 12 months, with Standard as the default
- Keep the Simplified Chinese Product UI font independent from the English Calendar Font preset
- Download/save any single month as a default print image or an optional 1200 × 1800 px digital image, choosing PNG or JPG; the choice also applies to the twelve-file ZIP
- **Session 05 mobile Photos handoff history, resolved for V1 in Session 08:** On 2026-09-23 the Product Owner requested one action to save a PNG directly into iPhone Photos. The observed Safari download went to iCloud Drive / Downloads, and manual Open then Save required another action. In Session 08 the Product Owner explicitly deferred direct Photos beyond V1 while retaining the browser-only platform constraint; no V1 automatic Photos claim is made.
- Generate the full January–December set as 12 independent monthly images in the selected PNG or JPG format through a distinct full-set action; ZIP is a delivery package, not the output definition
- Deliver the complete set on desktop and mobile through one ZIP containing the twelve independent files in the selected PNG or JPG format with 01–12 filename ordering. On mobile, the user opens/extracts the ZIP in Files/Downloads. Multi-file Share and one-action direct Photos are outside V1 by the Product Owner's Session 08 decision; actual ZIP handoff remains subject to the formal browser/device QA matrix.
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
- Gradient, image-based, or freely editable multi-region backgrounds. V1.1 Part 1 allows only six fixed low-opacity textures in the lower calendar background.
- Separate text colors for month, year, weekdays, or dates; complex text styling
- Per-month font overrides, template proportions, or date-layout overrides
- A broad Apply Style to All command that can overwrite month-level photos, crops, colors, or important dates
- Font upload, unlimited font libraries, free px size sliders, advanced typography editing, or per-month typography overrides
- Template selection, alternative layouts, repositioning the calendar region, or changing the photo-to-calendar proportion
- Physical printing service or print ordering
- Vendor-specific acceptance, CMYK conversion, press proofing, and a universal print-quality guarantee
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

## Session 08 export quality amendment

PNG remains the default; JPG is a user-selected V1 alternative for one month or twelve in either print or digital size. Each ZIP contains one format only. Print files are RGB with nominal 300 PPI metadata; provider acceptance remains a release check. Print photo bleed uses actual source pixels with the minimum additional cover scale needed, shown in print Preview. The renderer must avoid introducing a blank fringe at covered photo edges, and the Month Editor plus full-set preflight give a non-blocking, month-specific warning when the cropped photo itself has a broad white/light edge. See the Session 08 JPG and photo-edge change requests.


## V1 Enhancement / Polish Patch — controlled scope addition

The Product Owner directed a bounded V1 polish patch after the core workflow. It adds a restrained proofing-desk workspace and Fresh Baby Blue action/selection UI with Milk Mint recommendation accents, typographic brand slot and favicon, three optional per-photo background recommendations, a twelve-photo coordinated batch color suggestion with explicit preview/confirmation and one-operation restore, and modest reduced-motion-aware interaction feedback. These are optional aids; manual HEX/RGB/system-picker/Quick Colors and the existing photo/crop/export workflow remain.

**Scope change:** The earlier Post-V1 important-date priority is narrowed and brought into this V1 patch as an optional red date-number mark for the fixed 2027 calendar. It stores only day numbers per month and appears in Preview and output. Date titles, event descriptions, recurrence, reminders, sync and holiday databases remain outside V1. The broader 2028/2029 and fandom-date planning above remains Post-V1; this controlled exception does not authorize those capabilities. The patch requires Product Owner visual/interaction review before release work continues.

### Current V1.1 option-count amendment (2026-09-25)

The Product Owner additionally approved one **复古** project-wide Calendar type preset and one optional **亚麻纸** lower-calendar texture. The current build has four curated type presets and seven fixed textures; the earlier three/six limits above are historical V1/V1.1 Part 1 baselines. No font upload or free-form texture editor is added.

### Current paper choice correction (2026-09-25)

The seventh fixed texture is **硫酸纸**, replacing the briefly available 亚麻纸. Seven choices remain, confined to the lower calendar background. Existing saved 亚麻纸 selections open as 硫酸纸.

## V1.1 Part 2A important-date scope amendment (2026-09-25)

The old red-only mark remains the default. The Product Owner explicitly added only two alternate presentation styles, thin circle and small dot, chosen once for the whole project. Existing per-month day lists, date validity, no event names, no reminders, no custom mark colors and no other Part 2 features remain unchanged.

## V1.1 current-month photo-effect amendment (2026-09-25)

The Product Owner explicitly added one optional, non-destructive effect per month's photo: 原图 (default), 胶片, 冷调, 半调, or 双色映射. Duotone has exactly three fixed pairs: deep blue/cream, wine/pale pink, forest/ivory. The module offers compact previews and no intensity slider in this first pass. Photo assignment/crop, calendar background/text/texture, output geometry and core export workflow remain. AI retouching, adjustable filter stacks and additional effect libraries remain out of scope. Visual and device acceptance are pending.

## V1.1 Editor disclosure and duotone amendment (2026-09-25)

The later Product Owner direction retains always-visible photo/crop/effect/background shortcuts; precise color is default-collapsed, Text Color belongs inside Typography, Fine Tune is independently collapsible (default open) and Mark independently collapsible (default closed with a marked-day summary). The duotone choice expands from three to exactly six fixed pairs with one reversible shadow/highlight switch stored on the existing optional per-month photo-effect object. The earlier three-pair limit and RGB values in the preceding amendment are superseded. No additional editing parameters, presets, templates or export-size changes are authorized.

## V1.1 Month Editor Sidebar micro polish (2026-09-26)

The final owner-directed Sidebar pass changes presentation only: one live Mark count/style summary, a collapsed Fine Tune texture/type/scale summary, larger date hit areas, and slightly denser Fine Tune spacing. The 01/02/03 sections, controls, project fields, date marks, export, and Text Color disclosure stay in scope as previously approved. No new Sidebar feature or layout stage is introduced.

## V1.1 Review / Export final UX polish (2026-09-26)

The owner-directed Review pass changes only navigation affordances, wording and local visual hierarchy. Twelve month cards remain direct edit links; the completed header routes to Month Editor, while an incomplete project routes to photo assignment. Palette apply counts reflect actual changed months, and its existing single undo is presented as 撤销本次配色. Print/screen, PNG/JPG, export geometry, photo/color algorithms and project fields do not change.
