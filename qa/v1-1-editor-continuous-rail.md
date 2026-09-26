# V1.1 Editor continuous rail QA — 2026-09-25

## Implemented

- Desktop proof is sticky with top 24px and max-height `100dvh - 48px`; the 2:3 card is width constrained by viewport height.
- The right settings rail is ordered Photo, Background, Text Color, Style, Date with 24px section spacing and thin separators. No lower Style/Date card remains. Export follows as a separate full-width section.
- Background keeps three small round-swatch rows, selected ring and collapsed HEX/RGB. Texture retains Clear plus five 40px previews in one row.
- Text Color retains Auto/Custom, custom picker/HEX and unchanged contrast warning at the bottom of its section.

## Evidence

- `npm run build`: PASS, 78 modules.
- `npm test`: PASS, 59/59.
- `node tests/browser/v1-1-part-1.mjs`: PASS in Chrome CDP 9230 and Edge CDP 9231 on the production preview. Checked rail order, no lower cards, compact palette height ≤200px, one-row texture height ≤52px, sticky proof after scrolling, 600px viewport height, static stacking at 1023px, mobile width 320/390 without overflow, color/texture application, persistence and output.
- The browser workflow changed a custom background through the actual HEX field. The existing contrast warning appeared immediately on dark background with the same dark custom text, then disappeared after a light background was chosen.
- `node tests/browser/pre-release-preview.mjs`: PASS in Chrome. Full assignment, crop, three typography presets and scales, Important Date, 12 PNG/JPG ZIP and single-file export, failure/retry, mobile 320/390/landscape and month motion checks completed without runtime exceptions.
- Screenshot review: `qa/v1-1-editor-desktop.png`, `qa/v1-1-editor-deep-desktop.png`, `qa/v1-1-texture-phone.png`; desktop proof remained visible beside Style and Date, with Export directly after the rail.

## Remaining review

Product Owner visual review on their own viewport/device is pending. These local Chrome/Edge checks do not substitute for Session 08 unsupported Mac/Android/device/printer rows. No deployment.
