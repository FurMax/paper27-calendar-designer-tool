# Session 06 — Preview, Crop, and Export Pipeline

**Status:** Approved with the Session 06 Technical Gate on 2026-09-23. The original 1200×1800 digital PNG remains optional. The Product Owner-approved default print output is twelve independent 1252×1843 PNGs with 100×150 mm trim and approximately 3 mm bleed; ZIP is packaging.

## 1. One render input

Build `MonthRenderModel` from an immutable project snapshot, month number, validated decoded photo dimensions/bitmap, and bundled typography definitions:

```ts
interface MonthRenderModel {
  month: 1|2|3|4|5|6|7|8|9|10|11|12;
  year: 2027;
  geometry: CalendarGeometry;
  dateCells: readonly (number|null)[]; // 42 Sunday-first positions
  photo: { assetId: string; crop: CropState; width: number; height: number };
  style: { background: string; ink: string; contrastWarning: boolean };
  typography: ResolvedTypography;
}
```

`CalendarGeometry` is one versioned definition in **output coordinates**: page `(0,0,1200,1800)`, photo rectangle `(0,0,1200,1044)`, lower calendar rectangle `(0,1044,1200,756)`, plus title/year/weekday/date positions and clipping bounds. The 58% / 42% split derives from the frozen Direction A proof; Session 05's matching height was only a spike proxy. Text coordinates must be extracted from the proof and checked at implementation fidelity review. The model also resolves English month names, Sunday-first weekday initials, six fixed date rows, selected preset/scale metrics, Auto or Custom ink, and the same clamped crop transform. Product UI labels never enter the image model.

The DOM/CSS preview uses the output-coordinate geometry scaled uniformly to available width. Its photo is clipped to the exact Photo Region and positioned by the shared crop transform. Calendar text positions, line metrics and colors derive from the same model; responsive components must not recompute ratios, dates or font sizes. Review thumbnails use the same model at a smaller scale. The Canvas renderer consumes the model at scale 1. Compare preview and PNG visually on the formal browser matrix; the shared model reduces drift but does not prove pixel identity across DOM and Canvas font engines.

## 2. Photo import and crop pipeline

1. Read the system picker result in the order returned. Reject a selection of more than 12 as a whole; never silently slice it. Cancellation changes nothing. Individual month selection is always available.
2. Attempt decode before committing an asset or changing an occupied month. Record **oriented decoded** dimensions. JPEG/PNG/WebP are proven only for named Windows desktop fixtures. For HEIC/HEIF or unusual picker output, attempt browser decode; accept if readable, otherwise show a clear unsupported/unreadable error and preserve existing month state. Do not infer support from file extension/MIME alone.
3. Keep originals as Blobs in IndexedDB. Preview and export may create a decoded `ImageBitmap` or `<img>` on demand; dispose/revoke it after use. Avoid base64 copies in project state. Low resolution produces a non-blocking warning; the exact warning threshold is an **OPEN QUESTION**.
4. Compute centered cover: `base = max(regionWidth/imageWidth, regionHeight/imageHeight)`. Apply bounded `zoom >= 1`, normalized x/y offsets and clamping as defined in [Data Model](data-model.md). Drag updates offsets; pinch updates zoom around the gesture centroid; explicit zoom and Reset use the same math. Axis movement may correctly be zero at centered fill when there is no overflow. No offset can reveal blank pixels or change the Photo Region.

## 3. Canvas rendering for one month

Preflight requires a Ready month, a readable asset, valid model, and font outcome. Bundle the three final font systems locally after license review; await exact needed `FontFace` loads, check status, and use a named fallback/error state if any face fails. Do not assume `document.fonts.ready` alone guarantees the selected face. A failed font must never silently render a different preset while reporting success.

Draw the shared composition on one 1200×1800 Canvas 2D surface:

1. Clear/output background as specified by the geometry; clip to the upper full-width Photo Region and draw the cover-scaled, clamped bitmap so pixels reach `x=0` and `x=1199` with no gutters or letterboxing.
2. Fill the independent lower Calendar Region with the month's one solid background color.
3. Draw month title, year, Sunday–Saturday headings and up to 42 date positions with the one resolved Calendar text ink and preset role fonts/weights/metrics. Unused positions remain blank; weekends use ordinary ink.
4. Convert to `image/png` Blob; validate non-null Blob, MIME, PNG signature/dimensions in tests, then release bitmap and Canvas resources. Filename: `01-January-2027.png` through `12-December-2027.png`.

This renderer is selected because the Session 05 desktop spike produced actual 1200×1800 PNGs and the tested SVG-image path lost Serif fidelity. Safari/mobile, final fonts, full 12-month geometry and color behavior remain release QA. [Canvas font loading](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/font) and [toBlob](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob) describe the browser primitives; the spike is the project-specific evidence.

## 4. Single-month export

T05 takes a snapshot of the currently visible project revision and named month. The Editor title has a compact four-action menu for print/digital PNG/JPG. Each action checks readiness and renders **one** file through `renderMonthImage` without changing the month or saved editing state. After asynchronous preparation, the UI attempts a browser download automatically and retains the prepared Blob URL behind a small manual download fallback because Safari or other browsers may reject a click after user activation expires. Revoke the URL on close, project change or navigation. Report only that handoff was attempted until the browser destination is observed; never claim automatic Photos save. Failure leaves the project intact and offers Retry. One-action direct iPhone Photos was explicitly deferred beyond V1 in Session 08.

## 5. Full-set generation and ZIP package

Full-set preflight requires all 12 months Ready and required assets available. Capture one immutable project snapshot at start; edits made afterward do not alter an in-progress set. Prevent duplicate starts. Render January through December **sequentially** with one active decode/Canvas at a time. After each PNG: validate it, append a named `File`/Blob to the in-memory output list, release decoded/render resources, update T05 progress, check cancellation, and yield to the event loop. If a month fails, stop and show the month/error; retry starts a fresh attempt. An interrupted page can regenerate from the last committed project; no partial output is saved as project data.

On desktop and mobile, package the twelve already-generated PNGs into one ZIP with 01–12 names and no cover or manifest file. PNG bytes are already compressed, so ZIP storage without further image recompression is the implemented path; validate integrity and naming. The M7 implementation keeps pinned fflate@0.8.2 isolated in zip.ts and uses its pass-through ZIP stream. Desktop Chrome extraction and CRC passed; the Product Owner downloaded a 24.2 MB ZIP on iPhone 13 Safari 16.2, extracted it and opened all twelve PNGs. The remaining browser matrix is Session 08 QA. A ZIP error does not change the project and leaves individual PNG export available. Do not trigger twelve browser downloads. Mobile memory and interruption limits remain subject to QA.

On mobile, ZIP download is the Product Owner-approved V1 primary handoff for the same twelve independent PNGs. The result copy must explain that the ZIP goes to the browser's Files/Downloads destination and needs opening or extraction. Production has no multi-file Share button; the previous secure-context Web Share candidate is historical research, not a V1 acceptance requirement. A ZIP download does not save files directly into Photos; the one-action direct-Photos request was explicitly deferred beyond V1. Verify actual ZIP destination, extraction and each file on supported iPhone/iPad/Android browsers.

## 6. Error and resource policy

| Failure | Required outcome |
|---|---|
| Missing photo or bad asset | No export start; name missing/failed month and route to edit/import. |
| Decode/font/Canvas/PNG failure | Stop, show exact stage/month, keep project and allow retry after recovery. |
| User cancels batch | Stop between months, release temporary resources, return to editable S04. |
| ZIP package/handoff failure | Preserve project; allow ZIP retry or individual PNG export. Never claim delivery from generation alone. |
| Page interruption/mobile memory pressure | Last committed project remains restorable; transient export restarts rather than pretending to resume partially delivered files. |
| Local save currently failed | T04 remains visible; export may use the visible in-memory snapshot with truthful unsaved-work status. |

Release QA must compare actual output files against the preview and requirements: selected print 1252×1843 or digital 1200×1800 dimensions, print pHYs metadata and bleed/trim geometry, full-width covered upper region, separate lower region, English dates, selected font/scale/color, crop after drag/pinch/zoom, twelve unique month labels/date grids, ZIP entry integrity, and actual platform handoff. The detailed matrix is in [Testing Strategy](testing-strategy.md).

**Session 07 M8 historical candidate probe:** The dev-only QA worksheet previously tested a second-tap Web Share idea; it is not in the production build. The Product Owner selected ZIP for V1 mobile delivery in Session 08, so trusted-HTTPS Web Share is no longer a V1 release gate. Historical capability observations in qa/session-07-m8.md remain scoped to their test origin.

## Session 07 approved print and photo-sampling amendment

The baseline geometry above remains the 1200×1800 composition used by Preview and the optional digital variant. For the default print variant, render that composition once and map it into a 1181×1772 trim rectangle at (35,35) inside the 1252×1843 output. At 300 PPI, this represents approximately 100×150 mm after trimming and a 106×156 mm full file; integer rounding makes the four bleed edges 35/36/35/36 pixels, approximately 3 mm. Use the minimum extra source-photo cover scale to paint genuine pixels across top and side photo bleed; print Preview shows the same tighter photo crop. Continue the solid calendar background below. The exported image has no printed guide or crop marks. Add a valid PNG pHYs chunk of 11811 pixels/meter in both axes for nominal 300 PPI. Digital PNG bytes and naming remain available as a separate selection.

The chosen variant applies to both one-month and full-set rendering. The latter still produces twelve separate selected-variant PNGs and packages those twelve files into one ZIP; it never starts twelve downloads. Export selection is transient and does not migrate or alter the saved project. The preview shows the trimmed composition and explains the extra bleed in the print output. Printer profile, safe area, CMYK/PDF and any vendor acceptance are still open, so no universal print-readiness claim is made.

The approved photo sampler reads the exact decoded photo pixel under a point on the currently cropped Preview. It resolves the point through the shared crop transform to source image coordinates, previews HEX and a swatch, and applies the existing per-month solid background only after confirmation. Cancel and Escape leave the saved color unchanged. The native system color picker, HEX/RGB input and Quick Colors remain available.

## Session 08 approved PNG/JPG and photo-edge amendment

The Product Owner approved JPG as a user-selected alternative to the existing default PNG, for both single/full-set and print/digital outputs. The renderer first draws a slightly overscanned copy beneath the precise covered crop, preventing fractional Canvas edge sampling against the white underlay. The print compositor uses genuine source-photo pixels across its 35/36 px bleed, with a shared minimum-cover transform also applied to print Preview. It neither mirrors the trim edge nor stretches a single edge pixel. The 100×150 mm trim, 106×156 mm full geometry and 300 PPI metadata are unchanged. The print JPG carries JFIF 300 dpi density; the print PNG retains pHYs. Digital files are 1200×1800. All files are RGB.

The editor scans a downsampled visible crop for broad pale edges after crop changes and warns with zoom/reposition guidance. Before full-set rendering, the same check names affected months and lets the user edit or continue if the pale edge is intentional. This heuristic cannot guarantee detection of every source-photo border; it does not change saved crop or image pixels. Twelve rendered files in the selected format are validated and packaged into one same-format ZIP. Format selection remains transient; prepared outputs are invalidated after a format or content change. Historical PNG-only steps above describe the Session 06 baseline and are superseded for current V1 output by this amendment.


## V1 Enhancement export continuity

The shared month render model carries `importantDays` and a background-aware red date ink. CalendarProof and Canvas draw the same marked day numbers; single and twelve-file exports reuse the existing renderer and ZIP package path. Batch color recommendations change stored month backgrounds only after confirmation, so the existing Auto ink calculation runs from each new background for Preview and export. The desk grid, wordmark and favicon are not Canvas inputs. No output geometry, export format or print bleed rule changes.


## V1.1 Part 1 texture output

The shared month render model carries the optional per-month texture ID. A deterministic 48 × 48 transparent Canvas tile, with background-aware dark/light marks at roughly 6–12% opacity, supplies both the CSS proof tile and the Canvas renderer. It is painted only over the calendar region, behind text and below the untouched photo. Digital PNG/JPG uses the same trim renderer; print PNG/JPG extends the texture/background into the calendar bleed before drawing the trim, while photo bleed continues to use the existing genuine source-photo crop. None is the legacy/default state and produces no texture tile.

## Canvas PNG color-space metadata (2026-09-25 fidelity correction)

Trim and print-bleed Canvas contexts request sRGB. When the browser-generated PNG has no color-space chunk, the output gets standard `sRGB` (perceptual intent) and `gAMA` (45455) chunks before `IDAT`; any browser-supplied `cICP`, `iCCP`, `sRGB`, `gAMA` or `cHRM` metadata is preserved. Print `pHYs` remains 300 PPI and image data is not modified by this metadata step. The purpose is consistent interpretation across color-managed image viewers. It does not perform CMYK conversion or guarantee a match to a physical printer; verify with the selected printer and the Product Owner's viewer.

### Current V1.1 font/texture addition (2026-09-25)

The fourth curated preset bundles OFL Fraunces locally. `ensurePresetFonts` awaits its face before rendering PNG/JPG. `drawCalendarTexture` now accepts the seventh option, a deterministic linen-paper tile, in the lower calendar region only. The earlier three-font bundle count describes the V1 baseline. No export geometry or metadata changed.

### Tracing-paper output correction (2026-09-25)

The seventh texture is now `vellum` (硫酸纸), replacing `linen`. The shared generated satin tile and small sheet edge render in proof and canvas output only in the lower calendar color region; source photo pixels, trim/bleed geometry, and 300 PPI metadata remain unchanged.

### Current polka-dot texture (2026-09-25)

The existing `dots` ID draws 波点 on a transparent 288 × 256 tile with complete 15px-radius circles inset from all four edges of the 1200 × 756 calendar region. CSS proof and Canvas export reuse the generated tile; the Canvas pattern is anchored to the local calendar-region origin so its evenly staggered 128px rows match the proof. Dot color uses semi-transparent white on colored backgrounds (55%–65% alpha), with a 13% dark-ink fallback when white/background contrast is below 1.25; this is independent of calendar text color. In print output, the `dots` texture stops inside the trim artwork and the same solid calendar background continues into bleed, so the print file has no clipped dot at its outer edge. The photo draw path, print photo crop, geometry and format metadata are unchanged. Stored `dots` values remain valid without migration.

### Part 2A important marks in output, 2026-09-25

The shared render model now carries the project-wide `importantMarkStyle` along with the existing marked-day array and background-aware red mark ink. Red fills the number as before. Circle paints the normal-ink number and a tight thin red-toned ring; the saved `dot` style paints the normal-ink number and a small red-toned asterisk at its upper right. Both marks stay within the marked date's row, including at the large typography scale. CalendarProof uses the corresponding CSS mark in Editor/Review; Canvas draws the same semantics for screen/print PNG/JPG and the existing full-set path. Photo drawing, bleed, geometry, date grid and metadata do not change. This narrowly supersedes the earlier red-number-only output statement.
