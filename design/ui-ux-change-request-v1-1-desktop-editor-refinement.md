# V1.1 Desktop Editor UI refinement — UI / UX change request

Directed by the Product Owner on 2026-09-25 from the attached UI refinement brief. This is a desktop visual refinement of the existing Month Editor, not a new product stage or redesign.

## Scope

- Preserve the fresh blue-and-white identity, product model, calendar/crop/export logic, photo-color recommendations and all current controls.
- Restyle the 56px month navigator, narrow the inspector to 320px, give the canvas 48px internal padding, and use 24px page side padding.
- Replace option-card styling with 24px rail section rhythm, thin dividers, segmented font/scale choices, compact radio export rows, and a quiet status chip.
- Retain the current three-row background palette and six texture choices; common swatches wrap instead of scrolling on desktop. Put Clear in the Texture field header.
- Keep the export section in document flow and its options/palette CTA in two columns. Move the print bleed note below the canvas surface.
- Use the existing blue tokens and their lighter/darker values; do not recolor calendar artwork.

## Conflict resolved by Product Owner

The brief describes independent inspector scrolling as existing behavior, but the current app has whole-page scrolling and a sticky left proof. The Product Owner answered “按你推荐的来” to the offered choice on 2026-09-25. This patch preserves whole-page scrolling and the sticky left proof. The independent-inspector-scroll check in the attached brief is superseded for this pass. No nested scroll is introduced.

## Implementation limits

- Desktop-only layout/control styling at widths at least 1024px. Existing phone sheets and touch workflow remain.
- Grid reveal during drag may use CSS interaction state only; crop state and gesture handling stay unchanged.
- The requested white primary-CTA text uses the existing dark blue text token as its background to retain legibility; the pale baby-blue selection color remains elsewhere.
- “No shadows except canvas” applies to the Editor refinement surface; unrelated Entry, Assign and Review visuals remain out of scope.
- UI step labels are visual only: 01 EDIT, 02 FINE TUNE, 03 MARK, 04 FINISH. No navigation or completion semantics change.

## Verification

Check 1280/1440/1920 desktop widths, 800px viewport height, sticky proof, page scrolling to Export, month switching, crop/zoom, all selections, texture/date controls, contrast warnings, PNG/JPG export and no horizontal overflow. Product Owner visual review is required before any later stage or deployment.

## OPEN QUESTION — 800px initial fold

At 800px viewport height, a 72vh artwork plus 48px canvas padding on four sides totals 672px. Existing site header, page title and 56px month navigator place the canvas below the top of the viewport. The entire canvas therefore cannot fit in the first 800px without shrinking the artwork or changing the page chrome. This patch preserves the 72vh target and sticky proof; the first inspector section is visible without scrolling, while the lower part of the canvas requires normal page scroll. Product Owner may choose a different priority after visual review.
