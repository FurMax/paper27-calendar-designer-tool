# Session 06 — Preview, Crop, and Export Pipeline

**Status:** Approved with the Session 06 Technical Gate on 2026-09-23. Output is twelve independent 1200×1800 PNGs; ZIP is packaging.

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

Draw on one 1200×1800 Canvas 2D surface:

1. Clear/output background as specified by the geometry; clip to the upper full-width Photo Region and draw the cover-scaled, clamped bitmap so pixels reach `x=0` and `x=1199` with no gutters or letterboxing.
2. Fill the independent lower Calendar Region with the month's one solid background color.
3. Draw month title, year, Sunday–Saturday headings and up to 42 date positions with the one resolved Calendar text ink and preset role fonts/weights/metrics. Unused positions remain blank; weekends use ordinary ink.
4. Convert to `image/png` Blob; validate non-null Blob, MIME, PNG signature/dimensions in tests, then release bitmap and Canvas resources. Filename: `01-January-2027.png` through `12-December-2027.png`.

This renderer is selected because the Session 05 desktop spike produced actual 1200×1800 PNGs and the tested SVG-image path lost Serif fidelity. Safari/mobile, final fonts, full 12-month geometry and color behavior remain release QA. [Canvas font loading](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/font) and [toBlob](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob) describe the browser primitives; the spike is the project-specific evidence.

## 4. Single-month export

T05 takes a snapshot of the currently visible project revision and named month. It checks readiness and renders **one** PNG. The handoff uses a deliberately activated download/open/share control appropriate to the tested browser. Browser user activation may expire during asynchronous rendering, so the UI may first show “PNG ready” and require a fresh user tap on a prepared Blob URL to begin the file handoff. Revoke that URL after handoff/close. Do not report “saved to Photos” merely because a Blob was created, a Share Sheet appeared, or a download prompt opened; report only the observable action/result. Failure leaves the project intact and offers Retry. The requested direct iPhone Photos outcome remains an **OPEN QUESTION**, separately from successful Files download.

## 5. Full-set generation and ZIP package

Full-set preflight requires all 12 months Ready and required assets available. Capture one immutable project snapshot at start; edits made afterward do not alter an in-progress set. Prevent duplicate starts. Render January through December **sequentially** with one active decode/Canvas at a time. After each PNG: validate it, append a named `File`/Blob to the in-memory output list, release decoded/render resources, update T05 progress, check cancellation, and yield to the event loop. If a month fails, stop and show the month/error; retry starts a fresh attempt. An interrupted page can regenerate from the last committed project; no partial output is saved as project data.

On desktop, package the twelve already-generated PNGs into one ZIP with `01`–`12` names and no cover or manifest file. PNG bytes are already compressed, so ZIP storage without further image recompression is a reasonable initial implementation; validate integrity and naming. Keep the ZIP dependency isolated in `zip.ts`; choose and pin a browser-compatible small package during M7 after bundle-size and target-browser checks. A ZIP error does not change the project and leaves individual PNG export available. Do not trigger twelve browser downloads. Session 05 desktop proxy completed sequential generation and ZIP integrity, but its heap figures excluded native/GPU memory and used reused photo content; mobile capacity remains unproven.

On mobile, the **same twelve PNG Files** are the payload. A capability-specific delivery adapter may offer a tested multi-file Share/Save path, ZIP or per-month fallback, but no primary handoff is chosen yet. A trusted HTTPS iPhone/iPad run must measure `navigator.canShare({files})`, `navigator.share`, all twelve actual delivered files and destinations, user activation timing, interruption and resource limits. `canShare` is a capability check, not proof of successful handoff. Web Share uses a user-chosen target and transient activation, so a prepared-files second tap may be needed. A Share Sheet or Save to Files path does not satisfy the requested no-second-step direct Photos outcome. [Web Share API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API).

## 6. Error and resource policy

| Failure | Required outcome |
|---|---|
| Missing photo or bad asset | No export start; name missing/failed month and route to edit/import. |
| Decode/font/Canvas/PNG failure | Stop, show exact stage/month, keep project and allow retry after recovery. |
| User cancels batch | Stop between months, release temporary resources, return to editable S04. |
| ZIP package/handoff failure | Preserve project; allow ZIP retry or individual PNG export. Never claim delivery from generation alone. |
| Page interruption/mobile memory pressure | Last committed project remains restorable; transient export restarts rather than pretending to resume partially delivered files. |
| Local save currently failed | T04 remains visible; export may use the visible in-memory snapshot with truthful unsaved-work status. |

Release QA must compare actual output files against the preview and requirements: 1200×1800, full-width covered upper region, separate lower region, English dates, selected font/scale/color, crop after drag/pinch/zoom, twelve unique month labels/date grids, ZIP entry integrity, and actual platform handoff. The detailed matrix is in [Testing Strategy](testing-strategy.md).
