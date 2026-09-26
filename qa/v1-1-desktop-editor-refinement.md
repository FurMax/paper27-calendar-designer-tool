# V1.1 desktop Editor UI refinement QA — 2026-09-25

## Changes reviewed

- Month navigator 56px, white and flat; selected month pale blue, no shadow or scale.
- Canvas white with the only Editor shadow; 48px padding; 72vh artwork at 800px; bleed note outside canvas; subtle grid hidden at rest and visible only during photo drag.
- 320px rail with 24px section/divider rhythm, wrapped 28px swatches, texture Clear in header and five 40px tiles, 64px font and 56px scale segmented choices, 32px date cells, quiet Ready state, compact crop controls.
- Full-width Export remains in document flow, centered to 1120px, with 360px sticky whole-set palette column and compact radio rows. The dark-blue existing token provides readable white CTA text.

## Results

- `npm run build`: PASS, 78 modules, no new dependency.
- `npm test`: PASS, 59/59.
- `node tests/browser/pre-release-preview.mjs`: PASS in Chrome production preview after correcting a newly introduced zero-width preview wrapper. The complete run covered assignment, desktop drag/zoom, month edits, typography, Important Date, twelve PNG/JPG ZIP files, single exports, persistence/failure recovery, motion, and mobile layouts.
- `node tests/browser/v1-1-desktop-refinement.mjs`: PASS in Chrome and Edge at 1280, 1440 and 1920 widths × 800 height. Measured navigator 56px, rail 320px, artwork 384×576, canvas padding 48px, export right column 360px, no horizontal overflow. The first inspector section is visible at the initial fold. Sticky proof top remains 24px after page scroll. Grid opacity was 0 at rest, 0.3 during drag, then 0 again.
- Screenshots reviewed: `qa/v1-1-desktop-refinement-editor.png` and `qa/v1-1-desktop-refinement-export.png`.

## Decision and limitation

The Product Owner chose the recommended current whole-page scroll and sticky proof. The attached brief's independent-inspector-scroll check is superseded. At 800px height the entire 672px padded canvas cannot also fit below the existing app header/title/navigator without reducing the requested 72vh artwork or changing that chrome. The change request marks this as **OPEN QUESTION** for visual review. No deployment.
