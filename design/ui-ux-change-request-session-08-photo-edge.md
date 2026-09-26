# UI / UX CHANGE REQUEST — Session 08 photo-edge quality

**Status:** Product Owner-directed Session 08 correction implemented and bounded Chrome/Edge QA passed; real-device retest remains open. The Product Owner supplied January and May print JPGs with visible light edges and requested no unintended white borders, or at minimum a warning before export that explains zoom/crop recovery. This document records the controlled warning and print-bleed behavior correction; it is not Release Approval.

## Reproduced finding

The supplied print files are 1252×1843. The print trim begins 35 px from the top and left and ends 36 px before the right file edge. January is pure white across the top through approximately y=53, about 19 px into trim. Both right bleeds show a 36 px light strip; their final trim-edge pixel is much lighter than pixels a few columns inward. The old print renderer stretched one edge pixel across the bleed and then overlaid available source pixels. Fractional Canvas sampling against a white underlay can tint the last edge pixel, and the stretch magnifies it. The image's own light/white margin can also remain inside the crop; zooming the visible photo removes it.

## Approved bounded correction

- Keep the same 100×150 mm trim, approximately 3 mm bleed, 300 PPI metadata, source photo, persisted crop and selected export format.
- Draw an overscanned copy of the photo below the precise crop, so fractional Canvas edge sampling mixes with photo content instead of a white underlay.
- Fill print photo bleed from a reflected strip of the visible cropped photo at the trim edge. This avoids magnifying one antialiased pixel or exposing unreviewed source pixels beyond the visible crop. The bleed is cut away in print; the trim content remains governed by the shared crop model.
- Analyze the current visible crop edges before export. Show a non-blocking, specific warning for a broad white/light edge that may be part of the source photo, with instruction to zoom or reposition and check again. A scan is a heuristic; intentionally white photo backgrounds may be flagged and subtle borders may evade it.
- Preserve user control of crop. No automatic destructive zoom, image replacement, changed photo assignment or new saved project field. Preview and downloaded content must stay aligned.

## QA

Recheck both supplied JPGs numerically as historical failure evidence; create synthetic source fixtures with plain color and embedded white/light margins. Verify no app-created edge gap in print and digital PNG/JPG, no 1-pixel bleed amplification, warning before export for a true broad white strip, warning clears after sufficient zoom, and no warning for a solid-color covered photo. Real iPhone/iPad output still needs device QA.

## Superseded print-bleed fill decision

The reflected-strip method in this historical correction was superseded after the Product Owner supplied February/March JPGs with visibly repeated bleed content. Current print output uses genuine source-photo pixels with a small derived cover adjustment shown in print Preview. See design/ui-ux-change-request-session-08-print-photo-bleed.md. The white-edge warning and digital overscan remain.
