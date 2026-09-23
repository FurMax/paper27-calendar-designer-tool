# UI / UX CHANGE REQUEST — Session 07 print bleed output

**Status:** Approved by the Product Owner for Session 07 implementation on 2026-09-23. The approved decision below supersedes the original proposal and product-size questions; printer-specific acceptance remains open.

## Product Owner request and conflict with approved baseline

On 2026-09-23, the Product Owner requested a printable PNG with a conventional 3 mm bleed, suggested 1270 × 1870 px from the current 1200 × 1800 px canvas, and requested a dimension label indicating reserved 3 mm bleed.

At the time of this request, the approved V1 product scope and acceptance criteria excluded print-specific guarantees, bleed, DPI/CMYK and print-vendor readiness. Implementation and preview/export geometry were fixed at 1200 × 1800 px. This request therefore changes Product Scope, output semantics, UI copy and the frozen visual baseline. It is recorded here for the required Product Owner gate; the current output must not be labeled “print-ready.”

## Dimensional calculation

At an assumed **300 pixels per inch**, 3 mm is `3 × 300 / 25.4 = 35.433` pixels per edge. Choosing **35 whole pixels on each edge** yields `1200 + 35 + 35 = 1270` and `1800 + 35 + 35 = 1870`. The actual edge allowance at 300 PPI is **2.963 mm**, so the accurate label would be **“1270 × 1870 px（四边约 3 mm 出血，按 300 PPI）”**. Choosing 36 pixels on each edge would yield 1272 × 1872 px and about 3.048 mm per edge.

If 1200 × 1800 px is the **trimmed** image at 300 PPI, the physical trimmed size is **101.6 × 152.4 mm (4 × 6 in)**. If the intended trimmed product is exactly **100 × 150 mm**, the 300 PPI trim pixel dimensions are approximately **1181 × 1772 px** and the full 106 × 156 mm bleed document is approximately **1252 × 1843 px** after rounding. Thus 1270 × 1870 px and exact 100 × 150 mm are different specifications.

Bleed is extra artwork outside the trim boundary. Merely stretching a 1200 × 1800 composition to 1270 × 1870, or adding an empty border, would not provide a proper bleed. The exported PNG should contain artwork extending across the extra margin while the calendar text, dates and meaningful photo content remain safely inside trim and any vendor-specified safe area. A trim guide can appear in the editor preview; whether crop marks belong in a delivered file depends on the printer's specification.

## Original proposal reviewed before approval

**Preferred direction:** retain the existing 1200 × 1800 px digital PNG export and add an explicitly named print variant only after a physical trim size and print-provider specification are confirmed. The print variant would place the existing trim composition inside a bleed canvas, continue the photo/background into the bleed, show the trimmed composition with a clear non-exported bleed explanation in Preview, and identify trimmed size, exported pixel dimensions, bleed allowance and assumed PPI beside Export. The ZIP would still contain twelve independent month PNGs of the selected variant. Avoid a blanket “directly printable” claim until the output passes a representative printer handoff check.

The full change would require coordinated updates to `product/`, approved design/IA/wireframe artifacts, architecture, geometry, Preview, PNG/ZIP export, documentation and QA. Exact output pixels and label are resolved in the approved decision below.

## Original review questions

1. What is the **physical size after trimming**: exact 100 × 150 mm, 4 × 6 in (101.6 × 152.4 mm), or another size required by the chosen print service?
2. Should print output be **an additional variant** while keeping the existing digital 1200 × 1800 px PNGs, or should it replace them?
3. Does the print service require **at least** 3 mm bleed (suggesting 36 px at 300 PPI), accept approximately 3 mm (35 px), or specify another value?
4. Are trim/crop marks required in the delivered file, and where? The editor can show guides without drawing them into the photograph/calendar.
5. Which delivered format, color mode/profile, PPI metadata and safe area does the print service accept? A current sample PNG was inspected and has no `pHYs` physical-resolution chunk; a pixel count alone does not establish its printed physical size.

## Acceptance evidence and remaining provider check

- One named physical trim specification, bleed rule, output naming/selection rule and exact export label.
- Twelve exported pages inspected at their trim boundary and corners; photo/background extends through bleed, important content stays in the safe area, and Preview guides are absent from the PNG unless explicitly required.
- Dimension/PPI metadata and color handling checked against the selected print provider; at least one representative physical or provider preflight check before claiming print readiness.
- Existing digital PNG workflow and mobile ZIP handling regression checked if retained.

**Gate result:** The Product Owner approved the physical-size and export-variant decision on 2026-09-23. Product, design, architecture, implementation and scoped QA artifacts are updated. Printer-specific acceptance remains open.

## Approved decision and implementation

The Product Owner chose a 100 × 150 mm trimmed result with 3 mm bleed on all sides, giving a 106 × 156 mm full file. At 300 PPI, integer rounding produces 1252 × 1843 px, trim (35,35,1181,1772), and bleed edges 35/36/35/36 px. Those edges are approximately 2.96/3.05 mm, so the interface says “约 3 mm”. The print PNG carries 300 PPI physical-resolution metadata. The existing 1200 × 1800 digital PNG remains available; the print option is the user-facing default for single and full-set export. The ZIP contains twelve PNGs of the selected variant.

The preview shows the trimmed composition and a note that print export extends beyond it. The implementation fills photo bleed with actual source pixels where available and extends edge pixels where the crop has no extra source; the calendar background continues through its bleed. No trim/crop marks are burned into the PNG. Printer-specific CMYK/profile/PDF and safe-area requirements remain OPEN QUESTION until a print provider and physical/preflight sample are selected; universal vendor compatibility is not claimed.
