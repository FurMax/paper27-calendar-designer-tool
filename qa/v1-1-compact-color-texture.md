# V1.1 Compact color and texture controls

**Status:** Implemented for Product Owner review, 2026-09-25. No deployment.

- Background card measures 141 px in a 1440 px Chrome production preview with twelve imported photos. It has three rows: three crop-derived recommendation circles, ten fixed circles in a horizontally scrolling no-wrap Common row, and Custom. The separate current-color card is removed; HEX/RGB and the native picker appear only after Custom is opened. A small precise photo-sampling action still opens the existing sampler.
- Swatches preserve direct apply, Auto ink, pressed states, two-pixel selected ring, accessible names and name/HEX tooltips. The fallback-photo status remains available in compact form. The phone sheet uses the same controls and scrolls locally without page overflow at 320/390 px.
- Texture is a 50 px no-wrap strip: Clear writes `none`, five 40 × 40 px previews retain existing IDs and image patterns. Labels are accessible and shown on hover/focus; visual labels below thumbnails are gone. Preview and PNG/JPG output still show only the date-area texture.
- Chrome/Edge focused production-preview checks pass collapsed/expanded precision, keyboard tooltip, color apply, precise photo sampler, texture selection/persistence/output, single PNG/JPG, phone widths and no runtime exceptions. Full Chrome workflow passes assignment, crop, palette, month switching, 12-file PNG/JPG ZIP, single export and failure recovery. 59/59 unit tests and production build pass.
- No schema, photo-analysis, crop or renderer code changed. CSS bundle is 65.57 kB (11.95 kB gzip); JS is 379.76 kB (125.61 kB gzip). No dependency was added.

Visual captures: `qa/v1-1-editor-desktop.png` for the right compact palette and lower texture strip; `qa/v1-1-editor-color-sheet-phone.png` for the phone Custom form. This is local browser evidence; Product Owner device-level visual review and formal Session 08 release gaps remain open.
