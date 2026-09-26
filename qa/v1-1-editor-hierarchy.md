# V1.1 Editor hierarchy follow-up — QA

**Status:** Implemented for Product Owner review, 2026-09-25. No deployment.

## Scope checked

- Desktop first level: dominant proof beside a quick rail. Browser geometry confirms the rail is right of the proof and the Style / Dates / Export workbench begins below both.
- Quick rail contains only photo and background sections (plus month readiness). Background has current HEX, three photo-derived recommendation cards and ten common colors in five computed grid columns. Visible text labels are hidden; the first swatch exposes `奶油白 · #F7F4EE` on keyboard focus. Pressed state and direct apply remain.
- Lower level contains exact HEX/RGB, six textures, typography/ink, important dates, single export variant/format, and a Review palette entry.
- At 390 px the quick background sheet has ten swatches, the six textures are in the lower Style section, and there is no horizontal overflow.
- Chrome and Edge focused production-preview runs pass current background, photo recommendations, texture preview/output isolation, PNG/JPG single export, ZIP output, persistence, and phone layout. The full Chrome production-preview workflow passes import, assignment, crop, rapid month switching, palette apply/restore, 12-file PNG/JPG ZIP, single export, recovery, and responsive widths 320/390/844/1000/1440. No runtime exceptions were recorded.
- Build passes (78 modules; JS 379.41 kB / 125.48 kB gzip; CSS 61.00 kB / 11.37 kB gzip). 59/59 unit tests pass. This UI change adds no dependency.

## Visual review

`qa/v1-1-editor-desktop.png` shows the short rail and full 2 × 5 swatch shelf; `qa/v1-1-editor-deep-desktop.png` shows Style / Dates / Export; `qa/v1-1-texture-phone.png` shows the stacked phone Style controls. The initial narrow-strip swatch CSS was corrected before final QA.

## Limits

This is local Chrome/Edge and emulated-phone evidence. Product Owner hands-on review on iPhone/iPad remains pending for this follow-up. Formal Session 08 release/browser/printer gaps remain open. The hovered date appearance was not changed. The Review whole-set palette algorithm and flow were not duplicated or changed.
## Superseded QA placement notice (2026-09-25)

The earlier QA evidence remains a record of the first hierarchy iteration. The current Product Owner refinement moves precise color back to the rail/sheet, rounds colors, and places Export last. Current QA is in `qa/v1-1-editor-round-colors.md`.
