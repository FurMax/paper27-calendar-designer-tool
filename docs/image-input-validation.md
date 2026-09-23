# Image input and crop spikes — Session 05

## Spike 01 — System photo picker

**Hypothesis:** `<input type="file" accept="image/*" multiple>` supplies up to 12 `File` objects with an order usable for initial assignment.  
**Minimal test / run:** In installed Windows Chrome 153.0.8010.52 and Edge 153.0.4234.48, the browser harness injected 12 distinct JPEG files into the real page's input. `FileList` returned all 12 in the injected order with `name`, `type=image/jpeg`, `size`, and `lastModified`. The 12 files totaled 14,598,954 bytes.  
**Result:** **PARTIAL.** `setInputFiles` bypasses the operating-system picker. It does **not** prove that the native picker can select 12 photos, that selection order matches click order, that Photos/Files routes exist, or that cancellation produces a `change` event. Those must be observed manually. File metadata did not contain a standardized original EXIF orientation field; actual orientation was observed by decoding.  
**Product Owner iPhone Safari report (2026-09-23):** the native picker selected 12 photos in one action — **PASS for that specific behavior**. Device/OS version, actual returned order, tap order, Photos/Files routes, cancellation, metadata and HEIC details were not supplied. **Decision / recommendation:** Map `FileList` order as returned, never tap order; keep the approved Assign Photos rearrangement and individual-month fallback. Reject an over-12 return as a whole. Remaining native picker semantics and iPad/Android are **REAL DEVICE TEST REQUIRED**; desktop native UI and macOS Safari remain pending.

## Spike 02 — Decode

**Hypothesis:** `createImageBitmap` and object URL + `<img>.decode()` can prepare actual photo data and provide oriented dimensions.  
**Minimal test / run:** The source was a local Windows wallpaper JPEG, 1920×1200. Browser Canvas encoded PNG, WebP and JPEG fixtures from its pixels. A separate JPEG injected EXIF orientation 6. The actual `libheif` `example.heic` sample (718,114 bytes) was downloaded from [libheif's public sample](https://github.com/strukturag/libheif/blob/gh-pages/example.heic). All were decoded in Chrome and Edge. Raw per-browser timings are in [desktop-results.json](../spikes/browser-lab/results/desktop-results.json).

| Input | Chrome | Edge | Limitation |
|---|---|---|---|
| JPEG, PNG, WebP | Both paths returned 1920×1200 | Same | Fixtures derive from one JPEG; not a diverse camera corpus. |
| EXIF orientation 6 JPEG | Both paths returned 1200×1920 | Same | Only one orientation tag tested. |
| HEIC sample | `createImageBitmap` InvalidStateError; `<img>` EncodingError | Same | A single HEIC sample; Safari/iOS may differ, and iOS picker may transform a selected photo. |

**Decision / recommendation:** **PASS** for named JPEG/PNG/WebP desktop fixtures and EXIF-6. **FAIL** for the named HEIC desktop test. No V1 native HEIC commitment. Keep client conversion, platform-specific behavior, and clear JPG/PNG requirement as undecided fallback candidates. A failed decode must not replace an existing month photo. Real iPhone HEIC, large 12–48 MP photos, memory behavior and Safari/Android are **REAL DEVICE TEST REQUIRED**.

## Spike 03 — Crop

**Hypothesis:** centered fill plus scale and clamped x/y can pan and zoom without revealing the background.  
**Original minimal test / run:** A standalone 300×450 (2:3) crop viewport tested source shapes 400×600, 600×400, 500×500, 4000×300 and 300×4000 at 1.75× with extreme requested offsets. All computed rectangles covered the viewport. Chrome/Edge automated pointer drag changed offset by +55/−35 px and stayed covered. Reset set zoom 1 and offsets 0. The original PNG used a centered 800×1200 photo viewport; this historical geometry conflicted with the now-clarified full-width output rule.

**Product Owner observation:** Zoom worked, but desktop manual and iPhone touch drag did not visibly reposition in the original page — **FAIL / PARTIAL for that spike interaction**. Drag target, starting zoom and image overflow were not recorded. This does not relax the V1 drag requirement.

**Refined desktop test:** the disposable page now has a 1200×1044 upper Photo Region spanning the 1200×1800 output width, a matching blue crop box, and drag on both the crop box and preview's photo portion. At 1.5× zoom on a 1920×1200 landscape image, Chrome/Edge mouse drag moved output offset 0→(+138.2,−98.7), then preview drag moved it to (+254.2,−181.6); both stayed `covered=true`. At zoom 1, the exactly filled dimension has zero movable overflow, so a drag in that direction cannot visibly move until zoom increases. [Raw regression](../spikes/browser-lab/results/refinement-desktop.json).

**Result:** **PASS** for the named refined desktop pointer regression; **FAIL / PARTIAL** for the Product Owner's original iPhone drag attempt. The explicit Zoom control was reported working on iPhone. Real touch drag/pinch on the updated page, rapid gesture cancellation, browser scroll interference, actual portrait/square/extreme pixels and memory pressure remain unproven. The formal geometry is specified by the Product Owner; the spike is still disposable.

## Source and format references

- The [HTML file input reference](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/file) defines `multiple`, `accept`, and `FileList`; it does not guarantee user click order.
- [Apple's HEIF/HEVC overview](https://support.apple.com/en-us/116944) describes platform support, but is not evidence that the target Safari picker returns a decodable HEIC `File` in this application.

## Remaining test matrix

| Environment | Native 12-select/order/cancel | JPEG/PNG/WebP/HEIC decode | Drag/pinch |
|---|---|---|---|
| Windows Chrome/Edge | Pending native UI | Desktop fixtures above | Pointer above; touch pending |
| macOS Safari | NOT TESTED | NOT TESTED | NOT TESTED |
| iPhone Safari | 12-photo native selection PASS as reported; order/cancel pending | REAL DEVICE TEST REQUIRED | Old page drag failed/partial, explicit Zoom passed; refined drag/pinch re-test required |
| iPad Safari | REAL DEVICE TEST REQUIRED | REAL DEVICE TEST REQUIRED | REAL DEVICE TEST REQUIRED |
| Android Chrome | REAL DEVICE TEST REQUIRED | REAL DEVICE TEST REQUIRED | REAL DEVICE TEST REQUIRED |
