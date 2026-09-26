# V1.1 print PNG photo color fidelity — 2026-09-25

## Reproduction evidence

- User reports: print PNG **photo** looks brighter than Editor preview. The affected month and external viewer were not supplied.
- Available April print/digital PNG photo-region average RGB: `(159.81, 139.51, 142.47)` versus `(159.81, 139.53, 142.49)`. Available July: `(179.52, 179.71, 184.97)` versus `(179.51, 179.69, 184.95)`. This rules out a broad print-only brightness adjustment in those samples; crops may still differ by a few pixels.
- Existing PNG files contained `IHDR`, `pHYs` (print only), `IDAT`, `IEND`, with no color-space marker. A real ICC-tagged JPEG rendered through HTML `Image` and `createImageBitmap` in Chrome produced zero changed RGB channels.

## Correction verification

- Production build: PASS.
- Unit tests: 60/60 PASS. New regression checks `sRGB`/`gAMA`, idempotence, unchanged `IDAT` image bytes, and unchanged print `pHYs`.
- Chrome local-browser export: PASS. Digital PNG 1200 × 1800 and print PNG 1252 × 1843 contain `sRGB` and `gAMA`; print retains `pHYs` at 300 PPI. Both keep a fixture photo's center pixel at `[162, 93, 59, 255]` exactly.
- The Product Owner's actual source photo, image viewer, display profile, and same-viewer before/after visual comparison are not available to this test. **OPEN QUESTION:** whether the tag removes the perceived difference on their device.

No deployment or release acceptance.

## Product Owner screenshot follow-up, 2026-09-25

The side-by-side screenshot captured at 13:39:34 shows April proof beside MagicView. A clear calendar-background sample in the screenshot is about `#C23D4B` on the browser proof and `#DB2647` in MagicView, so the visible colors differ. The MagicView sample matches the stored pixel `#DB2647` in `04-April-2027-Print-106x156mm (1).png` exported at 13:39:19. A second April print PNG exported at 13:40:13 stores `#C8324D`; its photo region above y=1000 is pixel-identical to the first export. Thus the screenshot compares the proof against a prior background-color version, while the photo itself also appears less saturated in the browser than in MagicView. The newly added `sRGB`/`gAMA` chunks are present in both files but did not eliminate this cross-application appearance difference.

Conclusion: do not brighten or darken export pixels to force a match to a single viewer. Compare the newest PNG to the current proof in the **same browser** to isolate the app's renderer; then compare that same PNG in MagicView to isolate display color management. The exact browser CSS color at screenshot time cannot be read from the screenshot alone.
