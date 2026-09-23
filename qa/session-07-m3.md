# Session 07 — M3 verification

**Date:** 2026-09-23  
**Status:** Complete. Desktop checks passed. The first real iPhone Safari attempt failed at import; the HTTP LAN UUID cause was fixed. The Product Owner reported the repeat check had no problems on 2026-09-23.

## Desktop evidence

| Check | Result | Evidence |
|---|---|---|
| Crop math | PASS | `npm test`: 33/33 total. Cover at zoom 1/1.5/3 and extreme offsets for portrait, landscape, square and extreme ratios; drag clamp, zero-travel axis, moving pinch anchor, explicit zoom and Reset. |
| Import boundary | PASS | Unit checks for cancel, >12 whole-selection rejection, returned order and unreadable item identification. `createImageBitmap` falls back to image-element decode. |
| Build | PASS | `npm run build` completed. |
| Pointer drag | PASS | Production browser at 1440×900, real selected photo. Explicit Zoom changed to 1.51×; mouse drag changed normalized offsets from 0/0 to about +0.956/−0.158. `data-crop-covered` stayed true. |
| Reset | PASS | Reset returned zoom/offsets to `1/0/0` and coverage stayed true. |
| Full width | PASS | Desktop proof and Photo Region had the same 410px left edge and width; image covered the whole region. At 390px phone viewport, proof and Photo Region shared a 313px left edge and width, image covered all four edges and document had no horizontal overflow. |
| Phone control layout | PASS in desktop responsive emulation | Phone shows a Photo & Crop sheet with explicit zoom, Reset and Replace; month selector opens the approved 12-month state sheet. The later Product Owner real iPhone smoke reported no problems; detailed touch measurements were not supplied. |
| LAN test URL | PASS from this computer | Vite listens on `0.0.0.0:5173`; `http://192.168.31.102:5173/` returned HTTP 200 locally. The Product Owner screenshot from iPhone Safari confirms LAN reachability. |

## Required Product Owner smoke

On a real iPhone Safari, using the production dev URL, check one selected photo, single-finger drag, pinch, explicit zoom, Reset to centered fill, full-width Photo Region and no exposed blank area. At zoom 1, an axis may have zero travel when the image exactly fits it; set zoom to about 1.5× and retry drag in both directions. Record iPhone model, iOS version and PASS/FAIL for each behavior. If a failure occurs, capture the exact step and visible result. This check is an early M3 implementation gate, not full release QA.

**Current limitation:** The project is still in memory until M5. Keep Safari on the page during this smoke test; reloading will lose selected photos. HEIC behavior and large original photos remain deferred device risks, not claimed PASS.

## iPhone Safari attempt and correction — 2026-09-23

The Product Owner supplied a screenshot from iPhone Safari at the LAN URL showing “无法读取所选照片，请换一张重试。” immediately after selection. Device model, iOS version, selected file type and bytes were not supplied. **FAIL** for import in that run; crop/touch were not reached. The screenshot also proves that the iPhone reached the LAN app.

Source inspection found `crypto.randomUUID()` inside `decodePhotoSelection`'s decode `try` block. The LAN URL is ordinary HTTP at `192.168.31.102`, while `randomUUID()` requires a secure context. Thus a successful decode could throw during ID creation and be misreported as an unreadable image. This is a source-based diagnosis, not an iPhone runtime log. [MDN randomUUID](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/randomUUID) documents the secure-context requirement; [W3C Secure Contexts](https://www.w3.org/TR/secure-contexts/) treats loopback/localhost specially but not ordinary LAN HTTP; [MDN getRandomValues](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues) documents availability in insecure contexts.

`src/domain/id.ts` now uses `crypto.getRandomValues()` to create a UUID v4 when `randomUUID()` is unavailable. Every production ID call uses that function. ID creation was moved outside the image decode catch so another environment failure cannot masquerade as a bad photo. Real decode failures now show the file type, size and both decoder errors. Regression tests cover the missing-`randomUUID` path; `npm test` passes **33/33**, `npm run build` passes, and the LAN server serves the updated file. **iPhone re-test outcome:** The Product Owner replied “ok了没有问题，我检查过了。” on 2026-09-23 after the fix and the requested import/crop smoke instructions. This is a reported PASS for the scoped M3 real-device check. Device model, iOS version and per-action observations were not supplied; no detailed timing or coverage measurement is inferred. Formal device and release QA remain in Session 08.
