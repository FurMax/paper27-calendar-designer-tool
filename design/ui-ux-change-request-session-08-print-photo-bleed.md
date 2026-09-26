# UI / UX CHANGE REQUEST — Session 08 genuine-photo print bleed

**Status:** Product Owner-directed correction implemented with bounded Windows Chrome/Edge QA. Real iPhone/iPad and named-printer proof remain open. This supersedes the reflected-photo-bleed rule in the earlier Session 08 photo-edge correction; it does not grant Release Approval.

## Evidence and decision

The Product Owner supplied new February and March 1252×1843 print JPGs and asked whether the print bleed contains mirrored photo content. Pixel pairs in the top 35 px and right 36 px match the pixels reflected across the trim boundary, within JPG compression differences. February visibly repeats part of the head at the top. The Product Owner proposed filling only the photo background or letting the full photo cover the output. We chose genuine source-photo coverage: background extraction is unreliable when a subject touches an edge, while the full photo can cover bleed without inventing or repeating visual content.

## Controlled behavior

- Keep the 100×150 mm trim, 106×156 mm complete file, approximately 3 mm bleed, 300 PPI metadata, RGB PNG/JPG choice, saved crop and project schema.
- The print renderer uses the original photo pixels across the entire top and side bleed, never reflection or single-pixel stretching. It applies the smallest uniform extra cover scale needed for all photo-bleed edges, with one output pixel of overscan. The bottom photo/calendar boundary remains anchored.
- The tighter print crop can remove a small amount of photo content near trim edges. For a photo that exactly fills the trim at zoom 1, the calculated extra scale is approximately 1.063; users can reposition or choose a different photo if important content is near an edge. The optional digital variant keeps the original saved crop.
- The Month Editor proof, Review thumbnails and photo-color sampler display the actual selected print/digital photo crop. Edge-risk warnings inspect the same crop as the chosen variant. No destructive zoom is written to the saved project.
- Calendar layout, fonts, dates, background and export sizes remain the approved baseline.

## Verification and limits

A synthetic marked source showed a black band in the top bleed but red content at the trim line, proving the bleed is taken from genuine source pixels rather than mirrored trim content. A red gradient continued monotonically from trim to the outer right bleed. Solid-source digital/print PNG/JPG edge samples had no blank border in isolated Windows Chrome and Edge. The 12-file PNG and JPG ZIP regressions, 300 PPI metadata, Month Editor warning/continue flow, print-proof transform, emulated touch drag, build and unit suite passed. The original source photos/crop states behind the user JPGs are unavailable here, so their exact visual before/after must be confirmed by re-exporting from the saved project. Actual iPhone/iPad output and printer approval remain release QA.

