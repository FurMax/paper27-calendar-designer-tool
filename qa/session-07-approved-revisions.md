# Session 07 — Product Owner-approved print, color and typography revisions

**Date:** 2026-09-23
**Status:** Implemented with bounded automated verification. This record is not Session 08 release acceptance.

## Approved scope and implementation

The Product Owner approved the controlled changes recorded in the Session 07 color/type and print-bleed UI/UX change requests. A printable-size variant now defaults to a 1252×1843 PNG representing a 106×156 mm full file at nominal 300 PPI, with 100×150 mm trim and approximately 3 mm bleed on each side. A separate 1200×1800 digital variant remains. Single-month and twelve-month ZIP output use the selected variant; ZIP contains twelve independent PNGs. The print PNG includes a pHYs chunk of 11811 pixels/meter in both axes. Print artwork extends into bleed; no trim marks are burned into the output.

The background controls show a current swatch/HEX, four named Quick Colors, a system picker, precise HEX/RGB, and a cropped-photo pixel sampler with touch/click drag, keyboard movement and explicit confirm/cancel. The sampled color changes only the current month's solid background after confirmation. The existing current-month Auto/Custom text-color control remains available. Small/Standard/Large now render at 80%/100%/120%; saved enum values and project schema are unchanged.

## Bounded verification

| Check | Result | Evidence |
|---|---|---|
| Unit and production build | PASS | npm test passed 46/46; npm run build passed after implementation. Unit tests cover print dimensions/bleed geometry, pHYs replacement, photo-point mapping and type multipliers. |
| Photo sampling | PASS in Chrome touch emulation | A synthetic half-red/half-blue image was imported. Touching the red quarter yielded #FF0000; confirmation changed the current background and Preview. Captured qa/session07-photo-sample-mobile.png. Real iPhone Safari remains untested for this new sampler. |
| Single-month export | PASS in isolated Chrome | Digital PNG remained 1200×1800. Print PNG was 1252×1843, contained pHYs 11811 pixels/meter, had opaque corners, red/blue photo bleed at the corresponding edges, and the chosen red calendar background. |
| Full set | PASS in isolated Chrome | Twelve ordered print PNGs at 1252×1843, each with pHYs, were packaged as twelve ZIP entries; measured ZIP size 1,346,618 bytes for a synthetic fixture. This did not verify an iPhone or Android download destination. |
| Mobile layout and scale | PASS in Chrome 320/390px viewports | No horizontal overflow. Measured title sizes 18.4/23/27.6px. All 3 font families × 3 scales × 12 months passed DOM title/date overflow checks at both viewport widths (216 combinations); Review defaulted to print and switched to digital. Captured qa/session07-type-scale-mobile.png. Physical Safari safe areas and actual-PNG visual inspection remain open. |
| iPhone ZIP extraction | Product Owner-reported scoped PASS | The Product Owner confirmed the ZIP could be extracted on iPhone. Device/OS version and inspection of each of twelve PNGs were not recorded. |
| Android ZIP extraction path | Documented, device NOT TESTED | Google's Files by Google documentation describes opening a ZIP and choosing Extract; this product's Android download and twelve-file inspection still require device QA. |

The repeatable browser run is tests/browser/session07-print-color.mjs. It uses only its isolated Chrome profile and a synthetic photo; it does not clear or inspect the Product Owner's browser storage.

## Remaining gates

Session 08 must exercise the new sampler on a real named iPhone Safari device with a known-color image, including crop, drag, keyboard accessibility and color comparison to an exported PNG; inspect all twelve months across the three font systems and scales for clipping and Safari Preview/PNG parity; and verify the selected variant in single/ZIP files on the formal browser/device matrix. The mobile multi-file Share/Save and direct iPhone Photos questions remain open.

Before claiming that the PNG is accepted for a particular printer, record that provider's dimensions, bleed tolerance, safe area, file type, ICC/CMYK and crop-mark requirements and run a representative provider or physical preflight. The current PNG is RGB with nominal physical resolution; a bleed dimension alone cannot guarantee universal print acceptance.