# V1.1 Editor round colors and final export — QA

**Status:** Implemented for Product Owner review, 2026-09-25. No deployment.

- Desktop: ten fixed swatches compute as five columns, use circular button and fill, retain accessible name + HEX, selected ring, and keyboard-focus tooltip. Three photo-derived samples are circular while label/HEX remain visible.
- Precise HEX/RGB and native picker are inside the desktop rail, not lower Style. On phone the same precision inputs are present in the background sheet; ten circles and six lower textures fit at 320 and 390 px without horizontal overflow and remain true circles. Touch hover cannot leave a tooltip displayed.
- Lower Style contains texture and calendar typography/size/ink; Dates is beside it on desktop. Export is the final standalone full-width settings section, with current-month variant/format/file and a link to the existing Review whole-set palette.
- Chrome and Edge focused production-preview browser checks pass common-color apply, photo recommendations, keyboard tooltip, texture preview/output, PNG/JPG single export, persistence, and phone layout. Full Chrome production-preview workflow passes import, assignment, crop, twelve-month palette apply/restore, print/digital PNG/JPG outputs, error recovery, reduced motion, rapid month switching, and responsive widths 320/390/844/1000/1440. No runtime exceptions.
- Build passes (78 modules; CSS 61.95 kB / 11.50 kB gzip; JS 379.60 kB / 125.52 kB gzip) and 59/59 unit tests pass. The change adds no dependency or export-pixel logic.
- Visual captures: `qa/v1-1-editor-desktop.png` (round colors + rail precision), `qa/v1-1-editor-deep-desktop.png` (Style and Dates), `qa/v1-1-editor-export-desktop.png` (final Export), `qa/v1-1-editor-color-sheet-phone.png` (phone round colors/precision), and `qa/v1-1-texture-phone.png` (phone Style).

The Product Owner's device-level visual review remains pending. Formal Session 08 release/browser/printer gaps remain open.
## Superseded by compact-control follow-up (2026-09-25)

The Product Owner's later request replaces the 2 × 5 swatch grid, separate current-color card, always-visible precision and large texture cards. Current implementation and QA are in `qa/v1-1-compact-color-texture.md`.
